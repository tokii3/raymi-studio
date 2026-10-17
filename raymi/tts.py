"""Raymi's voice: edge-tts (en-US-AnaNeural, +17 %, -7 Hz) -> voice.mp3 + words.json.

Ported from the old engine's tts/generate_audio.py with three fixes:
- only WordBoundary events count as words (the old code also stored SentenceBoundary events as "words")
- the duration is the REAL audio length (ffprobe), not the end of the last word
- word timing falls back to faster-whisper word timestamps aligned to the script before the even-spread estimate
"""
from __future__ import annotations

import asyncio
import json
import re
import subprocess
from pathlib import Path

from .tts_text import normalize_minimal, strip_non_speech, validate_spoken

VOICE = "en-US-AnaNeural"
RATE = "+17%"
PITCH = "-7Hz"
VOLUME = "+0%"


def clean_spoken(text: str) -> str:
    cleaned = normalize_minimal(strip_non_speech(text))
    issues = validate_spoken(cleaned)
    if issues:
        raise ValueError("spoken text not clean: " + "; ".join(issues))
    return cleaned


def audio_duration(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


def norm(w: str) -> str:
    return re.sub(r"[^a-z0-9']", "", w.lower())


def communicate_kwargs(edge_tts) -> dict:
    """Voice settings for edge_tts.Communicate. Newer versions (>= 7.1) default to SentenceBoundary events and need
    boundary="WordBoundary"; 7.0.x always sends word boundaries and has no such argument (first cloud run failed on it)."""
    import inspect

    kw = {"rate": RATE, "pitch": PITCH, "volume": VOLUME}
    if "boundary" in inspect.signature(edge_tts.Communicate.__init__).parameters:
        kw["boundary"] = "WordBoundary"
    return kw


async def _synth(text: str, mp3: Path) -> list[dict]:
    import edge_tts

    comm = edge_tts.Communicate(text, VOICE, **communicate_kwargs(edge_tts))
    words = []
    with open(mp3, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                s = chunk["offset"] / 1e7
                words.append({"w": chunk.get("text", ""), "start": round(s, 3), "end": round(s + chunk["duration"] / 1e7, 3)})
    return words


def match_to_script(script_words: list[str], timed: list[dict]) -> list[dict] | None:
    """Map timed tokens onto the script's own words (keeps the script's spelling + punctuation)."""
    out, j = [], 0
    for sw in script_words:
        target = norm(sw)
        if not target:
            continue
        while j < len(timed) and not norm(timed[j]["w"]):
            j += 1
        if j >= len(timed):
            return None
        joined, first = "", j
        while j < len(timed) and len(joined) < len(target):
            joined += norm(timed[j]["w"])
            j += 1
        if joined != target:
            return None
        out.append({"w": sw, "start": timed[first]["start"], "end": timed[j - 1]["end"]})
    return out


def whisper_words(mp3: Path) -> list[dict]:
    from faster_whisper import WhisperModel

    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(str(mp3), word_timestamps=True, beam_size=5, language="en")
    return [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]


def align_fuzzy(script_words: list[str], timed: list[dict]) -> list[dict] | None:
    """Sequence-align ASR words to the script (ASR may mishear a word); interpolate the gaps."""
    import difflib

    a = [norm(w) for w in script_words]
    b = [norm(t["w"]) for t in timed]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times: list[tuple[float, float] | None] = [None] * len(a)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            t = timed[blk.b + k]
            times[blk.a + k] = (t["start"], t["end"])
    known = sum(1 for t in times if t)
    if known < 0.8 * len(a):
        return None
    # fill gaps linearly between known neighbours
    idx = [i for i, t in enumerate(times) if t]
    for i in range(len(a)):
        if times[i]:
            continue
        lo = max([k for k in idx if k < i], default=None)
        hi = min([k for k in idx if k > i], default=None)
        t0 = times[lo][1] if lo is not None else 0.0
        t1 = times[hi][0] if hi is not None else t0 + 0.3
        span = (hi if hi is not None else i + 1) - (lo if lo is not None else -1)
        pos = i - (lo if lo is not None else -1)
        s = t0 + (t1 - t0) * (pos - 1) / span
        times[i] = (round(s, 3), round(s + (t1 - t0) / span, 3))
    return [{"w": w, "start": t[0], "end": t[1]} for w, t in zip(script_words, times)]


def even_spread(script_words: list[str], duration: float) -> list[dict]:
    step = duration / max(len(script_words), 1)
    return [{"w": w, "start": round(i * step, 3), "end": round((i + 1) * step, 3)} for i, w in enumerate(script_words)]


def make_voice(text: str, out_dir: Path, use_whisper: bool = True) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    spoken = clean_spoken(text)
    mp3 = out_dir / "voice.mp3"
    script_words = [w for w in spoken.split() if norm(w)]
    timed, source = [], "none"
    for _ in range(2):
        timed = asyncio.run(_synth(spoken, mp3))
        if timed:
            break
    words = match_to_script(script_words, timed) if timed else None
    if words:
        source = "edge-tts"
    if not words and use_whisper:
        try:
            words = align_fuzzy(script_words, whisper_words(mp3))
            source = "whisper" if words else source
        except ImportError:
            words = None
    dur = audio_duration(mp3)
    if not words:
        words, source = even_spread(script_words, dur), "estimated"
    payload = {"voice": {"name": VOICE, "rate": RATE, "pitch": PITCH}, "text": spoken, "duration": round(dur, 3),
               "timing_source": source, "words": words}
    (out_dir / "words.json").write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding="utf-8")
    return payload

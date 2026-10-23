"""A talking Short in 3D (kind "pov"): her spoken lines placed in the film, a known music bed under them, sound effects.

shots.json of such a job:

    {"audio": {"file": "../../assets/music/sneaky-snitch.mp3", "from": 0.0, "to": 17.5},   # the music bed window
     "bed": {"db": -16, "duck": true, "mute": [[6.2, 8.0]]},   # level under her voice (dB), ducked while she speaks,
                                                # silent windows (song seconds)
     "voice": [{"at": 0.2, "text": "you sat in my seat."}, ...],   # song seconds, like every shot time
     "sfx": [{"at": 6.1, "kind": "tap", "db": -6}, ...],           # assets/sfx/<kind>.wav (raymi/sfx.py builds them)
     ...}

Each line is its own take (edge-tts, the fixed voice of raymi/tts.py) in jobs/<job>/voice/<hash>.mp3 + .json (word
times inside the take), so moving a line in time never re-synthesises it and a re-render reuses the same take.
`python -m raymi voice-lines <job>` makes the missing takes (needs internet; light, runs on toki's PC or in the cloud).
`python -m raymi mix <job>` lays bed + takes + sfx into jobs/<job>/out/mix.m4a (cloud prepare, before the timeline).
The timeline (raymi/timeline.py) reads the takes for her lip sync: every spoken word becomes a "sung" word.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import subprocess
import time
from pathlib import Path

from . import tts

REPO = Path(__file__).resolve().parents[1]
SFX_DIR = REPO / "assets" / "sfx"


def take_id(text: str) -> str:
    key = f"{tts.VOICE}|{tts.RATE}|{tts.PITCH}|{text}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:10]


def take_paths(job: Path, text: str) -> tuple[Path, Path]:
    tid = take_id(tts.clean_spoken(text))
    return job / "voice" / f"{tid}.mp3", job / "voice" / f"{tid}.json"


def make_take(job: Path, text: str) -> dict:
    """One spoken line -> voice/<id>.mp3 + voice/<id>.json ({text, duration, words: [{w, start, end}]})."""
    spoken = tts.clean_spoken(text)
    mp3, meta = take_paths(job, text)
    if mp3.is_file() and meta.is_file():
        return json.loads(meta.read_text(encoding="utf-8"))
    mp3.parent.mkdir(parents=True, exist_ok=True)
    script_words = [w for w in spoken.split() if tts.norm(w)]
    timed = []
    for attempt in range(4):                             # the service drops a request now and then (NoAudioReceived)
        try:
            timed = asyncio.run(tts._synth(spoken, mp3))
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 + 3 * attempt)
            continue
        if timed:
            break
    words = tts.match_to_script(script_words, timed) if timed else None
    dur = tts.audio_duration(mp3)
    source = "edge-tts" if words else "estimated"
    if not words:
        words = tts.even_spread(script_words, dur)
    payload = {"text": spoken, "duration": round(dur, 3), "timing_source": source, "words": words}
    meta.write_text(json.dumps(payload, indent=1, ensure_ascii=False), encoding="utf-8")
    return payload


def make_all(job: Path, spec: dict) -> list[dict]:
    return [{"at": float(v["at"]), **make_take(job, v["text"])} for v in spec.get("voice", [])]


def load_takes(job: Path, spec: dict, errors: list[str] | None = None) -> list[dict]:
    """The stored takes of every line ({at, text, duration, words}); a missing take is an error (never guessed)."""
    out = []
    for i, v in enumerate(spec.get("voice", [])):
        try:
            mp3, meta = take_paths(job, v["text"])
        except ValueError as e:                          # dirty spoken text (digits, symbols, kaomoji)
            if errors is not None:
                errors.append(f"voice line {i + 1}: {e}")
            continue
        if not meta.is_file():
            if errors is not None:
                errors.append(f"voice line {i + 1}: no take yet - run `python -m raymi voice-lines {job.name}`")
            continue
        out.append({"at": float(v["at"]), "file": mp3, **json.loads(meta.read_text(encoding="utf-8"))})
    if errors is not None:
        for a, b in zip(out, out[1:]):
            if a["at"] + a["words"][-1]["end"] > b["at"] + 0.05:      # the take ends in ~0.7 s of silence
                errors.append(f"voice: '{a['text']}' ({a['at']:.2f}-{a['at'] + a['words'][-1]['end']:.2f} s) runs into "
                              f"'{b['text']}' ({b['at']:.2f} s)")
    return out


def spoken_words(takes: list[dict], t_from: float, t_to: float) -> list[dict]:
    """Every spoken word in film seconds for her lip sync (the same shape as the sung words of a song)."""
    out = []
    for tk in takes:
        for w in tk["words"]:
            t0, t1 = tk["at"] + w["start"], tk["at"] + w["end"]
            if t1 > t_from and t0 < t_to:
                out.append({"w": w["w"], "roma": "", "t0": round(t0 - t_from, 3), "t1": round(t1 - t_from, 3)})
    return out


def db_gain(db: float) -> str:
    return f"{10 ** (db / 20):.4f}"


def mix(job: Path, spec: dict, out: Path | None = None) -> Path:
    """Bed window (ducked under her voice, faded at the end) + every take at its time + sfx -> out/mix.m4a."""
    audio = spec["audio"]
    t_from, t_to = float(audio["from"]), float(audio["to"])
    length = t_to - t_from
    bed = spec.get("bed") or {}
    takes = load_takes(job, spec)
    sfx = spec.get("sfx", [])
    out = out or job / "out" / "mix.m4a"
    out.parent.mkdir(parents=True, exist_ok=True)
    src = (job / audio["file"]).resolve()
    args = ["ffmpeg", "-y", "-hide_banner", "-ss", f"{t_from:.3f}", "-t", f"{length:.3f}", "-i", str(src)]
    for tk in takes:
        args += ["-i", str(tk["file"])]
    for s in sfx:
        f = SFX_DIR / f"{s['kind']}.wav"
        if not f.is_file():
            raise FileNotFoundError(f"sfx {s['kind']!r}: {f} missing (python -m raymi sfx builds the library)")
        args += ["-i", str(f)]
    fade = float(bed.get("fade", 0.6))
    chains = [f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={db_gain(float(bed.get('db', -16)))},"
              f"afade=t=out:st={max(0.0, length - fade):.3f}:d={fade:.3f}"
              + "".join(f",volume=0:enable='between(t,{float(a) - t_from:.3f},{float(b) - t_from:.3f})'"
                        for a, b in bed.get("mute", []))           # the bed stops (a freeze frame, a held breath)
              + "[bed]"]
    voice_labels, sfx_labels = [], []
    for i, tk in enumerate(takes):
        ms = max(0, round((tk["at"] - t_from) * 1000))
        chains.append(f"[{i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},"
                      f"volume={db_gain(float(spec.get('voice_db', 0)))}[v{i}]")
        voice_labels.append(f"[v{i}]")
    for j, s in enumerate(sfx):
        k = 1 + len(takes) + j
        ms = max(0, round((float(s["at"]) - t_from) * 1000))
        chains.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},"
                      f"volume={db_gain(float(s.get('db', -6)))}[s{j}]")
        sfx_labels.append(f"[s{j}]")
    if voice_labels:
        n = len(voice_labels)
        chains.append("".join(voice_labels) + f"amix=inputs={n}:normalize=0:duration=longest,asplit=2[voice][key]")
        if bed.get("duck", True):
            chains.append("[bed][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[bedd]")
        else:
            chains.append("[key]anullsink;[bed]anull[bedd]")
        mix_in = ["[bedd]", "[voice]"] + sfx_labels
    else:
        mix_in = ["[bed]"] + sfx_labels
    chains.append("".join(mix_in) + f"amix=inputs={len(mix_in)}:normalize=0:duration=first,"
                  f"atrim=0:{length:.3f},alimiter=limit=0.89[out]")
    args += ["-filter_complex", ";".join(chains), "-map", "[out]", "-c:a", "aac", "-b:a", "192k", str(out)]
    p = subprocess.run(args, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-2000:])
    return out

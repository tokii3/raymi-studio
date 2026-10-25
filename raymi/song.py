"""Song tools: measure a song so nothing about it is guessed (PRINCIPLES C: lyrics timed from the measured vocal).

Why: the old engine put lyric lines on a bar grid (Verity chorus 2 at 33 s instead of 41.9 s), trusted LRC offsets
(LML +11.5 s) and spread words over guessed 16ths (Know My Name "asynchron"). Here every word gets a time from the
VOCAL stem:
1. Demucs (htdemucs, CPU, cloud) splits the vocal from the official audio.
2. faster-whisper transcribes the vocal with word times, prompted with the official text.
3. The official words are matched to the recognised ones on their romanised letters (any script, kanji readings
   via pykakasi), so a kanji whisper wrote differently still matches by sound.
4. Each matched word snaps to the nearest vocal onset (whisper's word starts drift ~0.1-0.3 s on singing); words
   nobody matched are spread between their neighbours on vocal onsets and marked `interpolated`.
5. `cut` = the frame one frame BEFORE the syllable (cuts land one frame early - LESSONS 2).
The song map (beats, sections, stops, hits, vocal spans) is measured on the full mix + the stem the same way.

Heavy parts (demucs, whisper, librosa) are imported lazily: tests and the light CLI run without them.
CLI: `python -m raymi analyze <job>` (cloud: .github/workflows/analyze.yml), `python -m raymi lyrics <job>` re-aligns
locally from the cached whisper_words.json + vocals.ogg.
"""
from __future__ import annotations

import difflib
import json
import math
import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np

FPS = 30
SR = 16000                   # analysis rate for the vocal (whisper's rate too)
HOP = 160                    # 10 ms envelope hop
SNAP_S = 0.14                # a measured word moves to a vocal onset at most this far
MIN_BLOCK = 3                # romaji letters that must agree in a row before a match counts

# ------------------------------------------------------------------ lyric text -> lines of words

def script_of(ch: str) -> str:
    o = ord(ch)
    if 0x30A0 <= o <= 0x30FF or 0x31F0 <= o <= 0x31FF or ch == "ー":
        return "kata"
    if 0x3040 <= o <= 0x309F:
        return "hira"
    if 0x4E00 <= o <= 0x9FFF or 0x3400 <= o <= 0x4DBF or ch in "々〇〆ヶ" or ch.isdigit():
        return "kanji"           # digits behave like kanji: "1つ" is one word (counter + okurigana)
    if ch.isascii() and (ch.isalpha() or ch == "'"):
        return "latin"
    if 0xAC00 <= o <= 0xD7A3:
        return "hangul"          # K-pop lines (K/DA): a Hangul run is one word, Korean already spaces its words
    return "other"


# Revised Romanisation of Hangul syllables (algorithmic, no dependency): initial, vowel, final jamo
_HL = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"]
_HV = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu",
       "eu", "ui", "i"]
_HT = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng",
       "t", "t", "k", "t", "p", "t"]


def hangul_roma(s: str) -> str:
    """Hangul syllables -> Revised Romanisation (other characters pass through): 불을 -> bureul is NOT done
    (no liaison), 불을 -> buleul; close enough to match the recogniser's letters by sound."""
    out = []
    for ch in s:
        o = ord(ch)
        if 0xAC00 <= o <= 0xD7A3:
            k = o - 0xAC00
            out.append(_HL[k // 588] + _HV[(k % 588) // 28] + _HT[k % 28])
        else:
            out.append(ch)
    return "".join(out)


def words_of(chunk: str) -> list[str]:
    """Split a space-free chunk into display words: a katakana run, a kanji run with the hiragana after it
    (okurigana + particles), a hiragana run of its own, or a Latin word. Punctuation sticks to the word before."""
    out: list[str] = []
    cur, kind = "", None
    for ch in chunk:
        s = script_of(ch)
        if s == "other":
            if cur:
                cur += ch
            elif out:
                out[-1] += ch
            else:
                cur, kind = ch, "other"
            continue
        joins = cur and (s == kind or (kind == "kanji" and s == "hira") or (kind == "kanjihira" and s == "hira"))
        if joins:
            cur += ch
            if kind == "kanji" and s == "hira":
                kind = "kanjihira"
        else:
            carry = ""
            if s == "kanji" and kind in ("hira", "kanjihira") and cur[-1] in "おご":
                cur, carry = cur[:-1], cur[-1]      # the honorific お / ご belongs to the next word (お願い)
            if cur:
                out.append(cur)
            cur, kind = carry + ch, s
    if cur:
        out.append(cur)
    return out


def parse_lyrics(text: str) -> list[dict]:
    """Official lyric text -> lines {i, para, text, words}. A blank line starts a new paragraph; lines starting with
    '#' are comments."""
    lines, para, gap = [], 0, False
    for raw in text.splitlines():
        ln = raw.strip()
        if not ln:
            gap = True
            continue
        if ln.startswith("#"):
            continue
        if gap and lines:
            para += 1
        gap = False
        ws = [w for chunk in re.split(r"[ 　\t]+", ln) if chunk for w in words_of(chunk)]
        lines.append({"i": len(lines), "para": para, "text": ln, "words": ws})
    return lines


# ------------------------------------------------------------------ romanisation (matching by sound, any script)
_KKS = None


def _kakasi():
    global _KKS
    if _KKS is None:
        import pykakasi

        _KKS = pykakasi.kakasi()
    return _KKS


def roma(s: str) -> str:
    """Letters only, by sound: kana/kanji -> Hepburn (pykakasi), long vowels folded so 'yuuhei' == 'yuhei'."""
    s = unicodedata.normalize("NFKC", s)
    if any(script_of(c) == "hangul" for c in s):
        s = hangul_roma(s)
    if any(script_of(c) in ("kata", "hira", "kanji") for c in s):
        s = "".join(x["hepburn"] for x in _kakasi().convert(s))
    s = re.sub(r"[^a-z]", "", s.lower())
    s = re.sub(r"ou", "o", s)
    s = re.sub(r"([aeiou])\1+", r"\1", s)
    return s


# ------------------------------------------------------------------ alignment

def match_runs(a: list[str], b: list[str]) -> list[tuple[int, int, int]]:
    """Monotonic global alignment of two letter sequences (Needleman-Wunsch: match +2, mismatch / gap -1), returned
    as runs of consecutive matches (a index, b index, length). difflib took the LONGEST common block first, so a song
    whose choruses repeat word for word matched chorus 2's text to the final chorus' audio and dropped everything in
    between (FIRESTARTER 2026-10-19: 76-151 s lost). A global alignment keeps every text line in song order."""
    n, m = len(a), len(b)
    if not n or not m:
        return []
    A = np.frombuffer("".join(a).encode("ascii", "replace"), np.uint8)
    B = np.frombuffer("".join(b).encode("ascii", "replace"), np.uint8)
    ptr = np.zeros((n + 1, m + 1), np.uint8)                 # 0 diag, 1 up (gap in b), 2 left (gap in a)
    ptr[0, 1:] = 2
    ptr[1:, 0] = 1
    prev = -np.arange(m + 1, dtype=np.int32)
    idx = np.arange(m + 1, dtype=np.int32)
    for i in range(1, n + 1):
        sub = np.where(B == A[i - 1], 2, -1).astype(np.int32)
        diag = prev[:-1] + sub
        up = prev[1:] - 1
        best = np.maximum(diag, up)                              # without the left move, for j >= 1
        d = np.empty(m + 1, np.int32)
        d[0] = -i
        d[1:] = best
        # left moves: H[j] = max_k<=j (d[k] - (j - k)) = cummax(d + idx) - idx
        cur = np.maximum.accumulate(d + idx) - idx
        p = np.where(diag >= up, 0, 1).astype(np.uint8)
        left = cur[1:] > best
        p[left] = 2
        ptr[i, 1:] = p
        prev = cur
    pairs = []
    i, j = n, m
    while i > 0 and j > 0:
        p = ptr[i, j]
        if p == 0:
            if A[i - 1] == B[j - 1]:
                pairs.append((i - 1, j - 1))
            i, j = i - 1, j - 1
        elif p == 1:
            i -= 1
        else:
            j -= 1
    pairs.reverse()
    runs: list[tuple[int, int, int]] = []
    for x, y in pairs:
        if runs and runs[-1][0] + runs[-1][2] == x and runs[-1][1] + runs[-1][2] == y:
            ra, rb, rs = runs[-1]
            runs[-1] = (ra, rb, rs + 1)
        else:
            runs.append((x, y, 1))
    return runs


def align(lines: list[dict], asr: list[dict]) -> list[list[dict]]:
    """Official words <- recognised words (asr: [{w, t0, t1}]) by romanised letters.

    Returns per line a list of {w, roma, t0 | None, conf} where t0 comes from the recognised word that holds the
    official word's first matched letter (moved back by the letters before it)."""
    a, a_own = [], []                       # official letters, (line, word, letter index)
    for li, ln in enumerate(lines):
        for wi, w in enumerate(ln["words"]):
            for k, ch in enumerate(roma(w)):
                a.append(ch)
                a_own.append((li, wi, k))
    b, b_t = [], []                         # recognised letters, time of each letter
    for x in asr:
        r = roma(x["w"])
        n = len(r)
        for k, ch in enumerate(r):
            b.append(ch)
            b_t.append(x["t0"] + (x["t1"] - x["t0"]) * k / max(n, 1))
    hits: dict[tuple[int, int], list[tuple[int, float]]] = {}
    for blk_a, blk_b, size in match_runs(a, b):
        if size < MIN_BLOCK:
            continue
        for k in range(size):
            li, wi, pos = a_own[blk_a + k]
            hits.setdefault((li, wi), []).append((pos, b_t[blk_b + k]))
    out = []
    for li, ln in enumerate(lines):
        row = []
        for wi, w in enumerate(ln["words"]):
            r = roma(w)
            h = sorted(hits.get((li, wi), []))
            conf = len(h) / max(len(r), 1)
            t0 = None
            if h and (conf >= 0.5 or len(h) >= 4):
                pos, t = h[0]
                t0 = t - pos * 0.07              # ~70 ms per letter sung before the first matched one
            row.append({"w": w, "roma": r, "t0": t0, "conf": round(conf, 2)})
        out.append(row)
    return out


def _lis_keep(ts: list[float | None]) -> list[float | None]:
    """Keep the longest increasing run of measured times; a time out of order is a false match -> None."""
    idx = [i for i, t in enumerate(ts) if t is not None]
    if not idx:
        return ts
    best: list[list[int]] = []
    for i in idx:                           # O(n^2) is fine for a song's words
        cand = [best[j] + [i] for j in range(len(best)) if ts[best[j][-1]] < ts[i] - 0.05]
        best.append(max(cand, key=len) if cand else [i])
    keep = set(max(best, key=len))
    return [t if i in keep else None for i, t in enumerate(ts)]


def onset_env(x: np.ndarray, sr: int = SR) -> np.ndarray:
    """Spectral flux of a vocal (150-4000 Hz), 100 fps, normalised to its 95th percentile."""
    n = 512
    win = np.hanning(n).astype(np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(np.pad(x, (n // 2, n // 2)), n)[::HOP] * win
    S = np.abs(np.fft.rfft(frames, axis=1))
    f = np.fft.rfftfreq(n, 1 / sr)
    S = np.log1p(30 * S[:, (f >= 150) & (f <= 4000)])
    flux = np.maximum(0, np.diff(S, axis=0, prepend=S[:1])).sum(axis=1)
    flux = np.convolve(flux, np.ones(3) / 3, "same")
    return flux / (np.percentile(flux, 95) + 1e-6)


def pick_onsets(env: np.ndarray, fps: float = 100.0, thr: float = 0.35, gap_s: float = 0.07) -> list[float]:
    """Local maxima of an onset envelope above thr, at least gap_s apart, as seconds."""
    g = max(1, int(gap_s * fps))
    out, last = [], -10 ** 9
    for i in range(1, len(env) - 1):
        lo, hi = max(0, i - g), min(len(env), i + g + 1)
        if env[i] >= thr and env[i] == env[lo:hi].max() and i - last >= g:
            out.append(round(i / fps, 3))
            last = i
    return out


def snap(t: float, onsets: list[float], win: float = SNAP_S) -> tuple[float, bool]:
    if not onsets:
        return t, False
    j = int(np.searchsorted(onsets, t))
    near = [onsets[k] for k in (j - 1, j) if 0 <= k < len(onsets)]
    o = min(near, key=lambda v: abs(v - t))
    return (o, True) if abs(o - t) <= win else (t, False)


def time_words(lines: list[dict], matched: list[list[dict]], onsets: list[float], duration: float,
               spans: list[list[float]] | None = None) -> list[dict]:
    """Final word times: measured ones snapped to vocal onsets, gaps spread by letters onto onsets, all increasing."""
    flat = [w for row in matched for w in row]
    ts = _lis_keep([w["t0"] for w in flat])
    how = []
    for k, t in enumerate(ts):
        if t is None:
            how.append("interpolated")
            continue
        t2, ok = snap(max(0.0, t), onsets)
        ts[k] = t2
        how.append("snapped" if ok else "measured")
    ts = _lis_keep(ts)
    how = [h if ts[k] is not None else "interpolated" for k, h in enumerate(how)]
    n = len(ts)
    k = 0
    while k < n:                             # fill runs of None between known neighbours, weighted by letters
        if ts[k] is not None:
            k += 1
            continue
        e = k
        while e < n and ts[e] is None:
            e += 1
        L = [max(1, len(w["roma"])) for w in flat]
        a = ts[k - 1] if k > 0 else None
        b = ts[e] if e < n else None
        first = k - 1 if a is not None else k        # the letters from `a` on fill the time up to `b`
        if a is None:
            a = max(0.0, (b if b is not None else duration) - 0.22 * sum(L[k:e]))
        if b is None:
            b = min(duration, a + 0.22 * sum(L[first:e]))
        tot = sum(L[first:e]) or 1
        inside = [o for o in onsets if a < o < b]
        for j in range(k, e):
            guess = a + (b - a) * sum(L[first:j]) / tot
            ts[j], _ = snap(guess, inside, win=0.2)
        k = e
    for j in range(1, n):                    # strictly increasing, at least 2 frames apart
        if ts[j] <= ts[j - 1] + 2 / FPS:
            ts[j] = ts[j - 1] + 2 / FPS
    out, j = [], 0
    for li, ln in enumerate(lines):
        words = []
        for w in matched[li]:
            words.append({"w": w["w"], "roma": w["roma"], "t0": round(ts[j], 3), "how": how[j], "conf": w["conf"]})
            j += 1
        out.append({"i": ln["i"], "para": ln["para"], "text": ln["text"], "words": words})
    flatw = [w for ln in out for w in ln["words"]]
    for k2, w in enumerate(flatw):           # a word lasts until the next one, the end of its vocal span, or 1.5 s
        nxt = flatw[k2 + 1]["t0"] if k2 + 1 < len(flatw) else duration
        end = min(nxt, w["t0"] + 1.5)
        for a, b in spans or []:
            if a <= w["t0"] < b:
                end = min(end, max(b, w["t0"] + 0.15))
        w["t1"] = round(end, 3)
        w["cut"] = cut_frame(w["t0"])
    for ln in out:
        ln["t0"], ln["t1"] = ln["words"][0]["t0"], ln["words"][-1]["t1"]
        ln["cut"] = cut_frame(ln["t0"])
    return out


def cut_frame(t: float, fps: int = FPS) -> int:
    """The frame a cut / text event lands on: one frame BEFORE the syllable."""
    return max(0, int(math.floor(t * fps)) - 1)


# ------------------------------------------------------------------ song map (pure numpy parts)

def loudness_db(x: np.ndarray, sr: int, hop_s: float = 0.1) -> np.ndarray:
    h = int(sr * hop_s)
    n = len(x) // h
    fr = x[: n * h].reshape(n, h)
    return 20 * np.log10(np.sqrt((fr ** 2).mean(axis=1)) + 1e-9)


def stops(db: np.ndarray, hop_s: float = 0.1, drop: float = 6.0, min_s: float = 0.4, ctx_s: float = 3.0) -> list[dict]:
    """Spans where the music drops >= drop dB under its surrounding level (the song's breaks / held stops)."""
    c = int(ctx_s / hop_s)
    loud = db > db.max() - 40
    res, i, n = [], 0, len(db)
    low = np.zeros(n, bool)
    for k in range(n):
        ref = np.median(db[max(0, k - c): min(n, k + c + 1)])
        low[k] = loud[max(0, k - 1)] and db[k] < ref - drop
    while i < n:
        if low[i]:
            j = i
            while j < n and low[j]:
                j += 1
            if (j - i) * hop_s >= min_s and i > 0 and j < n:     # not the intro silence / the outro fade
                res.append({"t0": round(i * hop_s, 2), "t1": round(j * hop_s, 2),
                            "depth_db": round(float(np.median(db[max(0, i - c):i]) - db[i:j].mean()), 1)})
            i = j
        else:
            i += 1
    return res


def novelty(F: np.ndarray, k: int = 8) -> np.ndarray:
    """Checkerboard novelty along the diagonal of the self-similarity matrix of feature columns F (d x n)."""
    F = F - F.mean(axis=1, keepdims=True)
    F = F / (np.linalg.norm(F, axis=0, keepdims=True) + 1e-9)
    S = F.T @ F
    n = S.shape[0]
    g = np.outer(np.r_[-np.ones(k), np.ones(k)], np.r_[-np.ones(k), np.ones(k)])
    w = np.exp(-0.5 * (np.linspace(-2, 2, 2 * k)[:, None] ** 2 + np.linspace(-2, 2, 2 * k)[None, :] ** 2))
    K = g * w
    out = np.zeros(n)
    Sp = np.pad(S, k, mode="edge")
    for i in range(n):
        out[i] = (Sp[i:i + 2 * k, i:i + 2 * k] * K).sum()
    out = np.maximum(out, 0)
    return out / (out.max() + 1e-9)


def peaks(curve: np.ndarray, min_gap: int, thr: float) -> list[int]:
    out: list[int] = []
    for j in np.argsort(curve)[::-1]:
        if curve[j] < thr:
            break
        if all(abs(int(j) - o) >= min_gap for o in out):
            out.append(int(j))
    return sorted(out)


def vocal_spans(db: np.ndarray, hop_s: float = 0.1, thr_rel: float = 22.0, min_gap_s: float = 0.6) -> list[list[float]]:
    """Where the vocal stem sings: louder than (its 95th percentile - thr_rel dB); gaps < min_gap_s are bridged."""
    on = db > np.percentile(db, 95) - thr_rel
    spans, i, n = [], 0, len(on)
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            spans.append([i * hop_s, j * hop_s])
            i = j
        else:
            i += 1
    merged: list[list[float]] = []
    for s in spans:
        if merged and s[0] - merged[-1][1] < min_gap_s:
            merged[-1][1] = s[1]
        else:
            merged.append(list(s))
    return [[round(a, 2), round(b, 2)] for a, b in merged if b - a >= 0.2]


# ------------------------------------------------------------------ heavy parts (cloud)

def load_audio(path: Path, sr: int = SR, mono: bool = True) -> np.ndarray:
    ch = 1 if mono else 2
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", str(ch), "-ar", str(sr), "-"],
                       capture_output=True, check=True)
    x = np.frombuffer(p.stdout, np.float32)
    return x if mono else x.reshape(-1, 2).T


def separate(song: Path, out_dir: Path) -> Path:
    """Demucs htdemucs vocal stem (CPU). Audio in/out through ffmpeg (no torchaudio IO)."""
    import torch
    from demucs.apply import apply_model
    from demucs.pretrained import get_model

    model = get_model("htdemucs")
    model.eval()
    x = torch.from_numpy(load_audio(song, model.samplerate, mono=False).copy())
    ref = x.mean(0)
    x = (x - ref.mean()) / (ref.std() + 1e-8)
    with torch.no_grad():
        y = apply_model(model, x[None], device="cpu", shifts=1, split=True, overlap=0.25, progress=False)[0]
    y = y * (ref.std() + 1e-8) + ref.mean()
    voc = y[model.sources.index("vocals")].numpy()
    # everything but the voice (drums + bass + other): its own hits - a guitar stab, a can opening - are found there
    acc = sum(y[i] for i, n in enumerate(model.sources) if n != "vocals").numpy()
    out_dir.mkdir(parents=True, exist_ok=True)
    wav = out_dir / "vocals.wav"
    oth = y[model.sources.index("other")].numpy()       # synths / guitars / keys: the lead melody (melody_track)
    for sig, f in ((voc, wav), (acc, out_dir / "accomp.wav"), (oth, out_dir / "other.wav")):
        pcm = np.clip(sig.T, -1, 1).astype(np.float32).tobytes()
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ac", "2", "-ar", str(model.samplerate), "-i", "-",
                        str(f)], input=pcm, check=True)
    return wav


_WHISPER: dict = {}


def _whisper(model: str):
    from faster_whisper import WhisperModel

    if model not in _WHISPER:
        _WHISPER[model] = WhisperModel(model, device="cpu", compute_type="int8")
    return _WHISPER[model]


def transcribe(vocals: Path, language: str, prompt: str, model: str = "large-v3", clip: tuple[float, float] | None = None
               ) -> list[dict]:
    """Word times from the vocal stem; clip = (t0, t1) transcribes only that window (times stay song times)."""
    audio = load_audio(vocals, SR)
    off = 0.0
    if clip:
        off = max(0.0, clip[0])
        audio = audio[int(off * SR):int(clip[1] * SR)]
    segs, _ = _whisper(model).transcribe(audio, language=language, word_timestamps=True, vad_filter=False, beam_size=5,
                                         condition_on_previous_text=False, initial_prompt=prompt[:800])
    return [{"w": w.word.strip(), "t0": round(w.start + off, 3), "t1": round(w.end + off, 3)}
            for s in segs for w in (s.words or []) if w.word.strip()]


def asr_gaps(asr: list[dict], spans: list[list[float]], min_gap: float = 4.0, pad: float = 0.6) -> list[list[float]]:
    """Windows where the singer sings (vocal spans) but the recogniser heard (almost) nothing for >= min_gap s.
    Whisper on a whole song loses itself in long repeated / mixed-language stretches (FIRESTARTER 2026-10-19: 57-70 s
    and 145-170 s empty, one hallucinated word) - a second pass on just these windows hears them."""
    out = []
    ts = sorted(w["t0"] for w in asr)
    for a, b in spans:
        edges = [a] + [t for t in ts if a <= t < b] + [b]
        for x, y in zip(edges, edges[1:]):
            if y - x >= min_gap:
                out.append([round(max(a, x - pad), 2), round(min(b, y + pad), 2)])
    return out


def fill_gaps(vocals: Path, asr: list[dict], spans: list[list[float]], langs: list[str], prompt: str, model: str
              ) -> tuple[list[dict], list[dict]]:
    """Second pass: every gap window transcribed alone, once per language; the pass whose SOUND matches the official
    text best wins (letters in common, `heard_letters`) and replaces whatever stood in the window (a lone hallucinated
    word). Most WORDS was the first rule and failed (FIRESTARTER 2026-10-19: Korean mode wrote the English chorus in
    Hangul - more words, wrong ones - and the alignment got worse). A pass that matches less than half of its own
    letters is not used. Returns (new asr, log)."""
    target = roma(prompt)
    log = []
    for a, b in asr_gaps(asr, spans):
        best: list[dict] = []
        best_score = 0
        tried = {}
        for lang in langs:
            got = [w for w in transcribe(vocals, lang, prompt, model, clip=(a, b)) if a <= w["t0"] < b]
            sc, n = heard_letters(got, target)
            tried[lang] = {"words": len(got), "letters": n, "matched": sc}
            if sc > best_score and sc >= 0.5 * n:
                best, best_score = got, sc
        if best:
            asr = sorted([w for w in asr if not (a <= w["t0"] < b)] + best, key=lambda w: w["t0"])
        log.append({"window": [a, b], "passes": tried, "used": bool(best)})
    return asr, log


def heard_letters(words: list[dict], target: str, min_block: int = 3) -> tuple[int, int]:
    """(letters of the recognised words that match the official text in runs of >= min_block, all their letters)."""
    got = "".join(roma(w["w"]) for w in words)
    sm = difflib.SequenceMatcher(None, got, target, autojunk=False)
    return sum(m.size for m in sm.get_matching_blocks() if m.size >= min_block), len(got)


def beats(song: Path) -> dict:
    import librosa

    y, sr = librosa.load(str(song), sr=22050, mono=True)
    tempo, bt = librosa.beat.beat_track(y=y, sr=sr, units="time")
    on = librosa.onset.onset_detect(y=y, sr=sr, units="time", backtrack=True)
    env = librosa.onset.onset_strength(y=y, sr=sr)
    times = librosa.times_like(env, sr=sr)
    strong = np.interp(on, times, env)
    hits = [round(float(t), 3) for t, s in zip(on, strong) if s >= np.percentile(strong, 80)]
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    frames = librosa.time_to_frames(bt, sr=sr)
    F = np.vstack([librosa.util.sync(chroma, frames), librosa.util.sync(mfcc, frames)])
    return {"bpm": round(float(np.atleast_1d(tempo)[0]), 1), "beats": [round(float(t), 3) for t in bt],
            "hits": hits, "beat_features": F}


def sections(dur: float, novelty_bounds: list[float], stop_list: list[dict], spans: list[list[float]], loud: list[float],
             lines: list[dict]) -> list[dict]:
    """Song sections from MEASURED evidence, strongest first: the stops, the starts of the official text's paragraphs
    (timed from the vocal), vocal entries after >= 2 s of silence, then timbre changes (novelty). Paragraphs with the
    same text get the same letter, so the chorus shows up as a repeat (A B C C ...)."""
    cand: list[tuple[float, int]] = [(0.0, 9), (round(dur, 2), 9)]
    for s in stop_list:
        cand += [(s["t0"], 4), (s["t1"], 4)]
    paras: dict[int, list[dict]] = {}
    for ln in lines:
        paras.setdefault(ln["para"], []).append(ln)
    for pl in paras.values():
        cand.append((round(pl[0]["t0"], 2), 3))
    prev_end = None
    for a, b in spans:
        if prev_end is not None and a - prev_end >= 2.0:
            cand.append((a, 2))
        prev_end = b
    if spans and spans[-1][1] < dur - 2:
        cand.append((spans[-1][1], 2))
    cand += [(t, 1) for t in novelty_bounds]
    keep: list[tuple[float, int]] = []
    for t, pr in sorted(cand, key=lambda x: -x[1]):
        if all(abs(t - k) >= 1.2 or (pr == 4 and kp == 4) for k, kp in keep):
            keep.append((t, pr))
    bounds = sorted(t for t, _ in keep)
    letters: dict[str, str] = {}
    def letter(pl: list[dict]) -> str:
        key = "|".join(ln["text"] for ln in pl)
        if key not in letters:
            letters[key] = chr(ord("A") + len(letters))
        return letters[key]
    out = []
    top = max(loud) if loud else 0.0
    for a, z in zip(bounds[:-1], bounds[1:]):
        seg = loud[int(a * 10):max(int(a * 10) + 1, int(z * 10))] or [top]
        lvl = float(np.percentile(seg, 90))
        sung = sum(max(0, min(z, y1) - max(a, y0)) for y0, y1 in spans) / max(z - a, 1e-6)
        inside = [ln for ln in lines if a - 0.3 <= ln["t0"] < z - 0.3]
        stop = any(min(z, s["t1"]) - max(a, s["t0"]) >= 0.7 * (z - a) for s in stop_list)
        para = paras.get(inside[0]["para"]) if inside else None
        if stop:
            kind = "stop"
        elif not inside and a < (lines[0]["t0"] if lines else dur):
            kind = "intro"
        elif not inside and lines and a >= lines[-1]["t1"]:
            kind = "outro"
        else:
            kind = "peak" if lvl >= top - 1.5 else "high" if lvl >= top - 5 else "calm"
        out.append({"t0": round(a, 2), "t1": round(z, 2), "kind": kind, "loud_db": round(lvl, 1), "sung": round(sung, 2),
                    "part": letter(para) if para and not stop else None,
                    "first_line": inside[0]["text"] if inside else None})
    return out


def salient_hits(times: np.ndarray, strength: np.ndarray, at: np.ndarray, win_s: float = 4.0, thr: float = 2.5,
                 gap_s: float = 0.08) -> list[dict]:
    """Onsets that stand out from THEIR surroundings (a quiet intro's three guitar stabs count, not only the loudest
    hits of the whole song): salience = onset strength / median strength within +-win_s."""
    out: list[dict] = []
    for t in at:
        lo, hi = np.searchsorted(times, t - win_s), np.searchsorted(times, t + win_s)
        local = float(np.median(strength[lo:hi])) if hi > lo else 0.0
        k = int(np.clip(np.searchsorted(times, t), 0, len(strength) - 1))
        v = float(strength[max(0, k - 2):k + 3].max())
        sal = v / max(local, 1e-6)
        if sal >= thr and (not out or t - out[-1]["t"] >= gap_s):
            out.append({"t": round(float(t), 3), "sal": round(sal, 1), "cut": cut_frame(float(t))})
    return out


def fast_runs(hits: list[dict], k: float = 0.6, n: int = 3) -> list[dict]:
    """Runs of >= n band hits much faster than the band's own pulse (spacing < k x the median gap between hits - the
    beat tracker may count half time): a guitar stab triplet, a fill - the moments a cut can ride (Beach intro: three
    fast stabs ~4.6 s, toki 2026-10-22). Pure, from the map."""
    if len(hits) < n:
        return []
    fast = k * float(np.median(np.diff([h["t"] for h in hits])))
    runs, cur = [], [hits[0]]
    for h in hits[1:]:
        if h["t"] - cur[-1]["t"] < fast:
            cur.append(h)
        else:
            if len(cur) >= n:
                runs.append(cur)
            cur = [h]
    if len(cur) >= n:
        runs.append(cur)
    return [{"t0": r[0]["t"], "t1": r[-1]["t"], "times": [h["t"] for h in r], "cuts": [h["cut"] for h in r]} for r in runs]


def instrument_hits(accomp: Path) -> list[dict]:
    """Hits of the band without the voice (accompaniment stem): time, salience, brightness (spectral centroid, Hz)."""
    import librosa

    y, sr = librosa.load(str(accomp), sr=22050, mono=True)
    env = librosa.onset.onset_strength(y=y, sr=sr)
    times = librosa.times_like(env, sr=sr)
    on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, units="time", backtrack=False)
    hits = salient_hits(times, env, on)
    cen = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    ct = librosa.times_like(cen, sr=sr)
    for h in hits:
        k = int(np.clip(np.searchsorted(ct, h["t"]), 0, len(cen) - 1))
        h["bright_hz"] = int(np.median(cen[k:k + 4]))
    return hits


def label_voices(stats: list[dict]) -> list[dict]:
    """Who sings a line, from its measured median pitch (two singers): 2-means on log f0; the cluster that holds the
    Japanese lines is "ado". Lines without enough voiced frames stay unknown. An ESTIMATE - check by ear (duets
    overlap, backing vocals)."""
    pts = [(i, math.log(s["f0"])) for i, s in enumerate(stats) if s.get("f0")]
    out = [{**s, "voice": None, "conf": 0.0} for s in stats]
    if len(pts) < 2:
        return out
    vals = np.array([v for _, v in pts])
    c = np.array([vals.min(), vals.max()])
    for _ in range(30):
        lab = np.abs(vals[:, None] - c[None, :]).argmin(1)
        c = np.array([vals[lab == k].mean() if (lab == k).any() else c[k] for k in (0, 1)])
    ja = [lab[n] for n, (i, _) in enumerate(pts) if stats[i].get("ja")]
    ado = round(float(np.mean(ja))) if ja else 1          # no Japanese line: the higher cluster
    gap = abs(c[1] - c[0]) or 1e-6
    for n, (i, v) in enumerate(pts):
        d0, d1 = abs(v - c[0]), abs(v - c[1])
        out[i]["voice"] = "ado" if lab[n] == ado else "other"
        out[i]["conf"] = round(float(abs(d0 - d1) / gap), 2)
    return out


def line_voices(vocals: Path, lines: list[dict]) -> list[dict]:
    """Median pitch + brightness of every timed line on the vocal stem, labelled by singer (label_voices)."""
    import librosa

    y = load_audio(vocals, SR)
    stats = []
    for ln in lines:
        a, z = int(ln["t0"] * SR), int(ln["t1"] * SR)
        seg = y[a:z]
        f0 = None
        if len(seg) > SR // 5:
            f, voiced, _ = librosa.pyin(seg, fmin=70, fmax=1000, sr=SR, frame_length=1024, hop_length=320)
            ok = f[voiced & ~np.isnan(f)]
            if len(ok) >= 8:
                f0 = round(float(np.median(ok)), 1)
        ja = any(script_of(ch) in ("kata", "hira", "kanji") and not ch.isdigit() for ch in ln["text"])
        stats.append({"i": ln["i"], "t0": ln["t0"], "t1": ln["t1"], "text": ln["text"], "f0": f0, "ja": ja})
    return label_voices(stats)


MELODY_FPS = 20              # contour rate stored in song_map (an effect samples it per frame, 30 fps -> lerp)


def hz_to_midi(f: np.ndarray) -> np.ndarray:
    return 69.0 + 12.0 * np.log2(np.asarray(f, float) / 440.0)


def melody_notes(midi: np.ndarray, fps: float = MELODY_FPS, min_s: float = 0.12, held_s: float = 0.45,
                 jump: float = 0.8) -> list[dict]:
    """A pitch contour (MIDI per frame, NaN = silent) -> notes {t0, t1, midi, held}: a new note where the pitch moves
    by more than `jump` semitones from the running note or the voice stops; notes shorter than min_s are dropped
    (consonants, octave slips). `held` = a long note an effect can sustain on (toki 2026-10-25: effects on the melody)."""
    notes, a, vals = [], None, []

    def close(z: int) -> None:
        if a is not None and (z - a) / fps >= min_s:
            notes.append({"t0": round(a / fps, 2), "t1": round(z / fps, 2), "midi": round(float(np.median(vals)), 1),
                          "held": (z - a) / fps >= held_s})

    for k, m in enumerate(midi):
        if np.isnan(m):
            close(k)
            a, vals = None, []
        elif a is None:
            a, vals = k, [m]
        elif abs(m - np.median(vals)) > jump:
            close(k)
            a, vals = k, [m]
        else:
            vals.append(m)
    close(len(midi))
    return notes


def melody_shape(notes: list[dict], gap_s: float = 0.35) -> list[dict]:
    """Phrases of the melody (notes closer than gap_s) with their shape: lowest / highest note, where the peak is,
    and the direction (rise / fall / arch / flat) - what a picture can follow over a whole line."""
    out, cur = [], []
    for n in notes + [None]:
        if cur and (n is None or n["t0"] - cur[-1]["t1"] > gap_s):
            ms = [x["midi"] for x in cur]
            top = max(range(len(cur)), key=lambda i: ms[i])
            d = ms[-1] - ms[0]
            shape = "flat" if max(ms) - min(ms) < 2 else ("arch" if 0 < top < len(cur) - 1 and ms[top] - max(ms[0], ms[-1]) >= 2
                                                          else "rise" if d > 0 else "fall")
            out.append({"t0": cur[0]["t0"], "t1": cur[-1]["t1"], "low": min(ms), "high": max(ms),
                        "peak_t": cur[top]["t0"], "shape": shape, "notes": len(cur)})
            cur = []
        if n is not None:
            cur.append(n)
    return out


def octave_fix(y: np.ndarray, sr: int, f: np.ndarray, hop: int, n_fft: int = 4096, weak: float = 0.25) -> np.ndarray:
    """pyin's sub-harmonic slip: a frame reported at f with (almost) no energy at f but a strong partial at 2f is the
    octave above. Measured 2026-10-25: a clean 220 Hz glide read as 110 Hz for the WHOLE track once half a second of
    silence followed it (librosa 1.0 pyin) - so every frame is checked against the spectrum, up to two octaves."""
    S = np.abs(np.fft.rfft(np.lib.stride_tricks.sliding_window_view(np.pad(y, n_fft // 2), n_fft)[::hop][:len(f)]
                           * np.hanning(n_fft), axis=1))
    freqs = np.fft.rfftfreq(n_fft, 1 / sr)

    def mag(k: int, hz: float) -> float:
        i = int(np.searchsorted(freqs, hz))
        return float(S[k, max(0, i - 2):i + 3].max()) if i < len(freqs) else 0.0

    out = f.copy()
    for k in range(min(len(f), len(S))):
        for _ in range(2):
            if np.isnan(out[k]) or mag(k, out[k]) >= weak * mag(k, 2 * out[k]):
                break
            out[k] *= 2
    return out


def melody_track(wav: Path, fmin: float = 80.0, fmax: float = 1400.0, min_prob: float = 0.5) -> dict:
    """The melody of a stem as data (librosa pyin): contour (MIDI at MELODY_FPS, null = silent), notes, phrases.
    pyin is monophonic - on the vocal stem it is the sung line; on the `other` stem (synths, guitars, keys) it follows
    the loudest line and is an ESTIMATE (chords confuse it): check the lead by ear in the dossier."""
    import librosa

    sr = 22050
    y = load_audio(wav, sr)
    hop = int(sr / MELODY_FPS)
    f, voiced, prob = librosa.pyin(y, fmin=fmin, fmax=fmax, sr=sr, frame_length=2048, hop_length=hop)
    f = np.where(voiced & (prob >= min_prob) & ~np.isnan(f), f, np.nan)
    f = octave_fix(y, sr, f, hop)
    midi = hz_to_midi(np.where(np.isnan(f), 440.0, f))
    midi[np.isnan(f)] = np.nan
    notes = melody_notes(midi)
    return {"fps": MELODY_FPS, "contour": [None if np.isnan(m) else round(float(m), 1) for m in midi],
            "notes": notes, "phrases": melody_shape(notes)}


def top_line(cqt_db: np.ndarray, midi0: float, gate_db: float = 18.0, within_db: float = 15.0,
             top: int | None = None) -> np.ndarray:
    """The melody on top of chords (MIDI per frame, NaN = none) from a semitone CQT in dB: the candidates are the
    spectral peaks within `within_db` of the frame's loudest; a candidate that sits an octave / twelfth / two octaves
    above a LOUDER lower candidate is that note's overtone and dropped; the highest note left (below `top`) is the
    lead - it sits on top of the pads. Voiced only when the frame's loudest stands gate_db above its median.
    Harmonic summation was tried first and failed: the chord's root collects the overtones and wins (test 2026-10-25)."""
    n_bins, n = cqt_db.shape
    top = n_bins if top is None else top
    out = np.full(n, np.nan)
    for j in range(n):
        col = cqt_db[:, j]
        mx = col.max()
        if mx - np.median(col) < gate_db:
            continue
        pk = [i for i in range(n_bins) if col[i] >= mx - within_db and col[i] >= col[max(0, i - 1)]
              and col[i] >= col[min(n_bins - 1, i + 1)]]
        kept: list[int] = []
        for i in pk:
            if not any(i - b in (12, 19, 24, 28, 31) and col[i] < col[b] - 1.0 for b in kept):
                kept.append(i)
        kept = [i for i in kept if i < top]
        if kept:
            out[j] = midi0 + kept[-1]
    return out


def lead_track(wav: Path, fmin_midi: int = 48, n_bins: int = 48) -> dict:
    """The band's lead melody (Demucs `other` stem: synths, guitars, keys) as data like melody_track. pyin gives up on
    a polyphonic stem (2026-10-25 Love is War: 0 % voiced), so this follows the top line of a semitone CQT instead.
    An ESTIMATE - check by ear in the dossier."""
    import librosa

    sr = 22050
    y = load_audio(wav, sr)
    hop = 512                                            # cqt needs a multiple of 2^octaves; resampled to MELODY_FPS
    C = np.abs(librosa.cqt(y, sr=sr, hop_length=hop, fmin=librosa.midi_to_hz(fmin_midi), n_bins=n_bins + 24,
                           bins_per_octave=12))
    m = top_line(librosa.amplitude_to_db(C, ref=np.max), float(fmin_midi), top=n_bins)
    t_src = np.arange(len(m)) * hop / sr
    t_dst = np.arange(0, t_src[-1], 1 / MELODY_FPS)
    idx = np.clip(np.searchsorted(t_src, t_dst), 0, len(m) - 1)
    midi = m[idx]
    notes = melody_notes(midi)
    return {"fps": MELODY_FPS, "contour": [None if np.isnan(v) else round(float(v), 1) for v in midi],
            "notes": notes, "phrases": melody_shape(notes), "method": "cqt top line (estimate)"}


def song_map(song: Path, vocals: Path, lines: list[dict], accomp: Path | None = None) -> dict:
    full = load_audio(song, SR)
    dur = len(full) / SR
    db = loudness_db(full, SR)
    b = beats(song)
    bt = b.pop("beat_features")
    nov = novelty(bt, k=8)
    nb = [b["beats"][i] for i in peaks(nov, 16, 0.25) if 0 < i < len(b["beats"])]
    st = stops(db)
    vx = load_audio(vocals, SR)
    spans = vocal_spans(loudness_db(vx, SR))
    loud = [round(float(v), 1) for v in db]
    out = {"duration": round(dur, 2), "bpm": b["bpm"], "beats": b["beats"], "hits": b["hits"],
           "sections": sections(dur, nb, st, spans, loud, lines), "stops": st, "vocal_spans": spans,
           "vocal_onsets": pick_onsets(onset_env(vx)), "novelty_bounds": nb, "loudness_db_10hz": loud}
    if accomp is not None and accomp.is_file():
        out["inst_hits"] = instrument_hits(accomp)     # 2026-10-22 (Beach: guitar stabs, the can opening)
        out["fast_runs"] = fast_runs(out["inst_hits"])
    # 2026-10-22: median pitch per line. Beach showed it measures REGISTER, not the singer (Dan Reynolds and Ado both
    # sing the verse low and the bridge high) - "voice" is only a hint; who sings is checked by ear in the dossier
    out["voices"] = line_voices(vocals, lines)
    # 2026-10-25 (Love is War, toki: "on beat / melodie effekte"): the melody as data - the sung line and the lead of
    # the band (Demucs `other` stem) - so an effect can rise, fall and hold with the tune, not only hit on the beat
    out["melody"] = {"vocal": melody_track(vocals)}
    other = vocals.with_name("other.wav")
    if other.is_file():
        out["melody"]["lead"] = lead_track(other)
    return out


def resection(job_dir: Path) -> None:
    """Recompute song_map sections from the stored measurements + the current lyric times (light, local)."""
    f = job_dir / "song_map.json"
    if not f.is_file():
        return
    sm = json.loads(f.read_text(encoding="utf-8"))
    lines = json.loads((job_dir / "lyrics_timed.json").read_text(encoding="utf-8"))["lines"]
    nb = sm.get("novelty_bounds") or [s["t0"] for s in sm["sections"][1:]]
    sm["novelty_bounds"] = nb
    sm["sections"] = sections(sm["duration"], nb, sm["stops"], sm["vocal_spans"], sm["loudness_db_10hz"], lines)
    f.write_text(json.dumps(sm, indent=1, ensure_ascii=False), encoding="utf-8", newline="\n")


def analyze(job_dir: Path) -> dict:
    """Full measurement for a job (cloud): jobs/<job>/analyze.json = {song, lyrics, language, model}."""
    cfg = json.loads((job_dir / "analyze.json").read_text(encoding="utf-8"))
    song = job_dir / cfg.get("song", "song.webm")
    stems = job_dir / "out" / "stems"
    wav = stems / "vocals.wav"
    if not wav.is_file() or not (stems / "accomp.wav").is_file() or not (stems / "other.wav").is_file():
        separate(song, stems)
    ogg = job_dir / "vocals.ogg"            # small stem kept in the repo: local re-alignment + checks by ear
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav), "-ac", "1", "-c:a", "libopus", "-b:a", "48k",
                    str(ogg)], check=True)
    lyr = job_dir / cfg.get("lyrics", "lyrics.txt")
    text = lyr.read_text(encoding="utf-8") if lyr.is_file() else ""
    cache = job_dir / "whisper_words.json"
    if cache.is_file():
        asr = json.loads(cache.read_text(encoding="utf-8"))
    else:
        asr = transcribe(wav, cfg.get("language", "ja"), " ".join(text.split()), cfg.get("model", "large-v3"))
        cache.write_text(json.dumps(asr, ensure_ascii=False, indent=0), encoding="utf-8", newline="\n")
    langs = cfg.get("gap_languages")      # e.g. ["en", "ko"] for a bilingual song: a second pass on the empty windows
    gap_log = cache.with_name("whisper_gaps.json")
    if langs and not gap_log.is_file():
        spans0 = vocal_spans(loudness_db(load_audio(wav, SR), SR))
        asr, log = fill_gaps(wav, asr, spans0, list(langs), " ".join(text.split()), cfg.get("model", "large-v3"))
        cache.write_text(json.dumps(asr, ensure_ascii=False, indent=0), encoding="utf-8", newline="\n")
        gap_log.write_text(json.dumps(log, indent=1), encoding="utf-8", newline="\n")
    if not text:                          # no official text yet: what the recogniser heard, one line per phrase -
        text = heard_lines(asr)           # toki replaces it with the official text, `raymi lyrics` re-aligns locally
        (job_dir / "lyrics_heard.txt").write_text(text, encoding="utf-8", newline="\n")
    res = time_lyrics(job_dir, text, asr, wav)
    lines = res["lines"]
    sm = song_map(song, wav, lines, stems / "accomp.wav")
    (job_dir / "song_map.json").write_text(json.dumps(sm, indent=1, ensure_ascii=False), encoding="utf-8", newline="\n")
    return {"lines": len(lines), "stats": res["stats"], "sections": len(sm["sections"]), "bpm": sm["bpm"]}


def heard_lines(asr: list[dict], gap: float = 0.7, max_words: int = 12) -> str:
    """The recognised words as a draft lyric text: a new line after a pause >= gap s or max_words words. Only a
    stand-in until the official text is in lyrics.txt (the source label says so)."""
    out, cur, prev = [], [], None
    for w in asr:
        if cur and (w["t0"] - prev >= gap or len(cur) >= max_words):
            out.append(" ".join(cur))
            cur = []
        cur.append(w["w"])
        prev = w["t1"]
    if cur:
        out.append(" ".join(cur))
    return "# heard by the recogniser, NOT the official text - replace before the script step\n" + "\n".join(out) + "\n"


def time_lyrics(job_dir: Path, text: str, asr: list[dict], vocals: Path) -> dict:
    lines = parse_lyrics(text)
    vx = load_audio(vocals, SR)
    dur = len(vx) / SR
    on = pick_onsets(onset_env(vx))
    spans = vocal_spans(loudness_db(vx, SR))
    timed = time_words(lines, align(lines, asr), on, dur, spans)
    flat = [w for ln in timed for w in ln["words"]]
    stats = {k: sum(1 for w in flat if w["how"] == k) for k in ("snapped", "measured", "interpolated")}
    stats["words"] = len(flat)
    res = {"fps": FPS, "source": {"lyrics": ("HEARD by the recogniser (lyrics_heard.txt), not official" if text.startswith("# heard")
           else text.splitlines()[0].lstrip("# ").strip() if text.startswith("#") else "official text (YouTube description)"),
           "timing": "vocal stem: demucs "
           "htdemucs + faster-whisper word times, romaji letter match, snapped to vocal onsets"},
           "stats": stats, "lines": timed}
    (job_dir / "lyrics_timed.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8", newline="\n")
    return res

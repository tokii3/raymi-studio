"""A music bed's map (a known instrumental under a talking Short): tempo, beat grid, accents -> <track>.map.json.

Light (numpy on the decoded audio, no stems): good enough to cut on the beat of an instrumental. The film reads it like
a song map ("song_map" in shots.json: {"beats": [...], "hits": [...]}, seconds of the track).
`python -m raymi bed <track.mp3>` writes assets/music/<track>.map.json next to the file.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

SR = 22050
HOP = 256


def decode(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768


def onset_strength(x: np.ndarray) -> np.ndarray:
    n = 1024
    frames = np.lib.stride_tricks.sliding_window_view(np.pad(x, (0, n)), n)[::HOP]
    spec = np.abs(np.fft.rfft(frames * np.hanning(n), axis=1))
    logs = np.log1p(spec * 10)
    flux = np.maximum(np.diff(logs, axis=0), 0).sum(axis=1)
    flux = np.concatenate([[0], flux])
    flux -= np.convolve(flux, np.ones(16) / 16, mode="same")
    return np.maximum(flux, 0)


def tempo(env: np.ndarray, lo: float = 70, hi: float = 180) -> float:
    fps = SR / HOP
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    lags = np.arange(len(ac))
    bpm = 60 * fps / np.maximum(lags, 1)
    ok = (bpm >= lo) & (bpm <= hi)
    lag = lags[ok][np.argmax(ac[ok])]
    return float(60 * fps / lag)


def beat_grid(env: np.ndarray, bpm: float) -> list[float]:
    """The beat phase that sits on the most onset energy, as a fixed grid (instrumentals hold their tempo)."""
    fps = SR / HOP
    period = 60 * fps / bpm
    best, best_phase = -1.0, 0.0
    for ph in np.linspace(0, period, 48, endpoint=False):
        idx = np.round(np.arange(ph, len(env) - 1, period)).astype(int)
        score = env[idx].sum()
        if score > best:
            best, best_phase = score, ph
    return [round(float(i / fps), 3) for i in np.arange(best_phase, len(env) - 1, period)]


def accents(env: np.ndarray, beats: list[float], top: float = 0.25) -> list[float]:
    """The beats carrying the strongest onsets (the top quarter): where a cut or a camera kick lands hardest."""
    fps = SR / HOP
    vals = [env[max(0, int(b * fps) - 2): int(b * fps) + 3].max() for b in beats]
    if not vals:
        return []
    cut = np.quantile(vals, 1 - top)
    return [b for b, v in zip(beats, vals) if v >= cut]


def analyse(path: Path) -> dict:
    x = decode(path)
    env = onset_strength(x)
    bpm = tempo(env)
    beats = beat_grid(env, bpm)
    return {"file": path.name, "duration": round(len(x) / SR, 3), "bpm": round(bpm, 2), "beats": beats,
            "hits": accents(env, beats), "source": "raymi/bed.py (onset flux, fixed grid)"}


def write(path: Path) -> Path:
    out = path.with_suffix(".map.json")
    out.write_text(json.dumps(analyse(path), indent=1), encoding="utf-8")
    return out

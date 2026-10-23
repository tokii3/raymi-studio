"""Her sound-effect library, synthesised (owned by the channel, no licence to track): assets/sfx/<kind>.wav.

`python -m raymi sfx build` writes every kind; deterministic (fixed seeds), so a rebuild gives the same files.
shots.json names them: "sfx": [{"at": 6.1, "kind": "tap", "db": -6}] (raymi/voice_lines.py mixes them).
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[1] / "assets" / "sfx"


def _t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def _env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / max(decay, 1e-4))


def _lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def tap() -> np.ndarray:
    """A knuckle on aquarium glass: a dull knock + a short glassy ring."""
    t = _t(0.35)
    rng = np.random.default_rng(1)
    knock = _lowpass(rng.standard_normal(len(t)), 900) * _env(len(t), 0.001, 0.018) * 3
    ring = (np.sin(2 * np.pi * 1870 * t) + 0.5 * np.sin(2 * np.pi * 3110 * t)) * _env(len(t), 0.001, 0.06) * 0.35
    return knock + ring


def step() -> np.ndarray:
    """A soft creeping footstep on a floor."""
    t = _t(0.3)
    rng = np.random.default_rng(2)
    thud = np.sin(2 * np.pi * 70 * t) * _env(len(t), 0.004, 0.05)
    scuff = _lowpass(rng.standard_normal(len(t)), 2500) * _env(len(t), 0.01, 0.04) * 0.4
    return thud + scuff


def whoosh() -> np.ndarray:
    """Air rushing past (a whip of the head, a tunnel, a fast move)."""
    t = _t(0.55)
    rng = np.random.default_rng(3)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    for lo, hi, w in ((300, 900, 1.0), (900, 2600, 0.6)):
        out += (_lowpass(n, hi) - _lowpass(n, lo)) * w
    env = np.sin(np.pi * np.clip(t / t[-1], 0, 1)) ** 2
    return out * env * 2.2


def pop() -> np.ndarray:
    """A bubble pop (an icon appears)."""
    t = _t(0.12)
    f = 600 + 1400 * (t / t[-1])
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), 0.002, 0.03)


def scratch() -> np.ndarray:
    """A record scratch (the picture freezes)."""
    t = _t(0.42)
    rng = np.random.default_rng(4)
    rate = 1 + 0.9 * np.sin(2 * np.pi * 6 * t)
    n = _lowpass(rng.standard_normal(len(t)) * rate, 3500)
    tone = np.sin(2 * np.pi * np.cumsum(300 + 500 * np.sin(2 * np.pi * 6 * t)) / SR) * 0.4
    return (n * 0.8 + tone) * _env(len(t), 0.005, 0.25)


def sting() -> np.ndarray:
    """A short dramatic stab (a reveal)."""
    t = _t(1.1)
    chord = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) for f in (110, 130.8, 155.6, 220))
    return chord * _env(len(t), 0.004, 0.35) * 0.35


def boing() -> np.ndarray:
    """A cartoon boing (something bobs into the frame)."""
    t = _t(0.5)
    f = 180 + 90 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), 0.003, 0.18)


def grab() -> np.ndarray:
    """A hand slapping over the lens (a muffled thump + cloth)."""
    t = _t(0.4)
    rng = np.random.default_rng(5)
    thump = np.sin(2 * np.pi * 55 * t) * _env(len(t), 0.002, 0.08) * 1.4
    cloth = _lowpass(rng.standard_normal(len(t)), 1200) * _env(len(t), 0.004, 0.06) * 0.8
    return thump + cloth


def click() -> np.ndarray:
    """A light switch."""
    t = _t(0.08)
    rng = np.random.default_rng(6)
    return _lowpass(rng.standard_normal(len(t)), 5000) * _env(len(t), 0.0005, 0.006) * 3


def chime() -> np.ndarray:
    """A bright two-note chime (on air / a correct answer)."""
    t = _t(0.9)
    a = np.sin(2 * np.pi * 1318.5 * t) * _env(len(t), 0.002, 0.25)
    b = np.sin(2 * np.pi * 1760 * t) * _env(len(t), 0.002, 0.35)
    b = np.concatenate([np.zeros(int(SR * 0.12)), b])[: len(t)]
    return (a + b) * 0.45


def beep() -> np.ndarray:
    """An alarm clock: four quick high beeps (one second, loop it by placing several)."""
    t = _t(1.0)
    gate = ((t % 0.25) < 0.09).astype(float)
    return np.sin(2 * np.pi * 2900 * t) * gate * 0.6


KINDS = {"beep": beep, "tap": tap, "step": step, "whoosh": whoosh, "pop": pop, "scratch": scratch, "sting": sting, "boing": boing,
         "grab": grab, "click": click, "chime": chime}


def write(kind: str, out: Path = OUT) -> Path:
    x = KINDS[kind]()
    x = x / max(1e-6, np.max(np.abs(x))) * 0.89
    pcm = (np.stack([x, x], axis=1) * 32767).astype("<i2")
    out.mkdir(parents=True, exist_ok=True)
    p = out / f"{kind}.wav"
    with wave.open(str(p), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return p


def build_all() -> list[Path]:
    return [write(k) for k in sorted(KINDS)]

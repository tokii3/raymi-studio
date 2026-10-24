"""Mashups / remixes: songs split into stems, measured, then laid on ONE bar grid at one tempo and key (data, not code).

Why: toki 2026-10-24 wanted "Watch Me" vocals over Circus + the LoveGame riff + Akali's FIRESTARTER rap, faster and
with bass. A mashup only works when every piece sits on the same bar at the same tempo and key - so nothing is
guessed: tempo, bars (downbeats) and key are MEASURED per source (cloud, like song.py), and a mashup is a list of
bar-placed parts in `jobs/<job>/mashup.json`:

  {"tempo": 128, "key": "watchme",            # target key: a key name ("F#m") or a source name (its measured key)
   "sources": {"watchme": {"file": "watchme.webm"}, "circus": {"file": "circus.webm"}},
   "parts": [{"src": "circus", "stems": ["drums", "bass", "other"], "from_bar": 8, "bars": 8, "at_bar": 0,
              "gain_db": 0, "shift": null, "fade_in_bars": 0, "fade_out_bars": 0}],   # shift null = to target key
   "master": {"bass_db": 5, "bass_hz": 75, "duck_db": 4, "lufs": -14, "start_bar": 0, "end_bar": null}}

1. `measure` (cloud, mashup.yml): Demucs htdemucs -> drums / bass / other / vocals per source (artifact, not in git),
   `measure.json` = bpm, beats, bars (downbeat phase from the kick), key, loudness of every stem per bar.
2. `build` (light, ffmpeg + numpy): each part's bars are cut on the source's MEASURED bar times, stretched by
   rubberband to exactly its bars at the target tempo (formant-kept pitch shift), placed on the bar grid, summed;
   the beat ducks a little under the voice, low shelf for the bass, limiter, loudnorm.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

SR = 44100
STEMS = ("drums", "bass", "other", "vocals")
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
# Krumhansl-Kessler key profiles
_MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
_MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


# ------------------------------------------------------------------ light helpers (tested)

def key_name(tonic: int, minor: bool) -> str:
    return NOTES[tonic % 12] + ("m" if minor else "")


def parse_key(name: str) -> tuple[int, bool]:
    minor = name.endswith("m")
    return NOTES.index(name[:-1] if minor else name), minor


def key_of(chroma_mean: np.ndarray) -> list[dict]:
    """Best keys for a mean chroma vector (Krumhansl), best first."""
    c = (chroma_mean - chroma_mean.mean()) / (chroma_mean.std() + 1e-9)
    out = []
    for minor, prof in ((False, _MAJ), (True, _MIN)):
        p = (prof - prof.mean()) / prof.std()
        for t in range(12):
            out.append({"key": key_name(t, minor), "r": round(float(np.dot(c, np.roll(p, t)) / 12), 3)})
    return sorted(out, key=lambda k: -k["r"])


def shift_to(src: str, dst: str) -> int:
    """Semitones that move key src onto key dst, smallest move (-6..+5). Major / minor are compared through the
    relative major (Am == C), so a minor song can sit over its relative major's chords."""
    def rel(k: str) -> int:
        t, m = parse_key(k)
        return (t + 3) % 12 if m else t
    d = (rel(dst) - rel(src)) % 12
    return d - 12 if d > 5 else d


def downbeat_phase(kick: np.ndarray) -> int:
    """Which of every 4 beats is the 1: the phase whose beats carry the most kick (pop / EDM: the kick on 1)."""
    return int(np.argmax([kick[k::4].mean() if len(kick[k::4]) else 0 for k in range(4)]))


def bar_time(bars: list[float], b: float, bar_s: float) -> float:
    """Time of (fractional) bar b on a measured bar list; past the ends it continues at the source's bar length."""
    if b < 0:
        return bars[0] + b * bar_s
    i = int(b)
    if i + 1 < len(bars):
        return bars[i] + (b - i) * (bars[i + 1] - bars[i])
    return bars[-1] + (b - (len(bars) - 1)) * bar_s


# ------------------------------------------------------------------ audio IO

def load(path: Path, sr: int = SR) -> np.ndarray:
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(sr), "-"],
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32).reshape(-1, 2).T.copy()


def save(x: np.ndarray, path: Path, sr: int = SR, args: list[str] | None = None) -> None:
    pcm = np.ascontiguousarray(x.T, np.float32).tobytes()
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ac", "2", "-ar", str(sr), "-i", "-",
                    *(args or []), str(path)], input=pcm, check=True)


def stem_path(job_dir: Path, src: str, stem: str) -> Path:
    return job_dir / "out" / "stems" / src / f"{stem}.ogg"


# ------------------------------------------------------------------ measure (cloud)

def separate_all(song: Path, out_dir: Path) -> None:
    import torch
    from demucs.apply import apply_model
    from demucs.pretrained import get_model

    model = get_model("htdemucs")
    model.eval()
    x = torch.from_numpy(load(song, model.samplerate))
    ref = x.mean(0)
    x = (x - ref.mean()) / (ref.std() + 1e-8)
    with torch.no_grad():
        y = apply_model(model, x[None], device="cpu", shifts=2, split=True, overlap=0.25, progress=False)[0]
    y = y * (ref.std() + 1e-8) + ref.mean()
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, n in enumerate(model.sources):
        save(np.clip(y[i].numpy(), -1, 1), out_dir / f"{n}.ogg", model.samplerate,
             ["-c:a", "libopus", "-b:a", "256k"])


def measure_source(job_dir: Path, name: str, file: str) -> dict:
    import librosa

    song = job_dir / file
    sd = job_dir / "out" / "stems" / name
    if not all((sd / f"{s}.ogg").is_file() for s in STEMS):
        separate_all(song, sd)
    sr = 22050
    y = librosa.to_mono(load(song, sr))
    tempo, bt = librosa.beat.beat_track(y=y, sr=sr, units="time", start_bpm=120)
    bpm = float(np.atleast_1d(tempo)[0])
    st = {s: librosa.to_mono(load(sd / f"{s}.ogg", sr)) for s in STEMS}
    # kick: low band of the drum stem, onset strength at each beat
    d = st["drums"]
    S = np.abs(librosa.stft(d, n_fft=2048, hop_length=512))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S[freqs < 150].sum(0)
    on = np.maximum(0, np.diff(low, prepend=low[0]))
    tf = librosa.frames_to_time(np.arange(len(on)), sr=sr, hop_length=512)
    kick = np.array([on[max(0, i - 2):i + 3].max() for i in np.searchsorted(tf, bt)]) if len(bt) else np.zeros(0)
    ph = downbeat_phase(kick)
    bars = [float(t) for t in bt[ph::4]]
    harm = st["bass"] + st["other"]
    chroma = librosa.feature.chroma_cqt(y=harm, sr=sr)
    keys = key_of(chroma.mean(1))
    per_bar = []
    for a, z in zip(bars, bars[1:] + [len(y) / sr]):
        row = {"t": round(a, 3)}
        for s in STEMS:
            seg = st[s][int(a * sr):int(z * sr)]
            row[s] = round(float(20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)), 1) if len(seg) else -120.0
        per_bar.append(row)
    return {"file": file, "duration": round(len(y) / sr, 2), "bpm": round(bpm, 2),
            "beats": [round(float(t), 3) for t in bt], "downbeat_phase": ph, "bars": [round(t, 3) for t in bars],
            "key": keys[0]["key"], "keys_top3": keys[:3], "per_bar_db": per_bar}


def measure(job_dir: Path) -> dict:
    cfg = json.loads((job_dir / "mashup.json").read_text(encoding="utf-8"))
    res = {n: measure_source(job_dir, n, s["file"]) for n, s in cfg["sources"].items()}
    (job_dir / "measure.json").write_text(json.dumps(res, indent=1), encoding="utf-8", newline="\n")
    return {n: {"bpm": r["bpm"], "key": r["key"], "bars": len(r["bars"])} for n, r in res.items()}


# ------------------------------------------------------------------ build (light)

def stretch(x: np.ndarray, ratio: float, semis: float, tmp: Path) -> np.ndarray:
    """Rubberband: tempo x ratio (>1 = faster), pitch by semitones, formants kept (voices stay human)."""
    src, dst = tmp.with_suffix(".in.wav"), tmp.with_suffix(".out.wav")
    save(x, src)
    af = f"rubberband=tempo={ratio:.6f}:pitch={2 ** (semis / 12):.6f}:formant=preserved:transients=crisp:window=standard"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", af, str(dst)], check=True)
    out = load(dst)
    src.unlink()
    dst.unlink()
    return out


def build(job_dir: Path, out_name: str = "mashup") -> dict:
    cfg = json.loads((job_dir / "mashup.json").read_text(encoding="utf-8"))
    meas = json.loads((job_dir / "measure.json").read_text(encoding="utf-8"))
    tempo = float(cfg["tempo"])
    bar_n = int(round(SR * 4 * 60 / tempo))           # samples per target bar (whole samples: no drift)
    tk = cfg.get("key")
    tkey = meas[tk]["key"] if tk in meas else tk
    parts = cfg["parts"]
    total = max(p["at_bar"] + p["bars"] for p in parts)
    mix = {"inst": np.zeros((2, total * bar_n + SR), np.float32), "vox": np.zeros((2, total * bar_n + SR), np.float32)}
    tmp = job_dir / "out" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    cache: dict = {}
    log = []
    for k, p in enumerate(parts):
        m = meas[p["src"]]
        bar_s = 4 * 60 / m["bpm"]
        a = bar_time(m["bars"], p["from_bar"], bar_s) + p.get("offset_s", 0.0)
        z = bar_time(m["bars"], p["from_bar"] + p["bars"], bar_s) + p.get("offset_s", 0.0)
        semis = p["shift"] if p.get("shift") is not None else shift_to(m["key"], tkey) if tkey else 0
        x = None
        for s in p["stems"]:
            key = (p["src"], s)
            if key not in cache:
                cache[key] = load(stem_path(job_dir, p["src"], s))
            seg = cache[key][:, max(0, int(a * SR)):int(z * SR)]
            x = seg if x is None else x[:, :seg.shape[1]] + seg[:, :x.shape[1]]
        n = p["bars"] * bar_n
        y = stretch(x, x.shape[1] / n, semis, tmp / f"p{k}")
        y = y[:, :n] if y.shape[1] >= n else np.pad(y, ((0, 0), (0, n - y.shape[1])))
        g = np.ones(n, np.float32) * 10 ** (p.get("gain_db", 0) / 20)
        fi, fo = int(p.get("fade_in_bars", 0) * bar_n), int(p.get("fade_out_bars", 0) * bar_n)
        edge = int(0.004 * SR)                        # 4 ms: no click at a cut
        g[:max(fi, edge)] *= np.linspace(0, 1, max(fi, edge))
        g[n - max(fo, edge):] *= np.linspace(1, 0, max(fo, edge))
        bus = "vox" if p["stems"] == ["vocals"] and not p.get("as_inst") else "inst"
        o = p["at_bar"] * bar_n
        mix[bus][:, o:o + n] += y * g
        log.append({"part": k, "src": p["src"], "stems": p["stems"], "src_s": [round(a, 2), round(z, 2)],
                    "ratio": round(x.shape[1] / n, 4), "shift": semis, "at_s": round(o / SR, 2)})
    ms = cfg.get("master", {})
    s0 = int(ms.get("start_bar", 0) * bar_n)
    s1 = int(ms["end_bar"] * bar_n) if ms.get("end_bar") else total * bar_n
    inst, vox = tmp / "inst.wav", tmp / "vox.wav"
    save(mix["inst"][:, s0:s1], inst)
    save(mix["vox"][:, s0:s1], vox)
    out_dir = job_dir / "out"
    wav = out_dir / f"{out_name}.wav"
    duck = ms.get("duck_db", 4)
    fc = (f"[1:a]asplit=2[vk][vm];"
          f"[0:a][vk]sidechaincompress=threshold=0.05:ratio={1 + duck / 2:.2f}:attack=15:release=180:makeup=1[id];"
          f"[id][vm]amix=inputs=2:normalize=0,"
          f"equalizer=f={ms.get('bass_hz', 75)}:t=h:w=1.2:g={ms.get('bass_db', 5)},"   # wide bell = bass boost
          f"highpass=f=28,alimiter=limit=0.89:attack=5:release=60:level=disabled[m]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(inst), "-i", str(vox), "-filter_complex", fc,
                    "-map", "[m]", "-ar", str(SR), str(wav)], check=True)
    mp3 = out_dir / f"{out_name}.mp3"
    lufs = ms.get("lufs", -14)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav), "-af", f"loudnorm=I={lufs}:TP=-1.0:LRA=11",
                    "-ar", str(SR), "-b:a", "320k", str(mp3)], check=True)
    for f in (inst, vox):
        f.unlink()
    res = {"tempo": tempo, "key": tkey, "bars": total, "seconds": round((s1 - s0) / SR, 2), "parts": log,
           "out": str(mp3)}
    (out_dir / f"{out_name}.json").write_text(json.dumps(res, indent=1), encoding="utf-8", newline="\n")
    return res

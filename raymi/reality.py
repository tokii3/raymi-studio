"""What the finished video REALLY does - measured on its pixels, never read from shots.json (toki 2026-10-25: "wenn du
ein Skript schreibst in dem steht eine einzige Kamerafahrt, dann müssen die Checks das erkennen, falls es nicht so ist
- ist aber nie passiert").

- cuts:   hard cuts from ffmpeg's scene score (a real cut, not a planned one)
- motion: CAMERA motion per shot (corners tracked at the frame edges, where the set is) (a "never still" brief vs static shots)
- face:   Raymi's face TURNED TO THE LENS (frontal) found by an anime face detector (lbpcascade_animeface, MIT, nagadomi): visible?, how big,
          where - per shot
Then the brief contract's reality claims (`jobs/<job>/0_BRIEF.md`, section "## Reality claims", lines `- key: value`)
are checked against the measurement; exit 1 on a contradiction. Works on the pros too (calibration: a reference
oner must give 0 cuts, a FIRESTARTER burst must give its 7 cuts).
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

CASCADE = Path(__file__).parent / "data" / "lbpcascade_animeface.xml"
SCENE = 0.32          # ffmpeg scene score for a hard cut
STILL = 0.12          # % of the width per 1/6 s: below it a shot reads as a standing camera (calibrated on frames)


def cuts(video: Path, thr: float = SCENE) -> list[float]:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(video), "-vf", f"select='gt(scene,{thr})',showinfo",
                        "-an", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace")
    return [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", r.stderr)]


def _frames(video: Path, fps: float, width: int = 480):
    cap = cv2.VideoCapture(str(video))
    src = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step, i = max(1, round(src / fps)), 0
    while True:
        ok, f = cap.read()
        if not ok:
            break
        if i % step == 0:
            h = int(f.shape[0] * width / f.shape[1])
            yield i / src, cv2.resize(f, (width, h))
        i += 1
    cap.release()


def _shift(a: np.ndarray, b: np.ndarray) -> float:
    """CAMERA motion between two samples in % of the width: median displacement of corners tracked in the outer band
    of the frame (the set, rarely her). Checked on run 67 frames 2026-10-25: a whole-frame dense-flow median read 0 on
    the flat studio wall while the camera moved; whole-frame corners measured her dance instead of the lens."""
    h, w = a.shape
    band = np.zeros_like(a)
    bw, bh = w // 5, h // 5
    band[:bh, :] = band[-bh:, :] = band[:, :bw] = band[:, -bw:] = 255
    pts = cv2.goodFeaturesToTrack(a, 200, 0.01, 6, mask=band)
    if pts is None or len(pts) < 6:
        return float("nan")                     # nothing to track at the edges: unknown, never "still"
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(a, b, pts, None)
    ok = st.ravel() == 1
    if ok.sum() < 6:
        return float("nan")
    # the set moves together, drifting particles / her hair do not: one similarity transform by RANSAC
    m, inl = cv2.estimateAffinePartial2D(pts[ok], nxt[ok], method=cv2.RANSAC, ransacReprojThreshold=1.5)
    if m is None or inl is None or inl.sum() < max(6, 0.4 * ok.sum()):
        return float("nan")
    scale = float(np.hypot(m[0, 0], m[1, 0]))
    move = float(np.hypot(m[0, 2] + (scale - 1) * w / 2, m[1, 2] + (scale - 1) * h / 2))   # pan + zoom / dolly
    return (float(np.hypot(m[0, 2], m[1, 2])) + abs(scale - 1) * w / 2) / w * 100 if move == move else float("nan")


def measure(video: Path) -> dict:
    cut_t = cuts(video)
    det = cv2.CascadeClassifier(str(CASCADE))
    rows, prev = [], None
    for t, f in _frames(video, 6):
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        flow = _shift(prev, g) if prev is not None else 0.0
        prev = g
        faces = det.detectMultiScale(cv2.equalizeHist(g), 1.1, 4, minSize=(g.shape[0] // 14, g.shape[0] // 14))
        face = None
        if len(faces):
            x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
            face = {"h": round(h / g.shape[0], 3), "cx": round((x + w / 2) / g.shape[1], 3),
                    "cy": round((y + h / 2) / g.shape[0], 3)}
        rows.append({"t": round(t, 2), "flow": round(flow, 3), "face": face})
    dur = rows[-1]["t"] if rows else 0.0
    edges = [0.0, *cut_t, dur + 0.01]
    shots = []
    for a, b in zip(edges, edges[1:]):
        rs = [r for r in rows if a <= r["t"] < b]
        if not rs:
            continue
        fr = [r["face"] for r in rs if r["face"]]
        flows = [r["flow"] for r in rs[1:] if r["flow"] == r["flow"]] or [float("nan")]   # 1st sample = the cut
        shots.append({"start": round(a, 2), "end": round(b, 2),
                      "motion": round(float(np.median(flows)), 3) if flows[0] == flows[0] else None,
                      "face_to_lens": round(len(fr) / len(rs), 2),
                      "face_h": round(float(np.median([f["h"] for f in fr])), 3) if fr else 0.0,
                      "face_cx": round(float(np.median([f["cx"] for f in fr])), 3) if fr else None,
                      "face_cy": round(float(np.median([f["cy"] for f in fr])), 3) if fr else None})
    static = [s for s in shots if s["motion"] is not None and s["motion"] < STILL]
    return {"video": str(video), "duration": dur, "hard_cuts": len(cut_t), "cut_times": cut_t,
            "cuts_per_min": round(len(cut_t) / max(dur / 60, 1e-6), 1),
            "static_shots": len(static), "static_seconds": round(sum(s["end"] - s["start"] for s in static), 1),
            "face_to_lens": round(float(np.mean([r["face"] is not None for r in rows])), 2) if rows else 0.0,
            "face_h_median": round(float(np.median([r["face"]["h"] for r in rows if r["face"]] or [0])), 3),
            "shots": shots}


def claims(job_dir: Path) -> dict:
    """`## Reality claims` in 0_BRIEF.md: lines `- max_hard_cuts: 0`, `- max_static_seconds: 2`,
    `- min_face_to_lens: 0.5`, `- min_face_h_median: 0.18`, `- min_cuts_per_min: 20` ..."""
    f = job_dir / "0_BRIEF.md"
    if not f.is_file():
        return {}
    m = re.search(r"## Reality claims\n(.*?)(\n## |\Z)", f.read_text(encoding="utf-8"), re.S)
    out = {}
    for k, v in re.findall(r"^- (\w+):\s*([\d.]+)", m.group(1) if m else "", re.M):
        out[k] = float(v)
    return out


def verdict(rep: dict, cl: dict) -> list[str]:
    faults = []
    for k, v in cl.items():
        kind, key = k.split("_", 1)
        got = rep.get(key)
        if got is None:
            faults.append(f"unknown claim {k}")
        elif kind == "max" and got > v:
            faults.append(f"{key} = {got} > {v} (brief claim {k})")
        elif kind == "min" and got < v:
            faults.append(f"{key} = {got} < {v} (brief claim {k})")
    return faults


def main(argv: list[str]) -> int:
    """reality <job> <video>  -> jobs/<job>/out/reality.json + the brief's claims checked (exit 1 on a contradiction)"""
    from . import plan as P

    job_dir, video = P.job_dir(argv[0]), Path(argv[1])
    rep = measure(video)
    rep["faults"] = verdict(rep, claims(job_dir))
    (job_dir / "out").mkdir(exist_ok=True)
    (job_dir / "out" / "reality.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    print(f"{video.name}: {rep['duration']:.0f} s, {rep['hard_cuts']} hard cuts ({rep['cuts_per_min']}/min), "
          f"{rep['static_shots']} static shots ({rep['static_seconds']} s), her face to the lens {rep['face_to_lens']:.0%}, "
          f"face height median {rep['face_h_median']:.0%}")
    for f in rep["faults"]:
        print("  FAULT:", f)
    return 1 if rep["faults"] else 0

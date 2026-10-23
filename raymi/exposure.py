"""Is a picture overexposed, oversaturated, flat? Measured on stills / video frames (toki 2026-10-23: "schauen dass
nichts ueberlichtet ist, uebersaturiert, klar vor hinter und mittelgrund trennung").

Per image: clipped (share of pixels at the top of the range), crushed (share near black), mean / 95th-percentile
saturation, the luminance spread (p95 - p5) and the depth cue (sharpness of the centre against the frame edge: a soft
background behind a sharp subject reads as depth). `python -m raymi exposure <dir|image...>` prints a table and the faults.
Limits are defaults of a principle, not laws: a flash frame may clip on purpose.
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

CLIP_MAX = 0.02        # more than 2 % of the picture burnt to white = overexposed
SAT_MEAN_MAX = 0.42    # the whole picture loud (Queencard "grell / uebersaturiert")
SAT_P95_MAX = 0.85     # accents may be loud, not the whole top 5 %
# saturation is measured as CHROMA (HSV saturation x value): a dark saturated blue is not loud, a bright one is
SPREAD_MIN = 0.35      # a flat, washed-out picture


def measure(img: np.ndarray) -> dict:
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32) / 255.0
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    sat = hsv[:, :, 1] * hsv[:, :, 2]
    lap = cv2.Laplacian(lum, cv2.CV_32F)
    h, w = lum.shape
    centre = np.abs(lap[h // 4: 3 * h // 4, w // 4: 3 * w // 4]).mean()
    edge = np.concatenate([np.abs(lap[: h // 8]).ravel(), np.abs(lap[-h // 8:]).ravel()]).mean()
    return {"clipped": float((lum > 0.985).mean()), "crushed": float((lum < 0.02).mean()),
            "sat_mean": float(sat.mean()), "sat_p95": float(np.percentile(sat, 95)),
            "spread": float(np.percentile(lum, 95) - np.percentile(lum, 5)), "depth": float(centre / max(edge, 1e-6))}


def faults(m: dict) -> list[str]:
    out = []
    if m["clipped"] > CLIP_MAX:
        out.append(f"overexposed ({m['clipped'] * 100:.1f} % clipped)")
    if m["sat_mean"] > SAT_MEAN_MAX or m["sat_p95"] > SAT_P95_MAX:
        out.append(f"oversaturated (mean {m['sat_mean']:.2f}, p95 {m['sat_p95']:.2f})")
    if m["spread"] < SPREAD_MIN:
        out.append(f"flat (luminance spread {m['spread']:.2f})")
    return out


def report(paths: list[Path]) -> tuple[list[str], int]:
    files = []
    for p in paths:
        files += sorted(p.glob("*.jpg")) + sorted(p.glob("*.png")) if p.is_dir() else [p]
    lines = ["| image | clipped | crushed | sat mean | sat p95 | spread | depth | faults |", "|---|---|---|---|---|---|---|---|"]
    bad = 0
    for f in files:
        img = cv2.imread(str(f))
        if img is None:
            continue
        m = measure(img)
        fl = faults(m)
        bad += bool(fl)
        lines.append(f"| {f.parent.parent.name}/{f.name} | {m['clipped'] * 100:.1f} % | {m['crushed'] * 100:.1f} % | {m['sat_mean']:.2f} | "
                     f"{m['sat_p95']:.2f} | {m['spread']:.2f} | {m['depth']:.1f} | {'; '.join(fl) or 'ok'} |")
    return lines, bad

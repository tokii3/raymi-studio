"""Is the video's main element readable at phone size? The VALUE half of the hero check (toki 2026-10-19: "fehler wie
schlecht erkennbare krone müssen selber erkannt werden, das ist das main element").

The size half runs before every render (studio/src/film/check.ts heroFaults, pure math). Contrast needs the real
pixels, so this runs after a cloud render / stills run on the frames the studio rendered:

    node studio/guard.mjs <job> --hero-boxes every:15 > jobs/<job>/out/hero_boxes.json
    python -m raymi hero <job> <final.mp4 | stills folder>      -> out/hero.json (+ kit/facts/hero.json)

Method (a measurement, not taste): the frame is shrunk to phone size (screen.PHONE_W), the hero's box is compared with
a ring of picture around it - the difference of their median luma (does it stand out from what is behind it?) and the
spread inside the box (does it have readable inner detail?). A gold crown on black hair passes; a gold crown on a
yellow sign does not. Thresholds are defaults of a principle: a written reason in the shot (why_small) overrules them.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

from .screen import PHONE_W

MIN_SEP = 0.12          # median luma difference box vs ring (0..1)
MIN_DETAIL = 0.28       # p90 - p10 luma inside the box (0..1): readable inner contrast
MIN_PX = 9              # box height at phone size: below this nothing reads, whatever the contrast


def luma(img: np.ndarray) -> np.ndarray:
    """Rec. 709 luma 0..1 of an RGB uint8 image."""
    f = img.astype(np.float32) / 255.0
    return 0.2126 * f[..., 0] + 0.7152 * f[..., 1] + 0.0722 * f[..., 2]


def phone(img: np.ndarray) -> np.ndarray:
    import cv2

    h, w = img.shape[:2]
    pw = PHONE_W["h" if w >= h else "v"]
    return cv2.resize(img, (pw, max(1, round(h * pw / w))), interpolation=cv2.INTER_AREA)


def contrast(img: np.ndarray, box: list[float]) -> dict:
    """Readability of a box (x0, y0, x1, y1 in 0..1) in an RGB frame, measured at phone size."""
    small = phone(img)
    y = luma(small)
    H, W = y.shape
    x0, y0, x1, y1 = box
    a0, a1 = max(0, int(x0 * W)), min(W, int(np.ceil(x1 * W)))
    b0, b1 = max(0, int(y0 * H)), min(H, int(np.ceil(y1 * H)))
    if a1 - a0 < 1 or b1 - b0 < 1:
        return {"px": 0, "sep": 0.0, "detail": 0.0, "readable": False, "why": "off screen"}
    inner = y[b0:b1, a0:a1]
    mx, my = max(2, (a1 - a0) // 2), max(2, (b1 - b0) // 2)
    r = y[max(0, b0 - my):min(H, b1 + my), max(0, a0 - mx):min(W, a1 + mx)].copy()
    mask = np.ones_like(r, bool)
    mask[b0 - max(0, b0 - my):b1 - max(0, b0 - my), a0 - max(0, a0 - mx):a1 - max(0, a0 - mx)] = False
    ring = r[mask]
    sep = float(abs(np.median(inner) - (np.median(ring) if ring.size else np.median(inner))))
    detail = float(np.percentile(inner, 90) - np.percentile(inner, 10))
    px = b1 - b0
    ok = px >= MIN_PX and (sep >= MIN_SEP or detail >= MIN_DETAIL)
    why = "" if ok else ("too small at phone size" if px < MIN_PX else "melts into what is behind it (low value contrast)")
    return {"px": int(px), "sep": round(sep, 3), "detail": round(detail, 3), "readable": bool(ok), "why": why}


def _read(path: Path) -> np.ndarray:
    import cv2

    img = cv2.imread(str(path))
    if img is None:
        raise FileNotFoundError(path)
    return img[..., ::-1]


def _frame(video: Path, t: float) -> np.ndarray:
    import cv2

    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1",
                          "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True).stdout
    return cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)[..., ::-1]


def check(boxes: dict, source: Path, stills: dict[int, Path] | None = None) -> dict:
    """boxes = guard.mjs --hero-boxes output; source = the rendered video, or stills {frame: jpg}."""
    fps = boxes.get("fps", 30)
    rows = []
    for b in boxes["boxes"]:
        if b["box"] is None:
            rows.append({**b, "readable": False, "why": "not on screen"})
            continue
        if stills is not None:
            if b["frame"] not in stills:
                continue
            img = _read(stills[b["frame"]])
        else:
            img = _frame(source, b["frame"] / fps)
        rows.append({**b, **contrast(img, b["box"])})
    bad = [r for r in rows if not r["readable"]]
    return {"checked": len(rows), "unreadable": len(bad), "rows": rows,
            "verdict": "PASS" if not bad else f"UNREADABLE in {len(bad)} of {len(rows)} sampled frames"}


def run(job_dir: Path, source: Path) -> dict:
    boxes = json.loads((job_dir / "out" / "hero_boxes.json").read_text(encoding="utf-8"))
    stills = None
    if source.is_dir():               # a stills folder: names map to frames via the job's stills.json
        spec = json.loads((job_dir / "stills.json").read_text(encoding="utf-8"))
        frames = spec.get("frames", [])
        names = spec.get("names") or [f"{'MVShort' if spec.get('format') == 'short' else 'MV'}_{f:04d}" for f in frames]
        stills = {f: source / f"{n}.jpg" for f, n in zip(frames, names) if (source / f"{n}.jpg").is_file()}
    res = check(boxes, source, stills)
    (job_dir / "out" / "hero.json").write_text(json.dumps(res, indent=1), encoding="utf-8", newline="\n")
    kit = job_dir / "out" / "kit" / "facts"
    if kit.is_dir():
        (kit / "hero.json").write_text(json.dumps(res, indent=1), encoding="utf-8", newline="\n")
    return res

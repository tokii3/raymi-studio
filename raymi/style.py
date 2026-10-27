"""A look measured, not guessed (2026-10-27, from the "new style from references" method of the free animate skill,
knowledge/skillpacks/README.md). toki wants to try other styles; a style is first MEASURED on professional frames,
then our frames are matched against those numbers, and what still differs is written down as "not matched".

  python -m raymi style measure <image | dir> ...          the numbers of a set of frames
  python -m raymi style compare <ref dir|imgs> -- <ours>    reference vs ours, per number, with the gap

Numbers (per frame, then the median over the set):
  palette    the 6 most common colours (k-means on a 96 px thumbnail), with their share
  value      median luminance 0-1 (low key < 0.3 < mid < 0.6 < high key)
  contrast   luminance p95 - p5 (flat < 0.5 < punchy)
  sat        median saturation of the coloured pixels (muted < 0.3 < rich < 0.6 < neon)
  accent     share of pixels far more saturated than the median (one accent: small and strong)
  edges      share of pixels on a drawn edge (Canny at 540 px; line art / outlines raise it)
  grain      high-frequency noise in flat areas (film grain, paper, screentone)
  empty      share of the frame in near-flat areas (negative space)
Local only, reads images, writes nothing; frames of other people's videos stay in knowledge/references/frames/.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np

EXT = {".jpg", ".jpeg", ".png", ".webp"}


def files(args: list[str]) -> list[Path]:
    out = []
    for a in args:
        p = Path(a)
        out += sorted(f for f in p.iterdir() if f.suffix.lower() in EXT) if p.is_dir() else [p]
    return out


def frame(img: np.ndarray) -> dict:
    h, w = img.shape[:2]
    small = cv2.resize(img, (540, max(1, round(540 * h / w))), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV).astype(np.float32) / 255.0
    lum = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    sat = hsv[..., 1][hsv[..., 2] > 0.12]
    sat_med = float(np.median(sat)) if sat.size else 0.0
    edges = cv2.Canny((lum * 255).astype(np.uint8), 60, 160)
    blur = cv2.GaussianBlur(lum, (0, 0), 1.2)
    hf = np.abs(lum - blur)
    local = cv2.GaussianBlur(np.abs(cv2.Laplacian(blur, cv2.CV_32F)), (0, 0), 6)
    flat = local < np.percentile(local, 35)
    return {"value": float(np.median(lum)),
            "contrast": float(np.percentile(lum, 95) - np.percentile(lum, 5)),
            "sat": sat_med,
            "accent": float(np.mean(hsv[..., 1] > min(0.95, sat_med + 0.35))),
            "edges": float(np.mean(edges > 0)),
            "grain": float(np.median(hf[flat]) * 100) if flat.any() else 0.0,
            "empty": float(np.mean(local < 0.004))}


def palette(imgs: list[np.ndarray], k: int = 6) -> list[tuple[str, float]]:
    px = np.concatenate([cv2.resize(i, (96, max(1, round(96 * i.shape[0] / i.shape[1]))), interpolation=cv2.INTER_AREA)
                         .reshape(-1, 3) for i in imgs]).astype(np.float32)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)
    cv2.setRNGSeed(7)
    _, lab, cen = cv2.kmeans(px, k, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    share = np.bincount(lab.ravel(), minlength=k) / len(lab)
    order = np.argsort(-share)
    return [("#%02x%02x%02x" % tuple(int(c) for c in cen[i][::-1]), round(float(share[i]), 2)) for i in order]


def measure(paths: list[Path]) -> dict:
    imgs = [i for i in (cv2.imread(str(p)) for p in paths) if i is not None]
    if not imgs:
        raise SystemExit("no readable images")
    rows = [frame(i) for i in imgs]
    out = {k: round(float(np.median([r[k] for r in rows])), 3) for k in rows[0]}
    out["frames"] = len(imgs)
    out["palette"] = palette(imgs)
    return out


def show(name: str, m: dict) -> None:
    print(f"{name}: {m['frames']} frames")
    print("  " + "  ".join(f"{k} {m[k]}" for k in ("value", "contrast", "sat", "accent", "edges", "grain", "empty")))
    print("  palette " + "  ".join(f"{c} {s:.0%}" for c, s in m["palette"]))


def main(argv: list[str]) -> int:
    if not argv or argv[0] not in ("measure", "compare"):
        print(__doc__)
        return 2
    if argv[0] == "measure":
        show("set", measure(files(argv[1:])))
        return 0
    if "--" not in argv:
        print("style compare <reference images> -- <our images>")
        return 2
    i = argv.index("--")
    ref, ours = measure(files(argv[1:i])), measure(files(argv[i + 1:]))
    show("reference", ref)
    show("ours", ours)
    print("gap (ours - reference):")
    for k in ("value", "contrast", "sat", "accent", "edges", "grain", "empty"):
        d = ours[k] - ref[k]
        rel = abs(d) / max(1e-6, abs(ref[k]))
        print(f"  {k:9} {d:+.3f}{'   <- not matched' if rel > 0.25 and abs(d) > 0.02 else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

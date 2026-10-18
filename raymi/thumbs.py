"""Thumbnails stage (toki 2026-10-19: "thumbnails nicht vergessen auch für shorts ... immer 4-5 zur auswahl").

A thumbs job is a board job (`jobs/<date>_<slug>-thumbs/shots.json`): every candidate is a shot in the studio's own
sets (never a generated background), rendered as cloud stills. Its stills.json carries one pass per format:

    {"passes": [{"format": "mv", "frames": [..], "names": ["thumb_mv_M1", ..]},
                {"format": "short", "frames": [..], "names": ["thumb_short_S1", ..]}],
     "to": "boards", "dest": "jobs/<song job>/boards", "thumbs": true}

`"thumbs": true` makes stills.yml build boards/thumbs_168.jpg: every candidate the size the feed shows it (168 px
wide, on the dark and the light YouTube background) - the thumb-critic and toki judge THAT, not the full frame.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

FEED_W = 168
BG = {"dark": (15, 15, 15), "light": (249, 249, 249)}


def passes(spec: dict) -> list[dict]:
    """The stills passes of a stills.json: its "passes", or the single (format, frames, names) of the old form."""
    if spec.get("passes"):
        return [{"format": p.get("format", "mv"), "frames": p["frames"], "names": p.get("names") or []} for p in spec["passes"]]
    return [{"format": spec.get("format", "mv"), "frames": spec.get("frames", [0]), "names": spec.get("names") or []}]


def pass_lines(spec: dict) -> list[str]:
    """One shell line per pass: FORMAT<TAB>frames,..<TAB>names,.. (stills.yml reads these)."""
    return [f"{p['format']}\t{','.join(map(str, p['frames']))}\t{','.join(p['names'])}" for p in passes(spec)]


def feed_sheet(boards: Path, out: Path | None = None) -> Path:
    """boards/thumb_mv_*.jpg + thumb_short_*.jpg at feed size (168 px wide) on the dark and the light background."""
    import cv2

    rows = []
    for theme, bg in BG.items():
        tiles = []
        for f in sorted(boards.glob("thumb_mv_*.jpg")) + sorted(boards.glob("thumb_short_*.jpg")):
            img = cv2.imread(str(f))
            if img is None:
                continue
            h, w = img.shape[:2]
            small = cv2.resize(img, (FEED_W, round(h * FEED_W / w)), interpolation=cv2.INTER_AREA)
            tile = np.full((299 + 34, FEED_W + 16, 3), bg[::-1], np.uint8)
            tile[8:8 + small.shape[0], 8:8 + FEED_W] = small
            ink = (235, 235, 235) if theme == "dark" else (30, 30, 30)
            cv2.putText(tile, f.stem.replace("thumb_", ""), (8, 299 + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.45, ink, 1, cv2.LINE_AA)
            tiles.append(tile)
        if tiles:
            rows.append(np.hstack(tiles))
    if not rows:
        raise FileNotFoundError(f"no thumb_mv_* / thumb_short_* candidates in {boards}")
    out = out or boards / "thumbs_168.jpg"
    cv2.imwrite(str(out), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 92])
    return out


def main_lines(job_dir: Path) -> list[str]:
    return pass_lines(json.loads((job_dir / "stills.json").read_text(encoding="utf-8")))

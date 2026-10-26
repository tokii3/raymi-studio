"""The storyboard BEFORE the build (toki 2026-10-25: she judges pictures, but the script was text and the first
pictures came out of the build - by then the plan was already code). Every key moment of the script as a picture:
the professional reference frame (left) next to our previz still (right) - or, while there is no still yet, a PLAN
card that says exactly what the shot will be (labelled PLAN, never passed off as a picture of ours).

jobs/<job>/storyboard.json:
  {"moments": [{"t": 33.07, "line": "Watch me move", "ref": "kda-firestarter@112.0",
                "camera": "360 whip round her, 1.7 m, roll 14", "her": "dances, eyes on us the whole turn",
                "fx": "T01 dots flare on 'move'", "still": "boards/k06a_360_in.jpg",
                "refs": ["slug@s", ...],          # optional: a strip of several frames (a burst of cuts is not one frame)
                "rule": "the principle the pro frame follows + why (knowledge/references/LEARNED.md)"}, ...]}
-> boards/pairs/storyboard_<n>.jpg (4 moments per sheet; gitignored: reference frames are foreign footage)
"""
from __future__ import annotations

import json
import textwrap
from pathlib import Path

from . import refs

MIN_MOMENTS = {"mv": 8, "pov": 4, "lore": 3}
W, H = 640, 360


def _card(m: dict) -> "Image.Image":
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (W, H), (24, 22, 34))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W - 1, H - 1], outline=(255, 190, 90), width=3)
    d.text((14, 10), "PLAN - no previz still yet", fill=(255, 190, 90), font=refs.label_font(16))
    y = 40
    for key in ("camera", "her", "fx", "light", "rule"):
        if m.get(key):
            for i, ln in enumerate(textwrap.wrap(f"{key.upper()}: {m[key]}", 70)):
                d.text((14, y), ln, fill=(230, 230, 236), font=refs.label_font(16))
                y += 18
            y += 8
    return img


def _fit(p: Path) -> "Image.Image":
    from PIL import Image

    im = Image.open(p).convert("RGB")
    s = min(W / im.width, H / im.height)
    im = im.resize((int(im.width * s), int(im.height * s)))
    out = Image.new("RGB", (W, H), (10, 10, 12))
    out.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
    return out


def _strip(refs_: list[str]) -> "Image.Image":
    """Several reference frames in one panel (2 x n grid): a burst of cuts or a before / after."""
    from PIL import Image

    cols = 2 if len(refs_) <= 4 else 3
    rows = (len(refs_) + cols - 1) // cols
    cw, ch = W // cols, H // rows
    out = Image.new("RGB", (W, H), (10, 10, 12))
    for i, r in enumerate(refs_):
        im = Image.open(refs.ref_frame(r)).convert("RGB")
        s = min(cw / im.width, ch / im.height)
        im = im.resize((max(1, int(im.width * s) - 2), max(1, int(im.height * s) - 2)))
        out.paste(im, ((i % cols) * cw + 1, (i // cols) * ch + 1))
    return out


def build(job_dir: Path, core: str = "") -> list[Path]:
    from PIL import Image, ImageDraw

    moments = json.loads((job_dir / "storyboard.json").read_text(encoding="utf-8"))["moments"]
    if not core and (job_dir / "0_BRIEF.md").is_file():
        import re

        m = re.search(r"## Core.*?\n(.*?)(\n## |\Z)", (job_dir / "0_BRIEF.md").read_text(encoding="utf-8"), re.S)
        core = " / ".join(x.strip("- ").strip() for x in (m.group(1) if m else "").splitlines() if x.strip())[:180]
    out_dir = job_dir / "boards" / "pairs"
    out_dir.mkdir(parents=True, exist_ok=True)
    sheets = []
    for n in range(0, len(moments), 4):
        part = moments[n:n + 4]
        sheet = Image.new("RGB", (2 * W + 12, 30 + len(part) * (H + 52)), (14, 14, 18))
        d = ImageDraw.Draw(sheet)
        d.text((10, 8), f"toki's core: {core}", fill=(255, 210, 120), font=refs.label_font())
        for i, m in enumerate(part):
            y = 30 + i * (H + 52)
            d.text((10, y + 4), f"{m['t']:.2f} s  \"{m.get('line', '')}\"   reference {m['ref']}  |  "
                               f"{'ours: ' + Path(m['still']).name if m.get('still') else 'PLAN'}", fill=(235, 235, 235), font=refs.label_font())
            sheet.paste(_strip(m["refs"]) if m.get("refs") else _fit(refs.ref_frame(m["ref"])), (0, y + 24))
            if m.get("rule") and m.get("still"):          # without a still the PLAN card already shows the rule
                d.text((10, y + 26 + H), ("RULE: " + m["rule"])[:190], fill=(150, 220, 255), font=refs.label_font())
            still = job_dir / m["still"] if m.get("still") else None
            sheet.paste(_fit(still) if still and still.is_file() else _card(m), (W + 12, y + 24))
        p = out_dir / f"storyboard_{n // 4 + 1:02d}.jpg"
        sheet.save(p, quality=88)
        sheets.append(p)
    return sheets


def state(job_dir: Path, kind: str) -> tuple[bool, str]:
    """The writers' room step: enough key moments, each with a reference and a plan, the sheets built, brief-keeper PASS,
    toki's line `storyboard: toki YYYY-MM-DD ...` in toki.md."""
    f = job_dir / "storyboard.json"
    if not f.is_file():
        return False, "storyboard.json missing - every key moment: t, line, ref (slug@s), camera, her, fx, still"
    ms = json.loads(f.read_text(encoding="utf-8")).get("moments", [])
    want = MIN_MOMENTS.get(kind, 8)
    if len(ms) < want:
        return False, f"storyboard has {len(ms)} moments - want >= {want} (every key moment + the 5 wows)"
    bad = [str(m.get("t")) for m in ms if not m.get("ref") or not (m.get("camera") and m.get("her"))]
    if bad:
        return False, "storyboard moments without a reference / camera / her action at " + ", ".join(bad)
    if not list((job_dir / "boards" / "pairs").glob("storyboard_*.jpg")):
        return False, "storyboard sheets not built - python -m raymi storyboard <job>"
    from .room import last_verdict, toki_said

    if last_verdict(job_dir, "storyboard", "brief-keeper") != "PASS":
        return False, "brief-keeper has not passed the storyboard (reviews/storyboard_brief-keeper_<n>.md)"
    t = job_dir / "toki.md"
    if not t.is_file() or not toki_said(t.read_text(encoding="utf-8"), "storyboard"):
        return False, "waiting for toki's verdict on the storyboard (toki.md line `storyboard: toki YYYY-MM-DD ...`)"
    return True, "done"


def main(argv: list[str]) -> int:
    from . import plan as P

    for p in build(P.job_dir(argv[0])):
        print(p)
    return 0

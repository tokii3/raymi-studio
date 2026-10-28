"""Picture QC v2 - three levels (toki 2026-10-24: "die Stills müssen besser geprüft werden, mehr Frames, auf mehreren
Ebenen ... der Code zeigt keine Fehler, aber visuell sieht man sie, und das ist das, worauf es am Ende ankommt").

Level 1 GEOMETRY  the scene probe (studio/probe.mjs, raymi/probe.py): her real surface, every 2nd frame.
Level 2 PICTURE   the mask pass (studio/qcmask.mjs, film/QcMask.tsx): every 2nd frame drawn as flat ID colours three
                  times - all / her only / text only. Comparing them measures what the viewer SEES:
                    pierced    something covers a patch INSIDE her outline (a table edge, a rock, a word sticking out
                               through her) - a thing in front of her always crosses her outline, a clip never does
                    text_face  a lyric across her face
                    text_hid   a lyric mostly hidden behind her or a prop
                    face_cut   her face cut by the frame edge
                    her_pop    her figure jumps / vanishes between two frames of one shot
                    hair_wall  the frame is a wall of her hair: hair fills much of it and her face is not seen (the
                               lens behind / inside her head - take 14, toki 2026-10-28 "unsauber ... low quality")
Level 3 EYE       full-resolution stills of every flagged frame (both levels), cropped and enlarged around the fault,
                  + a dense sheet of the whole film (one frame a second) - looked at by me first, then a critic.
                  `frames()` says which stills to render, `crops()` builds boards/qc/.

`python -m raymi qc2 <job> [mv|short]` prints the picture classes and writes boards/qc_<fmt>_flags.json.
Thresholds were calibrated on Beach run 58 (toki's verdict: clips into things, falls from the sky, not fluid).
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import numpy as np

PALETTE = {               # film/QcMask.tsx QC_COLORS
    "body": (255, 0, 0), "face": (255, 0, 255), "hair": (255, 128, 0), "text": (0, 255, 0),
    "thing": (0, 255, 255), "set": (0, 0, 255), "room": (64, 64, 64), "none": (0, 0, 0),
}
NAMES = list(PALETTE)
HER = ("body", "face", "hair")
MAXD = 70                 # colour distance to the nearest palette entry (antialiased edges beyond it = none)
PIERCE = 0.0004           # share of the frame a covered patch inside her outline must have (~50 px at 480x270)
EDGE = 2                  # px her outline is eroded by before 'inside' (an object touching her outline is in front)
TEXT_FACE = 0.10          # share of her face under a lyric
TEXT_HID = 0.35           # share of a lyric hidden
HAIR_WALL = 0.30          # share of the frame that is her hair ...
HAIR_WALL_FACE = 0.01     # ... while her face is (nearly) not seen
TEXT_MIN = 0.002          # a lyric this small (share of frame) is not judged for hiding
FACE_MIN = 0.002          # her face this small is not judged for a cut
POP = 0.45                # relative change of her visible area between two masks of one shot
POP_MIN = 0.01            # ... when she covers at least this share of the frame


def classes(img: np.ndarray) -> np.ndarray:
    """RGB image (h, w, 3) -> index into NAMES per pixel (nearest palette colour, 'none' when far from all)."""
    pal = np.array([PALETTE[n] for n in NAMES], dtype=np.int32)
    d = ((img[:, :, None, :].astype(np.int32) - pal[None, None]) ** 2).sum(-1)
    idx = d.argmin(-1)
    idx[d.min(-1) > MAXD * MAXD] = NAMES.index("none")
    return idx


def _read(p: Path) -> np.ndarray:
    import cv2
    im = cv2.imread(str(p), cv2.IMREAD_COLOR)
    if im is None:
        raise FileNotFoundError(p)
    return im[:, :, ::-1]


def frame_metrics(all_: np.ndarray, her: np.ndarray, text: np.ndarray) -> dict:
    """The picture measurements of one frame from its three masks (class index arrays)."""
    import cv2
    h, w = all_.shape
    n = h * w
    her_ids = [NAMES.index(x) for x in HER]
    in_her_b = np.isin(her, her_ids)                    # where she is, alone
    in_her_a = np.isin(all_, her_ids)                   # where she is seen
    face_b = her == NAMES.index("face")
    text_a = all_ == NAMES.index("text")
    text_c = text == NAMES.index("text")
    out: dict = {"her": round(float(in_her_b.mean()), 5), "seen": round(float(in_her_a.mean()), 5), "pierced": [],
                 "hair": round(float((all_ == NAMES.index("hair")).mean()), 4), "face": round(float((all_ == NAMES.index("face")).mean()), 4)}
    if in_her_b.any():
        k = np.ones((2 * EDGE + 1, 2 * EDGE + 1), np.uint8)
        # holes in her own outline (the gap under an arm) belong to her silhouette for 'inside': fill them first
        sil = in_her_b.astype(np.uint8)
        cnts, _ = cv2.findContours(sil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        filled = np.zeros_like(sil)
        cv2.drawContours(filled, cnts, -1, 1, thickness=-1)
        inner = cv2.erode(filled, k).astype(bool)
        covered = in_her_b & ~in_her_a
        cov = covered.astype(np.uint8)
        nlab, lab, stats, cent = cv2.connectedComponentsWithStats(cov, connectivity=8)
        for i in range(1, nlab):
            area = stats[i, cv2.CC_STAT_AREA]
            if area < PIERCE * n:
                continue
            comp = lab == i
            ring = cv2.dilate(comp.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & ~comp
            if not inner[comp].all() or not in_her_b[ring].mean() > 0.9:
                continue                                 # it reaches her outline: something in FRONT of her
            by = np.bincount(all_[comp].ravel(), minlength=len(NAMES))
            what = NAMES[int(by.argmax())]
            if what == "text":
                continue                                 # a word in front of her: text_face / the probe judge it
            out["pierced"].append({"what": what, "share": round(area / n, 5),
                                   "xy": [round(cent[i][0] / w, 3), round(cent[i][1] / h, 3)]})
    if face_b.sum() > FACE_MIN * n:
        out["text_face"] = round(float((face_b & text_a).sum() / face_b.sum()), 3)
        ys, xs = np.nonzero(face_b)
        out["face_xy"] = [round(xs.mean() / w, 3), round(ys.mean() / h, 3)]
        out["face_cut"] = bool(ys.min() == 0 or xs.min() == 0 or ys.max() == h - 1 or xs.max() == w - 1)
    if text_c.sum() > TEXT_MIN * n:
        # per word (letters joined by a small dilation): one word fully hidden must not be averaged away by the others
        joined = cv2.dilate(text_c.astype(np.uint8), np.ones((5, 9), np.uint8))
        nlab, lab = cv2.connectedComponents(joined, connectivity=8)
        best = None
        for i in range(1, nlab):
            word = text_c & (lab == i)
            if word.sum() < TEXT_MIN * n / 4:
                continue
            hid = word & ~text_a
            share = float(hid.sum() / word.sum())
            if best is None or share > best[0]:
                ys, xs = np.nonzero(word)
                by = np.bincount(all_[hid].ravel(), minlength=len(NAMES)) if hid.any() else None
                best = (share, NAMES[int(by.argmax())] if by is not None else None, [round(xs.mean() / w, 3), round(ys.mean() / h, 3)])
        if best:
            out["text_hid"], out["text_hid_by"], out["text_xy"] = round(best[0], 3), best[1], best[2]
    return out


def _frame_no(p: Path) -> int:
    m = re.findall(r"(\d+)", p.stem)
    return int(m[-1]) if m else -1


def mask_frames(qc_dir: Path) -> list[tuple[int, Path, Path, Path]]:
    """(film frame, all, her, text) for every frame the mask pass drew in all three modes."""
    files = {m: {_frame_no(p): p for p in (qc_dir / m).glob("*.png")} for m in ("all", "her", "text")}
    nums = sorted(set(files["all"]) & set(files["her"]) & set(files["text"]))   # qcmask.mjs names them f<film frame>
    return [(k, files["all"][k], files["her"][k], files["text"][k]) for k in nums]


def shot_of(shots: list[dict], F: int) -> str:
    sid = shots[0]["id"] if shots else "?"
    for s in shots:
        if F >= s["from"]:
            sid = s["id"]
    return str(sid)


def analyze(qc_dir: Path) -> dict:
    """Every mask frame measured -> {"rows": [{F, shot, ...metrics}], "meta": qc.json}."""
    meta = json.loads((qc_dir / "qc.json").read_text(encoding="utf-8"))
    rows = []
    for F, a, h, t in mask_frames(qc_dir):
        m = frame_metrics(classes(_read(a)), classes(_read(h)), classes(_read(t)))
        rows.append({"F": F, "shot": shot_of(meta["shots"], F), **m})
    return {"meta": meta, "rows": rows}


def classify(rep: dict, closeups: set[str] | None = None) -> dict[str, dict[str, dict]]:
    """{class: {shot: {frames, worst, detail, at: {F, xy}}}} - the same shape as the probe's classes."""
    closeups = closeups or set()
    out: dict[str, dict[str, dict]] = defaultdict(dict)

    def add(cls, shot, worst, detail, F, xy):
        e = out[cls].setdefault(shot, {"frames": 0, "worst": 0.0, "detail": defaultdict(int), "at": None})
        e["frames"] += 1
        if e["at"] is None or worst >= e["worst"]:
            e["at"] = {"F": F, "xy": xy}
        e["worst"] = max(e["worst"], worst)
        e["detail"][detail] += 1

    prev = None
    for r in rep["rows"]:
        s, F = r["shot"], r["F"]
        for p in r.get("pierced", []):
            what = "a prop in front of or through her (check)" if p["what"] == "thing" else f"{p['what']} through her"
            add("pierced", s, p["share"], what, F, p["xy"])
        if r.get("text_face", 0) > TEXT_FACE:
            add("text_face", s, r["text_face"], "lyric on her face", F, r.get("face_xy"))
        if r.get("text_hid", 0) > TEXT_HID:
            by = r.get("text_hid_by")
            add("text_hid", s, r["text_hid"], f"lyric hidden by {'her' if by in HER else by}", F, r.get("text_xy"))
        if r.get("face_cut") and s not in closeups:
            add("face_cut", s, 1, "face cut by the frame edge", F, r.get("face_xy"))
        if prev and prev["shot"] == s and max(prev["her"], r["her"]) > POP_MIN:
            ch = abs(r["her"] - prev["her"]) / max(prev["her"], r["her"])
            if ch > POP:
                add("her_pop", s, round(ch, 2), "her figure jumps / vanishes", F, r.get("face_xy"))
        if r.get("hair", 0) > HAIR_WALL and r.get("face", 0) < HAIR_WALL_FACE:
            add("hair_wall", s, r["hair"], "the frame is a wall of her hair, no face", F, None)
        prev = r
    return {c: {s: {**v, "detail": dict(v["detail"])} for s, v in shots.items()} for c, shots in out.items()}


PICTURE = ("pierced", "text_face", "text_hid", "face_cut", "her_pop", "hair_wall")


def flags(cls: dict, top: int = 60) -> list[dict]:
    out = []
    for c in PICTURE:
        for shot, v in cls.get(c, {}).items():
            if v.get("at"):
                out.append({"cls": c, "shot": shot, "F": v["at"]["F"], "xy": v["at"].get("xy"), "frames": v["frames"],
                            "worst": v["worst"], "what": max(v["detail"], key=v["detail"].get)})
    out.sort(key=lambda x: -x["frames"])
    return out[:top]


def frames(job_dir: Path, fmt: str = "mv", dense_s: float = 1.0, fps: int = 30, duration: int | None = None) -> dict:
    """Which full-resolution stills the eye level needs: every flagged frame (probe + picture) + one a second."""
    b = job_dir / "boards"
    fl = []
    for f in (b / f"probe_{fmt}_flags.json", b / f"qc_{fmt}_flags.json"):
        if f.is_file():
            fl += json.loads(f.read_text(encoding="utf-8"))
    flagged = sorted({int(x["F"]) for x in fl})
    dense = []
    if duration:
        step = max(1, round(dense_s * fps))
        dense = list(range(0, duration, step))
    return {"flagged": flagged, "dense": dense, "flags": fl}


def crops(stills: Path, flag_list: list[dict], out: Path, frac: float = 0.34) -> list[Path]:
    """Each flag: its still cropped around the fault point, enlarged x2, labelled - boards/qc/NN_<cls>_<shot>.jpg, and
    one sheet of all crops (qc_sheet.jpg). The still for frame F is any file in `stills` whose name ends with F."""
    import cv2
    out.mkdir(parents=True, exist_ok=True)
    by_f = {_frame_no(p): p for p in stills.glob("*.jpg")}
    made = []
    for k, fl in enumerate(flag_list):
        p = by_f.get(int(fl["F"]))
        if p is None:
            continue
        im = cv2.imread(str(p))
        h, w = im.shape[:2]
        cx, cy = (fl.get("xy") or [0.5, 0.5])
        cw, ch = int(w * frac), int(h * frac)
        x0 = int(min(max(cx * w - cw / 2, 0), w - cw))
        y0 = int(min(max(cy * h - ch / 2, 0), h - ch))
        crop = cv2.resize(im[y0:y0 + ch, x0:x0 + cw], (cw * 2, ch * 2), interpolation=cv2.INTER_CUBIC)
        full = cv2.resize(im, (int(ch * 2 * w / h), ch * 2))
        cv2.rectangle(full, (int(x0 * full.shape[1] / w), int(y0 * full.shape[0] / h)),
                      (int((x0 + cw) * full.shape[1] / w), int((y0 + ch) * full.shape[0] / h)), (60, 60, 255), 3)
        tile = np.concatenate([full, crop], axis=1)
        txt = f"{fl['cls']}  shot {fl['shot']}  F{fl['F']}  {fl['what']}  ({fl['frames']} frames)"
        cv2.rectangle(tile, (0, 0), (tile.shape[1], 34), (18, 12, 18), -1)
        cv2.putText(tile, txt, (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (240, 240, 255), 2, cv2.LINE_AA)
        f = out / f"{k:02d}_{fl['cls']}_{fl['shot']}.jpg"
        cv2.imwrite(str(f), tile, [cv2.IMWRITE_JPEG_QUALITY, 88])
        made.append(f)
    if made:
        tiles = [cv2.imread(str(f)) for f in made]
        W = max(t.shape[1] for t in tiles)
        tiles = [cv2.copyMakeBorder(t, 0, 6, 0, W - t.shape[1], cv2.BORDER_CONSTANT, value=(18, 12, 18)) for t in tiles]
        for i in range(0, len(tiles), 8):
            cv2.imwrite(str(out / f"qc_sheet_{i // 8:02d}.jpg"), np.concatenate(tiles[i:i + 8], axis=0), [cv2.IMWRITE_JPEG_QUALITY, 80])
    return made


def dense_sheets(stills: Path, dense: list[int], out: Path, cols: int = 6, rows: int = 5, width: int = 480) -> list[Path]:
    """The whole film at one frame a second as labelled sheets (dense_NN.jpg): the eye level's overview, so a fault
    no measurement names is still seen."""
    import cv2
    out.mkdir(parents=True, exist_ok=True)
    by_f = {_frame_no(p): p for p in stills.glob("*.jpg")}
    tiles = []
    for F in dense:
        p = by_f.get(F)
        if p is None:
            continue
        im = cv2.imread(str(p))
        im = cv2.resize(im, (width, int(im.shape[0] * width / im.shape[1])))
        cv2.putText(im, f"{F / 30:.1f}s F{F}", (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 3, cv2.LINE_AA)
        cv2.putText(im, f"{F / 30:.1f}s F{F}", (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
        tiles.append(cv2.copyMakeBorder(im, 3, 3, 3, 3, cv2.BORDER_CONSTANT, value=(18, 12, 18)))
    made = []
    per = cols * rows
    for k in range(0, len(tiles), per):
        chunk = tiles[k:k + per]
        blank = np.full_like(chunk[0], 18)
        chunk += [blank] * (per - len(chunk))
        sheet = np.concatenate([np.concatenate(chunk[r * cols:(r + 1) * cols], axis=1) for r in range(rows)], axis=0)
        f = out / f"dense_{k // per:02d}.jpg"
        cv2.imwrite(str(f), sheet, [cv2.IMWRITE_JPEG_QUALITY, 82])
        made.append(f)
    return made


def join(parts: Path, job_dir: Path, fmt: str = "mv") -> dict:
    """qc.yml: the parallel workers' pieces -> out/probe_<fmt>.json (rows in frame order) + out/qc_<fmt>/{all,her,text}."""
    import shutil
    rows, every, fps, job = [], None, 30, job_dir.name
    for f in sorted(parts.glob("**/probe_part*.json")):
        r = json.loads(f.read_text(encoding="utf-8"))
        rows += r["rows"]
        every, fps, job = r["every"], r.get("fps", 30), r.get("job", job)
    out = job_dir / "out"
    out.mkdir(parents=True, exist_ok=True)
    rows.sort(key=lambda r: r.get("F", r.get("f", 0)))
    if rows:
        (out / f"probe_{fmt}.json").write_text(json.dumps({"job": job, "every": every, "fps": fps, "frames": len(rows),
                                                             "rows": rows}) + "\n", encoding="utf-8", newline="\n")
    qc = out / f"qc_{fmt}"
    n = 0
    for d in sorted(parts.glob("**/qc.json")):
        for m in ("all", "her", "text"):
            (qc / m).mkdir(parents=True, exist_ok=True)
            for png in (d.parent / m).glob("*.png"):
                shutil.copy2(png, qc / m / png.name)
                n += m == "all"
        shutil.copy2(d, qc / "qc.json")
    return {"probe_rows": len(rows), "mask_frames": n}


def main(job_dir: Path, fmt: str = "mv") -> int:
    from .probe import closeup_shots
    qc = job_dir / "boards" / f"qc_{fmt}"
    if not qc.is_dir():
        qc = job_dir / "out" / f"qc_{fmt}"
    rep = analyze(qc)
    spec = json.loads((job_dir / "shots.json").read_text(encoding="utf-8")) if (job_dir / "shots.json").is_file() else {}
    cls = classify(rep, closeup_shots(spec))
    b = job_dir / "boards"
    b.mkdir(exist_ok=True)
    (b / f"qc_{fmt}_rows.json").write_text(json.dumps(rep["rows"]), encoding="utf-8", newline="\n")
    (b / f"qc_{fmt}_flags.json").write_text(json.dumps(flags(cls), indent=1), encoding="utf-8", newline="\n")
    m = rep["meta"]
    print(f"qc2 picture {job_dir.name} ({fmt}): {len(rep['rows'])} mask frames, every {m['every']}, scale {m['scale']}")
    for c in PICTURE:
        shots = cls.get(c, {})
        print(f"\n## {c}: {len(shots)} shots, {sum(v['frames'] for v in shots.values())} frames")
        for s, v in sorted(shots.items(), key=lambda x: -x[1]["frames"]):
            top = ", ".join(f"{k} x{n}" for k, n in sorted(v["detail"].items(), key=lambda x: -x[1])[:3])
            print(f"  {s:>5}: {v['frames']:3d} frames, worst {v['worst']}  ({top})  F{v['at']['F']}")
    return 0

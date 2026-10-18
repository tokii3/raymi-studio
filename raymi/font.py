"""Raymi's font grows instead of falling back: every character a job puts on screen that Raymi-Regular.ttf lacks is
BUILT in her hand-drawn marker style and added (toki 2026-10-18: "raymi font als basis nutzen und dann neue kanji
bauen immer für alle schriftzeichen auch chinesisch hangul oder andere ... als raymi schrift bauen und hinzufügen").

How a glyph is built (re-implemented from the old engine's font_jp.py, same constants, so new glyphs match the 433
kanji / 108 hangul already in the font - tests/test_font.py rebuilds existing ones and compares):
1. the character's outline from a THIN skeleton font (OFL, assets/fonts/skeletons/): M PLUS Rounded 1c Thin for
   Japanese + Latin + symbols, Gothic A1 Thin for Hangul, Noto Sans SC Thin for hanzi the Japanese font lacks;
2. "wonk": a small seeded tilt, shear, squash, baseline bounce and a smooth wave field (her letters are never straight);
3. the thin strokes are inflated to her marker weight with a lumpy, noisy ink edge - kana one weight, kanji / hanzi a
   weight chosen from the measured gap between strokes so dense characters keep their counters open, Hangul the
   boldest weight at which no stroke merges and no counter closes;
4. the bitmap is traced back into TrueType outlines and added with its own side bearings.
Everything is seeded by the code point: a glyph never changes between builds. Existing glyphs are never touched.
A character no skeleton has still fails loudly (never a silent fallback font).

CLI: `python -m raymi font ensure <job>` (what the job shows on screen), `python -m raymi font add <chars>`.
The cloud workflows run `ensure` before every stills / render run and commit the grown font.
"""
from __future__ import annotations

import math
from datetime import date
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[1]
FONT = REPO / "assets" / "fonts" / "Raymi-Regular.ttf"
SKELETONS = REPO / "assets" / "fonts" / "skeletons"
LOG = REPO / "assets" / "fonts" / "glyphs_built.txt"
SOURCES = {"jp": "MPLUSRounded1c-Thin.ttf", "ko": "GothicA1-Thin.ttf", "zh": "NotoSansSC-Thin-GB2312.ttf"}
THIN_HALVES = {"jp": 14, "ko": 13, "zh": 16}   # half stroke width of each skeleton (its own units, measured on 一 / ㅡ)

CANVAS = 1600                 # px == font units (upem 1000), room for wonk
OX, OY = 300, 1250            # canvas position of the font origin (x = 0, baseline y = 0)
STROKE_R = 49                 # her marker half width in units (measured on '-' / 'l')
ROUGH = 7.0                   # ink edge noise amplitude
SCALE, LIFT = 0.80, 150       # CJK body ~1.2x her cap height, on her floating baseline (her H sits at 129)
SIDE = 40                     # side bearing of the CJK glyphs already in the font


def _cv2():
    import cv2

    return cv2


# ------------------------------------------------------------------ scripts
def is_hangul(ch: str) -> bool:
    cp = ord(ch)
    return 0xAC00 <= cp <= 0xD7A3 or 0x1100 <= cp <= 0x11FF or 0x3130 <= cp <= 0x318F


def is_kana(ch: str) -> bool:
    return 0x3040 <= ord(ch) <= 0x30FF


def is_cjk(ch: str) -> bool:
    cp = ord(ch)
    return is_hangul(ch) or 0x2E80 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or 0xFF00 <= cp <= 0xFFEF or 0x3000 <= cp <= 0x303F


# ------------------------------------------------------------------ outlines -> polygons
class _PolyPen:
    """Flattens a glyph's contours into polygons (font units)."""

    def __new__(cls, glyphset):
        from fontTools.pens.basePen import BasePen

        class Pen(BasePen):
            def __init__(self, gs):
                super().__init__(gs)
                self.polys, self.cur = [], []

            def _moveTo(self, p):
                self.cur = [p]

            def _lineTo(self, p):
                self.cur.append(p)

            def _qCurveToOne(self, p1, p2):
                p0 = self.cur[-1]
                for i in range(1, 7):
                    t = i / 6
                    self.cur.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
                                     (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]))

            def _curveToOne(self, p1, p2, p3):
                p0 = self.cur[-1]
                for i in range(1, 9):
                    t = i / 8
                    a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3
                    self.cur.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
                                     a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))

            def _closePath(self):
                if self.cur:
                    self.polys.append(self.cur)
                self.cur = []

            _endPath = _closePath

        return Pen(glyphset)


class Skeleton:
    def __init__(self, path: Path):
        from fontTools.ttLib import TTFont

        self.font = TTFont(str(path))
        self.gs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.upem = self.font["head"].unitsPerEm

    def polys(self, ch: str) -> list[list[tuple[float, float]]]:
        pen = _PolyPen(self.gs)
        self.gs[self.cmap[ord(ch)]].draw(pen)
        return pen.polys


_SKEL: dict[str, Skeleton] = {}


def skeleton(key: str) -> Skeleton:
    if key not in _SKEL:
        p = SKELETONS / SOURCES[key]
        if not p.is_file():
            raise FileNotFoundError(f"skeleton font missing: {p}")
        _SKEL[key] = Skeleton(p)
    return _SKEL[key]


def pick_source(ch: str) -> str | None:
    """Hangul -> KO; everything else JP first (kana / kanji / Latin / symbols), ZH for hanzi JP lacks."""
    order = ("ko",) if is_hangul(ch) else ("jp", "zh")
    return next((k for k in order if ord(ch) in skeleton(k).cmap), None)


def _to_px(pts) -> np.ndarray:
    return np.array([[OX + x, OY - y] for x, y in pts], np.int32)


# ------------------------------------------------------------------ the marker look
def wonk_params(ch: str) -> dict:
    rng = np.random.default_rng(ord(ch) * 7919)
    return dict(rot=float(np.clip(rng.normal(0, 3.5), -7, 7)), shear=float(rng.uniform(-0.06, 0.06)),
                sx=float(rng.uniform(0.95, 1.05)), sy=float(rng.uniform(0.95, 1.05)),
                dy=float(rng.uniform(-30, 30)), dx=float(rng.uniform(-12, 12)),
                waves=[(rng.uniform(0, 2 * math.pi), rng.uniform(250, 450), rng.uniform(10, 16), rng.uniform(0, 2 * math.pi))
                       for _ in range(2)])


def wonk_point(x: float, y: float, w: dict, cx: float, cy: float) -> tuple[float, float]:
    for ang, lam, amp, ph in w["waves"]:
        u = (x * math.cos(ang) + y * math.sin(ang)) * 2 * math.pi / lam + ph
        x += amp * math.cos(ang + 1.3) * math.sin(u)
        y += amp * math.sin(ang + 1.3) * math.sin(u)
    x, y = (x - cx) * w["sx"], (y - cy) * w["sy"]
    x += w["shear"] * y
    ca, sa = math.cos(math.radians(w["rot"])), math.sin(math.radians(w["rot"]))
    return x * ca - y * sa + cx + w["dx"], x * sa + y * ca + cy + w["dy"]


def topology(ink: np.ndarray) -> tuple[int, int]:
    """(separate ink pieces, enclosed counters >= 300 px) of a binary mask."""
    cv2 = _cv2()
    n_ink = cv2.connectedComponents(ink, connectivity=8)[0] - 1
    bg = cv2.copyMakeBorder(255 - ink, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=255)
    _, _, stats, _ = cv2.connectedComponentsWithStats(bg, connectivity=4)
    return n_ink, int((stats[2:, cv2.CC_STAT_AREA] >= 300).sum())


def ink_radius(ch: str, thin: np.ndarray, dist: np.ndarray, thin_r: float) -> float:
    """Marker half width: kana / Latin one weight; Hangul the boldest weight that keeps its topology; kanji a weight
    set by the measured gap between strokes (dense ones thinner, so counters stay open)."""
    cv2 = _cv2()
    if is_kana(ch) or not is_cjk(ch):
        return STROKE_R * 0.98
    if is_hangul(ch):
        want = topology(((dist < 6) * 255).astype(np.uint8))
        for f in (0.92, 0.88, 0.84, 0.80, 0.76):
            r = STROKE_R * f
            if topology(((dist < r - thin_r + 8.0) * 255).astype(np.uint8)) == want:
                return r
        return STROKE_R * 0.74
    ys, xs = np.nonzero(thin)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    bgd = dist[y0:y1 + 1, x0:x1 + 1]
    ridge = bgd[(bgd >= cv2.dilate(bgd, np.ones((3, 3), np.uint8)) - 1e-3) & (bgd > thin_r * 0.5)]
    ridge = ridge[ridge < (x1 - x0) / 5]
    gap_half = float(np.percentile(ridge, 30)) if len(ridge) > 20 else 999.0
    return min(STROKE_R * 0.86, max(STROKE_R * 0.68, thin_r + 0.72 * gap_half))


def placement(ch: str, sk: Skeleton, target: dict | None) -> tuple[float, float]:
    """(scale, lift): CJK on the existing CJK body; Latin / symbols matched to HER cap height (her H)."""
    if is_cjk(ch) or target is None:
        return SCALE * 1000 / sk.upem, LIFT
    from fontTools.pens.boundsPen import BoundsPen

    b = BoundsPen(sk.gs)
    sk.gs[sk.cmap[ord("H")]].draw(b)
    _, sy0, _, sy1 = b.bounds
    k = (target["H"][3] - target["H"][1]) / (sy1 - sy0)
    return k, target["H"][1] - sy0 * k


def glyph_mask(ch: str, key: str, target: dict | None = None) -> np.ndarray:
    cv2 = _cv2()
    sk = skeleton(key)
    k_em, lift = placement(ch, sk, target)
    polys = [[(x * k_em + 20, y * k_em + lift) for x, y in p] for p in sk.polys(ch)]
    w = wonk_params(ch)
    allp = np.concatenate([np.array(p) for p in polys])
    cx, cy = allp[:, 0].mean(), allp[:, 1].mean()
    polys = [[wonk_point(x, y, w, cx, cy) for x, y in p] for p in polys]
    thin = np.zeros((CANVAS, CANVAS), np.uint8)
    for q in polys:                        # even-odd keeps counters open
        layer = np.zeros_like(thin)
        cv2.fillPoly(layer, [_to_px(q)], 255)
        thin = cv2.bitwise_xor(thin, layer)
    dist = cv2.distanceTransform(255 - thin, cv2.DIST_L2, 5)
    thin_r = THIN_HALVES[key] * k_em
    r = ink_radius(ch, thin, dist, thin_r)
    rng = np.random.default_rng(ord(ch))

    def smooth(sig):
        n = cv2.GaussianBlur(rng.standard_normal(thin.shape).astype(np.float32), (0, 0), sig)
        return n / (n.std() + 1e-6)

    kk = r / STROKE_R
    edge = (r - thin_r) * (1 + 0.12 * smooth(60)) + ROUGH * 0.55 * kk * smooth(5) + 10.0 * kk * smooth(14)
    out = ((dist < edge) * 255).astype(np.uint8)
    return cv2.morphologyEx(out, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))


def trace(mask: np.ndarray):
    """Bitmap -> TrueType glyph (outer contours clockwise) and its x extent."""
    cv2 = _cv2()
    from fontTools.pens.ttGlyphPen import TTGlyphPen

    m = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    contours, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    pen = TTGlyphPen(None)
    xs: list[float] = []
    for i, c in enumerate(contours):
        if cv2.contourArea(c) < 60:
            continue
        c = cv2.approxPolyDP(c, 1.6, True).reshape(-1, 2)
        pts = [(float(x - OX), float(OY - y)) for x, y in c]
        area = sum(pts[k][0] * pts[k - 1][1] - pts[k - 1][0] * pts[k][1] for k in range(len(pts))) / 2
        outer = hier[0][i][3] == -1
        if (outer and area > 0) or (not outer and area < 0):
            pts = pts[::-1]
        pen.moveTo(pts[0])
        for q in pts[1:]:
            pen.lineTo(q)
        pen.closePath()
        xs += [q[0] for q in pts]
    return pen.glyph(), ((min(xs), max(xs)) if xs else (0.0, 0.0))


def raster(font, ch: str) -> np.ndarray:
    """A font's glyph painted on the canvas (for comparisons)."""
    cv2 = _cv2()
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    pen = _PolyPen(gs)
    gs[cmap[ord(ch)]].draw(pen)
    out = np.zeros((CANVAS, CANVAS), np.uint8)
    for q in pen.polys:
        layer = np.zeros_like(out)
        cv2.fillPoly(layer, [_to_px(q)], 255)
        out = cv2.bitwise_xor(out, layer)
    return out


# ------------------------------------------------------------------ growing the font
def missing(text: str, cmap: set[int]) -> list[str]:
    return sorted({c for c in text if not c.isspace() and ord(c) not in cmap})


def add_glyphs(font, chars: list[str]) -> tuple[list[str], list[str]]:
    """Build + add each char (in memory). Returns (added chars, chars no skeleton has)."""
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.ttGlyphPen import TTGlyphPen

    have = set(font.getBestCmap())
    glyf, hmtx = font["glyf"], font["hmtx"]
    order = list(font.getGlyphOrder())
    gs = font.getGlyphSet()
    b = BoundsPen(gs)
    gs[font.getBestCmap()[ord("H")]].draw(b)
    target = {"H": b.bounds}
    added, impossible = [], []
    for ch in chars:
        cp = ord(ch)
        if cp in have:
            continue
        key = pick_source(ch)
        if key is None:
            impossible.append(ch)
            continue
        glyph, (x0, x1) = trace(glyph_mask(ch, key, target))
        pen = TTGlyphPen(None)
        glyph.draw(TransformPen(pen, (1, 0, 0, 1, SIDE - x0, 0)), glyf)
        name = f"uni{cp:04X}" if cp <= 0xFFFF else f"u{cp:05X}"
        glyf[name] = pen.glyph()
        glyf[name].recalcBounds(glyf)
        hmtx[name] = (int(x1 - x0 + 2 * SIDE), SIDE)
        order.append(name)
        for table in font["cmap"].tables:
            if table.isUnicode() and (table.format in (4, 12)) and (cp <= 0xFFFF or table.format == 12):
                table.cmap[cp] = name
        added.append(ch)
    font.setGlyphOrder(order)
    font["maxp"].numGlyphs = len(order)
    if font["post"].formatType == 2.0:      # glyph names are rebuilt from the order on save
        font["post"].extraNames = []
        font["post"].mapping = {}
    return added, impossible


# ------------------------------------------------------------------ her heavy weight (lyrics v2)
# toki 2026-10-19: lyrics "zu klein, zu dünn". The heavy weight is HER font, not another one: every glyph of
# Raymi-Regular painted, its ink grown by HEAVY_R units (her marker pressed harder), traced back. The boldest growth
# that keeps the glyph's topology wins (a counter never closes, an i-dot never melts into its stem), so dense kanji
# get less. Glyph names, cmap and order stay identical: whatever Regular can show, Heavy can show.
HEAVY = REPO / "assets" / "fonts" / "Raymi-Heavy.ttf"
HEAVY_R = 18                  # extra half width in units (her stroke 49 -> 67, ~1.37x)


def _counters(ink: np.ndarray) -> list[np.ndarray]:
    """Masks of the enclosed counters (>= 300 px) of a binary glyph."""
    cv2 = _cv2()
    bg = cv2.copyMakeBorder(255 - ink, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=255)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(bg, connectivity=4)
    return [(lab[1:-1, 1:-1] == i) for i in range(2, n) if stats[i, cv2.CC_STAT_AREA] >= 300]


def embolden(mask: np.ndarray, ch: str = "", r: float = HEAVY_R) -> tuple[np.ndarray, float]:
    """Grow the ink by up to r, but every gap between strokes keeps at least 45 % of its width: a pixel of background
    is filled only if it is <= r from the ink AND <= 55 % of the local half gap (the ridge of the background distance
    field nearby). So open letters grow the full r, dense kanji grow less, and no counter or gap ever closes - the
    glyph stays legible at phone size. Returns (mask, r = the growth on the outside, for the spacing)."""
    cv2 = _cv2()
    k = int(round(r))
    dist = cv2.distanceTransform(255 - mask, cv2.DIST_L2, 5)
    ridge = cv2.dilate(dist, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4 * k + 1, 4 * k + 1)))
    fill = (dist <= k) & (dist <= 0.55 * ridge)
    return np.where(fill | (mask > 0), 255, 0).astype(np.uint8), float(k)


def heavy(src: Path = FONT, dst: Path = HEAVY, only: set[int] | None = None) -> list[str]:
    """Build / update Raymi-Heavy.ttf from Raymi-Regular.ttf. A glyph already emboldened in an existing Heavy is kept
    (same code point), so a grown Regular costs only its new glyphs. `only` limits the build (tests). Returns the chars
    emboldened in this run."""
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.ttLib import TTFont

    reg = TTFont(str(src))
    old = TTFont(str(dst)) if dst.is_file() else None
    old_cmap = old.getBestCmap() if old is not None else {}
    cmap = reg.getBestCmap()
    glyf, hmtx = reg["glyf"], reg["hmtx"]
    made = []
    for cp, name in sorted(cmap.items()):
        if only is not None and cp not in only:
            continue
        if cp in old_cmap and old_cmap[cp] == name:
            glyf[name] = old["glyf"][name]
            hmtx[name] = old["hmtx"][name]
            continue
        if glyf[name].numberOfContours == 0:         # space and friends: only a little wider
            adv, lsb = hmtx[name]
            hmtx[name] = (adv + HEAVY_R, lsb)
            continue
        mask, k = embolden(raster(reg, chr(cp)), chr(cp))
        glyph, (x0, x1) = trace(mask)
        pen = TTGlyphPen(None)
        glyph.draw(TransformPen(pen, (1, 0, 0, 1, k, 0)), glyf)   # the ink grew k to the left: shift it back in
        glyf[name] = pen.glyph()
        glyf[name].recalcBounds(glyf)
        adv, lsb = hmtx[name]
        hmtx[name] = (int(adv + 2 * k), int(round(x0 + k)))
        made.append(chr(cp))
    reg["OS/2"].usWeightClass = 800
    for rec in reg["name"].names:
        if rec.nameID in (2, 17):
            rec.string = "Heavy"
        elif rec.nameID in (3, 4, 6, 16):
            rec.string = str(rec.toUnicode()).replace("Regular", "Heavy").replace(" ", "-" if rec.nameID == 6 else " ")
    reg.save(str(dst))
    return made


def grow(text: str, font_path: Path = FONT, log: Path | None = LOG) -> tuple[list[str], list[str]]:
    """Make sure every character of `text` exists in her font; save it if it grew."""
    from fontTools.ttLib import TTFont

    font = TTFont(str(font_path))
    need = missing(text, set(font.getBestCmap()))
    if not need:
        return [], []
    added, impossible = add_glyphs(font, need)
    if added:
        font.save(str(font_path))
        if log is not None:
            with log.open("a", encoding="utf-8", newline="\n") as fh:
                fh.write(f"{date.today().isoformat()} {''.join(added)}\n")
    return added, impossible

"""Her font grows in her own marker style: the port matches the glyphs already in the font, new ones are deterministic,
Latin symbols sit on her cap height, and a character no skeleton has fails loudly."""
import shutil

import numpy as np
import pytest

from raymi import font as F

TTFont = pytest.importorskip("fontTools.ttLib").TTFont


def _absent(cands: str) -> str:
    """A character her font does not have yet (the font keeps growing, so pick at test time)."""
    have = set(TTFont(str(F.FONT)).getBestCmap())
    return next(c for c in cands if ord(c) not in have)


def _without(path, ch):
    f = TTFont(str(path))
    for t in f["cmap"].tables:
        if t.isUnicode():
            t.cmap.pop(ord(ch), None)
    return f


@pytest.mark.parametrize("ch", ["口", "願", "あ", "ア", "가"])
def test_port_rebuilds_the_existing_glyphs(ch):
    """Built again from scratch, a glyph already in her font comes out the same (so new kanji match the old ones)."""
    orig = TTFont(str(F.FONT))
    f = _without(F.FONT, ch)
    added, impossible = F.add_glyphs(f, [ch])
    assert added == [ch] and not impossible
    a, b = F.raster(orig, ch) > 0, F.raster(f, ch) > 0
    assert (a & b).sum() / (a | b).sum() > 0.97
    assert f["hmtx"][f.getBestCmap()[ord(ch)]] == orig["hmtx"][orig.getBestCmap()[ord(ch)]]


def test_grow_adds_missing_kanji_once_and_deterministically(tmp_path):
    p1, p2 = tmp_path / "a.ttf", tmp_path / "b.ttf"
    shutil.copy(F.FONT, p1)
    shutil.copy(F.FONT, p2)
    ch = _absent("鬱龍鷹鳳麒麟")
    added, impossible = F.grow(ch + "をむき出して", p1, log=None)
    assert added == [ch] and not impossible
    assert F.grow(ch, p1, log=None) == ([], [])            # already there now
    F.grow(ch, p2, log=None)
    r1, r2 = F.raster(TTFont(str(p1)), ch), F.raster(TTFont(str(p2)), ch)
    assert (r1 == r2).all()


def test_new_kanji_has_her_marker_weight(tmp_path):
    """Stroke thickness of a new kanji is in the band of the kanji already in her font."""
    cv2 = pytest.importorskip("cv2")
    p = tmp_path / "f.ttf"
    shutil.copy(F.FONT, p)
    F.grow("閉", p, log=None)
    f = TTFont(str(p))

    def width(ch):
        m = F.raster(f, ch)
        d = cv2.distanceTransform(m, cv2.DIST_L2, 5)
        ridge = d[(d >= cv2.dilate(d, np.ones((3, 3), np.uint8)) - 1e-3) & (d > 5)]
        return float(np.median(ridge)) * 2

    old = np.median([width(c) for c in "間開門問"if ord(c) in f.getBestCmap()] or [width("口")])
    assert 0.75 * old <= width("閉") <= 1.25 * old


def test_latin_symbol_sits_on_her_cap_height(tmp_path):
    p = tmp_path / "f.ttf"
    shutil.copy(F.FONT, p)
    sym = _absent("©€§¶@")
    added, _ = F.grow(sym, p, log=None)
    assert added == [sym]
    from fontTools.pens.boundsPen import BoundsPen

    f = TTFont(str(p))
    gs, cm = f.getGlyphSet(), f.getBestCmap()
    bh, ba = BoundsPen(gs), BoundsPen(gs)
    gs[cm[ord("H")]].draw(bh)
    gs[cm[ord(sym)]].draw(ba)
    h_h, h_a = bh.bounds[3] - bh.bounds[1], ba.bounds[3] - ba.bounds[1]
    assert 0.7 * h_h <= h_a <= 1.4 * h_h


def test_a_character_no_skeleton_has_fails_loudly(tmp_path):
    p = tmp_path / "f.ttf"
    shutil.copy(F.FONT, p)
    added, impossible = F.grow("\U0001F600", p, log=None)
    assert added == [] and impossible == ["\U0001F600"]


def test_heavy_weight_is_her_font_pressed_harder(tmp_path):
    """Lyrics v2 (toki 2026-10-19 "zu dünn"): Heavy = every Regular glyph with more ink, same topology, same cmap;
    an existing Heavy glyph is kept (a grown Regular costs only its new glyphs)."""
    cv2 = pytest.importorskip("cv2")
    dst = tmp_path / "Heavy.ttf"
    chars = "Kiあ願"
    made = F.heavy(F.FONT, dst, only={ord(c) for c in chars})
    assert sorted(made) == sorted(chars)
    reg, hv = TTFont(str(F.FONT)), TTFont(str(dst))
    assert hv.getBestCmap() == reg.getBestCmap()
    assert hv["OS/2"].usWeightClass == 800
    for ch in chars:
        a, b = F.raster(reg, ch), F.raster(hv, ch)
        assert (b > 0).sum() > (1.25 if not F.is_cjk(ch) else 1.08) * (a > 0).sum(), ch   # clearly more ink
        assert len(F._counters(b)) >= len(F._counters(a)), ch                # no counter closed
        if not F.is_cjk(ch):
            assert F.topology(b)[0] == F.topology(a)[0], ch                  # no dot melted into its stem
        n = reg.getBestCmap()[ord(ch)]
        assert hv["hmtx"][n][0] > reg["hmtx"][n][0]                         # wider advance, spacing kept
    assert F.heavy(F.FONT, dst, only={ord(c) for c in chars}) == []        # already heavy: nothing rebuilt
    assert cv2 is not None

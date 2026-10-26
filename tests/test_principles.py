import numpy as np

from raymi import principles as P


def _frame(h=180, w=320):
    return np.zeros((h, w, 3), np.float32)


def test_two_tone_frame_reads_as_two_tone():
    f = _frame()
    f[:, 160:] = 1.0                       # half paper white, half ink black
    m = P.measure(f)
    assert m["two_tone"] > 0.95 and abs(m["light_share"] - 0.5) < 0.05
    assert m["contrast"] > 0.9


def test_letterbox_is_not_dark_area():
    f = np.full((180, 320, 3), 0.5, np.float32)
    f[:25], f[-25:] = 0, 0                 # player bars
    assert P.measure(f)["dark_share"] < 0.01


def test_one_sided_black_sky_is_kept():
    f = np.full((180, 320, 3), 0.5, np.float32)
    f[:60] = 0                             # a black night sky on top only: picture, not a bar
    assert P.measure(f)["dark_share"] > 0.3


def test_placement_finds_a_small_figure_off_centre():
    f = np.full((180, 320, 3), 0.9, np.float32)
    f[60:130, 230:260] = 0.05              # a dark figure on the right third
    m = P.measure(f)
    assert m["subj_x"] > 0.6 and m["subj_size"] < 0.2
    assert m["neg_space"] > 0.5


def test_gap_names_the_broken_rule():
    card = {"range": {"two_tone": [0.8, 0.95], "light_share": [0.37, 0.8]}, "key": ["mid", "high"], "skip": []}
    m = {"two_tone": 0.6, "light_share": 0.5, "key": "mid"}
    g = P.gap(m, card)
    assert len(g) == 1 and g[0].startswith("two_tone")


def test_effect_class_words():
    assert P.effect_class("Visceral kinetic punch") == ["hit", "speed"]
    assert "breathe" in P.effect_class("release")

"""Screening kit: picture-change measurements and the kit itself (the kit test runs in the cloud only)."""
import os
import subprocess

import numpy as np
import pytest

from raymi import screen as S


def test_change_curve_and_hits():
    fr = np.zeros((10, 4, 4), np.float32)
    fr[5:] = 200                                   # a cut at frame 5
    c = S.change_curve(fr)
    assert c[0] == 0 and c[5] == 200 and c[6] == 0
    res = S.change_on_hits(c, [5, 8], win=1, thr=10)
    assert res == {"hits": 2, "changed": 1, "share": 0.5, "threshold": 10}


def test_dead_spans_find_slideshow_holds():
    c = np.r_[np.full(90, 0.2), np.full(30, 5.0), np.full(30, 0.1)]
    assert S.dead_spans(c, 30, min_s=2.0) == [[0.0, 3.0]]


def test_tile_command_is_phone_sized_and_stamped():
    cmd = S.tile_cmd(__import__("pathlib").Path("v.mp4"), __import__("pathlib").Path("o_%02d.jpg"), 2, 150, 6, 4,
                     gray=True, fontfile=None)
    vf = cmd[cmd.index("-vf") + 1]
    assert vf.startswith("fps=2,scale=150:-2,format=gray") and "tile=6x4" in vf


@pytest.mark.skipif(not os.environ.get("CI"), reason="encodes a test clip - cloud only (toki's PC never renders)")
def test_kit_from_a_test_clip(tmp_path):
    v = tmp_path / "v.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "testsrc=size=320x180:rate=30:duration=7",
                    "-f", "lavfi", "-i", "sine=frequency=440:duration=7", "-shortest", str(v)], check=True)
    props = {"durationInFrames": 210, "hits": [30, 90], "shots": [
        {"id": "a", "from": 0, "to": 100, "set": "x", "words": [], "transition": {"kind": "cut"}},
        {"id": "b", "from": 100, "to": 210, "set": "x", "words": [], "transition": {"kind": "cut"}}]}
    out = S.build(v, tmp_path / "kit", props, {"shots": [{"why": "w1"}, {"why": "w2"}]})
    names = {p.name for p in (out / "view").iterdir()}
    assert {"first_glance.jpg", "phone_01.jpg", "gray_01.jpg", "seq_00.jpg", "full_00.jpg", "full_01.jpg"} <= names
    facts = __import__("json").loads((out / "facts" / "facts.json").read_text())
    assert facts["shot_lengths_s"] == [3.33, 3.67] and facts["picture_change_on_hits"]["hits"] == 2
    assert (out / "script" / "shots.json").is_file()

"""Picture QC v2 (raymi/qcv2.py): what the viewer sees, measured on the mask pass (toki 2026-10-24)."""
import json

import numpy as np

from raymi import qcv2 as Q

H, W = 90, 160


def img(fill="none"):
    a = np.zeros((H, W, 3), np.uint8)
    a[:] = Q.PALETTE[fill]
    return a


def put(a, y0, y1, x0, x1, name):
    a[y0:y1, x0:x1] = Q.PALETTE[name]


def test_pierced_inside_her_outline_but_not_a_thing_in_front():
    her = img("room"); put(her, 20, 80, 60, 100, "body"); put(her, 20, 32, 70, 90, "face")
    all_ = her.copy()
    put(all_, 45, 55, 75, 85, "set")            # a set piece shows INSIDE her body: something sticks out through her
    put(all_, 70, 90, 40, 120, "set")           # a table in front of her legs crosses her outline: fine
    m = Q.frame_metrics(Q.classes(all_), Q.classes(her), Q.classes(img()))
    assert len(m["pierced"]) == 1 and m["pierced"][0]["what"] == "set"
    assert abs(m["pierced"][0]["xy"][0] - 0.5) < 0.02


def test_text_on_face_hidden_text_and_face_cut():
    her = img("room"); put(her, 0, 30, 60, 100, "face"); put(her, 30, 80, 55, 105, "body")
    text = img(); put(text, 10, 20, 50, 110, "text"); put(text, 60, 70, 0, 40, "text")
    all_ = her.copy(); put(all_, 10, 20, 50, 110, "text")       # the face line is drawn over her face
    put(all_, 60, 70, 0, 10, "text"); put(all_, 60, 70, 10, 40, "set")   # most of the second line hides behind a prop
    m = Q.frame_metrics(Q.classes(all_), Q.classes(her), Q.classes(text))
    assert m["text_face"] > 0.3 and m["face_cut"] is True
    assert 0.7 < m["text_hid"] < 0.8 and m["text_hid_by"] == "set" and m["text_xy"][0] < 0.3


def test_classify_and_pop(tmp_path):
    rows = [{"F": 0, "shot": "1", "her": 0.2, "pierced": [], "text_face": 0.5, "face_xy": [0.5, 0.2]},
            {"F": 2, "shot": "1", "her": 0.02, "pierced": [{"what": "set", "share": 0.01, "xy": [0.4, 0.5]}]},
            {"F": 4, "shot": "2", "her": 0.2, "pierced": [], "face_cut": True, "face_xy": [0.5, 0.0]}]
    c = Q.classify({"rows": rows}, closeups={"2"})
    assert set(c) == {"text_face", "pierced", "her_pop"}
    fl = Q.flags(c)
    assert {f["cls"] for f in fl} == {"text_face", "pierced", "her_pop"}


def test_mask_frames_and_shots(tmp_path):
    import cv2
    for m in ("all", "her", "text"):
        (tmp_path / m).mkdir()
        for F in (0, 2, 4):
            cv2.imwrite(str(tmp_path / m / f"f{F:05d}.png"), img("room"))
    (tmp_path / "qc.json").write_text(json.dumps({"every": 2, "frames": 6, "shots": [{"id": "a", "from": 0}, {"id": "b", "from": 3}]}))
    rep = Q.analyze(tmp_path)
    assert [(r["F"], r["shot"]) for r in rep["rows"]] == [(0, "a"), (2, "a"), (4, "b")]


def test_join_parallel_parts(tmp_path):
    import cv2
    parts, job = tmp_path / "parts", tmp_path / "job"
    for k, frames in enumerate(([0, 2], [4, 6])):
        d = parts / f"qc-{k}"
        (d / "probe").mkdir(parents=True)
        (d / "probe" / f"probe_part{k}.json").write_text(json.dumps({"job": "j", "every": 2, "fps": 30, "rows": [{"F": F, "f": F} for F in frames[::-1]]}))
        for m in ("all", "her", "text"):
            (d / "mask" / m).mkdir(parents=True)
            for F in frames:
                cv2.imwrite(str(d / "mask" / m / f"f{F:05d}.png"), img())
        (d / "mask" / "qc.json").write_text(json.dumps({"every": 2, "frames": 8, "shots": [{"id": "a", "from": 0}]}))
    assert Q.join(parts, job) == {"probe_rows": 4, "mask_frames": 4}
    rows = json.loads((job / "out" / "probe_mv.json").read_text())["rows"]
    assert [r["F"] for r in rows] == [0, 2, 4, 6]
    assert len(Q.analyze(job / "out" / "qc_mv")["rows"]) == 4

"""raymi/frame.py: close shots shift onto her measured head; wide shots and tiny errors stay as they are."""
from raymi import frame


def _props(fov=30.0, dist=0.6):
    keys = [{"f": 0, "pos": [0.0, 1.45, dist], "look": [0.0, 1.45, 0.0], "fov": fov},
            {"f": 30, "pos": [0.0, 1.45, dist], "look": [0.0, 1.45, 0.0], "fov": fov}]
    return {"shots": [{"id": "01", "from": 0, "to": 30, "camera": keys}]}


def _report(head):
    return {"rows": [{"f": f, "F": f, "shot": "01", "her": {"bones": {"head": head}}} for f in (0, 10, 20)]}


def test_close_shot_moves_onto_the_head_and_a_little_high():
    r = frame.fits(_props(), _report([0.15, 1.30, 0.0]))["01"]
    fh = 2 * 0.6 * 0.2679                                   # frame height at 0.6 m, fov 30
    assert abs(r["shift"][0] - 0.15) < 1e-3                 # sideways onto the head
    assert abs(r["shift"][1] - (1.30 + frame.EYES - 1.45 - frame.HIGH * fh)) < 2e-3   # her eyes, the face 10 % high
    assert abs(r["shift"][2]) < 1e-3                        # never along the view: the distance stays


def test_wide_shot_is_left_alone():
    assert frame.fits(_props(fov=40, dist=3.0), _report([0.3, 1.2, 0.0])) == {}


def test_huge_shift_is_reported_not_applied():
    r = frame.fits(_props(), _report([1.2, 1.45, 0.0]))["01"]
    assert "skip" in r


def test_main_writes_a_multicam_pictures_fit_into_its_row(tmp_path):
    """Love is War stills 2 (2026-10-27): main() crashed on its own name `fits` after a 52-min probe; a picture id
    "28a" (timeline expand_rows) stores its fit in row 28's frame_fits, the row's own picture in frame_fit."""
    import json
    props = _props()
    props["shots"].append({**props["shots"][0], "id": "01a"})
    rep = _report([0.15, 1.30, 0.0])
    rep["rows"] += [{**r, "shot": "01a"} for r in rep["rows"]]
    (tmp_path / "out").mkdir()
    (tmp_path / "out" / "props.json").write_text(json.dumps(props), encoding="utf-8")
    (tmp_path / "out" / "probe_mv.json").write_text(json.dumps(rep), encoding="utf-8")
    (tmp_path / "shots.json").write_text(json.dumps({"shots": [{"id": "01"}]}), encoding="utf-8")
    frame.main(tmp_path)
    row = json.loads((tmp_path / "shots.json").read_text(encoding="utf-8"))["shots"][0]
    assert row["frame_fit"] and row["frame_fits"]["01a"] == row["frame_fit"]

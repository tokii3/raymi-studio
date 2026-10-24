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
    assert abs(r["shift"][1] - (1.30 - 1.45 - frame.HIGH * fh)) < 2e-3   # down, leaving the face 10 % high
    assert abs(r["shift"][2]) < 1e-3                        # never along the view: the distance stays


def test_wide_shot_is_left_alone():
    assert frame.fits(_props(fov=40, dist=3.0), _report([0.3, 1.2, 0.0])) == {}


def test_huge_shift_is_reported_not_applied():
    r = frame.fits(_props(), _report([1.2, 1.45, 0.0]))["01"]
    assert "skip" in r

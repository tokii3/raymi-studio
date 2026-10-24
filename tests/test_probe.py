"""The scene probe's fault classes (raymi/probe.py, toki 2026-10-24: structural faults, not spots)."""
from raymi import probe as PR


def row(f, shot, hips, foot, support, inside=(), things=()):
    return {"f": f, "shot": shot, "her": {"hips": hips, "foot": foot, "support": support, "inside": list(inside)}, "things": list(things)}


def test_classes():
    rep = {"every": 6, "frames": 5, "rows": [
        row(0, "a", [0, 0.9, 0], 0.05, 0.0, inside=[{"bone": "leftHand", "in": "desk", "depth": 0.04}]),
        row(6, "a", [0, 0.9, 0.6], 0.3, 0.0),                                   # hips jump 0.6 m + floating 0.3 m
        row(12, "b", [0, 0.9, 0], -0.1, 0.0, things=[{"thing": "phone", "with": "cushion", "share": 0.4, "gap": None}]),
        row(18, "c", [0, 1.5, 0], 0.6, 0.0),                                    # c is a jump: airborne, not floating
        row(24, "b", [0, 0.9, 0], 0.0, 0.0, things=[{"thing": "can", "with": "air", "share": 0, "gap": 0.2}]),
    ]}
    c = PR.classify(rep, airborne={"c"})
    assert c["limb_in"]["a"]["detail"] == {"leftHand in desk": 1}
    assert c["pop"]["a"]["frames"] == 1 and c["float"]["a"]["worst"] == 0.3
    assert c["sink"]["b"]["frames"] == 1 and "c" not in c.get("float", {})
    assert c["thing_in"]["b"]["detail"] == {"phone in cushion": 1} and c["thing_air"]["b"]["worst"] == 0.2


def test_airborne_and_moving_shots():
    spec = {"shots": [{"id": "1", "actor": [{"clip": "falling"}]}, {"id": "2", "actor": [{"pose": "sit", "pos": "chair"}]},
                      {"id": "3", "actor": [{"pos": [0, 0, 0]}, {"pos": [0, 0, -5], "move": 2}]}]}
    assert PR.airborne_shots(spec) == {"1"} and PR.moving_shots(spec) == {"3"}

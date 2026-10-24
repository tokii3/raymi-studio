"""The scene probe's fault classes (raymi/probe.py, toki 2026-10-24: structural faults, not spots)."""
from raymi import probe as PR


def row(f, shot, hips, foot, support, inside=(), things=()):
    return {"f": f, "shot": shot, "her": {"hips": hips, "foot": foot, "support": support, "inside": list(inside)}, "things": list(things)}


def test_classes():
    rep = {"every": 6, "frames": 5, "rows": [
        row(0, "a", [0, 0.9, 0], 0.05, 0.0, inside=[{"bone": "leftHand", "in": "desk", "depth": 0.04}]),
        row(6, "a", [0, 0.9, 0.6], 0.38, 0.0),                                  # hips jump 0.6 m + floating 0.3 m (+ ankle)
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


def bones(hy, lf=(0.1, 0.08, 0), rf=(-0.1, 0.08, 0), hand=(0.3, 1.0, 0)):
    b = {k: [0, 1.0, 0] for k in ("head", "chest", "leftLowerArm", "rightLowerArm", "leftUpperLeg", "rightUpperLeg",
                                  "leftLowerLeg", "rightLowerLeg")}
    b.update(hips=[0, hy, 0], leftFoot=list(lf), rightFoot=list(rf), leftHand=list(hand), rightHand=[-0.3, 1.0, 0])
    return b


def vrow(F, shot, hy=0.9, foot_y=0.08, faults=(), **kw):
    b = bones(hy, **kw)
    return {"f": F, "F": F, "shot": shot, "faults": list(faults), "things": [],
            "her": {"hips": b["hips"], "foot": foot_y, "support": 0.0, "inside": [], "bones": b, "footSup": {"l": 0.0, "r": 0.0},
                    "scr": {"head": [0.5, 0.3], "top": [0.5, 0.2], "hips": [0.5, 0.6], "lf": [0.5, 0.9], "rf": [0.5, 0.9]}}}


def test_v2_drop_at_shot_start_even_when_airborne():
    # toki 2026-10-24 "fällt immer noch vom Himmel": v1 exempted every airborne shot and sampled every 15th frame
    rows = [vrow(0, "a", hy=2.4, foot_y=1.6)] + [vrow(2 * i, "a", hy=2.4 - 0.15 * i, foot_y=max(0.08, 1.6 - 0.15 * i)) for i in range(1, 9)]
    c = PR.classify({"every": 2, "fps": 30, "frames": len(rows), "rows": rows}, airborne={"a"})
    d = c["drop"]["a"]["detail"]
    assert any("starts in the air (airborne by script)" in k for k in d) and any(k.startswith("falls") for k in d)


def test_v2_jerk_slide_and_browser_faults():
    rows = [vrow(2 * i, "b", hand=(0.3 + 0.01 * i, 1.0, 0)) for i in range(8)]
    rows[5]["her"]["bones"]["leftHand"] = [0.9, 1.0, 0]                  # one hitch of the hand
    for i, r in enumerate(rows):                                         # the left foot skates while planted
        r["her"]["bones"]["leftFoot"] = [0.1 + 0.05 * i, 0.08, 0]
    rows[2]["faults"] = [{"cls": "text_in", "what": "a lyric in Box", "depth": 3, "at": [0.4, 0.4]}]
    c = PR.classify({"every": 2, "fps": 30, "frames": 8, "rows": rows})
    assert c["jerk"]["b"]["detail"].get("leftHand jumps", 0) >= 1
    assert c["slide"]["b"]["detail"] == {"leftFoot slides": 7}
    assert c["text_in"]["b"]["at"] == {"F": 4, "xy": [0.4, 0.4]}
    fl = PR.flags(c)
    assert {f["cls"] for f in fl} >= {"jerk", "slide", "text_in"} and all(f["F"] is not None for f in fl)


def test_v2_head_cut_only_outside_closeups():
    r = vrow(0, "c")
    r["her"]["scr"]["top"] = [0.5, -0.1]
    assert "c" in PR.classify({"every": 2, "frames": 1, "rows": [r]})["head_cut"]
    assert "head_cut" not in PR.classify({"every": 2, "frames": 1, "rows": [r]}, closeups={"c"})

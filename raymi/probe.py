"""The scene probe's report as fault CLASSES (toki 2026-10-24: "das sind Strukturfehler, hör auf punktuell zu fixen").

studio/probe.mjs measures every N-th frame of a film in the real scene graph (film/Probe.tsx). This groups what it found
by fault class and shot, so a fix goes into the part that makes the fault, not into one shot:
  limb_in   her surface (hand, foot, hips, hair ...) inside a piece of furniture or a prop
  float     her lowest foot above the support under her (she hovers, or "falls from the sky")
  sink      her lowest foot below the support (in the floor, in the bed, in the cushion)
  pop       her hips jump between two probed frames of the same shot (a key / clip switch teleports her)
  thing_in  a thing inside another solid (the phone in the cushion)
  thing_air a thing in the air with nothing under it
v2 (toki 2026-10-24 after Beach run 58: "der Code zeigt keine Fehler, aber visuell sieht man sie") - her real surface,
every 2nd frame, and what she SAW but v1 could not measure:
  self_in   her forearm / hand through her own torso         hair_in   her hair through her torso
  leg_cross shins / thighs through each other                text_in   a lyric through her or inside a prop
  lens_in   the camera inside a solid                        near_cut  the lens so close it cuts her open
  head_cut  the top of her head cut by the frame edge (not in a close-up)
  drop      she comes down from above at a shot start or falls fast ("fällt aus dem Himmel") - airborne shots are
            reported too, marked: toki saw the scripted falls as the fault
  jerk      a bone jumps between two probed frames far beyond the shot's own motion (a hitch: not fluid)
  slide     a planted foot slides over the floor (skating, a moonwalk on a walk)
`python -m raymi probe <job> [mv|short]` prints the classes; `flags()` lists the worst frame per class + shot with a
screen point (the eye level zooms there, raymi/qcv2.py).
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ANKLE = 0.08      # m: the probe measures the ankle bone - standing, it sits this high above the floor (run 1: every
                  # standing shot read 'floating 0.077')
FLOAT = 0.07      # m above the ankle's own height = floating
SINK = 0.03       # m: the ankle this far below the support = the foot is inside it
POP = 0.045       # m of hips travel PER FRAME between two probed frames (x the probe step) the keys did not ask for
SPARSE = 3        # a probe sampled sparser than every 3rd frame is no screening (v1 ran every 15th on Beach)
DROP_START = 0.10 # m: her feet this far above the support on a shot's first probed frame = she comes down into it
DROP_V = 1.6      # m/s of hips falling = a fall ...
DROP_T = 0.3      # ... lasting this many s (a jump's landing is shorter)
JERK = 4.0        # x the shot's own median step of that bone ...
JERK_MIN = 0.06   # ... and at least this many m PER FRAME (x the probe step): a hitch, not a fast move
SLIDE = 0.012     # m per frame a planted foot may drift (planted = within PLANT of its support, + ankle)
PLANT = 0.035
MOTION = ("hips", "head", "leftHand", "rightHand", "leftFoot", "rightFoot")
CLASSES = ("limb_in", "self_in", "hair_in", "leg_cross", "text_in", "lens_in", "near_cut", "head_cut", "float", "sink",
           "drop", "pop", "jerk", "slide", "thing_in", "thing_air")


def classify(report: dict, airborne: set[str] | None = None, moving: set[str] | None = None,
             seated: set[str] | None = None, closeups: set[str] | None = None) -> dict[str, dict[str, dict]]:
    """{class: {shot: {"frames": n, "worst": ..., "detail": ..., "at": {F, xy}}}}. airborne = shots where she is meant
    to be off the ground (falling, flying, a jump); moving = shots whose keys move her (a pop there is checked against
    the move); closeups = shots where her head may leave the frame."""
    airborne = airborne or set()
    moving = moving or set()
    seated = seated or set()               # her chair carries her: her feet under the seat are no float / sink
    closeups = closeups or set()
    pop = POP * report.get("every", 6)
    out: dict[str, dict[str, dict]] = defaultdict(dict)

    def add(cls, shot, worst, detail, r=None, at=None):
        e = out[cls].setdefault(shot, {"frames": 0, "worst": 0.0, "detail": defaultdict(int), "at": None})
        e["frames"] += 1
        if r is not None and (e["at"] is None or worst >= e["worst"]):
            e["at"] = {"F": r.get("F", r.get("f")), "xy": at}
        e["worst"] = max(e["worst"], worst)
        e["detail"][detail] += 1

    prev = None
    for r in report["rows"]:
        shot = r.get("shot")
        her = r.get("her")
        if her:
            sc = her.get("scr") or {}
            for x in her.get("inside", []):
                what = f"{x['part']} {x['bone']}" if x.get("part") not in (None, "body") else x["bone"]
                add("limb_in", shot, x["depth"], f"{what} in {x['in']}", r, x.get("at"))
            if her.get("foot") is not None and her.get("support") is not None and shot not in airborne and shot not in seated:
                gap = her["foot"] - her["support"] - ANKLE
                if gap > FLOAT:
                    add("float", shot, round(gap, 3), "above the support", r, sc.get("lf"))
                elif gap + ANKLE < -SINK:
                    add("sink", shot, round(-(gap + ANKLE), 3), "below the support", r, sc.get("lf"))
            if prev and prev.get("shot") == shot and prev.get("her") and her.get("hips") and prev["her"].get("hips") and shot not in moving and shot not in airborne:
                d = sum((a - b) ** 2 for a, b in zip(her["hips"], prev["her"]["hips"])) ** 0.5
                if d > pop:
                    add("pop", shot, round(d, 3), "hips jump", r, sc.get("hips"))
            hd, top = sc.get("head"), sc.get("top")
            if shot not in closeups and hd and top and 0.05 < hd[0] < 0.95 and 0.0 < hd[1] < 1.0 and top[1] < -0.02:
                add("head_cut", shot, round(-top[1], 3), "top of her head cut by the frame", r, hd)
        for t in r.get("things", []):
            if t["with"] == "air":
                add("thing_air", shot, t["gap"], t["thing"], r, t.get("at"))
            elif not (t["thing"] == "page" and t["with"] == "thing:page"):   # falling pages pass each other on purpose
                add("thing_in", shot, t["share"], f"{t['thing']} in {t['with']}", r, t.get("at"))
        for x in r.get("faults", []):
            add(x["cls"], shot, x["depth"], x["what"], r, x.get("at"))
        prev = r
    motion(report, add, airborne, moving, seated)
    return {c: {s: {**v, "detail": dict(v["detail"])} for s, v in shots.items()} for c, shots in out.items()}


def _shot_runs(rows: list[dict]) -> list[list[dict]]:
    """Consecutive probed frames of one shot that carry her bones (probe v2)."""
    runs, cur = [], []
    for r in rows:
        ok = bool(r.get("her") and r["her"].get("bones"))
        if cur and (not ok or r.get("shot") != cur[-1].get("shot")):
            runs.append(cur)
            cur = []
        if ok:
            cur.append(r)
    if cur:
        runs.append(cur)
    return runs


def motion(report: dict, add, airborne: set[str], moving: set[str], seated: set[str]) -> None:
    """The motion classes from every bone per probed frame (probe v2): drop, jerk, slide."""
    every = report.get("every", 2)
    dt = every / report.get("fps", 30)
    started: set[str] = set()
    for run in _shot_runs(report["rows"]):
        shot = run[0].get("shot")
        mark = " (airborne by script)" if shot in airborne else ""
        h0 = run[0]["her"]
        # she comes DOWN into the shot: its first probed frame has her feet high above the support
        if shot not in started and shot not in seated and h0.get("foot") is not None and h0.get("support") is not None:
            started.add(shot)
            gap = h0["foot"] - h0["support"] - ANKLE
            if gap > DROP_START:
                add("drop", shot, round(gap, 3), "starts in the air" + mark, run[0], (h0.get("scr") or {}).get("hips"))
        fall = 0.0
        for a, b in zip(run, run[1:]):
            ya, yb = a["her"]["bones"].get("hips"), b["her"]["bones"].get("hips")
            if ya and yb and (ya[1] - yb[1]) / dt > DROP_V:
                fall += dt
                if fall >= DROP_T - 1e-9:
                    add("drop", shot, round((ya[1] - yb[1]) / dt, 2), "falls" + mark, b, (b["her"].get("scr") or {}).get("hips"))
            else:
                fall = 0.0
        if len(run) < 4:
            continue
        # jerk: a bone's step far beyond the shot's own median step of that bone (a hitch, a clip seam, a key snap)
        if shot not in moving:
            for bone in MOTION:
                pts = [r["her"]["bones"].get(bone) for r in run]
                steps = [None if (p is None or q is None) else sum((x - y) ** 2 for x, y in zip(p, q)) ** 0.5
                         for p, q in zip(pts, pts[1:])]
                vals = sorted(x for x in steps if x is not None)
                if not vals:
                    continue
                lim = max(JERK * vals[len(vals) // 2], JERK_MIN * every)
                for i, d in enumerate(steps):
                    if d is not None and d > lim:
                        add("jerk", shot, round(d / every, 3), f"{bone} jumps", run[i + 1], (run[i + 1]["her"].get("scr") or {}).get("hips"))
        # slide: a planted foot drifting over the floor
        if shot in airborne or shot in seated:
            continue
        for side, bone in (("l", "leftFoot"), ("r", "rightFoot")):
            for a, b in zip(run, run[1:]):
                pa, pb = a["her"]["bones"].get(bone), b["her"]["bones"].get(bone)
                sa, sb = (a["her"].get("footSup") or {}).get(side), (b["her"].get("footSup") or {}).get(side)
                if None in (pa, pb, sa, sb):
                    continue
                if pa[1] - sa - ANKLE < PLANT and pb[1] - sb - ANKLE < PLANT:
                    d = ((pa[0] - pb[0]) ** 2 + (pa[2] - pb[2]) ** 2) ** 0.5
                    if d > SLIDE * every:
                        add("slide", shot, round(d / every, 3), f"{bone} slides", b, (b["her"].get("scr") or {}).get(side + "f"))


def flags(cls: dict, top: int = 60) -> list[dict]:
    """The worst frame per class + shot with its screen point, most frames first - the eye level's zoom list."""
    out = []
    for c in CLASSES:
        for shot, v in cls.get(c, {}).items():
            if v.get("at") and v["at"].get("F") is not None:
                out.append({"cls": c, "shot": shot, "F": v["at"]["F"], "xy": v["at"].get("xy"), "frames": v["frames"],
                            "worst": v["worst"], "what": max(v["detail"], key=v["detail"].get)})
    out.sort(key=lambda x: -x["frames"])
    return out[:top]


def airborne_shots(spec: dict) -> set[str]:
    """Shots whose clip / pose leaves the ground on purpose (falling, flying, jumping, floating)."""
    air = ("falling", "flying", "jump", "float", "fall")
    out = set()
    for s in spec.get("shots", []):
        for k in s.get("actor") or []:
            if any(a in str(k.get("clip", k.get("motion", ""))) or a in str(k.get("pose", "")) for a in air) or k.get("act") in ("hop", "float"):
                out.add(str(s["id"]))
    return out


def seated_shots(spec: dict) -> set[str]:
    return {str(s["id"]) for s in spec.get("shots", []) if any(str(k.get("pose", "")).startswith(("sit", "slump")) for k in s.get("actor") or [])}


def moving_shots(spec: dict) -> set[str]:
    return {str(s["id"]) for s in spec.get("shots", []) if any(k.get("move") for k in s.get("actor") or [])
            or len({json.dumps(k.get("pos")) for k in s.get("actor") or []}) > 1}


def closeup_shots(spec: dict) -> set[str]:
    """Shots framed so close that her head may leave the frame (size ecu / cu / macro in shots.json)."""
    return {str(s["id"]) for s in spec.get("shots", []) if str(s.get("size", "")).lower() in ("ecu", "xcu", "cu", "macro")}


def main(job_dir: Path, fmt: str = "mv") -> int:
    spec = json.loads((job_dir / "shots.json").read_text(encoding="utf-8"))
    p = job_dir / "out" / f"probe_{fmt}.json"           # v2: the fresh full report stays out of the repo (MBs of bones)
    if not p.exists():
        p = job_dir / "boards" / f"probe_{fmt}.json"
    report = json.loads(p.read_text(encoding="utf-8"))
    cls = classify(report, airborne_shots(spec), moving_shots(spec), seated_shots(spec), closeup_shots(spec))
    n = report["frames"]
    print(f"probe {job_dir.name} ({fmt}): {n} frames, every {report['every']}")
    if report["every"] > SPARSE:
        print(f"!! every {report['every']}th frame is too sparse for a screening (<= {SPARSE}): faults between the samples stay unseen")
    if not any("faults" in r for r in report["rows"]):
        print("!! a v1 report (no surface / self / lyric / lens / motion data): probe again with the v2 studio")
    (job_dir / "boards").mkdir(exist_ok=True)
    (job_dir / "boards" / f"probe_{fmt}_flags.json").write_text(json.dumps(flags(cls), indent=1), encoding="utf-8", newline="\n")
    for c in CLASSES:
        shots = cls.get(c, {})
        frames = sum(v["frames"] for v in shots.values())
        print(f"\n## {c}: {len(shots)} shots, {frames} frames")
        for s, v in sorted(shots.items(), key=lambda x: -x[1]["frames"]):
            top = ", ".join(f"{k} x{c_}" for k, c_ in sorted(v["detail"].items(), key=lambda x: -x[1])[:3])
            print(f"  {s:>5}: {v['frames']:3d} frames, worst {v['worst']}  ({top})")
    return 0

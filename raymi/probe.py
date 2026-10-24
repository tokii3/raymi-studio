"""The scene probe's report as fault CLASSES (toki 2026-10-24: "das sind Strukturfehler, hör auf punktuell zu fixen").

studio/probe.mjs measures every N-th frame of a film in the real scene graph (film/Probe.tsx). This groups what it found
by fault class and shot, so a fix goes into the part that makes the fault, not into one shot:
  limb_in   her hand / foot / hips ... inside a piece of furniture or a prop
  float     her lowest foot above the support under her (she hovers, or "falls from the sky")
  sink      her lowest foot below the support (in the floor, in the bed, in the cushion)
  pop       her hips jump between two probed frames of the same shot (a key / clip switch teleports her)
  thing_in  a thing inside another solid (the phone in the cushion)
  thing_air a thing in the air with nothing under it
`python -m raymi probe <job> [mv|short]` prints the classes; `faults()` is what a guard can refuse on.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

FLOAT = 0.05      # m: her lowest foot this far above the support = floating
SINK = 0.05       # m: this far below = sunk in
POP = 0.25        # m per probed step (default every 6 frames = 0.2 s) of hips travel the keys did not ask for


def classify(report: dict, airborne: set[str] | None = None, moving: set[str] | None = None) -> dict[str, dict[str, dict]]:
    """{class: {shot: {"frames": n, "worst": ..., "detail": ...}}}. airborne = shots where she is meant to be off the
    ground (falling, flying, a jump); moving = shots whose keys move her (a pop there is checked against the move)."""
    airborne = airborne or set()
    moving = moving or set()
    out: dict[str, dict[str, dict]] = defaultdict(dict)

    def add(cls, shot, worst, detail):
        e = out[cls].setdefault(shot, {"frames": 0, "worst": 0.0, "detail": defaultdict(int)})
        e["frames"] += 1
        e["worst"] = max(e["worst"], worst)
        e["detail"][detail] += 1

    prev = None
    for r in report["rows"]:
        shot = r.get("shot")
        her = r.get("her")
        if her:
            for x in her.get("inside", []):
                add("limb_in", shot, x["depth"], f"{x['bone']} in {x['in']}")
            if her.get("foot") is not None and her.get("support") is not None and shot not in airborne:
                gap = her["foot"] - her["support"]
                if gap > FLOAT:
                    add("float", shot, round(gap, 3), "above the support")
                elif gap < -SINK:
                    add("sink", shot, round(-gap, 3), "below the support")
            if prev and prev.get("shot") == shot and prev.get("her") and her.get("hips") and prev["her"].get("hips") and shot not in moving:
                d = sum((a - b) ** 2 for a, b in zip(her["hips"], prev["her"]["hips"])) ** 0.5
                if d > POP:
                    add("pop", shot, round(d, 3), "hips jump")
        for t in r.get("things", []):
            if t["with"] == "air":
                add("thing_air", shot, t["gap"], t["thing"])
            else:
                add("thing_in", shot, t["share"], f"{t['thing']} in {t['with']}")
        prev = r
    return {c: {s: {**v, "detail": dict(v["detail"])} for s, v in shots.items()} for c, shots in out.items()}


def airborne_shots(spec: dict) -> set[str]:
    """Shots whose clip / pose leaves the ground on purpose (falling, flying, jumping, floating)."""
    air = ("falling", "flying", "jump", "float", "fall")
    out = set()
    for s in spec.get("shots", []):
        for k in s.get("actor") or []:
            if any(a in str(k.get("clip", k.get("motion", ""))) or a in str(k.get("pose", "")) for a in air) or k.get("act") in ("hop", "float"):
                out.add(str(s["id"]))
    return out


def moving_shots(spec: dict) -> set[str]:
    return {str(s["id"]) for s in spec.get("shots", []) if any(k.get("move") for k in s.get("actor") or [])
            or len({json.dumps(k.get("pos")) for k in s.get("actor") or []}) > 1}


def main(job_dir: Path, fmt: str = "mv") -> int:
    spec = json.loads((job_dir / "shots.json").read_text(encoding="utf-8"))
    p = job_dir / "boards" / f"probe_{fmt}.json"
    if not p.exists():
        p = job_dir / "out" / f"probe_{fmt}.json"
    report = json.loads(p.read_text(encoding="utf-8"))
    cls = classify(report, airborne_shots(spec), moving_shots(spec))
    n = report["frames"]
    print(f"probe {job_dir.name} ({fmt}): {n} frames, every {report['every']}")
    for c in ("limb_in", "float", "sink", "pop", "thing_in", "thing_air"):
        shots = cls.get(c, {})
        frames = sum(v["frames"] for v in shots.values())
        print(f"\n## {c}: {len(shots)} shots, {frames} frames")
        for s, v in sorted(shots.items(), key=lambda x: -x[1]["frames"]):
            top = ", ".join(f"{k} x{c_}" for k, c_ in sorted(v["detail"].items(), key=lambda x: -x[1])[:3])
            print(f"  {s:>5}: {v['frames']:3d} frames, worst {v['worst']}  ({top})")
    return 0

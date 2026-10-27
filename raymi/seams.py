"""Seams: does the camera carry the eye through a hard cut? (toki 2026-10-25: "Kamera soll eine Kameraführung sein
auch bei cuts oder transitions"; the vector law of the motion-design skill packs, knowledge/skillpacks/README.md).

How shot A leaves decides how shot B arrives: same axis, same direction, similar speed, both sides still moving.
For every hard cut the lens of A's last frames and B's first frames is evaluated with the renderer's own maths
(studio/src/film/motion.ts cameraAt: eases + spline paths, without the hand-held drift) and turned into what the
viewer sees - how the world slides across the frame (x / y, in frame heights per frame) and how fast the subject
grows (z, log size per frame). Each seam is then
  carried   both sides move the same way (the move continues in the viewer's head)
  mirrored  both move, opposite ways (ping-pong: reads as an error unless a hit / a force licenses the flip)
  half      one side moves, the other is at rest (a dead beat on the resting side)
  static    both at rest (the cut hides in nothing; fine for a deliberate hard beat cut, dead in a ride)
Transitions other than `cut` (whip, cover, ink, pass ...) are bridges through things and are only counted.
Pure: reads out/props.json (+ the song map for hits). `python -m raymi seams <job>`; `timeline` prints the summary.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

REST = 0.0015       # frame heights per frame: slower than this the picture reads as held
REST_Z = 0.0015     # log size per frame (~0.15 % growth a frame)
SAME = 0.5          # cosine between the two vectors: >= carried
OPPOSITE = -0.3     # cosine: <= mirrored
HIT_TOL = 2         # frames: a cut this close to a loud hit may flip direction (a force licenses it)


def ease(kind: str | None, t: float) -> float:
    t = min(1.0, max(0.0, t))
    if kind == "linear":
        return t
    if kind == "in":
        return t ** 3
    if kind == "out":
        return 1 - (1 - t) ** 3
    if kind == "snap":
        return 1 - (1 - t) ** 5
    if kind == "hold":
        return 0.0 if t < 1 else 1.0
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def _cr(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return [0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2
                   + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3) for i in range(3)]


def camera_at(keys: list[dict], f: float) -> tuple[list[float], list[float], float]:
    """pos, look, fov at frame f - motion.ts cameraAt without drift / kick / observer."""
    if f <= keys[0]["f"]:
        k = keys[0]
        return k["pos"], k["look"], k["fov"]
    i = len(keys) - 1
    for k in range(len(keys) - 1):
        if f < keys[k + 1]["f"]:
            i = k
            break
    a, b = keys[i], keys[min(i + 1, len(keys) - 1)]
    t = 1.0 if b["f"] == a["f"] else ease(b.get("ease"), (f - a["f"]) / (b["f"] - a["f"]))
    lerp = lambda x, y: [x[j] + (y[j] - x[j]) * t for j in range(3)]  # noqa: E731
    if b.get("path") == "spline" and a is not b:
        p0, p3 = keys[max(0, i - 1)], keys[min(len(keys) - 1, i + 2)]
        pos, look = _cr(p0["pos"], a["pos"], b["pos"], p3["pos"], t), _cr(p0["look"], a["look"], b["look"], p3["look"], t)
    else:
        pos, look = lerp(a["pos"], b["pos"]), lerp(a["look"], b["look"])
    fov = a["fov"] + (b["fov"] - a["fov"]) * t
    if a.get("frameH") and b.get("frameH"):
        h = a["frameH"] + (b["frameH"] - a["frameH"]) * t
        fov = math.degrees(2 * math.atan(h / 2 / max(0.05, math.dist(pos, look))))
    return pos, look, fov


def _basis(pos, look):
    fw = [look[i] - pos[i] for i in range(3)]
    n = math.hypot(*fw) or 1.0
    fw = [x / n for x in fw]
    up0 = [0.0, 1.0, 0.0]
    r = [fw[1] * up0[2] - fw[2] * up0[1], fw[2] * up0[0] - fw[0] * up0[2], fw[0] * up0[1] - fw[1] * up0[0]]
    rn = math.hypot(*r) or 1.0
    r = [x / rn for x in r]
    u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]]
    return r, u, fw


def _screen(cam, X):
    """X on screen in frame heights from the centre (x right, y up); None behind the lens."""
    pos, look, fov = cam
    r, u, fw = _basis(pos, look)
    d = [X[i] - pos[i] for i in range(3)]
    z = sum(d[i] * fw[i] for i in range(3))
    if z <= 0.05:
        return None
    th = math.tan(math.radians(fov) / 2)
    return [sum(d[i] * r[i] for i in range(3)) / (z * th) / 2, sum(d[i] * u[i] for i in range(3)) / (z * th) / 2]


def vector(keys: list[dict], f0: float, f1: float) -> list[float]:
    """What the viewer sees between frames f0 -> f1: [x, y] = the CAMERA's travel across the picture (the world slides
    the other way; measured on a point 3 m behind the subject), z = log growth of the subject (+ = push in)."""
    c0, c1 = camera_at(keys, f0), camera_at(keys, f1)
    pos, look, _ = c0
    _, _, fw = _basis(pos, look)
    X = [look[i] + fw[i] * 3.0 for i in range(3)]
    s0, s1 = _screen(c0, X), _screen(c1, X)
    dx, dy = (0.0, 0.0) if s0 is None or s1 is None else (-(s1[0] - s0[0]), -(s1[1] - s0[1]))
    size = lambda c: 1.0 / (max(0.05, math.dist(c[0], c[1])) * math.tan(math.radians(c[2]) / 2))  # noqa: E731
    dz = math.log(size(c1) / size(c0))
    n = max(1e-6, f1 - f0)
    return [dx / n, dy / n, dz / n]


def moving(v: list[float]) -> bool:
    return math.hypot(v[0], v[1]) >= REST or abs(v[2]) >= REST_Z


def _cos(a, b):
    na, nb = math.hypot(*a), math.hypot(*b)
    return sum(x * y for x, y in zip(a, b)) / (na * nb) if na and nb else 0.0


def _word(v: list[float]) -> str:
    if not moving(v):
        return "rest"
    parts = []
    if abs(v[0]) >= REST and abs(v[0]) >= abs(v[1]) * 0.5:
        parts.append("right" if v[0] > 0 else "left")
    if abs(v[1]) >= REST and abs(v[1]) >= abs(v[0]) * 0.5:
        parts.append("up" if v[1] > 0 else "down")
    if abs(v[2]) >= REST_Z:
        parts.append("in" if v[2] > 0 else "out")
    return "+".join(parts) or "drift"


def report(props: dict, hits_f: list[int] | None = None) -> dict:
    shots, rows = props["shots"], []
    hits_f = hits_f or []
    for a, b in zip(shots, shots[1:]):
        kind = (b.get("transition") or {}).get("kind", "cut")
        cut = b["from"]
        if kind != "cut":
            rows.append({"cut_f": cut, "shot": b.get("id"), "seam": "bridge", "kind": kind})
            continue
        va = vector(a["camera"], cut - 3, cut - 1)          # A's last frames
        vb = vector(b["camera"], cut, cut + 2)              # B's first frames
        ma, mb = moving(va), moving(vb)
        c = _cos(va, vb)
        if ma and mb:
            seam = "carried" if c >= SAME else "mirrored" if c <= OPPOSITE else "turned"
        elif ma or mb:
            seam = "half"
        else:
            seam = "static"
        on_hit = any(abs(cut - h) <= HIT_TOL for h in hits_f)
        rows.append({"cut_f": cut, "shot": b.get("id"), "seam": seam, "exit": _word(va), "entry": _word(vb),
                     "cos": round(c, 2), "on_hit": on_hit,
                     "speed": [round(math.hypot(*va) * 1000, 1), round(math.hypot(*vb) * 1000, 1)]})
    count = {k: sum(1 for r in rows if r["seam"] == k) for k in ("carried", "turned", "mirrored", "half", "static", "bridge")}
    return {"seams": rows, "count": count,
            "mirrored_off_hit": [r for r in rows if r["seam"] == "mirrored" and not r["on_hit"]]}


def hits_frames(job_dir: Path, props: dict) -> list[int]:
    spec_f = job_dir / "shots.json"
    try:
        spec = json.loads(spec_f.read_text(encoding="utf-8"))
        smap = json.loads((job_dir / spec["song_map"]).read_text(encoding="utf-8"))
    except (OSError, KeyError, ValueError):
        return []
    t0, fps = float((props.get("audio") or {}).get("from", 0.0)), props.get("fps", 30)
    return [round((h - t0) * fps) for h in smap.get("hits", [])]


def summary(rep: dict) -> str:
    c = rep["count"]
    hard = sum(c[k] for k in ("carried", "turned", "mirrored", "half", "static"))
    return (f"seams: {hard} hard cuts - {c['carried']} carried, {c['turned']} turned, {c['mirrored']} mirrored, "
            f"{c['half']} half, {c['static']} static; {c['bridge']} bridges")


def main(job_dir: Path) -> int:
    props = json.loads((job_dir / "out" / "props.json").read_text(encoding="utf-8"))
    rep = report(props, hits_frames(job_dir, props))
    for r in rep["seams"]:
        if r["seam"] == "bridge":
            print(f"  f{r['cut_f']:>5} shot {r['shot']!s:>4}  bridge ({r['kind']})")
            continue
        hit = "  on a hit" if r["on_hit"] else ""
        print(f"  f{r['cut_f']:>5} shot {r['shot']!s:>4}  {r['seam']:8} {r['exit']:>10} -> {r['entry']:<10} "
              f"cos {r['cos']:+.2f}  speed {r['speed'][0]}/{r['speed'][1]}{hit}")
    print(summary(rep))
    for r in rep["mirrored_off_hit"]:
        print(f"MIRRORED shot {r['shot']}: {r['exit']} -> {r['entry']} without a hit to license the flip")
    (job_dir / "out" / "seams.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    return 0

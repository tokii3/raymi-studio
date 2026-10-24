"""Camera moves as reusable parts (toki 2026-10-23: "Kamerawinkel und Fahrten eher Standard").

A camera key {"move": {...}} in shots.json expands into plain camera keys around a subject - the anime MV
vocabulary of the 2D references: a crash zoom on a hit, a dutch push, an orbit that rolls, a crane from her feet to
above her, a drop from top-down to eye level, a flight THROUGH an object onto her, a lateral track with parallax, a
dolly zoom, a whip off her into the next shot, a spiral. Every move is pure geometry on the subject point, so any
set and any later video can use it; the result is ordinary keys (pos / look / fov / roll / ease / path / shake /
frameH) that the guards check like hand-written ones.

  {"move": {"kind": "crash", "around": "her" | mark | [x, y, z], "deg": 20, "dist": 1.3, "h": 1.35,
            "at": 0, "dur": null, "fov": 34, ...kind options}}

around "her" = her first actor key's spot; h = the height of the point the lens holds (her face ~1.35 standing,
~1.05 sitting); deg = the lens bearing around the subject (0 = from +z); dist = the closest distance of the move.
"""
from __future__ import annotations

import math

KINDS = {"crash", "push_dutch", "orbit_roll", "crane_up", "drop", "through", "track", "vertigo", "whip_out",
         "spiral", "handheld", "follow"}


def _at(P, deg, dist, dy=0.0):
    a = math.radians(deg)
    return [round(P[0] + dist * math.sin(a), 3), round(P[1] + dy, 3), round(P[2] + dist * math.cos(a), 3)]


def _r(v):
    return [round(x, 3) for x in v]


def expand(m: dict, length: float, P: list[float], obj: list[float] | None, P_end: list[float] | None = None) -> list[dict]:
    """The camera keys of one move (times relative to the shot start, seconds)."""
    kind = m["kind"]
    deg = float(m.get("deg", 0.0))
    d = float(m.get("dist", 1.6))
    fov = float(m.get("fov", 34))
    t0 = float(m.get("at", 0.0))
    t1 = min(length, t0 + float(m["dur"])) if m.get("dur") else length
    dur = max(0.1, t1 - t0)
    look = _r(P)
    K = lambda at, pos, **o: {"at": round(at, 3), "pos": pos, "look": o.pop("look", look), "fov": o.pop("fov", fov), **o}  # noqa: E731
    if kind == "crash":                       # on the hit: from far to close in ~6 frames, then a slow settle
        hit = float(m.get("hit", 0.0)) + t0
        return [K(t0, _at(P, deg, d * 2.3)), K(hit, _at(P, deg, d * 2.3)),
                K(min(t1, hit + float(m.get("snap", 0.2))), _at(P, deg, d), ease="snap", shake=0.35),
                K(t1, _at(P, deg, d * 0.93), ease="out")]
    if kind == "push_dutch":                  # a slow push while the horizon tilts - unease, pressure
        roll = float(m.get("roll", 12))
        return [K(t0, _at(P, deg, d * 1.7, 0.08)), K(t1, _at(P, deg + float(m.get("sweep", 10)), d), roll=roll, ease="inOut")]
    if kind == "orbit_roll":                  # around her, the roll leans into the turn
        sw, roll = float(m.get("sweep", 100)), float(m.get("roll", 10))
        return [K(t0, _at(P, deg, d, 0.1)), K(t0 + dur / 2, _at(P, deg + sw / 2, d * 0.95, 0.15), roll=roll / 2, path="spline"),
                K(t1, _at(P, deg + sw, d, 0.05), roll=roll, path="spline", ease="inOut")]
    if kind == "crane_up":                    # from her feet up past her face to above her (a reveal / a rise)
        # the low start stays >= 2.7 m away: a lens at her feet close by looks up her skirt (timeline under_skirt)
        return [K(t0, _at(P, deg, max(d * 0.9, 2.7), -P[1] + 0.3)), K(t0 + dur * 0.55, _at(P, deg + 8, d * 1.05, 0.0), path="spline"),
                K(t1, _at(P, deg + 14, d * 1.4, 1.1), path="spline", ease="inOut")]
    if kind == "drop":                        # straight down from above to her eye level (a fall, an arrival)
        return [K(t0, _at(P, deg, 0.25, 2.8)), K(t0 + dur * 0.6, _at(P, deg, d * 0.8, 0.9), path="spline", ease="in"),
                K(t1, _at(P, deg, d, 0.05), path="spline", ease="out")]
    if kind == "through":                     # through an object onto her: a transition made of the world
        if obj is None:
            raise ValueError("through needs \"obj\" (a mark or [x, y, z])")
        ux, uz = obj[0] - P[0], obj[2] - P[2]
        n = math.hypot(ux, uz) or 1.0
        ux, uz = ux / n, uz / n
        far = [obj[0] + ux * 0.9, obj[1] + 0.05, obj[2] + uz * 0.9]
        past = [obj[0] - ux * 0.08, obj[1], obj[2] - uz * 0.08]
        end = [P[0] + ux * d, P[1] + 0.05, P[2] + uz * d]
        return [K(t0, _r(far)), K(t0 + dur * 0.35, _r(past), path="spline", ease="in"),
                K(t1, _r(end), path="spline", ease="out")]
    if kind == "track":                       # alongside her: near things slide past faster than far ones
        w = float(m.get("width", 0.9))
        a = math.radians(deg)
        px, pz = math.cos(a), -math.sin(a)
        base = _at(P, deg, d, float(m.get("dy", 0.0)))
        return [K(t0, _r([base[0] - px * w, base[1], base[2] - pz * w])),
                K(t1, _r([base[0] + px * w, base[1], base[2] + pz * w]), ease="linear")]
    if kind == "vertigo":                     # dolly zoom: she stays, the room breathes (the fall into colour)
        fh = float(m.get("frameH", 1.1))
        return [K(t0, _at(P, deg, d * 2.4), frameH=fh), K(t1, _at(P, deg, d), frameH=fh, ease="inOut")]
    if kind == "whip_out":                    # hold her, then whip the lens off her into the next shot
        a = math.radians(deg + 180 + float(m.get("turn", 70)))
        pos = _at(P, deg, d)
        away = _r([pos[0] + 2 * math.sin(a), P[1], pos[2] + 2 * math.cos(a)])
        return [K(t0, pos), K(max(t0, t1 - float(m.get("whip", 0.22))), pos),
                K(t1, pos, look=away, ease="in")]
    if kind == "spiral":                      # half a turn, rising and closing in (the dream, the release)
        return [K(t0, _at(P, deg, d * 1.6, -0.3)), K(t0 + dur / 2, _at(P, deg + 90, d * 1.25, 0.2), path="spline", roll=6),
                K(t1, _at(P, deg + 180, d, 0.55), path="spline", ease="inOut")]
    if kind == "follow":                      # beside her while she travels (a run, a slide): her start to her end spot
        E = P_end or P
        a0, a1 = _at(P, deg, d, float(m.get("dy", 0.0))), _at(E, deg + float(m.get("sweep", 0)), d, float(m.get("dy", 0.0)))
        return [K(t0, a0, look=_r(P)), K(t1, a1, look=_r(E), ease="linear")]
    if kind == "handheld":                    # a person holding the camera: drift + shake (documentary, the grey days)
        return [K(t0, _at(P, deg, d), shake=float(m.get("shake", 0.45))),
                K(t1, _at(P, deg + 4, d * 0.96, -0.03), shake=float(m.get("shake", 0.45)), ease="linear")]
    raise ValueError(f"unknown camera move {kind!r} ({sorted(KINDS)})")

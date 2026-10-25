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

The FIRESTARTER vocabulary (knowledge/studies/kda_firestarter_1m43.md, toki 2026-10-25: "sie spielt mit der Kamera"):
moves written by hand per bar of music (jobs/<job>/6_CAMERA.md), never chosen by a rule -
  pull       extreme close on her eyes, then the lens pulls out and rises (the reveal)
  hero       low wide hero push: the lens at her hip height, wide fov, pushing in on an arc (she towers)
  into       the lens right in front of her, wide: her hand / face / tail comes INTO it (a punch on contact)
  walk_in    she walks into the lens: from her full figure to her face filling the frame (accelerating)
  drop_worm  overhead looking down at her, on the hit a whip down to the worm's eye (far, looking up)
  whip360    a full turn round her: fast on the hit, then a slow drift on
  dutch      a dutch close-up whose tilt flips sides on the hit
  ots        behind her shoulder; when she looks back the lens slides round to meet her eyes
  burst      a new angle on every hit: [{"at", "deg", "dist", "lens" | "dy", "fov", "roll", "ly"}], 4-frame whips between
  slow_push  a slow push on a held note (she is still, the lens is not)
"lens" = metres above HER FEET; "ly" moves the look point from h. A shot using them says "camera_hand": "<why>" -
the generic layers (camera v3, director, word swings, frame_fit / frame_dolly) then leave its lens alone.
"""
from __future__ import annotations

import math

KINDS = {"crash", "push_dutch", "orbit_roll", "crane_up", "drop", "through", "track", "vertigo", "whip_out",
         "spiral", "handheld", "follow", "pull", "hero", "into", "walk_in", "drop_worm", "whip360", "dutch", "ots", "burst",
         "slow_push"}


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
    if kind == "pull":                        # extreme close -> pull out (the reveal); "pull" = end distance x dist
        hold = min(float(m.get("hold", 0.4)), dur * 0.45)
        far, sw, rise = d * float(m.get("pull", 4.0)), float(m.get("sweep", 18)), float(m.get("rise", 0.25))
        lk = _r([P[0], P[1] - float(m.get("drop_look", 0.3)), P[2]])
        return [K(t0, _at(P, deg, d)), K(t0 + hold, _at(P, deg + sw * 0.08, d * 0.93)),
                K(t1, _at(P, deg + sw, far, rise), look=lk, fov=float(m.get("fov_end", fov)), path="spline", ease="inOut")]
    feet = P[1] - float(m.get("_h", 1.35))
    if kind == "hero":                        # low wide hero push: the lens at her hip, looking up, pushing in on an arc
        sw, roll, hf = float(m.get("sweep", 24)), float(m.get("roll", 6)), float(m.get("fov", 55))
        lk = _r([P[0], P[1] + float(m.get("ly", -0.2)), P[2]])
        dy = feet + float(m.get("lens", 0.8)) - P[1]
        return [K(t0, _at(P, deg, d * float(m.get("push", 1.5)), dy), look=lk, fov=hf),
                K(t1, _at(P, deg + sw, d, dy + float(m.get("rise", 0.12))), look=lk, fov=hf * 0.96,
                  roll=roll, path="spline", ease="inOut")]
    if kind == "into":                        # the lens in front of her, wide: her hand / face / tail comes into it
        hit = t0 + float(m.get("hit", dur * 0.5))
        dy, wf = float(m.get("dy", 0.0)), float(m.get("fov", 58))
        return [K(t0, _at(P, deg, d * 1.35, dy), fov=wf),
                K(hit, _at(P, deg + 4, d, dy), fov=wf, ease="out"),
                K(min(t1, hit + 0.1), _at(P, deg + 5, d * 0.97, dy), fov=wf, shake=0.5, ease="snap"),
                K(t1, _at(P, deg + 8, d * 0.92, dy), fov=wf, ease="out")]
    if kind == "walk_in":                     # she walks into the lens: full figure -> her face fills the frame
        dy0, far, wf = feet + float(m.get("lens", 0.95)) - P[1], float(m.get("far", 3.4)), float(m.get("fov", 44))
        return [K(t0, _at(P, deg, far, dy0), look=_r([P[0], P[1] - 0.45, P[2]]), fov=wf),
                K(t0 + dur * 0.6, _at(P, deg + 3, far * 0.45, dy0 * 0.4), look=_r([P[0], P[1] - 0.15, P[2]]), fov=wf,
                  path="spline", ease="in"),
                K(t1, _at(P, deg + 5, d, 0.0), fov=float(m.get("fov_end", 40)), path="spline", ease="out", shake=0.2)]
    if kind == "drop_worm":                   # overhead -> on the hit a whip down to the worm's eye (far, looking up)
        hit = t0 + float(m.get("hit", dur * 0.6))
        top, spin, ft = feet + float(m.get("top", 3.9)), float(m.get("spin", 40)), float(m.get("fov_top", 46))
        a = math.radians(deg)
        over = _r([P[0] + 0.14 * math.sin(a), top, P[2] + 0.14 * math.cos(a)])
        down = _r([P[0], feet + 0.5, P[2]])
        wd, wl = float(m.get("worm", 2.9)), feet + float(m.get("lens", 0.32)) - P[1]
        lk = _r([P[0], P[1] + float(m.get("ly", -0.1)), P[2]])
        return [K(t0, over, look=down, fov=ft, roll=0),
                K(max(t0 + 0.05, hit - 0.14), over, look=down, fov=ft * 0.94, roll=spin, ease="linear"),
                K(hit, _at(P, deg, wd, wl), look=lk, fov=fov, roll=-4, ease="snap", path="line"),
                K(t1, _at(P, deg + 10, wd * 0.94, wl + 0.05), look=lk, fov=fov, roll=-7, ease="out")]
    if kind == "whip360":                     # a full turn round her: fast from the hit, then a slow drift on
        hit = t0 + float(m.get("hit", 0.0))
        w = float(m.get("whip", 1.0))
        dy, roll, sgn = float(m.get("dy", 0.05)), float(m.get("roll", 14)), (1 if float(m.get("dir", 1)) >= 0 else -1)
        keys = [K(t0, _at(P, deg, d, dy))]
        if hit > t0 + 0.05:
            keys.append(K(hit, _at(P, deg + sgn * 6, d, dy), ease="linear"))
        for j in range(1, 7):                 # 6 spline keys round her, the roll leaning into the turn
            keys.append(K(hit + w * j / 6, _at(P, deg + sgn * (6 + 60 * j), d * (0.92 if j % 2 else 1.0), dy + (0.12 if j == 3 else 0)),
                          roll=sgn * roll * (0 if j == 6 else 1), path="spline", ease="linear" if j < 6 else "out"))
        if t1 > hit + w + 0.1:
            keys.append(K(t1, _at(P, deg + sgn * (366 + float(m.get("drift", 25))), d * 0.9, dy), path="spline", ease="inOut"))
        return keys
    if kind == "dutch":                       # a dutch close-up whose tilt flips sides on the hit
        hit = t0 + float(m.get("hit", dur * 0.5))
        r, dy, fl = float(m.get("roll", 18)), float(m.get("dy", 0.05)), float(m.get("flip", 26))
        return [K(t0, _at(P, deg, d * 1.12, dy), roll=r),
                K(max(t0 + 0.05, hit - 0.12), _at(P, deg + 4, d * 1.04, dy), roll=r, ease="linear"),
                K(hit, _at(P, deg - fl, d, dy + 0.06), roll=-r, ease="snap"),
                K(t1, _at(P, deg - fl - 6, d * 0.9, dy + 0.06), roll=-r * 1.15, ease="out")]
    if kind == "ots":                         # behind her shoulder; when she looks back the lens slides round to her eyes
        look_t = t0 + float(m.get("look", dur * 0.45))
        back = float(m.get("back", 155))      # bearing behind her (her front = deg)
        side = 1 if back >= 0 else -1
        dy = float(m.get("dy", -0.02))
        sh = _r([P[0], P[1] - 0.12, P[2]])
        return [K(t0, _at(P, deg + back, d * 1.15, dy), look=sh),
                K(look_t, _at(P, deg + back - side * 10, d, dy), look=sh, ease="linear"),
                K(t1, _at(P, deg + back - side * float(m.get("slide", 55)), d * 0.8, dy + 0.04), roll=side * 5,
                  path="spline", ease="out")]
    if kind == "burst":                       # a new angle on every hit, 4-frame whips between them (FIRESTARTER 111.7 s)
        w = float(m.get("whip", 0.13))
        keys, shots = [], m["shots"]
        for j, sh in enumerate(shots):
            at = t0 + float(sh.get("at", 0.0))
            nxt = t0 + float(shots[j + 1]["at"]) - w if j + 1 < len(shots) else t1
            dy = (feet + float(sh["lens"]) - P[1]) if "lens" in sh else float(sh.get("dy", 0.0))
            o = {"look": _r([P[0], P[1] + float(sh.get("ly", 0.0)), P[2]]), "fov": float(sh.get("fov", fov))}
            r, dd = float(sh.get("roll", 0)), float(sh.get("dist", d))
            keys.append(K(at, _at(P, float(sh["deg"]), dd, dy), ease="snap" if j else "inOut", roll=r, **o))
            keys.append(K(max(at + 0.05, nxt), _at(P, float(sh["deg"]) + float(sh.get("drift", 6)), dd * 0.93, dy),
                          ease="linear", roll=r * 1.1, **o))
        return keys
    if kind == "slow_push":                   # a slow push on a held note: she is still, the lens is not
        dy = float(m.get("dy", 0.0))
        return [K(t0, _at(P, deg, d * float(m.get("push", 1.3)), dy)),
                K(t1, _at(P, deg + float(m.get("sweep", 6)), d, dy + 0.02), fov=fov * 0.95, roll=float(m.get("roll", 0)),
                  ease="inOut")]
    raise ValueError(f"unknown camera move {kind!r} ({sorted(KINDS)})")

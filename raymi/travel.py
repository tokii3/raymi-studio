"""Her way through the space (toki 2026-10-28, take 11: "raymi bewegt sich zwar also die animation aber nicht im raum
selbst, sie schwebt, schwimmt auf der stelle" - measured: 63 of 63 swim / tread / climb keys played on the spot, and the
lens sat on her in 163 of 194 shots: "raymi wird immer in die mitte des bildes gezwungen").

Runs over the script rows before the multicam expansion (timeline.compile_shots):
- her way per clip is MEASURED on her rig (studio/catalog/root_travel.json, studio/root_travel.mjs): a clip whose hips
  travel carries her itself (VrmPuppet rootAt); nearly all are exported in place, so the way her planted feet imply
  moves her (key "drift", m/s) - a kick that advances advances, a step lands where the foot stays (toki 2026-10-28 on
  take 13: "raymi wirkt wie angewurzelt"); a swim moves at SWIM_V, treading / floating drifts (DRIFT);
- she heads ACROSS the lens, not into it (rotY): 55 deg off the lens axis when the lens rides along, 80 deg when it lets
  her pass; the row alternates left / right so the film is not one direction;
- her way is centred on the middle of the key's time (key "path", m): the place the script chose is where she is half way;
- a close / medium frame (frame height <= TRACK_H at the look distance) gets a lens that rides with her (row "track":
  velocity, middle, lead room ahead of her); a wide frame keeps its lens - she enters, crosses, leaves.
A row opts out with "travel": 0 and says why in "travel_why" (a held hero pose, a set she must stay on).
"""
import math
import re

TRACK_H = 2.6        # m: frames this tall or smaller at the look distance ride along with her; wider ones let her pass
LEAD = 0.17          # x frame width: she sits this far behind the centre, the room is ahead of her (rule of thirds)
MIN_TRAVEL = 0.3     # m of root travel in one clip loop: below that a clip is in place by nature (a dance, a pose)
DRIFT = 0.15         # m/s: treading water / floating moves with the water, never pinned to a point
MIN_FEET = 0.15      # m/s her planted feet must imply before she is moved by them (a dance shuffles in place)
# swimming has no foot on a floor to measure: one breaststroke cycle carries a swimmer about 1 m, the clip's ~1.4 s cycle
# -> ~0.7 m/s (BEST GUESS, labelled; take 13 used Blender's 2 m/s and the body slid past its slow strokes)
SWIM = re.compile(r"swim", re.I)
SWIM_V = 0.7
WATER = re.compile(r"tread|float|swim", re.I)
CLIMB = re.compile(r"climb|pull|ladder|ledge|wall", re.I)
# a linear way only for clips that ARE a way (swim, walk, run): an attack or a turn that shifts its weight would slide
LOCO = re.compile(r"swim|walk|run|jog|sprint|crawl|dash|skip", re.I)


def _num(x, default=0.0):
    try:
        return float(x)
    except (TypeError, ValueError):
        return default


def _cam_info(row: dict) -> tuple[float | None, float, float]:
    """(azimuth of the lens seen from her in degrees or None, frame height m at the look distance, fov) of the row's
    first camera key."""
    cams = row.get("camera") or []
    if not cams:
        return None, 99.0, 40.0
    c = cams[0]
    fov = _num(c.get("fov"), 40.0)
    a = c.get("aim")
    if isinstance(a, dict):
        d = _num(a.get("d"), 2.0)
        return _num(a.get("az"), 0.0), 2 * d * math.tan(math.radians(fov) / 2), fov
    p, lk = c.get("pos"), c.get("look")
    if isinstance(p, list) and isinstance(lk, list) and len(p) == 3 and len(lk) == 3:
        d = math.dist(p, lk)
        return math.degrees(math.atan2(p[0] - lk[0], p[2] - lk[2])), 2 * d * math.tan(math.radians(fov) / 2), fov
    return None, 99.0, fov


def plan_travel(rows: list[dict], energy: dict, warns: list[str]) -> list[dict]:
    out = [dict(r) for r in rows]
    ats = [_num(r.get("at"), None) if not isinstance(r.get("at"), str) else None for r in out]
    side = 1
    for i, row in enumerate(out):
        actor = row.get("actor") or []
        if not actor or ats[i] is None or _num(row.get("travel"), 1.0) == 0:
            continue
        nxt = next((a for a in ats[i + 1:] if a is not None), None)
        dur = (nxt - ats[i]) if nxt is not None else 2.0
        az, fh, _ = _cam_info(row)
        track = fh <= TRACK_H and not row.get("pass")
        keys = [dict(k) for k in actor]
        row["actor"] = keys
        tracked = False
        for j, k in enumerate(keys):
            m = str(k.get("clip") or k.get("motion") or "")
            if not m or _num(k.get("speed"), 1.0) == 0 or _num(k.get("travel"), 1.0) == 0 or "drift" in k:
                continue
            if CLIMB.search(m):
                continue                                  # the way is up: rootAt keeps the climb's height loop on loop
            rt = energy.get(m) or {}
            sp = _num(k.get("speed"), 1.0)
            lv, imp = rt.get("v") or [0, 0, 0], rt.get("implied") or [0, 0, 0]
            root = math.hypot(lv[0], lv[2]) * _num(rt.get("dur"), 1.0) >= MIN_TRAVEL
            if root:                                      # the clip's own hips carry her (VrmPuppet rootAt)
                local = [lv[0] * sp, lv[2] * sp]
            elif math.hypot(imp[0], imp[2]) >= MIN_FEET and _num(rt.get("planted")) >= 0.3:
                local = [imp[0] * sp, imp[2] * sp]        # the way her planted feet imply (measured on her rig)
            elif SWIM.search(m):
                local = [0.0, SWIM_V * sp]
            elif WATER.search(m):
                local = [0.0, DRIFT]
            else:
                continue
            loco = bool(LOCO.search(m) or WATER.search(m))
            # heading: a way of its own (swim, walk) goes ACROSS the lens, alternating sides; an action (a kick that
            # advances, a punch that steps in) keeps the facing the script gave it and moves the way her feet say
            rot = k.get("rotY", "lens")
            if isinstance(rot, (int, float)):
                head = float(rot)
            elif az is None:
                head = 90.0 * side
            elif not loco:
                head = az + (180.0 if rot == "away" else 0.0)
            else:
                head = az + (180.0 if rot == "away" else 0.0) + side * (55.0 if track else 80.0)
            if loco and az is not None and not track:
                off = abs(((head - az) + 180.0) % 360.0 - 180.0)
                if off < 45 or off > 135:
                    if row.get("pass"):                   # a pass crosses the frame: never at / away along the lens axis
                        head = az + side * 80.0
                    else:                                 # along the lens axis she would swim into it: the lens rides
                        track = True
            if loco:
                k["rotY"] = round(head, 1)
            h = math.radians(head)
            fwd = [math.sin(h), 0.0, math.cos(h)]
            right = [math.cos(h), 0.0, -math.sin(h)]
            k_at = 0.0 if k.get("at") == "end" else _num(k.get("at"))
            k_to = next((_num(x.get("at")) for x in keys[j + 1:] if x.get("at") != "end"), dur)
            span = max(0.2, k_to - k_at)
            v = [round(right[c] * local[0] + fwd[c] * local[1], 4) for c in range(3)]
            if not root:
                k["drift"] = v                            # a linear way; a root clip is carried by its own hips
            k["_v"] = v
            k["path"] = [round(-c * span / 2, 4) for c in v]
            if row.get("pass") and math.hypot(v[0], v[2]) > 0:
                # a pass starts just outside the frame edge and swims in (toki 2026-10-28: "es ist normal dass die
                # flaeche am anfang ... leer ist ... wenn sie erst rein ... schwimmt"): the frame is empty first
                fw = fh * 16 / 9
                k["path"] = [round(-c * (fw / 2 + 0.45), 4) for c in fwd]
            # a later key of the same row standing on the same mark: she is where her way took her
            for x in keys[j + 1:]:
                if x.get("pos", "center") == k.get("pos", "center") and "path" not in x:
                    x["path"] = [round(c * span / 2, 4) for c in v]
            if track and not tracked:
                fw = fh * 16 / 9
                cv = [math.sin(math.radians(az or 0.0)), 0.0, math.cos(math.radians(az or 0.0))]
                dot = fwd[0] * cv[0] + fwd[2] * cv[2]
                perp = [fwd[0] - dot * cv[0], 0.0, fwd[2] - dot * cv[2]]   # lead room only across the frame, never into her
                row["track"] = {"v": v, "mid": round(ats[i] + k_at + span / 2, 3),
                                "lead": [round(c * LEAD * fw, 4) for c in perp]}
                tracked = True
        if any("_v" in k for k in keys):
            side = -side
    return out


THIRD = 0.12         # x frame width: off the centre toward the third (QC v2: 0.16 on medium frames cut her face at the edge)
COMPOSE_H = (1.5, 9.0)   # m frame heights that compose on the thirds: closer ones keep her face clear of the edges


def compose_thirds(rows: list[dict]) -> list[dict]:
    """Not every frame centred (toki 2026-10-28: "raymi wird immer in die mitte des bildes gezwungen was nicht sein
    muss"): a row whose lens aims at her - not riding along, not fitted on her measured face, no shift of its own - slides
    its look point onto a third (aim "shift"), alternating sides through the film. A row keeps the centre with
    "center": true (a symmetric hero frame, a lens attack)."""
    out = []
    side = 1
    for r in rows:
        r = dict(r)
        out.append(r)
        if r.get("center") or r.get("track") or r.get("frame_fit") or r.get("frame_fits") or r.get("riser") or not r.get("actor"):
            continue
        keys = [c for c in (r.get("camera") or []) if isinstance(c.get("aim"), dict)]
        if not keys or any("shift" in c["aim"] for c in keys):
            continue
        c0 = keys[0]
        fh = 2 * float(c0["aim"].get("d", 2.0)) * math.tan(math.radians(float(c0.get("fov", 40))) / 2)
        if not COMPOSE_H[0] <= fh <= COMPOSE_H[1]:
            continue
        r["camera"] = [dict(c, aim={**c["aim"], "shift": round(side * THIRD * fh * 16 / 9, 3)}) if isinstance(c.get("aim"), dict)
                       else c for c in r["camera"]]
        side = -side
    return out


def face_walls(rows: list[dict], warns: list[str], set_opts: dict | None = None) -> list[dict]:
    """A climb holds on to a real surface (toki 2026-10-28 on take 13: "sie klettert am leuchtturm in die falsche
    richtung"; measured: at the rock ledge she climbed with her BACK to the rock). A climbing clip turns to the nearest
    climbable thing the row's set names - the lighthouse tower and its rock ledge (opts.lighthouse pos / ledge) - and a
    climb with no surface within 3 m is reported."""
    out = []
    for r in rows:
        actor = r.get("actor") or []
        lh = (r.get("opts") or {}).get("lighthouse") or ((set_opts or {}).get(r.get("set")) or {}).get("lighthouse") or {}
        walls = [w for w in (lh.get("pos"), lh.get("ledge")) if isinstance(w, list) and len(w) == 2]
        if not actor or not any(CLIMB.search(str(k.get("clip") or k.get("motion") or "")) for k in actor):
            out.append(r)
            continue
        keys = []
        for k in actor:
            m = str(k.get("clip") or k.get("motion") or "")
            p = k.get("pos")
            # up the tower / onto its rocks only: in the lantern room (her feet at the tower top) a pull is acting, not a climb
            if CLIMB.search(m) and not re.search(r"jump", m) and isinstance(p, list) and len(p) == 3 and p[1] < float(lh.get("height", 12)) - 0.2:
                near = min(walls, key=lambda w: math.hypot(w[0] - p[0], w[1] - p[2]), default=None)
                if near is None or math.hypot(near[0] - p[0], near[1] - p[2]) > 3.0:
                    warns.append(f"row {r.get('id')}: {m} climbs with no wall within 3 m - put her at the tower / the ledge")
                else:
                    want = math.degrees(math.atan2(near[0] - p[0], near[1] - p[2]))
                    k = {**k, "rotY": round(want, 1), "face_lens": False}
            keys.append(k)
        out.append({**r, "actor": keys})
    return out

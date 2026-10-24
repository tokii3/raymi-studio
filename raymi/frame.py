"""Close shots framed on her MEASURED head (Watch Me stills 1, 2026-10-24: the thumbnail frame cut her face at the edge,
two more close-ups showed only hair).

A camera move aims at an ASSUMED head point (her spot + h); a held pose or a dance clip moves the real head by 10-30 cm,
which a 30 cm-tall ECU frame cannot absorb. The scene probe (studio/probe.mjs, cloud) records the real head bone on
every probed frame. This step turns that into one camera shift per close shot: the median of (real head - where the
lens looked) on the probed frames, minus the along-the-view part (the distance stays as scripted), plus the house rule
"face centred and a little high" (memory raymi-3d-on-screen: eyes ~38-40 % from the top -> the head sits 10 % of the
frame height above the look point). The shift lands in shots.json as `frame_fit` [dx, dy, dz]; raymi/timeline.py adds
it to every camera key of that shot (pos and look), so guards, stills and the render all see the same lens.

    python -m raymi frame <job> [mv|short]     (stills.yml runs it when stills.json has "frame_fit": true)
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from statistics import median

CLOSE_H = 1.0        # m: a frame this tall (or less) at the look distance is a close shot - the face must sit right
HIGH = 0.10          # x frame height: the head above the look point (eyes ~40 % from the top)
MAX_SHIFT = 0.4      # m: a larger shift means the shot aims at the wrong thing - reported, not applied
MIN_SHIFT = 0.015    # m: smaller = already right


def _lerp(a, b, t):
    return [x + (y - x) * t for x, y in zip(a, b)]


def _key_at(keys: list[dict], f: int) -> dict:
    """The camera key pair around film frame f, linearly blended (enough for a median over a shot)."""
    if f <= keys[0]["f"]:
        return keys[0]
    for k0, k1 in zip(keys, keys[1:]):
        if k0["f"] <= f <= k1["f"]:
            t = (f - k0["f"]) / max(1, k1["f"] - k0["f"])
            return {"pos": _lerp(k0["pos"], k1["pos"], t), "look": _lerp(k0["look"], k1["look"], t),
                    "fov": k0["fov"] + (k1["fov"] - k0["fov"]) * t}
    return keys[-1]


def fits(props: dict, report: dict) -> dict[str, dict]:
    """Per close shot: {shift: [dx, dy, dz], frames: n, frame_h: m} or {skip: why}."""
    rows = [r for r in report["rows"] if r.get("her") and (r["her"].get("bones") or {}).get("head")]
    out: dict[str, dict] = {}
    for s in props["shots"]:
        keys = s.get("camera") or []
        mine = [r for r in rows if r.get("shot") == s["id"] and s["from"] <= r.get("F", r["f"]) < s["to"]]
        if not keys or not mine:
            continue
        deltas, hs = [], []
        for r in mine:
            k = _key_at(keys, r.get("F", r["f"]))
            v = [b - a for a, b in zip(k["pos"], k["look"])]
            dist = math.sqrt(sum(x * x for x in v)) or 1.0
            fh = 2 * dist * math.tan(math.radians(k["fov"]) / 2)
            if fh > CLOSE_H:
                continue
            fwd = [x / dist for x in v]
            want = [k["look"][0], k["look"][1] + HIGH * fh, k["look"][2]]
            d = [h - w for h, w in zip(r["her"]["bones"]["head"], want)]
            along = sum(a * b for a, b in zip(d, fwd))
            deltas.append([a - along * b for a, b in zip(d, fwd)])     # keep the scripted distance
            hs.append(fh)
        if len(deltas) < 2:
            continue
        shift = [round(median(c), 3) for c in zip(*deltas)]
        n = math.sqrt(sum(x * x for x in shift))
        if n > MAX_SHIFT:
            out[s["id"]] = {"skip": f"shift {n:.2f} m > {MAX_SHIFT} - the shot aims at the wrong thing, reframe it by hand", "shift": shift}
        elif n >= MIN_SHIFT:
            out[s["id"]] = {"shift": shift, "frames": len(deltas), "frame_h": round(median(hs), 3)}
    return out


def main(job_dir: Path, fmt: str = "mv") -> int:
    props = json.loads((job_dir / "out" / "props.json").read_text(encoding="utf-8"))
    rep = job_dir / "out" / f"probe_{fmt}.json"
    report = json.loads(rep.read_text(encoding="utf-8"))
    spec_p = job_dir / "shots.json"
    spec = json.loads(spec_p.read_text(encoding="utf-8"))
    res = fits(props, report)
    by_id = {r["id"]: r for r in spec["shots"]}
    applied = 0
    for sid, r in sorted(res.items()):
        row = by_id.get(sid)
        if row is None:
            continue
        if "skip" in r:
            print(f"  {sid}: SKIP {r['skip']} {r['shift']}")
            continue
        old = row.get("frame_fit") or [0, 0, 0]
        row["frame_fit"] = [round(a + b, 3) for a, b in zip(old, r["shift"])]   # the probe saw the lens WITH the old fit
        applied += 1
        print(f"  {sid}: shift {r['shift']} over {r['frames']} frames (frame {r['frame_h']} m tall) -> frame_fit {row['frame_fit']}")
    spec_p.write_text(json.dumps(spec, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"frame fit ({fmt}): {applied} close shots moved onto her measured head")
    return 0

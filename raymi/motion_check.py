"""Her motion measured on the real render (toki 2026-10-27, the third time: "raymis bewegungen nicht flüssig ... statisch
... abgehackt"). My gates judged STILLS, so a near-still Raymi never failed one. This reads the scene probe of the
rendered frames (her bones) and measures, per song section, how much of the time she is nearly still and how fast her
limbs move (relative to her hips, so a camera move or her drifting does not count), and the hard jumps (a pose that
snaps between two samples inside a shot: a loop seam, a restart).

    python -m raymi motion <job> [probe.json]      -> jobs/<job>/out/motion.json (gate reads it for a video)

Thresholds (measured Love is War draft 2026-10-27: still 33 %, median 0.22 m/s; pros' aggressive MVs move hands
1-3 m/s): in a LOUD section (song_map kind peak / loud) at most 15 % nearly still and a median limb speed >= 0.6 m/s;
anywhere a jump > 1.8 m/s above both neighbours inside a shot is a snap.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

STILL = 0.1          # m/s: slower than this the body reads as held
LOUD_STILL = 0.15
LOUD_MEDIAN = 0.6
SNAP = 1.8
LIMBS = ("head", "leftHand", "rightHand", "leftFoot", "rightFoot")


def speeds(rows: list[dict], fps: int = 30) -> list[tuple[float, float, str]]:
    """(song-relative film second, limb speed m/s, shot) between consecutive probe samples of the same shot."""
    out = []
    rows = [r for r in rows if r.get("her") and (r["her"].get("bones") or {}).get("hips")]
    for a, b in zip(rows, rows[1:]):
        if a["shot"] != b["shot"] or b["f"] <= a["f"]:
            continue
        dt = (b["f"] - a["f"]) / fps
        ha, hb = np.array(a["her"]["bones"]["hips"]), np.array(b["her"]["bones"]["hips"])
        v = 0.0
        for k in LIMBS:
            pa, pb = a["her"]["bones"].get(k), b["her"]["bones"].get(k)
            if pa and pb:
                v = max(v, float(np.linalg.norm((np.array(pb) - hb) - (np.array(pa) - ha))) / dt)
        out.append((a["f"] / fps, v, a["shot"]))
    return out


def check(sp: list[tuple[float, float, str]], sections: list[dict], t_from: float = 0.0) -> dict:
    faults, per = [], []
    for s in sections:
        vs = [v for t, v, _ in sp if s["t0"] <= t + t_from < s["t1"]]
        if len(vs) < 4:
            continue
        still = float(np.mean(np.array(vs) < STILL))
        med = float(np.median(vs))
        loud = s.get("kind") in ("peak", "loud")
        per.append({"t0": s["t0"], "t1": s["t1"], "kind": s.get("kind"), "still": round(still, 2), "median": round(med, 2), "n": len(vs)})
        if loud and still > LOUD_STILL:
            faults.append(f"{s['t0']:.1f}-{s['t1']:.1f} ({s.get('kind')}): nearly still {still:.0%} of the time (max {LOUD_STILL:.0%})")
        if loud and med < LOUD_MEDIAN:
            faults.append(f"{s['t0']:.1f}-{s['t1']:.1f} ({s.get('kind')}): median limb speed {med:.2f} m/s (min {LOUD_MEDIAN})")
    snaps = []
    for i in range(1, len(sp) - 1):
        (t, v, sh), (_, a, sa), (_, b, sb) = sp[i], sp[i - 1], sp[i + 1]
        if sh == sa == sb and v > SNAP and v > 2.5 * max(a, b, 0.2):
            snaps.append(round(t + t_from, 2))
    if snaps:
        faults.append(f"{len(snaps)} pose snaps inside shots at {snaps[:12]}")
    allv = np.array([v for _, v, _ in sp]) if sp else np.zeros(1)
    return {"still": round(float(np.mean(allv < STILL)), 3), "median": round(float(np.median(allv)), 3),
            "sections": per, "snaps": snaps, "faults": faults}


def main(argv: list[str]) -> int:
    from . import plan as P

    job_dir = P.job_dir(argv[0])
    probe = Path(argv[1]) if len(argv) > 1 else job_dir / "out" / "probe_mv.json"
    rep = json.loads(probe.read_text(encoding="utf-8"))
    props_f = job_dir / "out" / "props.json"
    if props_f.is_file():          # designed stops / picture holds (opts.freeze) are decisions, not a still Raymi
        # opts.calm = "<why>": a designed calm picture (e.g. an ECU push where her limbs are out of frame) - said, not hidden
        frozen = {s["id"] for s in json.loads(props_f.read_text(encoding="utf-8"))["shots"] if (s.get("opts") or {}).get("freeze") or (s.get("opts") or {}).get("calm")}
        rep["rows"] = [r for r in rep["rows"] if r.get("shot") not in frozen]
    spec = json.loads((job_dir / "shots.json").read_text(encoding="utf-8"))
    smap = json.loads((job_dir / spec.get("song_map", "song_map.json")).read_text(encoding="utf-8"))
    t_from = float(rep.get("t_from", 0.0))
    res = check(speeds(rep["rows"], int(rep.get("fps", 30))), smap.get("sections", []), t_from)
    res["probe"] = str(probe)
    (job_dir / "out").mkdir(exist_ok=True)
    (job_dir / "out" / "motion.json").write_text(json.dumps(res, indent=1), encoding="utf-8")
    print(f"motion: nearly still {res['still']:.0%}, median limb speed {res['median']:.2f} m/s")
    for s in res["sections"]:
        print(f"  {s['t0']:6.1f}-{s['t1']:6.1f} {str(s['kind']):6} still {s['still']:.0%}  median {s['median']:.2f} m/s")
    for f in res["faults"]:
        print("FAULT", f)
    return 1 if res["faults"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

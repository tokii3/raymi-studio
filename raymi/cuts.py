"""Cuts on the music (toki 2026-10-23: "cuts wirken random").

Every cut of a film job is measured against the song map: a hit, a sung line's first syllable, a section edge or a
stop is a musical event; a beat is the fallback. A cut sits ON the music when it lands one frame before an event
(CLAUDE.md rule 10), within CUT_TOL frames. `python -m raymi cuts <job> [--apply]` reports every cut, the share of
loud hits the picture answers, monotone runs of equal shot lengths, and with --apply moves each numeric shot start
to the event it is meant for (one frame early). Pure: reads shots.json, song_map.json and the compiled props.
"""
from __future__ import annotations

import io
import json
from pathlib import Path

FPS = 30
CUT_TOL = 2          # frames: a cut this close to (event - 1 frame) counts as on the music
SNAP = 0.35          # seconds: the furthest a cut is moved to an event by --apply
RANK = {"hit": 4, "section": 4, "stop": 4, "line": 3, "beat": 1}


def events(smap: dict) -> list[tuple[float, str]]:
    """(song seconds, kind) of every musical event a cut may land on."""
    ev = [(t, "hit") for t in smap.get("hits", [])]
    ev += [(s["t0"], "section") for s in smap.get("sections", []) if s["t0"] > 0]
    ev += [(s["t0"], "stop") for s in smap.get("stops", [])]
    ev += [(v["t0"], "line") for v in smap.get("voices", [])]
    ev += [(t, "beat") for t in smap.get("beats", [])]
    return sorted(ev)


def nearest(t: float, ev: list[tuple[float, str]], within: float = SNAP) -> tuple[float, str] | None:
    """The strongest event near t (rank first, then distance) - a cut meant for a hit is not pulled onto a beat."""
    near = [(e, k) for e, k in ev if abs(e - t) <= within]
    if not near:
        return None
    return max(near, key=lambda x: (RANK[x[1]], -abs(x[0] - t)))


def report(props: dict, smap: dict) -> dict:
    t0 = float((props.get("audio") or {}).get("from", 0.0))
    ev = events(smap)
    cuts, rows = [], []
    for i, s in enumerate(props["shots"]):
        if i == 0:
            continue
        t = t0 + s["from"] / FPS
        cuts.append(t)
        e = nearest(t, ev)
        target = (e[0] - 1 / FPS) if e else None
        off = round((t - target) * FPS) if target is not None else None
        on = off is not None and abs(off) <= CUT_TOL and e[1] != "beat"
        rows.append({"shot": s.get("id", str(i + 1)), "t": round(t, 3), "event": e[1] if e else None,
                     "event_t": round(e[0], 3) if e else None, "off_frames": off, "on": on})
    # loud hits the picture answers with a cut (within CUT_TOL + 1 frames)
    t_end = t0 + props["shots"][-1]["to"] / FPS
    hits = [h for h in smap.get("hits", []) if t0 <= h < t_end]   # the film's own window (a Short, a reel)
    answered = sum(1 for h in hits if any(abs((c - (h - 1 / FPS)) * FPS) <= CUT_TOL + 1 for c in cuts))
    lens = [(props["shots"][i]["to"] - props["shots"][i]["from"]) / FPS for i in range(len(props["shots"]))]
    runs, k = [], 0
    while k < len(lens):
        j = k
        while j + 1 < len(lens) and abs(lens[j + 1] - lens[k]) <= 0.2 * lens[k]:
            j += 1
        if j - k + 1 >= 4:
            runs.append({"from_shot": props["shots"][k].get("id"), "shots": j - k + 1, "len_s": round(lens[k], 2)})
        k = j + 1
    on = sum(1 for r in rows if r["on"])
    return {"cuts": rows, "on_music": round(on / max(1, len(rows)), 2), "hits": len(hits),
            "hits_with_cut": answered, "monotone_runs": runs}


def apply(spec: dict, rows: list[dict]) -> list[str]:
    """Move numeric shot starts onto their event (one frame early). Shots timed by "line:N" stay as they are."""
    by = {str(s.get("id")): s for s in spec["shots"]}
    done = []
    for r in rows:
        s = by.get(str(r["shot"]))
        if s is None or r["on"] or r["event_t"] is None or not isinstance(s.get("at"), (int, float)):
            continue
        new = round(r["event_t"] - 1 / FPS, 3)
        done.append(f"shot {r['shot']}: {s['at']} -> {new} ({r['event']})")
        s["at"] = new
    return done


def main(job_dir: Path, do_apply: bool = False) -> int:
    props = json.loads((job_dir / "out" / "props.json").read_text(encoding="utf-8"))
    spec_raw = io.open(job_dir / "shots.json", encoding="utf-8", newline="").read()
    spec = json.loads(spec_raw)
    smap = json.loads((job_dir / spec["song_map"]).read_text(encoding="utf-8"))
    rep = report(props, smap)
    for r in rep["cuts"]:
        mark = "on " if r["on"] else "OFF"
        ev_t = "" if r["event_t"] is None else f"{r['event_t']:.3f}"
        off = "" if r["off_frames"] is None else f"{r['off_frames']:+d} f"
        print(f"{mark} shot {r['shot']:>4} {r['t']:8.3f}s  {r['event'] or '-':8} {ev_t:>8}  {off}")
    print(f"cuts on the music: {rep['on_music']:.0%}   loud hits answered by a cut: {rep['hits_with_cut']}/{rep['hits']}")
    for run in rep["monotone_runs"]:
        print(f"monotone: {run['shots']} shots of ~{run['len_s']} s from shot {run['from_shot']}")
    if do_apply:
        done = apply(spec, rep["cuts"])
        nl = "\r\n" if "\r\n" in spec_raw else "\n"
        io.open(job_dir / "shots.json", "w", encoding="utf-8", newline="").write(
            json.dumps(spec, ensure_ascii=False, indent=1).replace("\n", nl) + nl)
        print("\n".join(done) or "nothing to move")
    return 0

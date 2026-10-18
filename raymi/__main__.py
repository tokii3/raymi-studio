"""python -m raymi <command> <job>

  new    <job> --kind mv|lore   writers' room: job folder with the step templates
  next   <job>          writers' room: which step is open, what to read first
  parts  <job> draft|final   JSON frame ranges for the parallel render
  assemble <job> <dir>  join part_<k>.mp4 + lay the audio under them -> out/raw.mp4
  voice  <job>          edge-tts -> jobs/<job>/voice.mp3 + words.json (needs internet)
  check  <job>          plan + words against every hard rule (exit 1 on errors)
  props  <job>          write jobs/<job>/out/props.json for the renderer
  finish <job>          loudness-normalise out/raw.mp4 -> out/final.mp4, then QC + contact sheet
  timeline <job> [mv|short]  shots.json (shooting script data) -> out/props.json for the MV / MVShort film
  font ensure <job>     build every on-screen glyph her font lacks, in her marker style (raymi/font.py)
  font add <chars>      the same for given characters
  font heavy            build / update her heavy weight (Raymi-Heavy.ttf, lyrics v2) from Raymi-Regular.ttf
  screen <job> [video] critic kit (phone sheets, gray, motion strips, one frame per shot, facts) -> out/kit
  hero   <job> <video|stills dir>  is the main element readable at phone size? (value contrast, after a render)
  analyze <job>         song tools (cloud, heavy): vocal stem, word-timed lyrics, song map (raymi/song.py)
  lyrics <job>          re-align lyrics_timed.json locally from the cached whisper_words.json + vocals.ogg
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from . import plan as P
from . import qc


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 2
    cmd, job = argv[0], argv[1]
    if cmd == "parts":       # parts <job> draft|final -> JSON matrix for the parallel render
        from . import parts

        print(json.dumps(parts.matrix(P.job_dir(job) / "out" / "props.json", argv[2] if len(argv) > 2 else "draft")))
        return 0
    if cmd == "assemble":    # assemble <job> <parts_dir> -> out/raw.mp4
        from . import parts

        print("raw ->", parts.assemble(P.job_dir(job), Path(argv[2])))
        return 0
    if cmd == "font":        # font ensure <job> | font add <chars>: build missing glyphs in her marker style
        from . import font as FN

        if job == "heavy":
            made = FN.heavy()
            print(f"font heavy: {len(made)} glyph(s) emboldened -> {FN.HEAVY.name}")
            return 0
        if job == "ensure":
            jd = P.job_dir(argv[2])
            if (jd / "shots.json").is_file():
                from . import timeline as T

                text = "".join(T.job_texts(argv[2]))
            else:
                text = "".join(P.screen_texts(json.loads((jd / "plan.json").read_text(encoding="utf-8"))))
        elif job == "add":
            text = "".join(argv[2:])
        else:
            print("usage: python -m raymi font ensure <job> | font add <chars> | font heavy")
            return 2
        added, impossible = FN.grow(text)
        print(f"font: built {len(added)} glyph(s) in her style: {''.join(added)}" if added else "font: nothing missing")
        if impossible:
            print(f"ERROR no skeleton has {''.join(impossible)} - add a skeleton font for that script (assets/fonts/skeletons)")
            return 1
        return 0
    if cmd == "screen":      # screen <job> [video] -> out/kit (critic kit, cloud after assemble)
        from . import screen

        print("kit ->", screen.screen_job(P.job_dir(job), Path(argv[2]) if len(argv) > 2 else None))
        return 0
    if cmd == "hero":        # hero <job> <final.mp4 | stills dir> -> out/hero.json (needs out/hero_boxes.json)
        from . import hero

        res = hero.run(P.job_dir(job), Path(argv[2]))
        print(f"hero: {res['verdict']}")
        for r in res["rows"]:
            if not r["readable"]:
                print(f"  {r['shot']} f{r['frame']} {r['name']}: {r['why']}")
        return 0 if not res["unreadable"] else 1
    if cmd in ("analyze", "lyrics"):
        from . import song

        d = P.job_dir(job)
        if cmd == "analyze":
            print(json.dumps(song.analyze(d), indent=1))
        else:
            cfg = json.loads((d / "analyze.json").read_text(encoding="utf-8"))
            res = song.time_lyrics(d, (d / cfg.get("lyrics", "lyrics.txt")).read_text(encoding="utf-8"),
                                   json.loads((d / "whisper_words.json").read_text(encoding="utf-8")), d / "vocals.ogg")
            song.resection(d)
            print(json.dumps(res["stats"]))
        return 0
    if cmd in ("new", "next"):
        from . import room

        if cmd == "new":
            kind = argv[argv.index("--kind") + 1] if "--kind" in argv else "mv"
            print("created", room.new(job, kind))
        print(room.next_step(job))
        return 0
    d = P.job_dir(job)
    out = d / "out"
    out.mkdir(exist_ok=True)
    if cmd == "voice":
        from .tts import make_voice

        plan, _ = P.load(job)
        res = make_voice(plan["script"], d)
        print(f"voice: {res['duration']} s, timing from {res['timing_source']}")
        return 0
    if cmd == "timeline":    # timeline <job> [mv|short] -> out/props.json for the film compositions
        from . import timeline as T

        fmt = argv[2] if len(argv) > 2 else "mv"
        props, errors, warns = T.compile_job(job, fmt)
        for w in warns:
            print("WARN ", w)
        for e in errors:
            print("ERROR", e)
        if errors:
            print("timeline: FAIL")
            return 1
        (out / "props.json").write_text(json.dumps(props, indent=1, ensure_ascii=False), encoding="utf-8", newline="\n")
        print(f"timeline ({fmt}): {len(props['shots'])} shots, {props['durationInFrames']} frames -> {out / 'props.json'}")
        return 0
    if cmd == "finish" and not (d / "plan.json").is_file():   # a film job: expected length from its props
        props = json.loads((out / "props.json").read_text(encoding="utf-8"))
        raw, final = out / "raw.mp4", out / "final.mp4"
        qc.normalize(raw, final)
        res = qc.run(final, props["durationInFrames"] / props["fps"], landscape=props["width"] > props["height"])
        qc.sheet(final, out / "sheet.jpg")
        (out / "qc.json").write_text(json.dumps(res, indent=1), encoding="utf-8", newline="\n")
        print(json.dumps(res, indent=1))
        return 0 if res["pass"] else 1
    plan, words = P.load(job)
    if cmd == "check":
        errors, warns = P.check(plan, words)
        for w in warns:
            print("WARN ", w)
        for e in errors:
            print("ERROR", e)
        if words is None:
            print("ERROR no words.json yet - run: python -m raymi voice", job)
            return 1
        print("check:", "FAIL" if errors else "ok")
        return 1 if errors else 0
    if cmd == "props":
        errors, _ = P.check(plan, words)
        if errors or words is None:
            print("refused: run `python -m raymi check` first")
            return 1
        (out / "props.json").write_text(json.dumps(P.props(plan, words), indent=1, ensure_ascii=False), encoding="utf-8", newline="\n")
        print("props ->", out / "props.json")
        return 0
    if cmd == "finish":
        raw, final = out / "raw.mp4", out / "final.mp4"
        qc.normalize(raw, final)
        expect = words["duration"] + P.TAIL_S if words else None
        res = qc.run(final, expect)
        qc.sheet(final, out / "sheet.jpg")
        (out / "qc.json").write_text(json.dumps(res, indent=1), encoding="utf-8", newline="\n")
        print(json.dumps(res, indent=1))
        return 0 if res["pass"] else 1
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

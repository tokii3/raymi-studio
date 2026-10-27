"""python -m raymi <command> <job>

  new    <job> --kind mv|lore   writers' room: job folder with the step templates
  next   <job>          writers' room: which step is open, what to read first
  parts  <job> draft|final   JSON frame ranges for the parallel render
  assemble <job> <dir>  join part_<k>.mp4 + lay the audio under them -> out/raw.mp4
  voice  <job>          edge-tts -> jobs/<job>/voice.mp3 + words.json (needs internet)
  check  <job>          plan + words against every hard rule (exit 1 on errors)
  props  <job>          write jobs/<job>/out/props.json for the renderer
  finish <job>          loudness-normalise out/raw.mp4 -> out/final.mp4, then QC + contact sheet
  voice-lines <job>     a talking 3D Short: one take per spoken line of shots.json "voice" (raymi/voice_lines.py)
  mix    <job>          bed + takes + sfx -> jobs/<job>/out/mix.m4a (cloud prepare, before the timeline)
  name   <job> [short|mv]  the file name toki downloads: <upload day>_Raymi_<title>_<Short|MV>.mp4
  exposure <dir|img..>  overexposed / oversaturated / flat pictures (raymi/exposure.py)
  bed    <track>        a music bed's map (tempo, beats, accents) -> <track>.map.json (raymi/bed.py)
  pov    <job>          a talking Short's timing against the measured takes + bed map (raymi/pov.py), exit 1 on a fault
  sfx    build          synthesise the sound-effect library -> assets/sfx/<kind>.wav (raymi/sfx.py)
  timeline <job> [mv|short]  shots.json (shooting script data) -> out/props.json for the MV / MVShort film
  probe  <job> [mv|short]  the scene probe's fault classes (studio/probe.mjs, stills.json "probe": N)
  frame  <job> [mv|short]  close shots onto her MEASURED head (probe -> shots.json frame_fit; stills.json "frame_fit")
  qc2    <job> [mv|short]  picture QC v2: the mask pass measured (pierced, lyric on face / hidden, face cut, pop)
  qc2-join <job> <parts dir> [mv|short]  join the parallel QC workers' probe rows + mask frames (qc.yml)
  qc2-frames <job> [mv|short] [dense_s]  the stills the eye level needs (every flagged frame + one a second), comma list
  qc2-crops <job> <stills dir> [mv|short] [dense_s]  zoomed crops of every flag + dense sheets -> boards/qc_<fmt>_eye/
  cuts   <job> [--apply]  every cut against hits / sung lines / sections (one frame early); --apply moves them
  font ensure <job>     build every on-screen glyph her font lacks, in her marker style (raymi/font.py)
  font add <chars>      the same for given characters
  font heavy            build / update her heavy weight (Raymi-Heavy.ttf, lyrics v2) from Raymi-Regular.ttf
  screen <job> [video] critic kit (phone sheets, gray, motion strips, one frame per shot, facts) -> out/kit
  hero   <job> <video|stills dir>  is the main element readable at phone size? (value contrast, after a render)
  stills-passes <job>   the stills passes of jobs/<job>/stills.json, one per line (stills.yml)
  thumbs <boards dir>   thumbnail candidates at feed size (168 px, dark + light) -> thumbs_168.jpg (raymi/thumbs.py)
  analyze <job>         song tools (cloud, heavy): vocal stem, word-timed lyrics, song map (raymi/song.py)
  lyrics <job>          re-align lyrics_timed.json locally from the cached whisper_words.json + vocals.ogg
  gemini <url|file> --prompt ..  Gemini WATCHES a YouTube video / local mp4 (motion + sound), answer verbatim
  refs   list|analyze|frames|board  the professional reference library (knowledge/references/, raymi/refs.py)
  storyboard <job>      storyboard.json -> reference frame | our previz still (or a PLAN card), before the build
  reality <job> <video>  what the finished video really does: cuts, camera motion, her face / size (raymi/reality.py)
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
    if cmd == "gemini":      # gemini <youtube url | file> [--start --end --fps] --prompt ...: Gemini watches a video
        from . import gemini

        return gemini.main(argv[1:])
    if cmd == "storyboard":  # storyboard <job>: reference frame next to our previz / PLAN card, before the build
        from . import storyboard

        return storyboard.main(argv[1:])
    if cmd == "reality":     # reality <job> <video>: what the finished video really does + the brief's claims
        from . import reality

        return reality.main(argv[1:])
    if cmd == "gate":        # gate <job> <stage> [files..]: nothing reaches toki past a BLOCK / FAIL / reality fault
        from . import gate

        return gate.main(argv[1:])
    if cmd == "style":       # style measure <imgs> | compare <ref imgs> -- <ours>: a look in numbers (knowledge/styles)
        from . import style

        return style.main(argv[1:])
    if cmd == "refs":        # refs list|analyze|frames|board ...: the professional reference library
        from . import refs

        return refs.main(argv[1:])
    if cmd == "parts":      # parts <job> draft|final -> JSON matrix for the parallel render
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
            elif (jd / "plan.json").is_file():
                text = "".join(P.screen_texts(json.loads((jd / "plan.json").read_text(encoding="utf-8"))))
            else:                    # a board without words (the VRM test board): nothing to grow
                text = ""
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
    if cmd == "stills-passes":
        from . import thumbs

        print("\n".join(thumbs.main_lines(P.job_dir(job))))
        return 0
    if cmd == "thumbs":      # thumbs <boards dir> -> thumbs_168.jpg
        from . import thumbs

        print("feed view ->", thumbs.feed_sheet(Path(job)))
        return 0
    if cmd == "hero":        # hero <job> <final.mp4 | stills dir> [frames names] -> out/hero.json (needs out/hero_boxes.json)
        from . import hero

        res = hero.run(P.job_dir(job), Path(argv[2]), *(argv[3:5]))
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
    if cmd == "pov":         # pov <job> -> measured timing table + faults
        from . import pov

        table, errs, warns = pov.check(P.job_dir(job))
        print("\n".join(table))
        for w in warns:
            print("WARN ", w)
        for e in errs:
            print("ERROR", e)
        return 1 if errs else 0
    if cmd == "name":        # name <job> [short|mv] -> the download file name (upload day, title, format)
        from .channel_rules import delivery_name

        print(delivery_name(P.job_dir(job), argv[2] if len(argv) > 2 else "short"))
        return 0
    if cmd == "exposure":    # exposure <dir|image...> -> over / undersaturation, clipping, depth per picture
        from . import exposure

        lines, bad = exposure.report([Path(x) for x in argv[1:]])
        print("\n".join(lines))
        return 1 if bad else 0
    if cmd == "bed":         # bed <track> -> <track>.map.json
        from . import bed

        print("bed map ->", bed.write(Path(job)))
        return 0
    if cmd == "sfx":         # sfx build -> assets/sfx/*.wav
        from . import sfx

        for f in sfx.build_all():
            print("sfx ->", f.name)
        return 0
    if cmd in ("voice-lines", "mix"):   # a talking 3D Short (kind "pov")
        from . import voice_lines as VL

        d = P.job_dir(job)
        spec = json.loads((d / "shots.json").read_text(encoding="utf-8"))
        if cmd == "voice-lines":
            for tk in VL.make_all(d, spec):
                print(f"{tk['at']:6.2f} +{tk['duration']:.2f} s  [{tk['timing_source']}]  {tk['text']}")
            return 0
        print("mix ->", VL.mix(d, spec))
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
    if cmd == "frame":       # frame <job> [mv|short]: close shots onto her measured head (raymi/frame.py)
        from . import frame as FR

        return FR.main(d, argv[2] if len(argv) > 2 else "mv")
    if cmd == "probe":       # probe <job> [mv|short]: the scene probe's fault classes (limbs in furniture, floating, pops ...)
        from . import probe as PR

        return PR.main(d, argv[2] if len(argv) > 2 else "mv")
    if cmd in ("qc2", "qc2-frames", "qc2-crops", "qc2-join"):   # picture QC v2 (raymi/qcv2.py, toki 2026-10-24)
        from . import qcv2 as Q

        if cmd == "qc2-join":     # qc2-join <job> <parts dir> [mv|short]: the parallel workers' pieces (qc.yml)
            print(Q.join(Path(argv[2]), d, argv[3] if len(argv) > 3 else "mv"))
            return 0

        if cmd == "qc2":
            return Q.main(d, argv[2] if len(argv) > 2 else "mv")
        if cmd == "qc2-frames":
            fmt = argv[2] if len(argv) > 2 else "mv"
            props = json.loads((d / "out" / "props.json").read_text(encoding="utf-8")) if (d / "out" / "props.json").is_file() else {}
            res = Q.frames(d, fmt, float(argv[3]) if len(argv) > 3 else 1.0, props.get("fps", 30), props.get("durationInFrames"))
            print(",".join(str(f) for f in sorted(set(res["flagged"]) | set(res["dense"]))))
            return 0
        fmt = argv[3] if len(argv) > 3 else "mv"
        props = json.loads((d / "out" / "props.json").read_text(encoding="utf-8")) if (d / "out" / "props.json").is_file() else {}
        res = Q.frames(d, fmt, float(argv[4]) if len(argv) > 4 else 1.0, props.get("fps", 30), props.get("durationInFrames"))
        eye = d / "boards" / f"qc_{fmt}_eye"
        made = Q.crops(Path(argv[2]), res["flags"], eye)
        sheets = Q.dense_sheets(Path(argv[2]), res["dense"], eye)
        print(f"qc2 eye: {len(made)} of {len(res['flags'])} flags cropped, {len(sheets)} dense sheets -> boards/qc_{fmt}_eye/")
        return 0
    if cmd == "cuts":        # cuts <job> [--apply]: every cut against the song's hits / lines / sections (needs out/props.json)
        from . import cuts as C

        return C.main(d, "--apply" in argv)
    if cmd == "motion":      # motion <job> [probe]: her motion on the real render, per section (gate reads out/motion.json)
        from . import motion_check

        return motion_check.main(argv[1:])
    if cmd == "seams":       # seams <job>: does the camera carry the eye through each hard cut? (needs out/props.json)
        from . import seams

        return seams.main(d)
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
        from . import seams

        rep = seams.report(props, seams.hits_frames(d, props))
        print(seams.summary(rep), "(details: python -m raymi seams", job + ")")
        for r in rep["mirrored_off_hit"]:
            print(f"WARN  seam before shot {r['shot']}: camera {r['exit']} -> {r['entry']} (mirrored, no hit licenses it)")
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

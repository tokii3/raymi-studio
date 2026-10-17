"""python -m raymi <command> <job>

  new    <job> --kind mv|lore   writers' room: job folder with the step templates
  next   <job>          writers' room: which step is open, what to read first
  parts  <job> draft|final   JSON frame ranges for the parallel render
  assemble <job> <dir>  join part_<k>.mp4 + lay the audio under them -> out/raw.mp4
  voice  <job>          edge-tts -> jobs/<job>/voice.mp3 + words.json (needs internet)
  check  <job>          plan + words against every hard rule (exit 1 on errors)
  props  <job>          write jobs/<job>/out/props.json for the renderer
  finish <job>          loudness-normalise out/raw.mp4 -> out/final.mp4, then QC + contact sheet
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
    if cmd in ("analyze", "lyrics"):
        from . import song

        d = P.job_dir(job)
        if cmd == "analyze":
            print(json.dumps(song.analyze(d), indent=1))
        else:
            cfg = json.loads((d / "analyze.json").read_text(encoding="utf-8"))
            res = song.time_lyrics(d, (d / cfg.get("lyrics", "lyrics.txt")).read_text(encoding="utf-8"),
                                   json.loads((d / "whisper_words.json").read_text(encoding="utf-8")), d / "vocals.ogg")
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
        (out / "props.json").write_text(json.dumps(P.props(plan, words), indent=1, ensure_ascii=False), encoding="utf-8")
        print("props ->", out / "props.json")
        return 0
    if cmd == "finish":
        raw, final = out / "raw.mp4", out / "final.mp4"
        qc.normalize(raw, final)
        expect = words["duration"] + P.TAIL_S if words else None
        res = qc.run(final, expect)
        qc.sheet(final, out / "sheet.jpg")
        (out / "qc.json").write_text(json.dumps(res, indent=1), encoding="utf-8")
        print(json.dumps(res, indent=1))
        return 0 if res["pass"] else 1
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

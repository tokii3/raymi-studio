"""python -m raymi <command> <job>

  voice  <job>          edge-tts -> jobs/<job>/voice.mp3 + words.json (needs internet)
  check  <job>          plan + words against every hard rule (exit 1 on errors)
  props  <job>          write jobs/<job>/out/props.json for the renderer
  finish <job>          loudness-normalise out/raw.mp4 -> out/final.mp4, then QC + contact sheet
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

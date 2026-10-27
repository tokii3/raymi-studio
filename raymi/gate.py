"""The gate: nothing reaches toki past a BLOCK / FAIL (toki 2026-10-25; Watch Me runs 60 / 62 went to her as
"previews" after look-critic FAIL x2 and seven BLOCKs).

    python -m raymi gate <job> <stage> <file..>

<stage> = the prefix of the stored critic answers in jobs/<job>/reviews/ (treatment, script, stills, boards, final ...).
PASS needs: the newest `<stage>_brief-keeper*.md` exists and says VERDICT: PASS; the newest answer of every other critic
for that stage has no BLOCK / FAIL verdict; for a video, out/reality.json has no fault. The files are copied to
deliveries/<job>/<stage>/ with GATE_PASS.json - or GATE_FAIL.json + the reasons. The SendUserFile hook
(.claude/hooks/gate_send.py) only lets pictures / videos out of a folder with GATE_PASS.json, or with GATE_FAIL.json
when the message itself says FAIL.
"""
from __future__ import annotations

import json
import re
import shutil
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOCKED = re.compile(r"^\s*(VERDICT:\s*(BLOCK|FAIL)|BLOCK:|OVERALL:\s*FAIL|RESULT:\s*FAIL)", re.M | re.I)


def _newest(reviews: Path, stage: str) -> dict[str, Path]:
    """critic -> its newest answer for the stage (`<stage>_<critic>_<n>.md`, n highest)."""
    best: dict[str, tuple[int, Path]] = {}
    for f in reviews.glob(f"{stage}_*.md"):
        m = re.match(rf"{re.escape(stage)}_(.+?)(?:_(\d+))?\.md$", f.name)
        if m:
            n = int(m.group(2) or 0)
            if m.group(1) not in best or n > best[m.group(1)][0]:
                best[m.group(1)] = (n, f)
    return {k: v[1] for k, v in best.items()}


def check(job_dir: Path, stage: str, files: list[Path]) -> list[str]:
    reasons = []
    answers = _newest(job_dir / "reviews", stage)
    keeper = answers.pop("brief-keeper", None)
    if not (job_dir / "0_BRIEF.md").is_file():
        reasons.append("no 0_BRIEF.md (toki's words + visible proof) - skill raymi-reading-toki")
    if keeper is None:
        reasons.append(f"no brief-keeper answer for '{stage}' (reviews/{stage}_brief-keeper_<n>.md)")
    elif not re.search(r"VERDICT:\s*PASS", keeper.read_text(encoding="utf-8"), re.I):
        reasons.append(f"brief-keeper did not PASS ({keeper.name})")
    for critic, f in answers.items():
        if BLOCKED.search(f.read_text(encoding="utf-8")):
            reasons.append(f"{critic} BLOCK / FAIL ({f.name})")
    if any(p.suffix.lower() in (".mp4", ".mov", ".webm") for p in files):
        rf = job_dir / "out" / "reality.json"
        if not rf.is_file():
            reasons.append("no out/reality.json - run python -m raymi reality <job> <video>")
        else:
            reasons += [f"reality: {x}" for x in json.loads(rf.read_text(encoding="utf-8")).get("faults", [])]
        # her motion on the real render (toki 2026-10-27, third time "nicht flüssig ... statisch"): stills never showed it
        mf = job_dir / "out" / "motion.json"
        if (job_dir / "shots.json").is_file() and json.loads((job_dir / "shots.json").read_text(encoding="utf-8")).get("vrm"):
            if not mf.is_file():
                reasons.append("no out/motion.json - run the scene probe on the render, then python -m raymi motion <job>")
            else:
                reasons += [f"motion: {x}" for x in json.loads(mf.read_text(encoding="utf-8")).get("faults", [])]
    return reasons


def main(argv: list[str]) -> int:
    """gate <job> <stage> <file..>"""
    from . import plan as P

    job, stage, files = argv[0], argv[1], [Path(x) for x in argv[2:]]
    job_dir = P.job_dir(job)
    reasons = check(job_dir, stage, files)
    out = ROOT / "deliveries" / job / stage
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    for f in files:
        shutil.copy2(f, out / f.name)
    stamp = {"job": job, "stage": stage, "time": time.strftime("%Y-%m-%d %H:%M"), "files": [f.name for f in files],
             "reasons": reasons}
    (out / ("GATE_FAIL.json" if reasons else "GATE_PASS.json")).write_text(json.dumps(stamp, indent=1), encoding="utf-8")
    print(("FAIL - not for toki:" if reasons else "PASS ->"), out)
    for r in reasons:
        print("  ", r)
    return 1 if reasons else 0

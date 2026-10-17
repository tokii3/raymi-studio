"""Writers' room steps: which file comes next, and is the step really done.

A step is done by evidence in the job folder, never by a flag: no TODO left, toki's approval line, or a stored
script-critic answer whose last verdict is PASS (writers_room/README.md).
"""
from __future__ import annotations

import json
import re
import shutil
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
TEMPLATES = REPO / "writers_room" / "templates"
KINDS = ("mv", "lore")

# (step id, file, how it is proven done)
STEPS = {
    "mv": [
        ("dossier", "1_DOSSIER.md", "filled"),
        ("ideas", "2_IDEAS.md", "approved"),
        ("treatment", "3_TREATMENT.md", "critic"),
        ("script", "4_SCRIPT.md", "critic"),
        ("build", None, "studio"),
        ("pilot", None, "studio"),
        ("final", None, "studio"),
    ],
    "lore": [
        ("dossier", "1_DOSSIER.md", "filled"),
        ("ideas", "2_IDEAS.md", "approved"),
        ("plan", "plan.json", "plan"),
    ],
}

APPROVED = re.compile(r"^approved:\s*toki\s+\d{4}-\d{2}-\d{2}\b", re.M)
VERDICT = re.compile(r"^VERDICT:\s*(PASS|BLOCK\b.*)$", re.M)


def job_dir(job: str) -> Path:
    p = Path(job)
    return p if p.is_dir() else REPO / "jobs" / job


def new(job: str, kind: str) -> Path:
    if kind not in KINDS:
        raise ValueError(f"kind must be one of {KINDS}")
    d = job_dir(job)
    if (d / "job.json").exists():
        raise FileExistsError(f"{d} already exists")
    (d / "reviews").mkdir(parents=True, exist_ok=True)
    (d / "boards").mkdir(exist_ok=True)
    for _, fname, how in STEPS[kind]:
        if fname and fname.endswith(".md"):
            shutil.copyfile(TEMPLATES / fname, d / fname)
    (d / "job.json").write_text(json.dumps({"kind": kind, "created": date.today().isoformat()}, indent=1),
                                encoding="utf-8")
    return d


def last_verdict(d: Path, step: str) -> str | None:
    """Verdict of the newest stored script-critic answer for a step (reviews/<step>_<n>.md, n increasing)."""
    files = sorted((d / "reviews").glob(f"{step}_*.md"), key=lambda p: int(re.sub(r"\D", "", p.stem) or 0))
    if not files:
        return None
    found = VERDICT.findall(files[-1].read_text(encoding="utf-8"))
    return found[-1] if found else None


def blocks(d: Path, step: str) -> int:
    return sum(1 for p in (d / "reviews").glob(f"{step}_*.md")
               if any(v.startswith("BLOCK") for v in VERDICT.findall(p.read_text(encoding="utf-8"))))


def step_state(d: Path, step: str, fname: str | None, how: str) -> tuple[bool, str]:
    if how == "studio":
        return False, "studio step (phase 2): not automated yet"
    f = d / fname
    if not f.is_file():
        return False, f"{fname} missing"
    text = f.read_text(encoding="utf-8")
    if how == "plan":
        return True, "plan.json exists - run `python -m raymi check`"
    todos = text.count("TODO")
    if todos:
        return False, f"{todos} TODO left in {fname}"
    if how == "approved" and not APPROVED.search(text):
        return False, "waiting for toki's choice (line `approved: toki YYYY-MM-DD <idea>`)"
    if how == "critic":
        v = last_verdict(d, step)
        if v is None:
            return False, f"script-critic has not judged {fname} (store its answer verbatim in reviews/{step}_<n>.md)"
        if v != "PASS":
            n = blocks(d, step)
            back = " - TWO blocks: back to IDEAS, not a third patch" if n >= 2 else ""
            return False, f"script-critic: {v}{back}"
    return True, "done"


def knowledge(fname: str) -> list[str]:
    t = TEMPLATES / fname
    if not t.is_file():
        return []
    head = t.read_text(encoding="utf-8").split("\n\n", 2)[1] if "\n\n" in t.read_text(encoding="utf-8") else ""
    return re.findall(r"`([^`]+)`", head)


def status(job: str) -> list[tuple[str, bool, str]]:
    d = job_dir(job)
    kind = json.loads((d / "job.json").read_text(encoding="utf-8"))["kind"]
    out, blocked = [], False
    for step, fname, how in STEPS[kind]:
        ok, why = step_state(d, step, fname, how)
        if blocked:
            ok, why = False, "after an open step"
        out.append((step, ok, why))
        blocked = blocked or not ok
    return out


def next_step(job: str) -> str:
    d = job_dir(job)
    kind = json.loads((d / "job.json").read_text(encoding="utf-8"))["kind"]
    files = {s: f for s, f, _ in STEPS[kind]}
    lines = []
    for step, ok, why in status(job):
        lines.append(f"  [{'x' if ok else ' '}] {step:<10} {why}")
    open_steps = [s for s, ok, _ in status(job) if not ok]
    if open_steps:
        s = open_steps[0]
        lines.append(f"\nNEXT: {s}  ({files[s] or 'studio'})  - writers_room/README.md")
        k = knowledge(files[s]) if files[s] else []
        if k:
            lines.append("open first: " + ", ".join(k))
    else:
        lines.append("\nall steps done")
    return "\n".join(lines)

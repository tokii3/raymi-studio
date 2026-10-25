"""Writers' room + studio steps: which file comes next, and is the step really done.

A step is done by evidence in the job folder, never by a flag: no TODO left, toki's approval line, a stored
script-critic answer whose last verdict is PASS, the timeline data, stored screening answers + toki's verdict in
toki.md, the thumbnail candidates + her pick, the upload line (writers_room/README.md).
"""
from __future__ import annotations

import json
import re
import shutil
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
TEMPLATES = REPO / "writers_room" / "templates"
KINDS = ("mv", "lore", "pov")

# (step id, file, how it is proven done). Every kind starts with the brief contract (0_BRIEF.md, toki 2026-10-25:
# her words verbatim, her examples opened into classes, what must be VISIBLE, what is missing) - jobs created
# before 2026-10-25 skip it.
BRIEF_STEP = ("brief", "0_BRIEF.md", "brief")
BRIEF_FROM = "2026-10-25"
STEPS = {
    "mv": [
        ("dossier", "1_DOSSIER.md", "filled"),
        ("ideas", "2_IDEAS.md", "approved"),
        ("treatment", "3_TREATMENT.md", "critic"),
        ("script", "4_SCRIPT.md", "critic"),
        ("build", "shots.json", "built"),
        # toki 2026-10-22: no pilot any more ("frisst zu viel Zeit, zu kurz um das Gesamtvideo zu beurteilen") -
        # a stills board across the WHOLE MV goes to her instead, then the full MV + Short
        ("stills", "toki.md", "stills"),
        ("final", "toki.md", "verdict"),
        ("thumbs", "5_THUMBS.md", "thumbs"),
        ("upload", "upload.md", "upload"),
    ],
    "lore": [
        ("dossier", "1_DOSSIER.md", "filled"),
        ("ideas", "2_IDEAS.md", "approved"),
        ("plan", "plan.json", "plan"),
        ("thumbs", "5_THUMBS.md", "thumbs"),
        ("upload", "upload.md", "upload"),
    ],
    # a talking lore Short in 3D (toki 2026-10-23: "raymi 3d soll mit der kamera interagieren ... die kamera
    # repraesentiert den zuschauer"): her voice + a known music bed, one shooting script, stills, the final
    "pov": [
        ("dossier", "1_DOSSIER.md", "filled"),
        ("ideas", "2_IDEAS.md", "approved"),
        ("script", "4_SCRIPT.md", "critic"),
        ("build", "shots.json", "built"),
        ("stills", "toki.md", "stills"),
        ("final", "toki.md", "verdict"),
        ("thumbs", "5_THUMBS.md", "thumbs"),
        ("upload", "upload.md", "upload"),
    ],
}
# toki 2026-10-19: thumbnails for the MV AND the Short, always 4-5 to choose from
THUMB_FORMATS = {"mv": ("mv", "short"), "lore": ("short",), "pov": ("short",)}
THUMB_MIN = 5     # toki 2026-10-22: 5 thumbnails for the MV and 5 for the Short
STILLS_MIN = 12   # the stills board that replaces the pilot: every act and key moment of the MV
STILLS_MIN_KIND = {"pov": 4}   # a 15-20 s Short: hook, the turn, the payoff, the CTA

APPROVED = re.compile(r"^approved:\s*toki\s+\d{4}-\d{2}-\d{2}\b", re.M)
PICKED = re.compile(r"^picked:\s*toki\s+\d{4}-\d{2}-\d{2}\b", re.M)


def toki_said(text: str, step: str) -> bool:
    """toki.md line `<step>: toki YYYY-MM-DD <her words>`."""
    return re.search(rf"^{step}:\s*toki\s+\d{{4}}-\d{{2}}-\d{{2}}\b", text, re.M) is not None
VERDICT = re.compile(r"^VERDICT:\s*(PASS\b|BLOCK\b.*)", re.M)   # "PASS" alone or "PASS - reason" (brief-keeper)


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
    for _, fname, how in [BRIEF_STEP, *STEPS[kind]]:
        if fname and fname.endswith(".md") and (TEMPLATES / fname).is_file() and not (d / fname).exists():
            shutil.copyfile(TEMPLATES / fname, d / fname)
    if not (d / "toki.md").exists():
        shutil.copyfile(TEMPLATES / "toki.md", d / "toki.md")
    (d / "job.json").write_text(json.dumps({"kind": kind, "created": date.today().isoformat()}, indent=1),
                                encoding="utf-8")
    return d


def last_verdict(d: Path, step: str, critic: str | None = None) -> str | None:
    """Verdict of the newest stored answer for a step: the script-critic's (reviews/<step>_<n>.md, n increasing) or,
    with critic="brief-keeper", toki's advocate's (reviews/<step>_brief-keeper_<n>.md)."""
    pat = f"{step}_{critic}_*.md" if critic else f"{step}_*.md"
    files = sorted((p for p in (d / "reviews").glob(pat) if critic or "brief-keeper" not in p.name),
                   key=lambda p: int(re.sub(r"\D", "", p.stem) or 0))
    if not files:
        return None
    found = VERDICT.findall(files[-1].read_text(encoding="utf-8"))
    return found[-1] if found else None


def blocks(d: Path, step: str) -> int:
    return sum(1 for p in (d / "reviews").glob(f"{step}_*.md")
               if any(v.startswith("BLOCK") for v in VERDICT.findall(p.read_text(encoding="utf-8"))))


def brief_state(f: Path) -> tuple[bool, str]:
    """0_BRIEF.md is done when her words are quoted with a date, every core has a visible proof, and nothing is
    MISSING in the feasibility unless toki accepted it (line `missing ok: toki YYYY-MM-DD ...`)."""
    if not f.is_file():
        return False, "0_BRIEF.md missing - skill raymi-reading-toki (her words, core, classes, visible proof)"
    t = f.read_text(encoding="utf-8")
    if "TODO" in t:
        return False, f"{t.count('TODO')} TODO left in 0_BRIEF.md"
    if not re.search(r"toki\s+\d{4}-\d{2}-\d{2}", t):
        return False, "0_BRIEF.md quotes no dated words of toki"
    if not re.search(r"^- \[[ x]\] C\d", t, re.M):
        return False, "0_BRIEF.md has no visible-proof lines (- [ ] C1 ...)"
    open_x = [x for x in re.findall(r"^- (X\d+)\b.*->\s*ASK\s*$", t, re.M)
              if not re.search(rf"^answered {x}:\s*toki\s+\d{{4}}-", t, re.M)]
    if open_x:
        return False, ("0_BRIEF.md has open conflicts " + ", ".join(open_x) + " between toki's messages - ask her "
                       "(line `answered X1: toki YYYY-MM-DD ...`)")
    if re.search(r"\bMISSING\b", t) and not re.search(r"^missing ok:\s*toki\s+\d{4}-", t, re.M):
        return False, "0_BRIEF.md names something MISSING - tell toki now and solve it (or her line `missing ok: toki ...`)"
    return True, "done"


TOOLKIT = REPO / "canon" / "02_raymi_toolkit.md"
MATRIX_MIN = 8      # rows of the idea matrix: a song has at least this many lines / sections worth a picture


def toolkit_ids() -> list[str]:
    return sorted(set(re.findall(r"^\| (T\d\d) \|", TOOLKIT.read_text(encoding="utf-8"), re.M))) if TOOLKIT.is_file() else []


def ideas_gaps(text: str) -> str:
    """The IDEAS step's homework (toki 2026-10-25: ideas like radar / sonar must appear from the start): an idea matrix
    of >= MATRIX_MIN song rows with real ideas, and every toolkit entry of canon/02 used or skipped with a reason."""
    m = re.search(r"## Idea matrix.*?\n(.*?)(\n## |\Z)", text, re.S)
    rows = [r for r in (m.group(1) if m else "").splitlines()
            if r.startswith("|") and not re.match(r"^\|\s*(time|-)", r) and r.count("|") >= 5
            and len(r.split("|")[4].strip()) > 10]
    if len(rows) < MATRIX_MIN:
        return f"idea matrix has {len(rows)} filled rows - want >= {MATRIX_MIN} (every line x toolkit x medium, 2_IDEAS.md)"
    cov = re.search(r"## Toolkit coverage.*?\n(.*?)(\n## |\Z)", text, re.S)
    missing = [t for t in toolkit_ids() if not re.search(rf"^- {t}\b.{{8,}}", cov.group(1) if cov else "", re.M)]
    if missing:
        return "toolkit coverage misses " + ", ".join(missing) + " (used where, or why not - canon/02_raymi_toolkit.md)"
    return ""


def step_state(d: Path, step: str, fname: str | None, how: str, kind: str = "mv") -> tuple[bool, str]:
    f = d / fname
    if how == "brief":
        return brief_state(f)
    if how == "storyboard":
        from .storyboard import state

        return state(d, kind)
    if how == "built":
        return (True, "done") if f.is_file() else (False, "shots.json missing - the shooting script as data (raymi/timeline.py)")
    if how == "verdict":
        if not list((d / "reviews").glob(f"{step}_*.md")):
            return False, f"not screened yet (critic answers verbatim in reviews/{step}_<critic>_<n>.md)"
        if not f.is_file() or not toki_said(f.read_text(encoding="utf-8"), step):
            return False, f"waiting for toki's verdict (toki.md line `{step}: toki YYYY-MM-DD <her words>`)"
        return True, "done"
    if how == "stills":
        n = len(list((d / "boards").glob("still_*.jpg")))
        want = STILLS_MIN_KIND.get(kind, STILLS_MIN)
        if n < want:
            return False, f"{n} stills in boards/ - want >= {want} across the whole video (boards/still_<nn>.jpg, cloud stills)"
        if not f.is_file() or not toki_said(f.read_text(encoding="utf-8"), "stills"):
            return False, "waiting for toki's verdict on the stills (toki.md line `stills: toki YYYY-MM-DD <her words>`)"
        return True, "done"
    if how == "thumbs":
        boards = d / "boards"
        for fmt in THUMB_FORMATS.get(kind, ("mv", "short")):
            n = len(list(boards.glob(f"thumb_{fmt}_*.jpg")))
            if n < THUMB_MIN:
                return False, f"{n} {fmt} thumbnail(s) in boards/ - want {THUMB_MIN} (thumb_{fmt}_<id>.jpg, cloud stills)"
        if not list((d / "reviews").glob("thumbs_*.md")):
            return False, "thumb-critic has not judged them (reviews/thumbs_<n>.md)"
        if not f.is_file() or not PICKED.search(f.read_text(encoding="utf-8")):
            return False, "waiting for toki's pick (5_THUMBS.md line `picked: toki YYYY-MM-DD MV=.. SHORT=..`)"
        return True, "done"
    if how == "upload":
        if not f.is_file() or "TODO" in f.read_text(encoding="utf-8"):
            return False, "upload.md missing or has TODO (canon/12_titles_descriptions.md, raymi/channel_rules.py)"
        t = d / "toki.md"
        if not t.is_file() or not toki_said(t.read_text(encoding="utf-8"), "uploaded"):
            return False, "waiting for toki's upload (toki.md line `uploaded: toki YYYY-MM-DD ...`)"
        return True, "done"
    if not f.is_file():
        return False, f"{fname} missing"
    text = f.read_text(encoding="utf-8")
    if how == "plan":
        return True, "plan.json exists - run `python -m raymi check`"
    todos = text.count("TODO")
    if todos:
        return False, f"{todos} TODO left in {fname}"
    if how == "approved" and uses_brief(d):
        bad = ideas_gaps(text)
        if bad:
            return False, bad
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
        if uses_brief(d):
            k = last_verdict(d, step, "brief-keeper")
            if k != "PASS":
                return False, (f"brief-keeper has not passed {fname} against toki's words "
                               f"(reviews/{step}_brief-keeper_<n>.md){': ' + k if k else ''}")
    return True, "done"


def knowledge(fname: str) -> list[str]:
    t = TEMPLATES / fname
    if not t.is_file():
        return []
    head = t.read_text(encoding="utf-8").split("\n\n", 2)[1] if "\n\n" in t.read_text(encoding="utf-8") else ""
    return re.findall(r"`([^`]+)`", head)


def uses_brief(d: Path) -> bool:
    return json.loads((d / "job.json").read_text(encoding="utf-8")).get("created", "") >= BRIEF_FROM


STORYBOARD_STEP = ("storyboard", "storyboard.json", "storyboard")


def steps(d: Path) -> list[tuple[str, str, str]]:
    """Brief-era jobs: the brief first, and a storyboard of pictures (reference + previz / plan) between the script and
    the build (toki 2026-10-25: she judges pictures, the first pictures must not come out of the build)."""
    kind = json.loads((d / "job.json").read_text(encoding="utf-8"))["kind"]
    if not uses_brief(d):
        return STEPS[kind]
    out = [BRIEF_STEP]
    for st in STEPS[kind]:
        if st[0] == "build":
            out.append(STORYBOARD_STEP)
        out.append(st)
    return out


def status(job: str) -> list[tuple[str, bool, str]]:
    d = job_dir(job)
    kind = json.loads((d / "job.json").read_text(encoding="utf-8"))["kind"]
    out, blocked = [], False
    for step, fname, how in steps(d):
        ok, why = step_state(d, step, fname, how, kind)
        if blocked:
            ok, why = False, "after an open step"
        out.append((step, ok, why))
        blocked = blocked or not ok
    return out


def next_step(job: str) -> str:
    d = job_dir(job)
    kind = json.loads((d / "job.json").read_text(encoding="utf-8"))["kind"]
    files = {s: f for s, f, _ in steps(d)}
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

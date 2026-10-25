"""SessionStart hook: tells every session (main checkout, worktree, resume, after compaction) where the studio REALLY
stands before it plans anything. Why (toki 2026-10-24): sessions started from zero - a worktree branched from a
stale local main, the newest handoff was not read, PROGRESS was not strictly newest-first. Kept short on purpose
(budget): it points at files, it does not paste them. Never fails the session: every step is best effort."""
import json
import re
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def git(*args: str, timeout: int = 15) -> str:
    try:
        r = subprocess.run(["git", "-C", str(REPO), *args], capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip() if r.returncode == 0 else ""
    except (OSError, subprocess.TimeoutExpired):
        return ""


lines = ["RAYMI STUDIO BRIEFING (auto). FIRST load skill raymi-reading-toki (her examples are samples of a class, her "
         "'etc' is open), then raymi-video-production (map + acceptance list). Area skills, load when you work on that "
         "area: raymi-idea-story, raymi-camera, raymi-posing-acting, raymi-editing, raymi-2d-techniques, "
         "raymi-light-color, raymi-composition, raymi-lyrics-type, raymi-screening, raymi-references, "
         "raymi-shorts-thumbs-upload. Makers: camera-director, choreographer, editor, look-designer; toki's advocate: "
         "brief-keeper. The bar = professional references (knowledge/references), never our own videos. Nothing goes "
         "to toki without `python -m raymi gate`."]

git("fetch", "--quiet", "origin", "main", timeout=20)
branch = git("rev-parse", "--abbrev-ref", "HEAD") or "?"
behind = git("rev-list", "--count", "HEAD..origin/main")
if behind and behind != "0":
    lines.append(f"WARNING: branch '{branch}' is {behind} commits BEHIND origin/main - run `git merge origin/main` "
                 "(or `git pull` on main) BEFORE reading or changing anything; you would work on an old state.")
else:
    lines.append(f"Branch '{branch}' is up to date with origin/main (as far as the fetch could tell).")

# newest handoffs on origin/main (the last sessions' root causes, tools, open items)
names = git("ls-tree", "--name-only", "origin/main", "knowledge/").splitlines()
handoffs = sorted((n for n in names if Path(n).name.startswith("HANDOFF_")), reverse=True)[:3]
if handoffs:
    lines.append("Read the newest handoff(s) first: " + ", ".join(handoffs))

# sessions in flight: claude/* branches with commits not on main, touched in the last 3 days
inflight = []
for ref in git("for-each-ref", "--format=%(refname:short) %(committerdate:relative)",
               "--sort=-committerdate", "refs/remotes/origin/claude/").splitlines()[:8]:
    name = ref.split(" ")[0]
    ahead = git("rev-list", "--count", f"origin/main..{name}")
    if ahead and ahead != "0" and re.search(r"(minute|hour|day)s? ago", ref) and not re.search(r"\b([4-9]|\d\d) days", ref):
        inflight.append(f"{name} (+{ahead}, {ref.split(' ', 1)[1]})")
if inflight:
    lines.append("Sessions in flight (not on main yet): " + "; ".join(inflight))

# jobs where toki's verdict is still open (placeholder lines in toki.md), newest first
open_jobs = []
for toki in sorted(REPO.glob("jobs/*/toki.md"), reverse=True)[:12]:
    try:
        text = toki.read_text(encoding="utf-8")
    except OSError:
        continue
    try:
        status = json.loads((toki.parent / "job.json").read_text(encoding="utf-8")).get("status", "")
    except (OSError, ValueError):
        status = ""
    if status != "stopped" and not re.search(r"^(final|uploaded): toki 20", text, re.M):
        open_jobs.append(toki.parent.name)
if open_jobs:
    lines.append("Jobs with open toki verdicts: " + ", ".join(open_jobs[:6]))
    # her core for the newest open job, verbatim - the goal must never get lost under fixes
    brief = REPO / "jobs" / open_jobs[0] / "0_BRIEF.md"
    if brief.is_file():
        m = re.search(r"## Core.*?\n(.*?)(\n## |\Z)", brief.read_text(encoding="utf-8"), re.S)
        if m:
            lines.append(f"toki's core for {open_jobs[0]} (verbatim, re-read before every step):\n" + m.group(1).strip())

lines.append("PROGRESS.md: newest entry at the TOP. End of session: toki's words -> jobs/<job>/toki.md, lesson -> a "
             "check / part (not prose), PROGRESS on top, commit + push to main.")

print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "\n".join(lines)}}))

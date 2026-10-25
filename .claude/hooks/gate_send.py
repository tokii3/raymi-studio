"""PreToolUse hook on SendUserFile: pictures and videos reach toki only through the gate (python -m raymi gate).

Allowed: a media file inside a folder with GATE_PASS.json; or with GATE_FAIL.json when the caption says FAIL (toki asked
to see it anyway - then the faults go with it). Everything else is refused with the reason (exit 2 = blocked,
stderr is shown to Claude). Non-media files (upload.md, notes) pass.
"""
import json
import sys
from pathlib import Path

MEDIA = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".webm"}

data = json.load(sys.stdin)
inp = data.get("tool_input") or {}
caption = str(inp.get("caption") or "")
cwd = Path(data.get("cwd") or ".")
bad = []
for f in inp.get("files") or []:
    p = Path(f)
    p = p if p.is_absolute() else cwd / p
    if p.suffix.lower() not in MEDIA:
        continue
    if (p.parent / "GATE_PASS.json").is_file():
        continue
    if (p.parent / "GATE_FAIL.json").is_file() and "FAIL" in caption:
        continue
    bad.append(str(f))
if bad:
    print("GATE: these pictures / videos have not passed the gate: " + ", ".join(bad) + ". Run `python -m raymi gate "
          "<job> <stage> <files>` (brief-keeper PASS, no critic BLOCK, no reality fault). If toki asked to see a "
          "failed one, send it from its deliveries folder with FAIL and the reasons in the caption.", file=sys.stderr)
    sys.exit(2)
sys.exit(0)

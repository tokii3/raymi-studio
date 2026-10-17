"""Parallel render: split a job into frame ranges (one per worker) and join the rendered parts again.

Workers render their range muted (`node render.mjs <job> --frames a-b --muted --out part_k.mp4`); the audio is laid
under the joined picture once, so there is no AAC seam at part borders.
"""
from __future__ import annotations

import json
import math
import re
import subprocess
from pathlib import Path

PART_FRAMES = {"draft": 240, "final": 150}   # frames per worker; final frames cost ~4x a half-size draft frame
MAX_PARTS = 20                                 # GitHub's concurrent job limit for a free private repo


def split(total: int, size: int, max_parts: int = MAX_PARTS) -> list[tuple[int, int]]:
    """Inclusive frame ranges covering 0..total-1, at most max_parts, as even as possible."""
    if total <= 0:
        raise ValueError("nothing to render")
    n = min(max_parts, max(1, math.ceil(total / size)))
    step = math.ceil(total / n)
    return [(a, min(a + step, total) - 1) for a in range(0, total, step)]


def matrix(props_file: Path, quality: str) -> list[dict]:
    total = json.loads(props_file.read_text(encoding="utf-8"))["durationInFrames"]
    return [{"part": i, "frames": f"{a}-{b}"} for i, (a, b) in enumerate(split(total, PART_FRAMES[quality]))]


def _run(cmd: list[str]) -> None:
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-2000:])


def audio_source(job_dir: Path, props: dict) -> tuple[Path | None, list[str]]:
    """Which sound goes under the picture: a lore Short's voice, or a music video's song window (props.audio)."""
    a = props.get("audio")
    if a:
        src = job_dir / a["file"]                    # staged copy (cloud workers) ...
        if not src.is_file():
            src = Path(__file__).resolve().parents[1] / a["src"]   # ... or the song in its own job folder
        return src, ["-ss", f"{a['from']:.3f}", "-t", f"{a['to'] - a['from']:.3f}"]
    if props.get("voice"):
        return job_dir / props["voice"], []
    return None, []


def assemble(job_dir: Path, parts_dir: Path) -> Path:
    """part_<k>.mp4 (k = 0..n-1, no gaps) -> out/raw.mp4 with the job's audio under it."""
    parts = sorted(parts_dir.glob("part_*.mp4"), key=lambda p: int(re.sub(r"\D", "", p.stem)))
    ks = [int(re.sub(r"\D", "", p.stem)) for p in parts]
    if not parts or ks != list(range(len(parts))):
        raise RuntimeError(f"parts missing or out of order: {ks}")
    out = job_dir / "out"
    out.mkdir(exist_ok=True)
    listing = out / "parts.txt"
    listing.write_text("".join(f"file '{p.resolve().as_posix()}'\n" for p in parts), encoding="utf-8")
    video = out / "video.mp4"
    _run(["ffmpeg", "-y", "-hide_banner", "-f", "concat", "-safe", "0", "-i", str(listing), "-c", "copy", str(video)])
    props = json.loads((out / "props.json").read_text(encoding="utf-8"))
    raw = out / "raw.mp4"
    audio, trim = audio_source(job_dir, props)
    if audio and audio.is_file():
        # audio padded with silence to the picture's length (the plan's tail after the last word); a music video
        # takes its window of the song (-ss / -t before the input = sample exact)
        _run(["ffmpeg", "-y", "-hide_banner", "-i", str(video), *trim, "-i", str(audio), "-map", "0:v", "-map", "1:a",
              "-c:v", "copy", "-af", "apad", "-shortest", "-c:a", "aac", "-b:a", "192k", str(raw)])
    else:
        video.replace(raw)
    return raw

"""Hard checks on a finished video + loudness normalisation. Measures pixels and sound, never trusts the plan."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

TARGET_LUFS, TP_MAX = -14.0, -1.0


def _run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-2000:])
    return p.stdout + p.stderr


def loudness(path: Path) -> dict:
    out = _run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "loudnorm=print_format=json", "-f", "null", "-"])
    return json.loads(out[out.rindex("{"):out.rindex("}") + 1])


def normalize(src: Path, dst: Path) -> None:
    """Two-pass loudnorm to -14 LUFS / -1.5 dBTP, picture copied untouched."""
    m = loudness(src)
    af = (f"loudnorm=I={TARGET_LUFS}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
          # a true-peak safety net (FIRESTARTER pilot 2026-10-19: -0.82 dBTP after AAC): a 4x oversampled limiter at -2 dBFS
          ",aresample=192000,alimiter=limit=0.79:attack=1:release=50:level=disabled,aresample=48000")
    _run(["ffmpeg", "-y", "-hide_banner", "-i", str(src), "-c:v", "copy", "-af", af, "-ar", "48000",
          "-c:a", "aac", "-b:a", "192k", str(dst)])


def probe(path: Path) -> dict:
    out = _run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)])
    return json.loads(out[out.index("{"):])


def freezes(path: Path, min_s: float = 1.2) -> list[tuple[float, float]]:
    out = _run(["ffmpeg", "-hide_banner", "-i", str(path), "-vf", f"freezedetect=n=0.002:d={min_s}", "-an", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", out)]
    durs = [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", out)]
    return list(zip(starts, durs))


def sheet(path: Path, dst: Path, fps: float = 2.0) -> None:
    _run(["ffmpeg", "-y", "-hide_banner", "-i", str(path), "-vf",
          f"fps={fps},scale=270:-1,tile=8x5:padding=4:color=0x14141a", "-frames:v", "1", str(dst)])


def run(video: Path, expect_s: float | None = None, landscape: bool = False) -> dict:
    info = probe(video)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = [s for s in info["streams"] if s["codec_type"] == "audio"]
    dur = float(info["format"]["duration"])
    res = {"file": video.name, "width": v["width"], "height": v["height"], "duration": round(dur, 2),
           "fps": v.get("r_frame_rate"), "checks": {}}
    c = res["checks"]
    ar = v["width"] / v["height"]
    if landscape:
        c["landscape_16x9"] = abs(ar - 16 / 9) < 0.01
        res["full_res"] = v["width"] == 1920 and v["height"] == 1080
    else:
        c["portrait_9x16"] = abs(ar - 9 / 16) < 0.01
        res["full_res"] = v["width"] == 1080 and v["height"] == 1920   # drafts render at half size
    c["has_audio"] = bool(a)
    if a:
        m = loudness(video)
        res["lufs"], res["true_peak"] = float(m["input_i"]), float(m["input_tp"])
        c["loudness_-14"] = abs(res["lufs"] - TARGET_LUFS) <= 1.0
        c["true_peak_<=-1"] = res["true_peak"] <= TP_MAX
    if expect_s:
        c["duration_matches_plan"] = abs(dur - expect_s) < 0.5
    fr = freezes(video)
    res["frozen_spans"] = fr
    c["no_frozen_picture_>1.2s"] = not fr
    res["pass"] = all(c.values())
    return res

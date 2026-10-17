"""Parallel render: ranges cover every frame exactly once; joined parts keep length and get the audio once."""
import json
import shutil
import subprocess

import pytest

from raymi import parts


@pytest.mark.parametrize("total,size", [(1, 240), (600, 240), (601, 240), (4050, 150), (99999, 150)])
def test_split_covers_every_frame_once(total, size):
    r = parts.split(total, size)
    assert len(r) <= parts.MAX_PARTS
    covered = [f for a, b in r for f in range(a, b + 1)]
    assert covered == list(range(total))


def test_split_refuses_empty():
    with pytest.raises(ValueError):
        parts.split(0, 240)


def _dur(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True).stdout
    return float(out)


def _streams(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True).stdout
    return sorted(out.split())


@pytest.mark.skipif(not shutil.which("ffmpeg"), reason="ffmpeg not installed")
def test_assemble_joins_parts_and_adds_audio(tmp_path):
    job = tmp_path / "job"
    (job / "out").mkdir(parents=True)
    pd = tmp_path / "parts"
    pd.mkdir()
    for k in range(3):   # three 1 s muted parts, like the workers deliver them
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"color=c=0x{k}0{k}0{k}0:s=64x112:r=30:d=1",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", str(pd / f"part_{k}.mp4")], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=f=440:d=2.3",
                    str(job / "voice.mp3")], check=True)
    (job / "out" / "props.json").write_text(json.dumps({"voice": "voice.mp3", "durationInFrames": 90}))
    raw = parts.assemble(job, pd)
    assert abs(_dur(raw) - 3.0) < 0.1           # picture length wins, audio padded
    assert _streams(raw) == ["audio", "video"]


def test_assemble_refuses_a_missing_part(tmp_path):
    (tmp_path / "job" / "out").mkdir(parents=True)
    pd = tmp_path / "parts"
    pd.mkdir()
    (pd / "part_0.mp4").write_bytes(b"x")
    (pd / "part_2.mp4").write_bytes(b"x")
    with pytest.raises(RuntimeError, match="missing"):
        parts.assemble(tmp_path / "job", pd)

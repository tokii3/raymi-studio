"""Screening: what a critic LOOKS at, made the way a real viewer sees it (LESSONS 1.2: blind QC measured proxies).

`python -m raymi screen <job> [video]` (cloud, after assemble) writes a critic kit:

    kit/view/first_glance.jpg   frame 0 and the frame at 0.5 s at phone size + the 168 px feed thumbnail
    kit/view/phone_NN.jpg       the whole video at 2 fps, phone-size tiles with time stamps
    kit/view/gray_NN.jpg        1 fps in grayscale (does the subject separate by value? craft module 01)
    kit/view/seq_NN.jpg         2 s windows at 12 fps (real motion: smears, holds, pops - module 04)
    kit/view/full_NN.jpg        one full-resolution frame per shot (detail, edges, faces, text - module 12)
    kit/facts/facts.json        measured HINTS for the craft critics, never a verdict
    kit/script/shots.json       the shooting script's shots (time, what + why) - only for the shot-by-shot critics,
                                NEVER for the blind viewer

The blind viewer gets only view/ (no captions, no intention). Answers of the critic agents (.claude/agents) are stored
verbatim in jobs/<job>/reviews/; the builder never writes or edits one (hard rule 3).
Everything is plain ffmpeg + numpy, so the kit builds on any runner.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np

PHONE_W = {"v": 300, "h": 390}      # how big a frame is on a phone (9:16 full screen, 16:9 in the feed)
THUMB_W = 168                       # mobile home / suggested column thumbnail
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"   # time stamps only (never on screen in a video)


def _run(cmd: list[str]) -> bytes:
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0:
        raise RuntimeError(p.stderr.decode(errors="replace")[-1500:])
    return p.stdout


def probe(video: Path) -> dict:
    out = json.loads(_run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(video)]))
    v = next(s for s in out["streams"] if s["codec_type"] == "video")
    num, den = (int(x) for x in v.get("r_frame_rate", "30/1").split("/"))
    return {"w": int(v["width"]), "h": int(v["height"]), "fps": num / max(den, 1), "dur": float(out["format"]["duration"])}


def _stamp(fontfile: str | None) -> str:
    if not fontfile or not Path(fontfile).is_file():
        return ""
    return (f",drawtext=fontfile={fontfile}:text='%{{pts\\:hms}}':x=6:y=6:fontsize=14:fontcolor=white"
            ":box=1:boxcolor=black@0.6:boxborderw=3")


def tile_cmd(video: Path, out_pattern: Path, fps: float, width: int, cols: int, rows: int, gray: bool = False,
             start: float | None = None, dur: float | None = None, fontfile: str | None = FONT) -> list[str]:
    """ffmpeg command: frames at `fps`, scaled to `width`, time-stamped, tiled cols x rows per sheet."""
    vf = f"fps={fps},scale={width}:-2" + (",format=gray,format=yuv420p" if gray else "") + _stamp(fontfile) + \
         f",tile={cols}x{rows}:padding=4:margin=4:color=0x121218"
    cmd = ["ffmpeg", "-y", "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{start:.3f}"]
    cmd += ["-i", str(video)]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    return cmd + ["-vf", vf, "-q:v", "3", "-fps_mode", "vfr", str(out_pattern)]


def frame_at(video: Path, t: float, width: int | None, out: Path) -> None:
    vf = ["-vf", f"scale={width}:-2"] if width else []
    _run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1", *vf, "-q:v", "2", str(out)])


def small_frames(video: Path, w: int = 96, h: int = 54) -> np.ndarray:
    """Every frame at 96x54 grayscale as an array (n, h, w) - for picture-change measurements."""
    raw = _run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"scale={w}:{h},format=gray", "-f", "rawvideo", "-"])
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def change_curve(frames: np.ndarray) -> np.ndarray:
    """Mean absolute frame-to-frame difference (0..255) per frame; frame 0 = 0."""
    if len(frames) < 2:
        return np.zeros(len(frames))
    return np.r_[0.0, np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))]


def change_on_hits(curve: np.ndarray, hits: list[int], win: int = 2, thr: float | None = None) -> dict:
    """How many loud music hits get a picture change within +-win frames (a hint: dance ~80 %, story ~45 %)."""
    if not hits:
        return {"hits": 0, "changed": 0, "share": None}
    thr = thr if thr is not None else max(6.0, float(np.percentile(curve, 75)))
    changed = sum(1 for h in hits if curve[max(0, h - win):h + win + 1].max(initial=0) >= thr)
    return {"hits": len(hits), "changed": changed, "share": round(changed / len(hits), 2), "threshold": round(thr, 1)}


def dead_spans(curve: np.ndarray, fps: float, thr: float = 1.0, min_s: float = 2.0) -> list[list[float]]:
    """Spans where almost nothing moves (mean change < thr) for >= min_s - candidates for a slideshow feel."""
    out, i, n = [], 0, len(curve)
    while i < n:
        if curve[i] < thr:
            j = i
            while j < n and curve[j] < thr:
                j += 1
            if (j - i) / fps >= min_s:
                out.append([round(i / fps, 2), round(j / fps, 2)])
            i = j
        else:
            i += 1
    return out


def build(video: Path, out: Path, props: dict | None = None, spec: dict | None = None, fontfile: str | None = FONT) -> Path:
    view, facts_dir, script_dir = out / "view", out / "facts", out / "script"
    for d in (view, facts_dir, script_dir):
        d.mkdir(parents=True, exist_ok=True)
    info = probe(video)
    vert = info["h"] > info["w"]
    pw = PHONE_W["v" if vert else "h"]
    # first glance: what a swiper perceives before reading
    for name, t, w in (("fg_0", 0.0, pw), ("fg_1", min(0.5, info["dur"] / 2), pw), ("fg_t", min(0.5, info["dur"] / 2), THUMB_W)):
        frame_at(video, t, w, view / f"{name}.jpg")
    hb = 2 * round(info["h"] * pw / info["w"] / 2)          # the phone tiles' height; the thumbnail is padded to it
    _run(["ffmpeg", "-y", "-v", "error", "-i", str(view / "fg_0.jpg"), "-i", str(view / "fg_1.jpg"), "-i", str(view / "fg_t.jpg"),
          "-filter_complex", f"[2]pad=iw+8:{hb}:8:0:color=0x121218[t];[0]pad=iw+8:ih:0:0:color=0x121218[a];[a][1][t]hstack=inputs=3",
          "-q:v", "2", str(view / "first_glance.jpg")])
    for f in ("fg_0", "fg_1", "fg_t"):
        (view / f"{f}.jpg").unlink(missing_ok=True)
    cols = 6 if vert else 4
    tw = pw // 2 if vert else int(pw / 1.5)
    _run(tile_cmd(video, view / "phone_%02d.jpg", 2, tw, cols, 4, fontfile=fontfile))
    _run(tile_cmd(video, view / "gray_%02d.jpg", 1, tw, cols, 4, gray=True, fontfile=fontfile))
    # motion: 2 s windows at 12 fps, about one per 6 s, at most 10
    n_seq = int(min(10, max(1, info["dur"] // 6)))
    for j, t0 in enumerate(np.linspace(0, max(0.0, info["dur"] - 2.0), n_seq)):
        _run(tile_cmd(video, view / f"seq_{j:02d}.jpg", 12, 200 if vert else 260, 12 if vert else 8, 3,
                      start=float(t0), dur=2.0, fontfile=fontfile))
    # shots: the script's shots if we know them, else measured cuts
    fps = info["fps"]
    if props and props.get("shots"):
        bounds = [s["from"] / fps for s in props["shots"]] + [props["durationInFrames"] / fps]
    else:
        curve0 = change_curve(small_frames(video))
        bounds = [0.0] + [i / fps for i in range(1, len(curve0)) if curve0[i] > 40] + [info["dur"]]
    mids = [(a + b) / 2 for a, b in zip(bounds, bounds[1:]) if b > a]
    if len(mids) > 16:
        mids = [mids[int(i)] for i in np.linspace(0, len(mids) - 1, 16)]
    for j, t in enumerate(mids):
        frame_at(video, t, None, view / f"full_{j:02d}.jpg")
    curve = change_curve(small_frames(video))
    lens = [round(b - a, 2) for a, b in zip(bounds, bounds[1:]) if b > a]
    arr = np.array(lens) if lens else np.array([info["dur"]])
    from . import qc
    facts = {
        "video": video.name, "size": [info["w"], info["h"]], "fps": round(fps, 2), "duration_s": round(info["dur"], 2),
        "shot_starts_s": [round(b, 2) for b in bounds[:-1]], "shot_lengths_s": lens,
        "shot_rhythm": {"n": len(lens), "mean_s": round(float(arr.mean()), 2),
                        "cv": round(float(arr.std() / max(arr.mean(), 1e-6)), 2),
                        "note": "cv ~0 = metronome, high cv = long holds next to bursts (craft module 03)"},
        "picture_change_on_hits": change_on_hits(curve, (props or {}).get("hits", [])),
        "still_spans_s": dead_spans(curve, fps),
        "audio": _safe(lambda: {k: qc.loudness(video)[k] for k in ("input_i", "input_tp")}),
        "hint": "Measured hints only. They never prove an effect - the critic describes what is REALLY there.",
    }
    (facts_dir / "facts.json").write_text(json.dumps(facts, indent=1), encoding="utf-8")
    if spec and props:
        rows = []
        for s_in, s in zip(spec.get("shots", []), props["shots"]):
            rows.append({"id": s["id"], "from_s": round(s["from"] / fps, 2), "to_s": round(s["to"] / fps, 2),
                         "set": s["set"], "why": s_in.get("why", ""),
                         "words": " ".join(w["w"] for w in s["words"]), "transition_out": s["transition"]["kind"]})
        (script_dir / "shots.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False), encoding="utf-8")
    return out


def _safe(fn):
    try:
        return fn()
    except Exception as e:      # noqa: BLE001 - facts are hints, never block the kit
        return {"error": str(e)[:200]}


def screen_job(job_dir: Path, video: Path | None = None) -> Path:
    video = video or job_dir / "out" / "final.mp4"
    props_f = job_dir / "out" / "props.json"
    props = json.loads(props_f.read_text(encoding="utf-8")) if props_f.is_file() else None
    spec_f = job_dir / "shots.json"
    spec = json.loads(spec_f.read_text(encoding="utf-8")) if spec_f.is_file() else None
    return build(video, job_dir / "out" / "kit", props, spec)

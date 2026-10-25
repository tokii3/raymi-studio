"""Gemini as a second pair of eyes that WATCHES video (toki 2026-10-25: "gemini api ... um arbeit auszulagern").

Why: Claude's critics only see stills; Gemini watches a YouTube video (with offsets) or a local mp4 with motion and
sound, and it costs nothing from toki's Claude limit. Used for the professional reference library
(knowledge/references/) and for a first watch of our own renders. Its answers are stored verbatim, never edited.

Key: GEMINI_API_KEY from the environment, the studio's .env or C:\\raymi\\.env (never printed, never committed).
Verified 2026-10-25: gemini-3.7-flash described FIRESTARTER 1:43-1:55 in line with the frame-by-frame study.
"""
from __future__ import annotations

import json
import mimetypes
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://generativelanguage.googleapis.com"
# newest first; a 503 (high demand) or 404 (retired) falls through to the next
MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"]
ROOT = Path(__file__).resolve().parent.parent


def _key() -> str:
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"].strip()
    for env in (ROOT / ".env", Path(r"C:\raymi-studio\.env"), Path(r"C:\raymi\.env")):
        if env.is_file():
            for line in env.read_text(encoding="utf-8").splitlines():
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("GEMINI_API_KEY missing (env or .env)")


def _post(url: str, body: bytes, headers: dict, timeout: int = 600) -> dict:
    req = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def upload(path: Path) -> str:
    """A local video / image -> Files API uri (waits until it is ACTIVE)."""
    key, data = _key(), path.read_bytes()
    mime = mimetypes.guess_type(path.name)[0] or "video/mp4"
    start = urllib.request.Request(
        f"{API}/upload/v1beta/files?key={key}",
        data=json.dumps({"file": {"display_name": path.name}}).encode(),
        headers={"X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
                 "X-Goog-Upload-Header-Content-Length": str(len(data)),
                 "X-Goog-Upload-Header-Content-Type": mime, "Content-Type": "application/json"})
    with urllib.request.urlopen(start, timeout=120) as r:
        up_url = r.headers["X-Goog-Upload-URL"]
    f = _post(up_url, data, {"X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize",
                             "Content-Length": str(len(data))})["file"]
    for _ in range(120):
        if f.get("state") == "ACTIVE":
            return f["uri"]
        time.sleep(5)
        with urllib.request.urlopen(f"{API}/v1beta/{f['name']}?key={key}", timeout=60) as r:
            f = json.load(r)
    raise SystemExit(f"upload of {path.name} never became ACTIVE")


def media_part(src: str, start: float | None = None, end: float | None = None, fps: float | None = None) -> dict:
    """A YouTube URL or a local file as a content part, optionally clipped to [start, end] seconds."""
    if src.startswith("http"):
        part: dict = {"file_data": {"file_uri": src}}
    else:
        p = Path(src)
        part = {"file_data": {"file_uri": upload(p), "mime_type": mimetypes.guess_type(p.name)[0] or "video/mp4"}}
    meta = {}
    if start is not None:
        meta["start_offset"] = f"{start:g}s"
    if end is not None:
        meta["end_offset"] = f"{end:g}s"
    if fps:
        meta["fps"] = fps
    if meta:
        part["video_metadata"] = meta
    return part


def ask(prompt: str, parts: list[dict] | None = None, models: list[str] | None = None,
        config: dict | None = None) -> tuple[str, str]:
    """-> (answer text, model used). Retries busy models, falls through retired ones. config = generationConfig
    (e.g. {"mediaResolution": "MEDIA_RESOLUTION_LOW", "responseMimeType": "application/json"})."""
    key = _key()
    req = {"contents": [{"parts": [*(parts or []), {"text": prompt}]}]}
    if config:
        req["generationConfig"] = config
    body = json.dumps(req).encode()
    last = ""
    order = models or sorted(MODELS, key=lambda m: m != _sticky[0])   # the model that answered last goes first
    for rnd in range(3):                                               # busy (503 / 429): next model, then rounds
        for model in order:
            try:
                r = _post(f"{API}/v1beta/models/{model}:generateContent?key={key}", body,
                          {"Content-Type": "application/json"})
                text = "".join(p.get("text", "") for p in r["candidates"][0]["content"]["parts"])
                _sticky[0] = model
                return text, model
            except urllib.error.HTTPError as e:
                last = f"{model}: {e.code}"
                if e.code not in (429, 500, 503):
                    order = [m for m in order if m != model]           # retired / refused: drop it
            except (urllib.error.URLError, TimeoutError) as e:
                last = f"{model}: {e}"
        time.sleep(30 * (rnd + 1))
    raise SystemExit(f"no Gemini model answered ({last})")


_sticky = [MODELS[1]]


def main(argv: list[str]) -> int:
    """gemini <src: youtube url | file> [--start s] [--end s] [--fps n] --prompt <text | @file> [--out file]"""
    import argparse

    a = argparse.ArgumentParser(prog="raymi gemini")
    a.add_argument("src", nargs="?")
    a.add_argument("--start", type=float)
    a.add_argument("--end", type=float)
    a.add_argument("--fps", type=float)
    a.add_argument("--prompt", required=True)
    a.add_argument("--out")
    o = a.parse_args(argv)
    prompt = Path(o.prompt[1:]).read_text(encoding="utf-8") if o.prompt.startswith("@") else o.prompt
    parts = [media_part(o.src, o.start, o.end, o.fps)] if o.src else []
    text, model = ask(prompt, parts)
    head = f"<!-- gemini {model}, {o.src or 'text'} {o.start or ''}-{o.end or ''}, verbatim -->\n"
    if o.out:
        Path(o.out).parent.mkdir(parents=True, exist_ok=True)
        Path(o.out).write_text(head + text, encoding="utf-8")
        print("->", o.out)
    else:
        print(head + text)
    return 0

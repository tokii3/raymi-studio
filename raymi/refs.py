"""The professional reference library (toki 2026-10-25: "den kritiker bitte nicht an unseren videos messen sondern an
ähnlichen professionellen videos ... 20 oder 30 videos als referenz für verschiedene scenen, kameras, emotionen,
schnell, langsam").

knowledge/references/catalog.json   the videos (YouTube ids verified)
knowledge/references/analysis/      Gemini's answer per video, verbatim (it WATCHES the video)
knowledge/references/segments.json  every segment of every video with tags -> `refs find`
knowledge/references/frames/        3 stills per segment, LOCAL only (gitignored: not our footage, never published)

Makers (camera / choreo / edit / look agents) pick the segments that match a moment; critics put our frame next to
the reference frame (`refs pair`) and judge the gap. Our own videos are never the bar.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from . import gemini

ROOT = Path(__file__).resolve().parent.parent
REFS = ROOT / "knowledge" / "references"
CACHE = REFS / ".cache"
FRAMES = REFS / "frames"

FACETS = {
    "shot": "ecu cu mcu ms full wide extreme_wide insert",
    "angle": "eye low high overhead worm dutch pov ots profile back",
    "move": "static push_in pull_out orbit crane_up crane_down whip track_lateral track_with handheld crash_zoom "
            "dolly_zoom oner roll float",
    "lens_play": "none gaze_to_lens hand_to_lens lean_in cover_lens kiss wink point_at_lens pose_to_lens "
                 "walk_into_lens look_back_over_shoulder ignores_lens",
    "tempo": "slow medium fast burst",
    "transition_out": "hard_cut match_cut whip cover flash morph through_object smash_cut dissolve continuous",
    "light": "dark_key high_key rim_only self_glow neon silhouette two_colour flat",
}

PROMPT = """You are a music-video director analysing a professional video shot by shot for a reference library.
Watch the whole video (picture AND sound). Split it into segments: a new segment at every cut, or every ~3 s inside a
long continuous shot. For EACH segment output one JSON object:
{"start": seconds, "end": seconds,
 "what": "what is literally on screen, one sentence (who, where, doing what)",
 "shot": one of [%(shot)s],
 "angle": one of [%(angle)s],
 "move": list from [%(move)s],
 "lens_play": list from [%(lens_play)s] - what the performer does TO the camera,
 "tempo": one of [%(tempo)s] (cut + motion speed),
 "music": "verse / pre / chorus / drop / bridge / break / intro / outro + what the beat does",
 "emotion": "1-3 words: the feeling it gives a viewer (flirt, power, menace, longing, joy, playful, rage, calm ...)",
 "transition_out": one of [%(transition_out)s],
 "light": list from [%(light)s] + colours in words,
 "craft": "the one technique that makes this segment work, concrete (e.g. 'hand fills the lens on the downbeat, cut hidden behind it')"}
Only describe what you SEE and HEAR; if unsure write "unsure". Return a JSON array, nothing else.""" % FACETS


def catalog() -> list[dict]:
    return json.loads((REFS / "catalog.json").read_text(encoding="utf-8"))["videos"]


def _pick(arg: str | None) -> list[dict]:
    vids = catalog()
    return vids if arg in (None, "all") else [v for v in vids if v["slug"] == arg or v["id"] == arg]


def _json_array(text: str) -> list[dict]:
    """All chunk answers of one analysis file, in order; segments cut at a chunk edge are merged with their twin."""
    segs: list[dict] = []
    for block in re.split(r"<!-- chunk [\d.]+ -->", text)[1:] or [text]:
        m = re.search(r"\[.*\]", block, re.S)
        if not m:
            continue
        for s in json.loads(m.group(0)):
            prev = segs[-1] if segs else None
            if prev and prev.get("edge") and s.get("edge") and abs(float(s["start"]) - float(prev["end"])) < 0.6:
                prev["end"] = s["end"]
                prev.pop("edge", None)
                continue
            segs.append(s)
    return segs


CHUNK = 20.0   # s per Gemini pass: one pass over a whole video merged a 7-cut burst into one segment (FIRESTARTER
               # 1:51-1:55, checked 2026-10-25); 20 s at 4 fps finds every cut


def _duration(v: dict) -> float:
    import yt_dlp

    with yt_dlp.YoutubeDL({"quiet": True, "skip_download": True}) as y:
        return float(y.extract_info(f"https://www.youtube.com/watch?v={v['id']}", download=False)["duration"])


def analyze(arg: str | None, force: bool = False) -> None:
    """Gemini watches each video in 20 s chunks (picture + sound) -> analysis/<slug>.md, one verbatim JSON answer per
    chunk with absolute times. Resumes: chunks already answered are kept."""
    for v in _pick(arg):
        _analyze_one(v, force)
    build_segments()


def _analyze_one(v: dict, force: bool = False) -> None:
    import time

    out = REFS / "analysis"
    out.mkdir(parents=True, exist_ok=True)
    f = out / f"{v['slug']}.md"
    done = f.read_text(encoding="utf-8") if f.exists() and not force else ""
    if "<!-- complete -->" in done:
        return
    url = f"https://www.youtube.com/watch?v={v['id']}"
    dur = _duration(v)
    print("watching", v["slug"], f"{dur:.0f}s", flush=True)
    text = done if "<!-- chunk" in done else f"<!-- gemini watched {url} in {CHUNK:g} s chunks - verbatim, never edited -->\n"
    t = 0.0
    while t < dur:
        tag = f"<!-- chunk {t:g} -->"
        if tag not in text:
            end = min(dur, t + CHUNK)
            prompt = PROMPT + (f"\nYou see only {t:g}-{end:g} s of the video. Give ABSOLUTE times in seconds of the "
                               "whole video. Mark a segment that is cut off at the chunk edge with \"edge\": true.")
            try:
                ans, model = gemini.ask(prompt, [gemini.media_part(url, t, end, fps=4)],
                                        config={"mediaResolution": "MEDIA_RESOLUTION_LOW",
                                                "responseMimeType": "application/json"})
            except SystemExit as e:
                print("  stopped", v["slug"], "at", t, e, flush=True)
                f.write_text(text, encoding="utf-8")
                return
            text += f"{tag} <!-- {model} -->\n{ans}\n"
            f.write_text(text, encoding="utf-8")
            time.sleep(2)
        t += CHUNK
    f.write_text(text + "<!-- complete -->\n", encoding="utf-8")
    print("  done", v["slug"], flush=True)


def build_segments() -> list[dict]:
    rows = []
    for v in catalog():
        f = REFS / "analysis" / f"{v['slug']}.md"
        if not f.exists():
            continue
        try:
            segs = _json_array(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            print("  unreadable JSON:", f.name)
            continue
        for i, s in enumerate(segs):
            rows.append({"ref": f"{v['slug']}#{i:03d}", "slug": v["slug"], "id": v["id"], "medium": v["medium"], **s})
    (REFS / "segments.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(rows), "segments ->", REFS / "segments.json")
    return rows


def _flat(seg: dict) -> str:
    return " ".join(str(x) for k, x in seg.items() if k not in ("id",)).lower()


def find(terms: list[str], limit: int = 20) -> list[dict]:
    """Segments whose tags / text contain ALL terms (e.g. `refs find hand_to_lens low` or `refs find flirt slow`)."""
    segs = json.loads((REFS / "segments.json").read_text(encoding="utf-8"))
    hits = [s for s in segs if all(t.lower() in _flat(s) for t in terms)]
    return hits[:limit]


def _video(v: dict) -> Path:
    """480p copy for frame grabs - local cache only, never committed or published."""
    CACHE.mkdir(parents=True, exist_ok=True)
    p = CACHE / f"{v['slug']}.mp4"
    if not p.exists():
        subprocess.run([sys.executable, "-m", "yt_dlp", "-q", "-f", "bv*[height<=480][ext=mp4]/b[height<=480]",
                        "-o", str(p), f"https://www.youtube.com/watch?v={v['id']}"], check=True)
    return p


def frames(arg: str | None) -> None:
    """3 stills per segment (start + 25 %, middle, end - 25 %) -> frames/<slug>/<nnn>_<k>.jpg."""
    segs = json.loads((REFS / "segments.json").read_text(encoding="utf-8"))
    for v in _pick(arg):
        mine = [s for s in segs if s["slug"] == v["slug"]]
        if not mine:
            continue
        src, d = _video(v), FRAMES / v["slug"]
        d.mkdir(parents=True, exist_ok=True)
        for s in mine:
            a, b = float(s["start"]), float(s["end"])
            for k, t in enumerate((a + (b - a) * 0.25, (a + b) / 2, b - (b - a) * 0.25)):
                o = d / f"{s['ref'].split('#')[1]}_{k}.jpg"
                if not o.exists():
                    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", str(src), "-frames:v", "1",
                                    "-q:v", "3", str(o)], check=False)
        print(v["slug"], len(mine), "segments")


def pair(ref: str, ours: Path, out: Path, note: str = "") -> Path:
    """Side by side: the reference frame (left) next to ours (right), the brief / note on top - every board toki sees
    and every look / reference critic uses this."""
    from PIL import Image, ImageDraw

    slug, n = ref.split("#")
    left = Image.open(FRAMES / slug / f"{n}_1.jpg").convert("RGB")
    right = Image.open(ours).convert("RGB")
    h = 540
    left = left.resize((int(left.width * h / left.height), h))
    right = right.resize((int(right.width * h / right.height), h))
    img = Image.new("RGB", (left.width + right.width + 12, h + 44), (12, 12, 16))
    img.paste(left, (0, 44))
    img.paste(right, (left.width + 12, 44))
    ImageDraw.Draw(img).text((8, 6), f"REFERENCE {ref}  |  OURS {ours.name}   {note}"[:180], fill=(235, 235, 235))
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, quality=90)
    return out


def main(argv: list[str]) -> int:
    """refs list | analyze [slug|all] [--force] | segments | frames [slug|all] | find <term..> | pair <ref> <ours> <out>"""
    cmd, rest = argv[0], argv[1:]
    if cmd == "list":
        for v in catalog():
            done = (REFS / "analysis" / f"{v['slug']}.md").exists()
            print(("x" if done else " "), v["slug"].ljust(24), v["medium"].ljust(13), v["title"])
    elif cmd == "analyze":
        target = rest[0] if rest and not rest[0].startswith("--") else None
        if target in (None, "all"):            # 3 videos at once (each call waits minutes on Gemini's side)
            from concurrent.futures import ThreadPoolExecutor

            with ThreadPoolExecutor(3) as ex:
                list(ex.map(lambda v: _analyze_one(v, "--force" in rest), catalog()))
            build_segments()
        else:
            analyze(target, "--force" in rest)
    elif cmd == "segments":
        build_segments()
    elif cmd == "frames":
        frames(rest[0] if rest else None)
    elif cmd == "find":
        for s in find(rest):
            print(f"{s['ref']:28} {s['start']:>6}-{s['end']:<6} {s.get('shot','')}/{s.get('angle','')} "
                  f"{','.join(s.get('move') or [])} | {','.join(s.get('lens_play') or [])} | {s.get('emotion','')} "
                  f"| {s.get('craft','')[:90]}")
    elif cmd == "pair":
        print(pair(rest[0], Path(rest[1]), Path(rest[2]), " ".join(rest[3:])))
    else:
        print(main.__doc__)
        return 2
    return 0

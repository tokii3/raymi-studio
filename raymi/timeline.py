"""Shooting script data -> the film timeline the studio draws (studio/src/film/types.ts). A video is DATA.

jobs/<job>/shots.json is the machine part of the shooting script (4_SCRIPT.md says WHY, shots.json says WHAT):

    {"audio": {"file": "song.webm", "from": 52.0, "to": 64.4},        # the song window (s, song time)
     "lyrics": "lyrics_timed.json", "song_map": "song_map.json",     # paths relative to the job (or ../<job>/...)
     "grain": 0.06,
     "shots": [{
       "at": 52.0 | "line:13" | "word:13.1",      # start: song seconds, or a lyric line / word (lands on its cut frame)
       "set": "aquarium", "opts": {...},           # a built set (studio/src/three/sets) + its options
       "camera": [{"at": 0, "cam": "hall_wide"},   # keys: seconds from the shot start (or "end"); a named camera of the
                  {"at": "end", "pos": [..], "look": [..], "fov": 30, "ease": "inOut", "roll": 0}],   # set, or numbers
       "kick": 1,                                  # camera punch on music hits (0..2)
       "raymi": [{"at": 0, "sprite": "WS_F_SMUG_WINK_UV_141", "pos": "throne" | [x, y, z], "act": "pop",
                  "icon": "heart", "height": 1.55, "move": 0.4, "arc": 0.5, "flip": false, "ease": "snap"}],
       "lyrics": {"kind": "sign", "anchor": "led" | [x, y, z], "rot": 0, "size": 0.3, "width": 4, "key": ["KING"],
                  "lines": [16, 18], "words": ["KING"],   # optional: only these lines / words become objects
                  "color": "#fff", "accent": "#ffcf6b", "outline": "#1a0b33", "lit": false},
       "transition": {"kind": "bubbles", "frames": 12},
       "why": "the feeling this shot serves"}]}

compile() refuses (errors) anything that would reach the screen broken: unknown set / mark / camera / sprite, glyphs
the Raymi font lacks, times outside the window, non-increasing shots. The studio itself refuses cut sprite edges in
frame (studio/src/film/check.ts) - that needs the camera, so it runs in node before every render.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from . import plan as P

REPO = Path(__file__).resolve().parents[1]
SETS = REPO / "studio" / "src" / "three" / "sets" / "sets.json"
FPS = 30
FORMATS = {"mv": ("MV", 1920, 1080), "short": ("MVShort", 1080, 1920)}
ACTS = {"idle", "pop", "hop", "bounce", "shake", "tilt", "lean", "shrink", "turn", "stomp", "float"}
EASES = {"linear", "in", "out", "inOut", "snap", "hold"}
LYRIC_KINDS = {"sign", "float", "stamp", "glass", "card", "ticker"}
TRANSITIONS = {"cut", "bubbles", "ink", "whip", "flash", "pass"}
ICONS = {None, "!", "?", "heart", "sweat", "anger", "zz", "bulb", "sparkle", "music"}
DEFAULT_HEIGHT = 1.55   # Raymi's figure height in metres (ears to feet)


class TimelineError(ValueError):
    pass


def load_sets() -> dict:
    return {k: v for k, v in json.loads(SETS.read_text(encoding="utf-8")).items() if not k.startswith("_")}


def _rel(job: Path, p: str) -> Path:
    q = (job / p).resolve()
    return q


def _repo_path(p: Path) -> str:
    try:
        return p.relative_to(REPO).as_posix()
    except ValueError:
        return p.as_posix()


def resolve_time(at, lyrics: list[dict], errors: list[str], tag: str) -> float | None:
    """Song seconds of a shot start. Lyric references land on the cut frame (one frame before the syllable)."""
    if isinstance(at, (int, float)):
        return float(at)
    if isinstance(at, str) and at.startswith(("line:", "word:")):
        try:
            if at.startswith("line:"):
                ln = lyrics[int(at[5:])]
                return ln["cut"] / FPS
            li, wi = at[5:].split(".")
            return lyrics[int(li)]["words"][int(wi)]["cut"] / FPS
        except (IndexError, ValueError, KeyError):
            errors.append(f"{tag}: lyric reference {at!r} does not exist")
            return None
    errors.append(f"{tag}: 'at' must be seconds or 'line:N' / 'word:N.M', got {at!r}")
    return None


def _v3(v, marks: dict, errors: list[str], tag: str) -> list[float] | None:
    if isinstance(v, str):
        if v not in marks:
            errors.append(f"{tag}: unknown mark {v!r} (set marks: {sorted(marks)})")
            return None
        return list(marks[v])
    if isinstance(v, list) and len(v) == 3 and all(isinstance(x, (int, float)) for x in v):
        return [float(x) for x in v]
    errors.append(f"{tag}: position must be a mark name or [x, y, z], got {v!r}")
    return None


def _key_time(at, start: float, end: float) -> float:
    if at == "end":
        return end
    return start + float(at)


def glyph_errors(texts: list[str], cmap: set[int]) -> list[str]:
    out = []
    for t in texts:
        miss = sorted({c for c in t if not c.isspace() and ord(c) not in cmap})
        if miss:
            out.append(f"Raymi font has no glyph for {''.join(miss)} in {t!r} - extend her font (BACKLOG), never a "
                       f"fallback font")
    return out


def compile_shots(job: Path, spec: dict, fmt: str = "mv", cmap: set[int] | None = None) -> tuple[dict, list[str], list[str]]:
    errors: list[str] = []
    warns: list[str] = []
    if fmt not in FORMATS:
        raise TimelineError(f"format must be one of {sorted(FORMATS)}")
    comp, W, H = FORMATS[fmt]
    sets = load_sets()
    cat = P.load_catalog()
    audio = spec.get("audio")
    lyrics = []
    if spec.get("lyrics"):
        lyrics = json.loads(_rel(job, spec["lyrics"]).read_text(encoding="utf-8"))["lines"]
    smap = json.loads(_rel(job, spec["song_map"]).read_text(encoding="utf-8")) if spec.get("song_map") else {}
    win = spec.get("window") or {}
    t_from = float(win.get(fmt, {}).get("from", audio["from"] if audio else 0.0))
    t_to = float(win.get(fmt, {}).get("to", audio["to"] if audio else 0.0))
    f0 = round(t_from * FPS)
    total = round(t_to * FPS) - f0
    if total <= 0:
        errors.append("audio window is empty (audio.to must be after audio.from)")
        total = 1
    fr = lambda t: round(t * FPS) - f0                      # noqa: E731  song seconds -> film frame
    shots_in = spec.get("shots", [])
    if not shots_in:
        errors.append("no shots")
    starts = [resolve_time(s.get("at", 0), lyrics, errors, f"shot {i + 1}") for i, s in enumerate(shots_in)]
    shots, sprites, screen_texts = [], set(), []
    for i, s in enumerate(shots_in):
        tag = f"shot {i + 1}"
        a = starts[i]
        b = starts[i + 1] if i + 1 < len(starts) else t_to
        if a is None or b is None:
            continue
        if b <= a:
            errors.append(f"{tag}: starts at {a:.2f} s, not before the next shot ({b:.2f} s)")
            continue
        if a < t_from - 1e-6 and i == 0:
            a = t_from
        st = s.get("set")
        if st not in sets:
            errors.append(f"{tag}: unknown set {st!r} (built sets: {sorted(sets)})")
            continue
        marks, cams = sets[st]["marks"], sets[st]["cams"]
        # camera keys
        ckeys = []
        for k, c in enumerate(s.get("camera", [])):
            ktag = f"{tag} camera key {k + 1}"
            base = cams.get(c["cam"]) if "cam" in c else {}
            if "cam" in c and base is None:
                errors.append(f"{ktag}: unknown camera {c['cam']!r} (set cameras: {sorted(cams)})")
                continue
            if fmt == "short" and isinstance(c.get("short"), dict):
                c = {**c, **c["short"]}
            pos = _v3(c.get("pos", base.get("pos")), marks, errors, ktag)
            look = _v3(c.get("look", base.get("look")), marks, errors, ktag)
            if pos is None or look is None:
                continue
            off = c.get("offset")
            if off:
                pos = [p + o for p, o in zip(pos, off)]
                look = [p + o for p, o in zip(look, c.get("look_offset", off))]
            if c.get("ease", "inOut") not in EASES:
                errors.append(f"{ktag}: ease must be one of {sorted(EASES)}")
            ckeys.append({"f": fr(_key_time(c.get("at", 0), a, b)), "pos": pos, "look": look,
                          "fov": float(c.get("fov", base.get("fov", 35))), "roll": float(c.get("roll", 0)),
                          "ease": c.get("ease", "inOut")})
        if not ckeys:
            errors.append(f"{tag}: needs at least one camera key")
            continue
        # Raymi
        pkeys = []
        for k, r in enumerate(s.get("raymi", [])):
            ktag = f"{tag} raymi key {k + 1}"
            sp = r.get("sprite")
            if sp not in cat:
                errors.append(f"{ktag}: sprite {sp!r} is not in assets/catalog.json")
                continue
            info = cat[sp]
            if info["status"] == "limited":
                warns.append(f"{ktag}: {sp} is limited - {'; '.join(info['notes'])[:140]}")
            pos = _v3(r.get("pos", "center"), marks, errors, ktag)
            if pos is None:
                continue
            if r.get("act", "idle") not in ACTS:
                errors.append(f"{ktag}: act must be one of {sorted(ACTS)}")
            if r.get("icon") not in ICONS:
                errors.append(f"{ktag}: icon must be one of {sorted(x for x in ICONS if x)}")
            an = info.get("anatomy", {})
            head = an.get("head") or info.get("face_box") or [0.3, 0.02, 0.7, 0.3]
            feet = max([p[1] for p in an.get("feet", [])] or [0.98 if "bottom" not in info["cut_sides"] else 1.0])
            top = float(head[1])
            if info["size"][0] > info["size"][1] or feet - top < 0.5:
                # lying / flying / swimming (landscape) sprites: her body rests on the image's lower edge, and
                # `height` is the height of the whole image content (raised feet are not the floor line)
                feet, top = 0.97, 0.03
            feet = float(r.get("ground", feet))
            fname = "sprites/" + Path(info["file"]).name
            sprites.add(fname)
            pkeys.append({"f": fr(_key_time(r.get("at", 0), a, b)), "sprite": fname, "size": info["size"],
                          "cuts": info["cut_sides"], "top": top, "feet": float(min(1.0, feet)),
                          "pos": pos, "height": float(r.get("height", DEFAULT_HEIGHT)), "act": r.get("act", "idle"),
                          "icon": r.get("icon"), "flip": bool(r.get("flip", False)),
                          "move": round(float(r.get("move", 0.0)) * FPS), "arc": float(r.get("arc", 0.0)),
                          "ease": r.get("ease", "inOut")})
        # lyrics living in this shot
        lyr = s.get("lyrics")
        if lyr and fmt == "short" and isinstance(lyr.get("short"), dict):
            lyr = {**lyr, **lyr["short"]}                 # the Short frame is narrow: its own anchor / size / width
        L, words = None, []
        if lyr:
            if lyr.get("kind") not in LYRIC_KINDS:
                errors.append(f"{tag}: lyrics.kind must be one of {sorted(LYRIC_KINDS)}")
            anchor = _v3(lyr.get("anchor", "center"), marks, errors, f"{tag} lyrics")
            keys = {k.lower() for k in lyr.get("key", [])}
            L = {"kind": lyr.get("kind", "sign"), "anchor": anchor or [0, 1, 0], "rotY": float(lyr.get("rot", 0)),
                 "size": float(lyr.get("size", 0.3)), "width": float(lyr.get("width", 4.0)),
                 "color": lyr.get("color", "#ffffff"), "accent": lyr.get("accent", "#ffcf6b"),
                 "outline": lyr.get("outline", "#1a0b33"), "lit": bool(lyr.get("lit", False))}
            only_lines = set(lyr["lines"]) if "lines" in lyr else None      # a line can be ACTED instead of written
            only_words = set(lyr["words"]) if "words" in lyr else None
            for li, ln in enumerate(lyrics):
                if only_lines is not None and li not in only_lines:
                    continue
                for wi, w in enumerate(ln["words"]):
                    if only_words is not None and w["w"] not in only_words:
                        continue
                    if round(a * FPS) <= w["cut"] < round(b * FPS) and t_from <= w["t0"] < t_to:   # frames, not floats
                        words.append({"w": w["w"], "from": w["cut"] - f0, "to": round(w["t1"] * FPS) - f0,
                                      "key": w["w"].lower() in keys or w["roma"] in keys, "line": li, "idx": wi})
                        screen_texts.append(w["w"])
        opts = dict(s.get("opts") or {})
        for k, v in opts.items():
            if isinstance(v, str) and v in cat:            # a sprite printed on a prop (a card, a poster, a screen)
                opts[k] = "sprites/" + Path(cat[v]["file"]).name
                sprites.add(opts[k])
            elif isinstance(v, str) and (k.startswith("text") or k in ("led", "title")):
                screen_texts.append(v)
        tr = s.get("transition", {"kind": "cut", "frames": 0})
        if tr.get("kind") not in TRANSITIONS:
            errors.append(f"{tag}: transition.kind must be one of {sorted(TRANSITIONS)}")
        shots.append({"id": s.get("id", f"s{i + 1}"), "from": max(0, fr(a)), "to": min(total, fr(b)), "set": st,
                      "opts": opts, "camera": ckeys, "kick": float(s.get("kick", 1.0)), "puppets": pkeys,
                      "lyrics": L, "words": words,
                      "transition": {"kind": tr.get("kind", "cut"), "frames": int(tr.get("frames", 0)),
                                     **({"obj": tr["obj"]} if "obj" in tr else {}), **({"dir": tr["dir"]} if "dir" in tr else {})},
                      "events": []})
    if shots and shots[0]["from"] != 0:
        errors.append(f"the first shot must start at the window start ({t_from:.2f} s)")
    if cmap is None:
        cmap = P.font_cmap()
    errors += glyph_errors(sorted(set(screen_texts)), cmap)
    hits = sorted({h for h in (round(x * FPS) - f0 for x in smap.get("hits", [])) if 0 <= h < total})
    beats = sorted({h for h in (round(x * FPS) - f0 for x in smap.get("beats", [])) if 0 <= h < total})
    props = {"composition": comp, "width": W, "height": H, "fps": FPS, "durationInFrames": total,
             "audio": ({"file": "audio" + Path(audio["file"]).suffix, "from": t_from, "to": t_to,
                        "src": _repo_path(_rel(job, audio["file"]))} if audio else None),
             "shots": shots, "hits": hits, "beats": beats, "sprites": sorted(sprites),
             "grain": float(spec.get("grain", 0.06)), "title": spec.get("title", job.name)}
    return props, errors, warns


def compile_job(job: str, fmt: str = "mv") -> tuple[dict, list[str], list[str]]:
    d = P.job_dir(job)
    spec = json.loads((d / "shots.json").read_text(encoding="utf-8"))
    return compile_shots(d, spec, fmt)


def frames_for(seconds: float) -> int:
    return int(math.floor(seconds * FPS))

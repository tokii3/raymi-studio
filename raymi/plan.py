"""Job plan -> checked render props.

A job is data, never code: jobs/<id>/plan.json (what happens) + words.json (when, from the voice).
check() refuses anything that would reach the screen broken; props() resolves times + sprite data
so the Remotion side only draws.
"""
from __future__ import annotations

import json
from pathlib import Path

from . import channel_rules
from .tts_text import validate_spoken

REPO = Path(__file__).resolve().parents[1]
CATALOG = REPO / "assets" / "catalog.json"
FONT = REPO / "assets" / "fonts" / "Raymi-Regular.ttf"
FPS = 30
TAIL_S = 0.7            # breath after the last word so the line lands
CTA_HOLD_S = 2.8        # CTA readable >= 2.5 s before the end (old engine lesson)
ACTS = {"idle", "pop", "hop", "tilt", "lean", "shake", "slide_in", "bounce", "shrink"}
SHOTS = {"wide", "medium", "close", "extreme"}
SIDES = {"center", "left", "right"}
ICONS = {None, "!", "?", "heart", "sweat", "anger", "zz", "bulb", "sparkle", "music"}
WORLDS = {"deep_sea", "paper", "night_sky", "sunset_reef", "screen"}


def _bare(word: str) -> str:
    return word.lower().strip(".,!?;:'\"")


def load_catalog() -> dict:
    return json.loads(CATALOG.read_text(encoding="utf-8"))["sprites"]


def font_cmap() -> set[int]:
    from fontTools.ttLib import TTFont

    return set(TTFont(str(FONT)).getBestCmap())


_ADV: dict | None = None


_ADV_HEAVY: dict | None = None


def text_em(text: str, heavy: bool = False) -> float | None:
    """Exact advance width of `text` in her font, in em (the guards measure words with this, never a guess).
    heavy = her heavy weight (lyrics v2): its own widths once built, else Regular + the growth it will get."""
    global _ADV, _ADV_HEAVY
    if heavy:
        from .font import HEAVY, HEAVY_R

        if _ADV_HEAVY is None:
            if HEAVY.is_file():
                from fontTools.ttLib import TTFont

                f = TTFont(str(HEAVY))
                upm = f["head"].unitsPerEm
                hm, cmap = f["hmtx"].metrics, f.getBestCmap()
                _ADV_HEAVY = {cp: hm[g][0] / upm for cp, g in cmap.items() if g in hm}
            else:
                _ADV_HEAVY = {}
        try:
            return round(sum(_ADV_HEAVY[ord(c)] for c in text), 4)
        except KeyError:
            base = text_em(text)
            return None if base is None else round(base + 2 * HEAVY_R / 1000 * sum(1 for c in text if not c.isspace()), 4)
    if _ADV is None:
        from fontTools.ttLib import TTFont

        f = TTFont(str(FONT))
        upm = f["head"].unitsPerEm
        hm, cmap = f["hmtx"].metrics, f.getBestCmap()
        _ADV = {cp: hm[g][0] / upm for cp, g in cmap.items() if g in hm}
    try:
        return round(sum(_ADV[ord(c)] for c in text), 4)
    except KeyError:
        return None


def job_dir(job: str) -> Path:
    p = Path(job)
    return p if p.is_dir() else REPO / "jobs" / job


def load(job: str) -> tuple[dict, dict | None]:
    d = job_dir(job)
    plan = json.loads((d / "plan.json").read_text(encoding="utf-8"))
    w = d / "words.json"
    return plan, (json.loads(w.read_text(encoding="utf-8")) if w.is_file() else None)


def screen_texts(plan: dict) -> list[str]:
    out = [plan.get("hook", {}).get("text", ""), plan.get("cta", {}).get("text", "")]
    out += [plan.get("script", "")]
    out += [t for b in plan.get("beats", []) for t in ([b.get("say")] if b.get("say") else [])]
    return [t for t in out if t]


def check(plan: dict, words: dict | None) -> tuple[list[str], list[str]]:
    errors, warns = [], []
    cat = load_catalog()
    if plan.get("kind") not in channel_rules.SHORT_LEN_BY_KIND:
        errors.append(f"kind must be one of {sorted(channel_rules.SHORT_LEN_BY_KIND)}")
    if plan.get("look", {}).get("world") not in WORLDS:
        errors.append(f"look.world must be one of {sorted(WORLDS)}")
    errors += [f"script: {i}" for i in validate_spoken(plan.get("script", ""))]
    hook = plan.get("hook", {})
    if not hook.get("text"):
        errors.append("hook.text missing (the promise a swiper reads in the first second)")
    elif len(hook["text"].split()) > 8:
        errors.append("hook.text > 8 words - it has to read in under a second")
    cta = plan.get("cta", {}).get("text", "")
    if not cta.strip().endswith("?"):
        errors.append("cta.text must be a question (comment prompt)")
    cmap = font_cmap()
    for t in screen_texts(plan):
        miss = sorted({c for c in t if not c.isspace() and ord(c) not in cmap})
        if miss:
            errors.append(f"Raymi font has no glyph for {miss} in {t[:40]!r} - rewrite, never fall back to another font")
    beats = plan.get("beats", [])
    if not beats or beats[0].get("at_word") != 0:
        errors.append("beats: the first beat must start at word 0")
    last_idx, last_sprite = -1, None
    n_words = len(words["words"]) if words else None
    for i, b in enumerate(beats):
        tag = f"beat {i + 1}"
        s = b.get("sprite")
        if s not in cat:
            errors.append(f"{tag}: sprite {s!r} is not in assets/catalog.json (excluded or unknown)")
        elif cat[s]["status"] == "limited":
            warns.append(f"{tag}: {s} is limited - {'; '.join(cat[s]['notes'])[:160]}")
        if s == last_sprite:
            errors.append(f"{tag}: same sprite as the beat before - her expression must change")
        last_sprite = s
        aw = b.get("at_word")
        if not isinstance(aw, int) or aw <= last_idx:
            errors.append(f"{tag}: at_word must be an increasing word index")
        elif n_words is not None and aw >= n_words:
            errors.append(f"{tag}: at_word {aw} >= number of spoken words {n_words}")
        last_idx = aw if isinstance(aw, int) else last_idx
        if b.get("act", "idle") not in ACTS:
            errors.append(f"{tag}: act must be one of {sorted(ACTS)}")
        if b.get("shot", "medium") not in SHOTS:
            errors.append(f"{tag}: shot must be one of {sorted(SHOTS)}")
        if b.get("side", "center") not in SIDES:
            errors.append(f"{tag}: side must be one of {sorted(SIDES)}")
        spoken = {_bare(w) for w in plan.get("script", "").split()}
        for k in b.get("key", []):
            if _bare(k) not in spoken:
                errors.append(f"{tag}: key word {k!r} is not in the script")
        if b.get("icon") not in ICONS:
            errors.append(f"{tag}: icon must be one of {sorted(i for i in ICONS if i)}")
    if words:
        dur = words["duration"] + TAIL_S
        lo, hi = channel_rules.SHORT_LEN_BY_KIND.get(plan.get("kind"), (15, 35))
        if not lo <= dur <= hi:
            errors.append(f"length {dur:.1f} s outside {lo}-{hi} s for kind {plan.get('kind')!r}")
        if words.get("timing_source") == "estimated":
            warns.append("word timing is ESTIMATED (edge-tts + whisper both failed) - captions may drift")
        gaps = [b2["start"] - b1["start"] for b1, b2 in zip(
            [words["words"][b["at_word"]] for b in beats if isinstance(b.get("at_word"), int) and b["at_word"] < len(words["words"])][:-1],
            [words["words"][b["at_word"]] for b in beats if isinstance(b.get("at_word"), int) and b["at_word"] < len(words["words"])][1:])]
        if gaps and max(gaps) > 4.5:
            warns.append(f"a beat holds {max(gaps):.1f} s - a visual change every 2-4 s keeps Shorts alive")
    up = plan.get("upload", {})
    if up:
        warns += [f"upload: {x}" for x in channel_rules.title_issues(up.get("titles", []), "shorts")]
        warns += [f"upload: {x}" for x in channel_rules.tag_issues(up.get("tags", []), up.get("hashtags", []))]
    return errors, warns


def props(plan: dict, words: dict) -> dict:
    """Resolve everything the renderer needs into one JSON (seconds -> frames, sprite data inlined)."""
    cat = load_catalog()
    ws = words["words"]
    dur_s = words["duration"] + TAIL_S
    total = int(round(dur_s * FPS))
    beats = []
    for i, b in enumerate(plan["beats"]):
        start = ws[b["at_word"]]["start"]
        end = ws[plan["beats"][i + 1]["at_word"]]["start"] if i + 1 < len(plan["beats"]) else dur_s
        s = cat[b["sprite"]]
        beats.append({
            "from": int(round(start * FPS)) if i else 0,
            "to": int(round(end * FPS)),
            "sprite": "sprites/" + Path(s["file"]).name,
            "size": s["size"], "anatomy": s["anatomy"], "faceBox": s.get("face_box"), "cuts": s["cut_sides"],
            "act": b.get("act", "idle"), "shot": b.get("shot", "medium"), "side": b.get("side", "center"),
            "icon": b.get("icon"), "key": [k.lower() for k in b.get("key", [])],
        })
    key_words = {_bare(k) for b in plan["beats"] for k in b.get("key", [])}
    return {
        "fps": FPS, "width": 1080, "height": 1920, "durationInFrames": total,
        "world": plan["look"]["world"], "accent": plan["look"].get("accent", "#b56bff"),
        "hook": {"text": plan["hook"]["text"], "to": int(round(plan["hook"].get("until", 1.8) * FPS))},
        "cta": {"text": plan["cta"]["text"], "from": max(0, total - int(CTA_HOLD_S * FPS))},
        "words": [{"w": w["w"], "from": int(round(w["start"] * FPS)), "to": int(round(w["end"] * FPS)),
                   "key": _bare(w["w"]) in key_words} for w in ws],
        "beats": beats, "voice": "voice.mp3",
    }

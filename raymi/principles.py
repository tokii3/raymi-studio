"""Learn the picture rules from the professional references, not only their frames (toki 2026-10-26: "aus den
referenzen lernen und sie nachhaltig verstehen ... die profi videos basieren ja auch auf 'regeln', optimalen ratios,
farb anpassung, kontrast etc, alles hat grund und wirkung").

A storyboard failed twice because the library had no frame for a moment (a silhouette in a white flood, a pillar of
light, a starry ink sky). The fix: measure WHY a reference frame works - value split, contrast, how much of the frame
is light / dark, saturation, palette and harmony, where the light sits, how much grit - and keep it as a PRINCIPLE CARD
for a moment class. A card judges our still even when no reference frame matches its exact content.

  python -m raymi refs learn <slug|all>                 per-frame measures every 1 s -> knowledge/references/principles/<slug>.json
  python -m raymi refs card <name> <slug@t> [...] [--why "<text>"] [--skip k1,k2]   a principle card from chosen
                                                        frames (looked at by eye first) -> principle_cards.json
  python -m raymi refs measure <image> [--card <name>]  our still's measures (+ the gap to a card)

Measures (all 0..1 unless said): lum_mean, lum_p05 / p50 / p95, contrast (p95 - p05), light_share (L > 0.75),
dark_share (L < 0.15), two_tone (light_share + dark_share: near 1 = a graphic two-value frame), sat_mean,
sat_accent (share of pixels with saturation > 0.6), hue_main / hue_second (degrees of the two biggest hue masses),
harmony (mono / analogous / triad / complementary from their distance), main_share (share of the biggest hue mass),
light_x / light_y (centre of the brightest 5 %: where the eye goes), thirds (distance of that centre to the nearest
thirds point, 0 = on it), detail (edge density: grit / texture), key ("low" / "mid" / "high").
Placement (toki 2026-10-26: "auch character placements, dinge wie negative space, schnelligkeit"): subj_x / subj_y /
subj_w / subj_h (box of the salient mass - spectral-residual saliency, a PROXY for "the character", not a detector),
subj_size (its area share), subj_thirds (its centre to the nearest thirds point), neg_space (share of 16x9 cells that
are empty: flat and not salient), neg_side ("left" / "right" / "top" / "bottom" / "even": where the empty room sits).
Speed (per shot, from the video): `refs shots <slug|all>` cuts the reference into shots (colour-histogram jumps) and
measures each shot's length, its motion (median optical flow in frame widths per second) and the frame rules of its
middle frame -> principles/<slug>.shots.json. The WHY of each decision: `refs why <slug>` (Gemini on the measured
shot list, stored verbatim).
Derived numbers only - no reference footage is stored by this module.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
REFS = ROOT / "knowledge" / "references"
FRAMES = REFS / "frames"
OUT = REFS / "principles"
CARDS = REFS / "principle_cards.json"
KEYS = ["lum_mean", "lum_p05", "lum_p50", "lum_p95", "contrast", "light_share", "dark_share", "two_tone", "sat_mean",
        "sat_accent", "main_share", "light_x", "light_y", "thirds", "detail", "subj_x", "subj_y", "subj_size",
        "subj_thirds", "neg_space"]


def _load(path: Path, w: int = 320) -> np.ndarray:
    from PIL import Image

    im = Image.open(path).convert("RGB")
    h = max(1, int(im.height * w / im.width))
    return np.asarray(im.resize((w, h)), dtype=np.float32) / 255.0


def _hsv(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 1e-3, (mx - mn) / (mx + 1e-6), 0)
    return h % 360, s, mx


def harmony(a: float, b: float) -> str:
    d = abs((a - b + 180) % 360 - 180)
    return "mono" if d < 20 else "analogous" if d < 60 else "triad" if d < 140 else "complementary"


def unbox(rgb: np.ndarray) -> np.ndarray:
    """Cut letterbox / pillarbox bars: they are the player's, not the picture's dark area or negative space."""
    L = rgb.mean(-1)
    rows = np.nonzero((L.mean(1) > 0.035) | (L.std(1) > 0.02))[0]
    cols = np.nonzero((L.mean(0) > 0.035) | (L.std(0) > 0.02))[0]
    if len(rows) < L.shape[0] * 0.3 or len(cols) < L.shape[1] * 0.3:
        return rgb                      # a (nearly) black frame: keep it whole
    H, W = L.shape
    # bars are symmetric; a black night sky on one side only is picture, so cut the smaller of the two
    t = min(rows[0], H - 1 - rows[-1])
    s = min(cols[0], W - 1 - cols[-1])
    return rgb[t:H - t, s:W - s]


def measure(rgb: np.ndarray) -> dict:
    """The rule numbers of one frame (see the module doc)."""
    rgb = unbox(rgb)
    L = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    h, s, v = _hsv(rgb)
    p05, p50, p95 = (float(np.percentile(L, q)) for q in (5, 50, 95))
    light, dark = float((L > 0.75).mean()), float((L < 0.15).mean())
    colourful = (s > 0.25) & (v > 0.15)
    hist = np.histogram(h[colourful], bins=24, range=(0, 360))[0].astype(float) if colourful.any() else np.zeros(24)
    order = np.argsort(hist)[::-1]
    main = float(order[0] * 15 + 7.5)
    # the second mass: the biggest bin at least 30 deg away from the first
    second = next((float(i * 15 + 7.5) for i in order[1:] if abs(((i - order[0]) * 15 + 180) % 360 - 180) >= 30 and hist[i] > 0), main)
    tot = hist.sum() or 1.0
    thr = np.percentile(L, 95)
    ys, xs = np.nonzero(L >= thr)
    lx, ly = (float(xs.mean() / L.shape[1]), float(ys.mean() / L.shape[0])) if len(xs) else (0.5, 0.5)
    thirds = min(((lx - a) ** 2 + (ly - b) ** 2) ** 0.5 for a in (1 / 3, 2 / 3) for b in (1 / 3, 2 / 3))
    gx, gy = np.abs(np.diff(L, axis=1)), np.abs(np.diff(L, axis=0))
    edges = (gx[:-1, :] + gy[:, :-1]) > 0.08
    detail = float(edges.mean())
    place = placement(L, edges)
    m = {"lum_mean": float(L.mean()), "lum_p05": p05, "lum_p50": p50, "lum_p95": p95, "contrast": p95 - p05,
         "light_share": light, "dark_share": dark, "two_tone": light + dark, "sat_mean": float(s.mean()),
         "sat_accent": float((s > 0.6).mean()), "hue_main": main, "hue_second": second,
         "harmony": harmony(main, second), "main_share": float(hist[order[0]] / tot), "light_x": lx, "light_y": ly,
         "thirds": float(thirds), "detail": detail,
         "key": "low" if L.mean() < 0.3 else "high" if L.mean() > 0.6 else "mid", **place}
    return {k: (round(v, 3) if isinstance(v, float) else v) for k, v in m.items()}


def saliency(L: np.ndarray, w: int = 96) -> np.ndarray:
    """Spectral residual saliency (Hou & Zhang 2007): what stands out from the frame's own statistics, 0..1."""
    import cv2

    h = max(1, int(L.shape[0] * w / L.shape[1]))
    g = cv2.resize(L, (w, h), interpolation=cv2.INTER_AREA)
    F = np.fft.fft2(g)
    logA, ph = np.log(np.abs(F) + 1e-8), np.angle(F)
    R = logA - cv2.blur(logA, (3, 3))
    S = np.abs(np.fft.ifft2(np.exp(R + 1j * ph))) ** 2
    S = cv2.GaussianBlur(S, (0, 0), 2.5)
    S = (S - S.min()) / (S.max() - S.min() + 1e-9)
    return cv2.resize(S.astype(np.float32), (L.shape[1], L.shape[0]))


def placement(L: np.ndarray, edges: np.ndarray) -> dict:
    """Where the main mass sits, how big it is, and how much empty room the frame keeps (see the module doc)."""
    S = saliency(L)
    m = S > max(0.25, 3 * float(S.mean()))
    ys, xs = np.nonzero(m)
    H, W = L.shape
    if len(xs) < 20:
        cx, cy, bw, bh = 0.5, 0.5, 0.0, 0.0
    else:   # the box holding the middle 90 % of the mask (stray specks do not stretch it)
        x0, x1 = np.percentile(xs, (5, 95)) / W
        y0, y1 = np.percentile(ys, (5, 95)) / H
        cx, cy, bw, bh = float(xs.mean() / W), float(ys.mean() / H), float(x1 - x0), float(y1 - y0)
    cells = np.zeros((9, 16), bool)
    e = np.pad(edges, ((0, 1), (0, 1)))
    for j in range(9):
        for i in range(16):
            sl = (slice(j * H // 9, (j + 1) * H // 9), slice(i * W // 16, (i + 1) * W // 16))
            cells[j, i] = e[sl].mean() < 0.03 and S[sl].mean() < 0.2
    room = {"left": cells[:, :8].mean(), "right": cells[:, 8:].mean(), "top": cells[:5].mean(), "bottom": cells[4:].mean()}
    side = max(room, key=room.get)
    if room[side] - min(room.values()) < 0.15:
        side = "even"
    return {"subj_x": cx, "subj_y": cy, "subj_w": bw, "subj_h": bh, "subj_size": float(m.mean()),
            "subj_thirds": min(((cx - a) ** 2 + (cy - b) ** 2) ** 0.5 for a in (1 / 3, 2 / 3) for b in (1 / 3, 2 / 3)),
            "neg_space": float(cells.mean()), "neg_side": side}


def shots(slug: str, fps: float = 6.0) -> Path:
    """Cut a reference video into shots and measure each: length, motion speed, frame rules of its middle frame."""
    import cv2

    src = REFS / ".cache" / f"{slug}.mp4"
    if not src.is_file():
        raise SystemExit(f"no video for {slug} (python -m raymi refs frames {slug})")
    cap = cv2.VideoCapture(str(src))
    vf = cap.get(cv2.CAP_PROP_FPS) or 25.0
    step = max(1, round(vf / fps))
    prev_h = prev_g = None
    diffs, mads, flows, times, frames = [], [], [], [], []
    i = 0
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        if i % step == 0:
            small = cv2.resize(fr, (160, 90), interpolation=cv2.INTER_AREA)
            hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
            hist = cv2.normalize(cv2.calcHist([hsv], [0, 1, 2], None, [12, 4, 4], [0, 180, 0, 256, 0, 256]), None).flatten()
            g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
            d = 0.0 if prev_h is None else float(cv2.compareHist(prev_h, hist, cv2.HISTCMP_BHATTACHARYYA))
            mads.append(0.0 if prev_g is None else float(np.abs(g.astype(np.float32) - prev_g).mean() / 255))
            f = 0.0
            if prev_g is not None:
                fl = cv2.calcOpticalFlowFarneback(prev_g, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                f = float(np.median(np.linalg.norm(fl, axis=2))) / 160 * (vf / step)   # frame widths per second
            diffs.append(d), flows.append(f), times.append(i / vf)
            frames.append(cv2.resize(fr, (320, 180), interpolation=cv2.INTER_AREA))
            prev_h, prev_g = hist, g
        i += 1
    cap.release()
    if not times:
        raise SystemExit(f"{slug}: no frames decoded")
    # a cut = a colour jump OR a picture jump that spikes above its neighbours (motion changes the picture smoothly,
    # a cut between two shots of the same colours does not change the histogram)
    dd, md = np.array(diffs), np.array(mads)

    def spike(k: int) -> bool:
        around = np.concatenate([md[max(1, k - 3):k], md[k + 1:k + 4]])
        return md[k] > 0.06 and md[k] > 2.5 * (float(np.median(around)) if len(around) else 0) + 0.01

    cut_idx = [0] + [k for k in range(1, len(dd)) if dd[k] > 0.45 or spike(k)] + [len(times)]
    rows = []
    for a, b in zip(cut_idx, cut_idx[1:]):
        if b <= a:
            continue
        rgb = cv2.cvtColor(frames[(a + b - 1) // 2], cv2.COLOR_BGR2RGB).astype(np.float32) / 255
        motion = float(np.median(flows[a + 1:b])) if b - a > 1 else flows[a]
        end = times[b] if b < len(times) else times[-1] + step / vf
        rows.append({"start": round(times[a], 2), "end": round(end, 2), "dur": round(end - times[a], 2),
                     "motion": round(motion, 3), **measure(rgb)})
    durs = [r["dur"] for r in rows]
    summary = {"shots": len(rows), "dur_p10": round(float(np.percentile(durs, 10)), 2),
               "dur_p50": round(float(np.percentile(durs, 50)), 2), "dur_p90": round(float(np.percentile(durs, 90)), 2),
               "motion_p50": round(float(np.median([r["motion"] for r in rows])), 3),
               "neg_space_p50": round(float(np.median([r["neg_space"] for r in rows])), 3),
               "subj_size_p50": round(float(np.median([r["subj_size"] for r in rows])), 3)}
    OUT.mkdir(parents=True, exist_ok=True)
    f = OUT / f"{slug}.shots.json"
    f.write_text(json.dumps({"slug": slug, "summary": summary, "rows": rows}, indent=0), encoding="utf-8", newline="\n")
    return f


WHY_PROMPT = """You are a music-video director teaching a younger director the CRAFT of a professional video - not its story.
Below is the measured shot list of this video (our tools measured it; trust the times). Columns: start, dur (s),
motion (frame widths per second), subj (centre x,y and area share of the salient mass - a proxy for the main figure),
neg (share of empty frame and on which side), key, harmony.
Watch the video with sound. For EACH shot:
{"start": s,
 "decision": "the CRAFT choices, never the plot: where the figure sits and how big (use the numbers), how much empty
   room and on which side, angle / lens distance, how long the shot is held and how fast things move, where the cut
   lands, value split (dark / light), colour and light. Name 1-3 choices that matter most here.",
 "why": "the reason for exactly those choices - the music at that moment, the shot before / after, the feeling wanted",
 "effect": "what it does to a viewer (pull in, hit, breathe, tension, beauty, scale, speed, release ...)",
 "music": "what the music does here (downbeat, snare, hit, stop, riser, held note, vocal line, drop ...)"}
Return ONE JSON object: {"shots": [ ...one object per shot... ],
 "rules": [ 8-12 rules this director follows for placement, size, negative space, speed / shot length, cut points,
   light / colour - each with 2-3 shot starts as evidence and the effect it buys ]}.
Say only what you see and hear; "unsure" where unsure.
SHOTS:
"""


def why(slug: str) -> Path:
    """Gemini watches the reference with our measured shots and says the decision, its reason and its effect per shot.
    The answer is stored verbatim (principles/<slug>.why.json), never edited."""
    from . import gemini

    shots_f = OUT / f"{slug}.shots.json"
    if not shots_f.is_file():
        shots(slug)
    rows = json.loads(shots_f.read_text(encoding="utf-8"))["rows"]
    table = "\n".join(f"{r['start']} {r['dur']} {r['motion']} subj {r['subj_x']},{r['subj_y']},{r['subj_size']} "
                      f"neg {r['neg_space']} {r['neg_side']} {r['key']} {r['harmony']}" for r in rows)
    text, model = gemini.ask(WHY_PROMPT + table, [gemini.media_part(str(REFS / ".cache" / f"{slug}.mp4"))],
                             config={"responseMimeType": "application/json"})
    f = OUT / f"{slug}.why.json"
    f.write_text(json.dumps({"slug": slug, "model": model, "verbatim": text}, ensure_ascii=False, indent=0),
                 encoding="utf-8", newline="\n")
    return f


# effect words in the why answers -> the effect classes we design with (toki's core: pull in, hit, beauty ...)
EFFECTS = {"hit": ("hit", "impact", "punch", "jolt", "shock", "blow", "slam", "overpressure"),
           "pull_in": ("pull in", "pull-in", "intimacy", "immers", "draw", "close", "confront"),
           "breathe": ("breathe", "release", "calm", "rest", "pause", "relief"),
           "tension": ("tension", "suspense", "anticipation", "unease", "menace", "dread"),
           "beauty": ("beauty", "beautiful", "awe", "wonder", "aesthetic", "serene", "dream"),
           "scale": ("scale", "vast", "isolation", "lonel", "small", "power", "domina"),
           "speed": ("speed", "kinetic", "velocity", "momentum", "rush", "energy")}
RULE_KEYS = ["dur", "motion", "subj_size", "subj_thirds", "neg_space", "contrast", "light_share", "dark_share",
             "two_tone", "sat_mean", "detail"]


def effect_class(text: str) -> list[str]:
    t = text.lower()
    return [k for k, words in EFFECTS.items() if any(w in t for w in words)]


def rules() -> Path:
    """Join every reference's measured shots with its why answer: per effect class, the measured range of the craft
    choices that produced it, the most common placements / empty sides, and example shots. -> principles/rules.json"""
    by: dict[str, list[dict]] = {k: [] for k in EFFECTS}
    book: dict[str, list[str]] = {}
    for wf in sorted(OUT.glob("*.why.json")):
        slug = wf.name[:-len(".why.json")]
        try:
            ans = json.loads(json.loads(wf.read_text(encoding="utf-8"))["verbatim"])
        except (ValueError, KeyError):
            continue
        shot_rows = json.loads((OUT / f"{slug}.shots.json").read_text(encoding="utf-8"))["rows"]
        starts = {round(r["start"], 2): r for r in shot_rows}
        items = ans.get("shots", []) if isinstance(ans, dict) else [a for a in ans if "start" in a]
        book[slug] = ans.get("rules", []) if isinstance(ans, dict) else []
        for a in items:
            try:
                r = starts.get(round(float(a["start"]), 2))
            except (TypeError, ValueError):
                continue
            if not r:
                continue
            for k in effect_class(str(a.get("effect", ""))):
                by[k].append({**r, "slug": slug, "decision": a.get("decision", ""), "why": a.get("why", ""),
                              "music": a.get("music", "")})
    out = {"effects": {}, "rules_by_video": book}
    for k, rs in by.items():
        if not rs:
            continue
        rng = {m: {q: round(float(np.percentile([r[m] for r in rs], p)), 3) for q, p in (("p10", 10), ("p50", 50), ("p90", 90))}
               for m in RULE_KEYS}
        sides = {s: sum(1 for r in rs if r["neg_side"] == s) for s in ("left", "right", "top", "bottom", "even")}
        keys = {s: sum(1 for r in rs if r["key"] == s) for s in ("low", "mid", "high")}
        ex = sorted(rs, key=lambda r: -len(r["decision"]))[:8]
        out["effects"][k] = {"shots": len(rs), "range": rng, "neg_side": sides, "key": keys,
                             "examples": [f"{r['slug']}@{r['start']}: {r['decision']} | why: {r['why']} | music: {r['music']}"
                                          for r in ex]}
    f = OUT / "rules.json"
    f.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    return f


def _frame(ref: str) -> Path:
    slug, t = ref.split("@")
    t = float(t)
    stills = sorted((FRAMES / slug).glob("*.*.jpg"), key=lambda p: abs(float(p.stem) - t))
    if not stills:
        raise SystemExit(f"no frames for {slug} (python -m raymi refs frames {slug})")
    return stills[0]


def learn(slug: str) -> Path:
    stills = sorted((FRAMES / slug).glob("*.*.jpg"), key=lambda p: float(p.stem))
    rows = [{"t": float(p.stem), **measure(_load(p))} for p in stills[::2]]          # every 1 s
    OUT.mkdir(parents=True, exist_ok=True)
    nums = {k: [r[k] for r in rows] for k in KEYS}
    summary = {k: {"p10": round(float(np.percentile(v, 10)), 3), "p50": round(float(np.percentile(v, 50)), 3),
                   "p90": round(float(np.percentile(v, 90)), 3)} for k, v in nums.items() if v}
    harm = {h: sum(1 for r in rows if r["harmony"] == h) for h in ("mono", "analogous", "triad", "complementary")}
    f = OUT / f"{slug}.json"
    f.write_text(json.dumps({"slug": slug, "frames": len(rows), "summary": summary, "harmony": harm, "rows": rows},
                            indent=0), encoding="utf-8", newline="\n")
    return f


def card(name: str, refs: list[str], why: str = "", skip: list[str] | None = None) -> dict:
    """A principle card: the measured range of chosen reference frames for one moment class."""
    ms = [measure(_load(_frame(r))) for r in refs]
    rng = {k: [round(min(m[k] for m in ms), 3), round(max(m[k] for m in ms), 3)] for k in KEYS}
    c = {"refs": refs, "why": why, "skip": skip or [], "range": rng, "harmony": sorted({m["harmony"] for m in ms}),
         "key": sorted({m["key"] for m in ms})}
    cards = json.loads(CARDS.read_text(encoding="utf-8")) if CARDS.is_file() else {}
    cards[name] = c
    CARDS.write_text(json.dumps(cards, indent=1, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    return c


def gap(m: dict, c: dict, slack: float = 0.05) -> list[str]:
    """Where our frame leaves the card's range (with a little slack): the rules it breaks."""
    out = []
    for k, (lo, hi) in c["range"].items():
        if k in ("light_x", "light_y", "subj_x", "subj_y") or k in c.get("skip", []):
            continue
        v = m[k]
        if v < lo - slack:
            out.append(f"{k} {v} < {lo}")
        elif v > hi + slack:
            out.append(f"{k} {v} > {hi}")
    if c.get("key") and m["key"] not in c["key"]:
        out.append(f"key {m['key']} not in {c['key']}")
    return out


def main(argv: list[str]) -> None:
    cmd, rest = argv[0], argv[1:]
    if cmd == "learn":
        slugs = sorted(p.name for p in FRAMES.iterdir() if p.is_dir()) if rest[0] == "all" else rest
        for s in slugs:
            print(learn(s))
    elif cmd == "shots":
        slugs = sorted(p.stem for p in (REFS / ".cache").glob("*.mp4")) if rest[0] == "all" else rest
        for s in slugs:
            print(shots(s))
    elif cmd == "rules":
        print(rules())
    elif cmd == "why":
        slugs = sorted(p.stem for p in (REFS / ".cache").glob("*.mp4")) if rest[0] == "all" else             [s for s in rest if not s.startswith("--")]
        for s in slugs:
            if (OUT / f"{s}.why.json").is_file() and "--force" not in rest:
                continue
            try:
                print(why(s))
            except SystemExit as e:           # one busy / refused video does not stop the others
                print(s, e)
    elif cmd == "card":
        reason, skip = "", []
        if "--skip" in rest:
            i = rest.index("--skip")
            skip, rest = rest[i + 1].split(","), rest[:i] + rest[i + 2:]
        if "--why" in rest:
            i = rest.index("--why")
            reason, rest = rest[i + 1], rest[:i] + rest[i + 2:]
        print(json.dumps(card(rest[0], rest[1:], reason, skip), indent=1, ensure_ascii=False))
    elif cmd == "measure":
        m = measure(_load(Path(rest[0])))
        print(json.dumps(m, indent=1))
        if "--card" in rest:
            name = rest[rest.index("--card") + 1]
            c = json.loads(CARDS.read_text(encoding="utf-8"))[name]
            g = gap(m, c)
            print(f"card {name}: " + ("inside the range" if not g else "OUTSIDE: " + "; ".join(g)))


if __name__ == "__main__":
    main(sys.argv[1:])

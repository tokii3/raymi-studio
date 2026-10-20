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
       "hero": ["crown"],                          # the video's main element(s) this shot must show readably
       "why": "the feeling this shot serves"}],
     "heroes": {"crown": {"kind": "worn", "size": [0.13, 0.07], "min": 0.05}},   # the main element(s) (3_TREATMENT)
     "acts": [{"at": 0, "grade": "day"}, {"at": 77.9, "grade": "night"}],  # the look step: one grade per act (grade.ts)
     "lyric_style": "v2",                          # default v2 (heavy, scene colour, lit, romaji + English); "v1" = old jobs
     "translation": "lyrics_en.json"}              # per line {"roma", "en"}: default <lyrics folder>/lyrics_en.json

Lyrics v2 fields (shot "lyrics"): "style" (per shot), "tilt" / "roll" (deg: lie on a surface, follow a diagonal),
"key_scale" (key word size, default 2.8), "sub": false (no romaji / English on purpose - write why in "why"),
"small": "<reason>" (smaller than the readable default on purpose). Colours come from the shot's grade unless the
lyric names "color". These are principles with defaults (PRINCIPLES 11), a written reason may break them.

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
MASK_N = 16
_MASKS: dict[str, list[str]] = {}


def _silhouette(file: str) -> list[str]:
    """Her coarse silhouette in the sprite: MASK_N rows of MASK_N '0'/'1' cells (alpha > 8 % of the cell), so the
    lyric guard knows where her body really is - the trimmed sprite box is mostly empty around a crouch / spread
    arms (toki 2026-10-20 FIRESTARTER: lyrics on her body, while beside her was free)."""
    if file not in _MASKS:
        import cv2
        import numpy as np
        img = cv2.imread(str(REPO / file), cv2.IMREAD_UNCHANGED)
        if img is None or img.ndim < 3 or img.shape[2] < 4:
            _MASKS[file] = ["1" * MASK_N] * MASK_N
        else:
            a = (img[:, :, 3] > 40).astype(np.float32)
            cell = cv2.resize(a, (MASK_N, MASK_N), interpolation=cv2.INTER_AREA)
            _MASKS[file] = ["".join("1" if v > 0.08 else "0" for v in row) for row in cell]
    return _MASKS[file]


FORMATS = {"mv": ("MV", 1920, 1080), "short": ("MVShort", 1080, 1920),
           "pilot": ("MV", 1920, 1080)}   # pilot = the MV frame over shots.json window.pilot (a 20-40 s section)
ACTS = {"idle", "pop", "hop", "bounce", "shake", "tilt", "lean", "shrink", "turn", "stomp", "float"}
EASES = {"linear", "in", "out", "inOut", "snap", "hold"}
LYRIC_KINDS = {"sign", "float", "stamp", "glass", "card", "ticker", "firework"}
# what a lyric is MADE of on its object (Words3D): breath-fog, engraved brass, a phone's camera UI, a card's print,
# the felt's gold print, light
LYRIC_MATERIALS = {None, "fog", "engraved", "screen", "print", "felt", "light"}
TRANSITIONS = {"cut", "bubbles", "ink", "whip", "flash", "pass", "rewind"}
GRADES = {"day", "closing", "night", "own", "warm", "clean", "ember"}   # studio/src/film/grade.ts TONES (a test keeps them equal)
LYRIC_STYLES = {"v1", "v2"}
# a main element: worn on her head (crown, hat), her face, a lyric word, a prop box in the set (check.ts heroBox)
HERO_KINDS = {"worn", "face", "word", "prop"}
ICONS = {None, "!", "?", "heart", "sweat", "anger", "zz", "bulb", "sparkle", "music"}
DEFAULT_HEIGHT = 1.55   # Raymi's figure height in metres (ears to feet)
# set options written in SONG seconds (the script's measured times); the compiler turns them into film frames so a
# set event lands on the same beat in the MV, the Short and a pilot window
TIME_OPTS = {"banks_off", "cap_lift", "cap_off", "cap_pick", "card_flutter", "card_pass_lens", "card_rain", "coin_drop",
             "coin_rain", "crowd_in", "crowd_look", "crowd_out", "crown_from", "deck_slide", "deck_tip", "flash_seq",
             "glow_out", "hall_lights", "last_phone_down", "led_blink", "led_flip", "salmon_arrive", "salmon_coin",
             "swarm_beam", "taps", "warning_flash", "bulb_pop", "coin_flick", "coin_roll", "coin_spin", "collapse",
             "flick", "gust", "house_keys", "king_kick", "king_rot", "pickup", "pool_on", "rays_pass_lens", "shuffle",
             "slaps", "spade_glow", "swarm_peel", "topple", "warning_cards", "warning_slash", "burst_at",
             "ignite_at", "erupt_at", "lit_at", "rise_at",
             # FIRESTARTER build (sets/Deep, sets/NightSea, Film): the fire's life, the vents, the current, the colour
             # wave, the cliff, the column, the surface, her glow colour over time, the tail whip, a grade change
             "rewind_at", "dark_at", "kill_at", "vents_at", "flares", "shells", "current_at", "tint_at",
             "cliff_ignite_at", "cliff_steps", "column_at", "column_bend_at", "column_unbend_at", "column_pulse",
             "pool_at", "sea_glow_at", "pulse_at", "dots_at", "path_at", "cloud_at", "rain_at", "rain_end_at", "fireworks",
             "glow", "whip", "grade_at"}
# options holding specs (a dict or a list of dicts) whose own fields are times / positions (three/fire.tsx,
# three/creatures.tsx): "at" / "out" / "toss" / "*_at" = song seconds -> frames, "grow" / "fade" / "ember" = seconds ->
# frame counts, "pos" / "from" / "to" = a mark or [x, y, z]
NESTED_OPTS = {"fires", "sparks", "fish", "school", "sauna", "salmon", "props"}
NESTED_TIME = {"at", "out", "toss"}
NESTED_FRAMES = {"grow", "fade", "ember"}
NESTED_VEC = {"pos", "from", "to"}

REL_OPTS = {"hands"}                               # set options in seconds from the shot start


def time_opt(v, fr):
    """song seconds -> film frames inside a set option: 12.3 | [t, ...] | [[t, x], ...] | [t, "left"]; else as is."""
    num = lambda x: isinstance(x, (int, float)) and not isinstance(x, bool)    # noqa: E731
    if num(v):
        return fr(v)
    if isinstance(v, list):
        if len(v) == 2 and num(v[0]) and isinstance(v[1], str):
            return [fr(v[0]), v[1]]
        return [time_opt(x, fr) if (num(x) or isinstance(x, list)) else x for x in v]
    return v


def nested_opt(v, fr, marks: dict, errors: list[str], tag: str):
    """A spec option (dict or list of dicts): its times to film frames, its positions to [x, y, z]."""
    if isinstance(v, list):
        return [nested_opt(x, fr, marks, errors, tag) for x in v]
    if not isinstance(v, dict):
        return v
    out = {}
    for k, x in v.items():
        if k in NESTED_VEC:
            out[k] = _v3(x, marks, errors, f"{tag} {k}")
        elif k in NESTED_TIME or k.endswith("_at"):
            out[k] = time_opt(x, fr)
        elif k in NESTED_FRAMES and isinstance(x, (int, float)):
            out[k] = max(1, round(float(x) * FPS))
        else:
            out[k] = x
    return out


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


# Framing her in the 3D space (the 3D twin of studio/src/framing.ts): a camera key {"frame": "close"} is solved
# from her sprite plane - the head fully in, every cut edge fully out (hard rule 9), the head at the shot size's
# share of the frame. "from" = the side the lens is on (a set camera or a point; default the key's "cam").
FRAME_SHARE = {"huge": 0.72, "extreme": 0.46, "close": 0.3, "medium": 0.17}   # head height / frame height (as framing.ts)
# "huge": thumbnails only (toki 2026-10-20 FIRESTARTER thumbs) - the head box holds her long hair, so 46 % read as a
# small face at feed size; 72 % makes the FACE the picture
FRAME_FIGURE = 0.66                                            # wide: figure height / frame height
FRAME_SIDE = {"center": 0.5, "left": 0.38, "right": 0.62}
ACT_LIFT = {"hop": 0.3, "float": 0.2, "bounce": 0.07}
# how far an act squashes her height (motion.ts puppetAt; every fresh pose also enters with a ~5 % pop)
ACT_SQUASH = {"shrink": 0.16, "pop": 0.13, "stomp": 0.17, "hop": 0.13}


def _squash(k: dict) -> float:
    return ACT_SQUASH.get(k["act"], 0.06) + 0.02


def _vfov(fov16x9: float, aspect: float) -> float:
    """Vertical fov the renderer really uses (studio/src/film/motion.ts fovFor)."""
    if aspect >= 1:
        return fov16x9
    h = math.atan(math.tan(math.radians(fov16x9) / 2) * 0.95)
    return math.degrees(2 * math.atan(math.tan(h) / aspect))


def plane_size(k: dict) -> tuple[float, float]:
    span = max(0.2, k["feet"] - k["top"])
    h = k["height"] / span
    return h * k["size"][0] / k["size"][1], h


def _plane_points(k: dict, lift: float):
    """Her plane in local metres (x right, y world height): cut-edge samples and head corners."""
    w, h = plane_size(k)
    fx = -1 if k.get("flip") else 1
    X = lambda u: (u - 0.5) * w * fx                                # noqa: E731
    Y = lambda v: (k["feet"] - v) * h + k["pos"][1]                 # noqa: E731
    edges = []
    for side in k["cuts"]:
        for i in range(13):
            q = i / 12
            u, v = {"left": (0.01, q), "right": (0.99, q), "top": (q, 0.01), "bottom": (q, 0.99)}[side]
            for dl in (0.0, lift):
                y = Y(v) + dl
                if side == "top":                                   # a squash pulls the top edge down
                    y = k["pos"][1] + (y - k["pos"][1]) * (1 - _squash(k))
                if y < -0.01:                                       # under the opaque floor: hidden
                    continue
                edges.append((X(u), y))
    x0, y0, x1, y1 = k["head"]
    head = [(X(u), Y(v) + dl) for u in (x0, x1) for v in (y0, y1) for dl in (0.0, lift)]
    return edges, head


def frame_window(keys: list[dict], aspect: float, size: str, side: str = "center", lift: float = 0.0,
                 scale: float = 1.0, top: float = 0.2):
    """The frame on her sprite plane (centre x / y relative to her feet point, half-height s, metres) that shows the
    head of every key fully and none of their cut edges, at the shot size's head share (x scale) or the largest
    that fits. Returns (cx, cy, s, lo, hi): lo..hi = every frame centre x that works. None = impossible."""
    xs_lo, xs_hi, ys_lo, ys_hi = [], [], [], []          # cut constraints: frame L > x, R < x, B > y, T < y
    hx0 = hy0 = math.inf
    hx1 = hy1 = -math.inf
    fig_top, feet_y = -math.inf, math.inf
    for k in keys:
        w, h = plane_size(k)
        X = lambda u: (u - 0.5) * w * (-1 if k.get("flip") else 1)  # noqa: E731
        Y = lambda v: (k["feet"] - v) * h + k["pos"][1]             # noqa: E731
        mx, my = 0.06 * w, 0.05 * h                                 # squash / breathing / kick room
        cuts = set(k["cuts"])
        for sd, u in (("left", 0.01), ("right", 0.99)):             # a flipped sprite mirrors its sides
            if sd in cuts:
                e = X(u)
                if e <= X(1 - u):
                    xs_lo.append(e + mx)
                else:
                    xs_hi.append(e - mx)
        if "top" in cuts:
            ys_hi.append(k["pos"][1] + (Y(0.01) - k["pos"][1]) * (1 - _squash(k)) - my)
        if "bottom" in cuts and Y(0.99) + lift > -0.01:             # a bottom under the opaque floor is hidden
            ys_lo.append(Y(0.99) + lift + my)
        x0, y0, x1, y1 = k["head"]
        ax, bx = sorted((X(x0), X(x1)))
        hm = 0.06 * (y1 - y0) * h
        hx0, hx1 = min(hx0, ax - hm), max(hx1, bx + hm)
        hy0, hy1 = min(hy0, Y(y1) - hm), max(hy1, Y(y0) + lift + hm)
        fig_top, feet_y = max(fig_top, Y(k["top"]) + lift), min(feet_y, k["pos"][1])
    a = aspect
    if size == "wide":
        want = (fig_top - feet_y) / (2 * FRAME_FIGURE)
    else:
        want = (hy1 - hy0) / (2 * FRAME_SHARE[size])
    want *= scale

    def feasible(s):
        lo = max([x + a * s for x in xs_lo] + [hx1 - a * s])
        hi = min([x - a * s for x in xs_hi] + [hx0 + a * s])
        ylo = max([y + s for y in ys_lo] + [hy1 - s])
        yhi = min([y - s for y in ys_hi] + [hy0 + s])
        return (lo, hi, ylo, yhi) if lo <= hi and ylo <= yhi else None
    s = want
    while s > 0.02 and feasible(s) is None:
        s *= 0.97
    win = feasible(s)
    if win is None:
        return None
    lo, hi, ylo, yhi = win
    hcx = (hx0 + hx1) / 2
    cx = min(hi, max(lo, hcx - (FRAME_SIDE.get(side, 0.5) - 0.5) * 2 * a * s))
    pref_y = (feet_y - s + 0.23 * s) if size == "wide" else (hy1 + (2 * top - 1) * s)   # head top at `top` from the frame top
    cy = min(yhi, max(ylo, pref_y))
    return cx, cy, s, lo, hi


def _ndc(C, L, t, a, X):
    """Pinhole projection as three.js lookAt with up = +Y (no roll): normalised device x, y or None behind."""
    f = [L[i] - C[i] for i in range(3)]
    n = math.sqrt(sum(v * v for v in f))
    f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]
    rn = math.hypot(r[0], r[2]) or 1.0
    r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [X[i] - C[i] for i in range(3)]
    z = sum(d[i] * f[i] for i in range(3))
    if z <= 0.05:
        return None
    return sum(d[i] * r[i] for i in range(3)) / (z * t * a), sum(d[i] * u[i] for i in range(3)) / (z * t)


def frame_camera(c: dict, base: dict, pkeys: list[dict], kf: int, aspect: float, marks: dict,
                 errors: list[str], tag: str):
    size = c["frame"]
    if size not in FRAME_SHARE and size != "wide":
        errors.append(f"{tag}: frame must be one of {sorted(FRAME_SHARE) + ['wide']}")
        return None
    if not pkeys:
        errors.append(f"{tag}: frame needs Raymi in the shot")
        return None
    act = [k for k in pkeys if k["f"] <= kf] or pkeys[:1]
    k0 = act[-1]
    same = [k for k in pkeys if math.dist(k["pos"], k0["pos"]) < 0.05]   # every pose she holds on this spot
    lift = max([ACT_LIFT.get(k["act"], 0.0) + k["arc"] for k in same] + [0.0])
    fov = float(c.get("fov", base.get("fov", 30)))
    src = c.get("from", base.get("pos"))
    src = _v3(src, marks, errors, tag) if src is not None else [k0["pos"][0], 1.0, k0["pos"][2] + 3]
    if src is None:
        return None
    p = k0["pos"]
    dx, dz = src[0] - p[0], src[2] - p[2]
    nn = math.hypot(dx, dz) or 1.0
    dx, dz = dx / nn, dz / nn                            # the lens side: her plane faces it (cylindrical billboard)
    rx, rz = dz, -dx                                     # her plane's right axis
    t = math.tan(math.radians(_vfov(fov, aspect)) / 2)
    pts = [_plane_points(k, lift) for k in same]
    world = lambda x, y: [p[0] + rx * x, y, p[2] + rz * x]          # noqa: E731
    up = float(c.get("rise", 0.0))                       # lens above the frame centre (m): looks down on her

    def passes(C, L):
        for edges, head in pts:
            for hx, hy in head:
                q = _ndc(C, L, t, aspect, world(hx, hy))
                if q is None or abs(q[0]) > 0.94 or abs(q[1]) > 0.94:
                    return False
            for ex, ey in edges:
                q = _ndc(C, L, t, aspect, world(ex, ey))
                if q is not None and abs(q[0]) < 1.03 and abs(q[1]) < 1.03:
                    return False
        return True
    # The lens sits on her plane's normal (the billboard faces it), so a frame centre beside her looks obliquely:
    # every candidate is checked with the real pinhole projection before it is taken.
    for scale in [1.0 - 0.05 * i for i in range(16)]:
        win = frame_window(same, aspect, size, c.get("side", "center"), lift, scale, float(c.get("top", 0.2)))
        if win is None:
            break
        cx, cy, s, lo, hi = win
        cands = sorted({min(hi, max(lo, cx + (hi - lo) * q)) for q in (0, -0.1, 0.1, -0.25, 0.25, -0.5, 0.5, -1, 1)},
                       key=lambda v: abs(v - cx))
        for x in cands:
            for yy in (cy, cy + 0.1 * s, cy - 0.1 * s):
                d = s / t
                C = [p[0] + dx * d, yy + up, p[2] + dz * d]
                L = world(x, yy)
                if passes(C, L):
                    return [round(v, 3) for v in C], [round(v, 3) for v in L], fov
    errors.append(f"{tag}: no {size} frame of {k0['sprite']} shows her whole head without a cut edge in "
                  f"{'16:9' if aspect >= 1 else '9:16'} - choose a clean sprite (or set her height for a bust)")
    return None


def glyph_errors(texts: list[str], cmap: set[int]) -> list[str]:
    out = []
    for t in texts:
        miss = sorted({c for c in t if not c.isspace() and ord(c) not in cmap})
        if miss:
            out.append(f"Raymi font has no glyph for {''.join(miss)} in {t!r} - build it in her style: "
                       f"python -m raymi font ensure <job> (never a fallback font)")
    return out


def is_japanese(text: str) -> bool:
    """Kana, kanji or Hangul in a line: it gets its romanisation + English under it (lyrics v2; K-pop lines too)."""
    return any(0x3040 <= ord(c) <= 0x30FF or 0x4E00 <= ord(c) <= 0x9FFF or c == "〇" or 0xAC00 <= ord(c) <= 0xD7A3
               for c in text)


def load_translation(job: Path, spec: dict) -> dict:
    """{line text: {"roma", "en"}} from the job's translation file (own, safe translation; raymi lyrics_en)."""
    path = spec.get("translation")
    if path is None and spec.get("lyrics"):
        cand = _rel(job, spec["lyrics"]).parent / "lyrics_en.json"
        path = cand if cand.is_file() else None
    elif path is not None:
        path = _rel(job, path)
    if not path or not Path(path).is_file():
        return {}
    return json.loads(Path(path).read_text(encoding="utf-8")).get("lines", {})


def act_grade(acts: list, t: float) -> str | None:
    g = None
    for a in sorted(acts, key=lambda x: float(x.get("at", 0))):
        if float(a.get("at", 0)) <= t + 1e-6:
            g = a.get("grade")
    return g


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
    trans = load_translation(job, spec)
    job_style = spec.get("lyric_style", "v2")             # v2 = the studio default (toki 2026-10-19); v1 = jobs made before
    acts = spec.get("acts") or []
    for a_ in acts:
        if a_.get("grade") not in GRADES:
            errors.append(f"acts: grade {a_.get('grade')!r} is not in the grade library {sorted(GRADES)} (studio/src/film/grade.ts)")
    heroes = spec.get("heroes") or {}
    heavy = False
    shots, sprites, screen_texts = [], set(), []
    for i, s in enumerate(shots_in):
        tag = f"shot {i + 1}"
        a = starts[i]
        b = starts[i + 1] if i + 1 < len(starts) else t_to
        if a is None or b is None:
            continue
        if a >= t_to - 1e-6:                               # after this format's window (Short, pilot): dropped
            continue
        if b <= a:
            errors.append(f"{tag}: starts at {a:.2f} s, not before the next shot ({b:.2f} s)")
            continue
        if b <= t_from + 1e-6:                             # before the window: dropped
            continue
        b = min(b, t_to)
        st = s.get("set")
        if st not in sets:
            errors.append(f"{tag}: unknown set {st!r} (built sets: {sorted(sets)})")
            continue
        marks, cams = sets[st]["marks"], sets[st]["cams"]
        # Raymi
        pkeys = []
        for k, r in enumerate(s.get("raymi", [])):
            ktag = f"{tag} raymi key {k + 1}"
            if fmt == "short" and isinstance(r.get("short"), dict):
                r = {**r, **r["short"]}                   # the Short plays its own beat here (sprite / pos)
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
                          "head": [float(x) for x in head], "mask": _silhouette(info["file"]),
                          "pos": pos, "height": float(r.get("height", DEFAULT_HEIGHT)), "act": r.get("act", "idle"),
                          "icon": r.get("icon"), "flip": bool(r.get("flip", False)), "rot": float(r.get("rot", 0)),
                          "move": round(float(r.get("move", 0.0)) * FPS), "arc": float(r.get("arc", 0.0)),
                          "ease": r.get("ease", "inOut")})
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
            kf = fr(_key_time(c.get("at", 0), a, b))
            if "frame" in c:                              # the lens frames HER by shot size, cut edges always out
                fc = frame_camera(c, base, pkeys, kf, W / H, marks, errors, ktag)
                if fc is None:
                    continue
                pos, look, fov = fc
                ckeys.append({"f": kf, "pos": pos, "look": look, "fov": fov, "roll": float(c.get("roll", 0)),
                              "ease": c.get("ease", "inOut")})
                continue
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
            ckeys.append({"f": kf, "pos": pos, "look": look,
                          "fov": float(c.get("fov", base.get("fov", 35))), "roll": float(c.get("roll", 0)),
                          "ease": c.get("ease", "inOut")})
        if not ckeys:
            errors.append(f"{tag}: needs at least one camera key")
            continue
        # lyrics living in this shot
        lyr = s.get("lyrics")
        if lyr is None and job_style == "v2" and spec.get("all_lyrics", True) and not s.get("text")                 and not s.get("acted") and any(round(a * FPS) <= w["cut"] < round(b * FPS) and t_from <= w["t0"] < t_to
                                               for ln in lyrics for w in ln["words"]):
            # toki 2026-10-20 (FIRESTARTER final: "die Hälfte fehlt"): every sung word is on screen. A shot without a
            # lyric block gets one at the camera's look point, facing the lens; guard.mjs --fill places it in the frame's
            # empty space. A shot that ACTS its line instead says "acted": "<why>".
            lk = ckeys[0]["look"]; cp = ckeys[0]["pos"]
            lyr = {"kind": "sign", "anchor": [round(v, 2) for v in lk], "size": 0.3, "width": 4.0,
                   "rot": round(math.degrees(math.atan2(cp[0] - lk[0], cp[2] - lk[2])), 1), "auto": True}
        text = s.get("text")                              # words that are not sung (a title in the picture: the cold
        if text and lyr:                                  # open's 'FIRE. UNDERWATER.'), timed from the shot start
            errors.append(f"{tag}: a shot shows lyrics OR a text, not both")
        elif text:
            lyr = {k: v for k, v in text.items() if k != "say"}
        if lyr and fmt == "short" and isinstance(lyr.get("short"), dict):
            lyr = {**lyr, **lyr["short"]}                 # the Short frame is narrow: its own anchor / size / width
        fit = (s.get("lyrics_fit") or {}).get(fmt)      # guard.mjs --fill: the block placed in the frame's empty space
        if lyr and isinstance(fit, dict):
            lyr = {**lyr, **fit}
        L, words = None, []
        if lyr:
            if lyr.get("kind") not in LYRIC_KINDS:
                errors.append(f"{tag}: lyrics.kind must be one of {sorted(LYRIC_KINDS)}")
            if lyr.get("material") not in LYRIC_MATERIALS:
                errors.append(f"{tag}: lyrics.material must be one of {sorted(m for m in LYRIC_MATERIALS if m)}")
            anchor = _v3(lyr.get("anchor", "center"), marks, errors, f"{tag} lyrics")
            keys = {k.lower() for k in lyr.get("key", [])}
            L = {"kind": lyr.get("kind", "sign"), "anchor": anchor or [0, 1, 0], "rotY": float(lyr.get("rot", 0)),
                 "size": float(lyr.get("size", 0.3)), "width": float(lyr.get("width", 4.0)),
                 "color": lyr.get("color", "#ffffff"), "accent": lyr.get("accent", "#ffcf6b"),
                 "outline": lyr.get("outline", "#1a0b33"), "lit": bool(lyr.get("lit", False)),
                 "over": bool(lyr.get("over", False)),       # true = the words cross her face ON PURPOSE (written why)
                 "material": lyr.get("material")}             # what the words are made of (Words3D): fog, screen ...
            style = lyr.get("style", job_style)
            if style not in LYRIC_STYLES:
                errors.append(f"{tag}: lyrics.style must be one of {sorted(LYRIC_STYLES)}")
            if style == "v2":
                heavy = True
                L.update({"style": "v2", "tilt": float(lyr.get("tilt", 0)), "roll": float(lyr.get("roll", 0)),
                          "keyScale": float(lyr.get("key_scale", 2.8)), "auto": "color" not in lyr,
                          "small": lyr.get("small"), "subs": {}, "reveal": lyr.get("reveal"), "dim": lyr.get("dim"),
                          "mirror": lyr.get("mirror")})
            if text:
                say = text.get("say") or []
                line_no = 10000 + i                       # never a lyric line index
                for wi, (w, t) in enumerate(say):
                    t1 = float(say[wi + 1][1]) if wi + 1 < len(say) else float(text.get("until", b - a))
                    words.append({"w": w, "from": fr(a + float(t)), "to": fr(a + t1), "key": w.lower() in keys,
                                  "line": line_no, "idx": wi, "em": P.text_em(w, heavy=style == "v2")})
                    screen_texts.append(w)
            only_lines = set(lyr["lines"]) if "lines" in lyr else (set() if text else None)   # a line can be ACTED instead of written
            only_words = set(lyr["words"]) if "words" in lyr else None
            if style == "v2" and spec.get("all_lyrics", True) and not text:
                # toki 2026-10-20: a line is never cut down to its key words - the chosen words are the BIG ones
                # (keys), the rest of the sung line is still written; only "acted": [line, ...] leaves a line out
                keys |= {w.lower() for w in (only_words or ())}
                only_words = None
                acted = lyr.get("acted")
                only_lines = None if not acted else {li for li in range(len(lyrics)) if li not in set(acted)}
            for li, ln in enumerate(lyrics):
                if only_lines is not None and li not in only_lines:
                    continue
                for wi, w in enumerate(ln["words"]):
                    if only_words is not None and w["w"] not in only_words:
                        continue
                    if round(a * FPS) <= w["cut"] < round(b * FPS) and t_from <= w["t0"] < t_to:   # frames, not floats
                        words.append({"w": w["w"], "from": w["cut"] - f0, "to": round(w["t1"] * FPS) - f0,
                                      "key": w["w"].lower() in keys or w["roma"] in keys, "line": li, "idx": wi,
                                      "em": P.text_em(w["w"], heavy=style == "v2")})   # exact width in her font (guards)
                        screen_texts.append(w["w"])
                if style == "v2" and lyr.get("sub", True) and is_japanese(ln["text"]) \
                        and any(x["line"] == li for x in words):
                    # toki 2026-10-19: a Japanese line ALWAYS shows romaji + English under it
                    tr = trans.get(ln["text"]) or trans.get(ln["text"].replace("\u3000", " "))
                    if not tr or not tr.get("en"):
                        errors.append(f"{tag}: line {li} ({ln['text']}) has no English in the translation file "
                                      f"(lyrics_en.json: {{\"<line>\": {{\"roma\": ..., \"en\": ...}}}}, own safe translation)")
                        continue
                    roma = tr.get("roma") or " ".join(w["roma"] for w in ln["words"])
                    L["subs"][str(li)] = {"roma": roma, "en": tr["en"],
                                          "romaEm": [P.text_em(t, heavy=True) for t in roma.split()],
                                          "enEm": [P.text_em(t, heavy=True) for t in tr["en"].split()]}
                    screen_texts += [roma, tr["en"]]
        opts = dict(s.get("opts") or {})
        if "grade" not in opts and acts:                   # the look step: the act's grade (a shot may name its own)
            g = act_grade(acts, a)
            if g:
                opts["grade"] = g
        if "grade" in opts and opts["grade"] not in GRADES:
            errors.append(f"{tag}: grade {opts['grade']!r} is not in the grade library {sorted(GRADES)}")
        short_opts = opts.pop("short", None)
        if fmt == "short" and isinstance(short_opts, dict):
            opts.update(short_opts)                        # the narrow frame's own set choices (e.g. a sign left out)
        for k in TIME_OPTS & opts.keys():
            opts[k] = time_opt(opts[k], fr)
        for k in REL_OPTS & opts.keys():                   # seconds from this shot's start
            opts[k] = time_opt(opts[k], lambda t, a=a: fr(a + t))
        for k in NESTED_OPTS & opts.keys():               # flames, strikes, creatures, props: their times + places
            if k in ("fires", "sparks") and isinstance(opts[k], list):   # a flame on HER (uv) needs no world place
                opts[k] = [{**x, "pos": x.get("pos", [0, 0, 0])} if isinstance(x, dict) else x for x in opts[k]]
            opts[k] = nested_opt(opts[k], fr, marks, errors, f"{tag} {k}")
        if lyr and lyr.get("anchor") == "led" and "led" in marks:
            opts["led"] = ""                               # a lyric written on the LED board replaces its text (stills 14)
        for k, v in opts.items():
            if isinstance(v, str) and v in cat:            # a sprite printed on a prop (a card, a poster, a screen)
                opts[k] = "sprites/" + Path(cat[v]["file"]).name
                sprites.add(opts[k])
            elif isinstance(v, str) and (k.startswith("text") or k in ("led", "title", "ticker")):
                screen_texts.append(v)
        tr = s.get("transition", {"kind": "cut", "frames": 0})
        if tr.get("kind") not in TRANSITIONS:
            errors.append(f"{tag}: transition.kind must be one of {sorted(TRANSITIONS)}")
        hero = []
        for h in s.get("hero", []):
            if fmt == "short" and isinstance(h, dict) and isinstance(h.get("short"), dict):
                h = {**{k: v for k, v in h.items() if k != "short"}, **h["short"]}   # the narrow frame's own reason
            name = h if isinstance(h, str) else h.get("name")
            spec_h = {**(heroes.get(name) or {}), **({} if isinstance(h, str) else h)}
            if name not in heroes:
                errors.append(f"{tag}: hero {name!r} is not named in shots.json 'heroes' (the treatment's main elements)")
                continue
            kind = spec_h.get("kind", "word")
            if kind not in HERO_KINDS:
                errors.append(f"{tag}: hero {name!r} kind must be one of {sorted(HERO_KINDS)}")
                continue
            hero.append({"name": name, "kind": kind, "word": spec_h.get("word", name), "min": float(spec_h.get("min", 0.05)),
                         "why_small": spec_h.get("why_small"), **({"uv": spec_h["uv"]} if "uv" in spec_h else {}),
                         **({"size": spec_h["size"]} if "size" in spec_h else {}),
                         **({"center": _v3(spec_h["center"], marks, errors, tag)} if "center" in spec_h else {})})
        shots.append({"id": s.get("id", f"s{i + 1}"), "from": max(0, fr(a)), "to": min(total, fr(b)), "set": st, "hero": hero,
                      "opts": opts, "camera": ckeys, "kick": float(s.get("kick", 1.0)), "puppets": pkeys,
                      "lyrics": L, "words": words,
                      "transition": {"kind": tr.get("kind", "cut"), "frames": int(tr.get("frames", 0)),
                                     **({"obj": tr["obj"]} if "obj" in tr else {}), **({"dir": tr["dir"]} if "dir" in tr else {})},
                      "events": [],
                      # readable set props (guard: never cut by the frame edge) + places the lens may never be
                      "texts": [{k: v for k, v in tx.items() if k not in ("opt", "unless", "blank")} for tx in sets[st].get("texts", [])
                                if (not tx.get("opt") or opts.get(tx["opt"])) and opts.get(tx.get("unless", ""), True) is not False
                                and not (tx.get("blank") and opts.get(tx["blank"]) == "")],
                      "noLens": sets[st].get("no_lens", []),
                      "solids": [{k: v for k, v in so.items() if k not in ("opt", "unless")} for so in sets[st].get("solids", [])
                                 if (not so.get("opt") or opts.get(so["opt"])) and opts.get(so.get("unless", ""), True) is not False]})
    if shots and shots[0]["from"] != 0:
        errors.append(f"the first shot must start at the window start ({t_from:.2f} s)")
    overlay = None
    sh = spec.get("short") or {}
    if fmt == "short" and sh.get("hook"):                  # the Short's hook (frame 0) and its comment question (CTA)
        hook_to = float(sh.get("hook_to", float(sh.get("hook_at", t_from)) + 2.43))
        overlay = {"hook": {"text": sh["hook"], "from": 0, "to": max(1, fr(hook_to))},
                   "cta": ({"text": sh["cta"], "from": max(0, fr(float(sh["cta_from"])))} if sh.get("cta") else None)}
        screen_texts += [sh["hook"]] + ([sh["cta"]] if sh.get("cta") else [])
        if overlay["cta"] and total - overlay["cta"]["from"] < round(2.5 * FPS):
            errors.append("short: the CTA must be readable >= 2.5 s before the end")
    if cmap is None:
        cmap = P.font_cmap()
    errors += glyph_errors(sorted(set(screen_texts)), cmap)
    hits = sorted({h for h in (round(x * FPS) - f0 for x in smap.get("hits", [])) if 0 <= h < total})
    beats = sorted({h for h in (round(x * FPS) - f0 for x in smap.get("beats", [])) if 0 <= h < total})
    props = {"composition": comp, "width": W, "height": H, "fps": FPS, "durationInFrames": total,
             "audio": ({"file": "audio" + Path(audio["file"]).suffix, "from": t_from, "to": t_to,
                        "src": _repo_path(_rel(job, audio["file"]))} if audio else None),
             "shots": shots, "hits": hits, "beats": beats, "sprites": sorted(sprites),
             "grain": float(spec.get("grain", 0.06)), "title": spec.get("title", job.name), "overlay": overlay,
             "heavy": heavy}
    return props, errors, warns


def compile_job(job: str, fmt: str = "mv") -> tuple[dict, list[str], list[str]]:
    d = P.job_dir(job)
    spec = json.loads((d / "shots.json").read_text(encoding="utf-8"))
    return compile_shots(d, spec, fmt)


def job_texts(job: str) -> list[str]:
    """Everything a film job shows on screen in either frame (lyric words of its shots + set texts)."""
    d = P.job_dir(job)
    spec = json.loads((d / "shots.json").read_text(encoding="utf-8"))
    everything = set(range(0x110000))
    texts: set[str] = set()
    for fmt in FORMATS:
        props, _, _ = compile_shots(d, spec, fmt, cmap=everything)
        for s in props["shots"]:
            texts |= {w["w"] for w in s["words"]}
            for sub in ((s.get("lyrics") or {}).get("subs") or {}).values():
                texts |= {sub["roma"], sub["en"]}
            texts |= {v for k, v in s["opts"].items() if isinstance(v, str) and not v.startswith("sprites/")
                      and (k.startswith("text") or k in ("led", "title", "ticker"))}
    return sorted(texts)


def frames_for(seconds: float) -> int:
    return int(math.floor(seconds * FPS))

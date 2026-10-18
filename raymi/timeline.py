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
FORMATS = {"mv": ("MV", 1920, 1080), "short": ("MVShort", 1080, 1920),
           "pilot": ("MV", 1920, 1080)}   # pilot = the MV frame over shots.json window.pilot (a 20-40 s section)
ACTS = {"idle", "pop", "hop", "bounce", "shake", "tilt", "lean", "shrink", "turn", "stomp", "float"}
EASES = {"linear", "in", "out", "inOut", "snap", "hold"}
LYRIC_KINDS = {"sign", "float", "stamp", "glass", "card", "ticker"}
# what a lyric is MADE of on its object (Words3D): breath-fog, engraved brass, a phone's camera UI, a card's print,
# the felt's gold print, light
LYRIC_MATERIALS = {None, "fog", "engraved", "screen", "print", "felt", "light"}
TRANSITIONS = {"cut", "bubbles", "ink", "whip", "flash", "pass"}
ICONS = {None, "!", "?", "heart", "sweat", "anger", "zz", "bulb", "sparkle", "music"}
DEFAULT_HEIGHT = 1.55   # Raymi's figure height in metres (ears to feet)
# set options written in SONG seconds (the script's measured times); the compiler turns them into film frames so a
# set event lands on the same beat in the MV, the Short and a pilot window
TIME_OPTS = {"banks_off", "cap_lift", "cap_off", "cap_pick", "card_flutter", "card_pass_lens", "card_rain", "coin_drop",
             "coin_rain", "crowd_in", "crowd_look", "crowd_out", "crown_from", "deck_slide", "deck_tip", "flash_seq",
             "glow_out", "hall_lights", "last_phone_down", "led_blink", "led_flip", "salmon_arrive", "salmon_coin",
             "swarm_beam", "taps", "warning_flash", "bulb_pop", "coin_flick", "coin_roll", "coin_spin", "collapse",
             "flick", "gust", "house_keys", "king_kick", "king_rot", "pickup", "pool_on", "rays_pass_lens", "shuffle",
             "slaps", "spade_glow", "swarm_peel", "topple", "warning_cards", "warning_slash", "burst_at"}


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
FRAME_SHARE = {"extreme": 0.46, "close": 0.3, "medium": 0.17}   # head height / frame height (as framing.ts)
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
                 scale: float = 1.0):
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
    pref_y = (feet_y - s + 0.23 * s) if size == "wide" else (hy1 - 0.6 * s)
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
        win = frame_window(same, aspect, size, c.get("side", "center"), lift, scale)
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
                          "head": [float(x) for x in head],
                          "pos": pos, "height": float(r.get("height", DEFAULT_HEIGHT)), "act": r.get("act", "idle"),
                          "icon": r.get("icon"), "flip": bool(r.get("flip", False)),
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
        if lyr and fmt == "short" and isinstance(lyr.get("short"), dict):
            lyr = {**lyr, **lyr["short"]}                 # the Short frame is narrow: its own anchor / size / width
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
                                      "key": w["w"].lower() in keys or w["roma"] in keys, "line": li, "idx": wi,
                                      "em": P.text_em(w["w"])})          # exact width in her font (guards)
                        screen_texts.append(w["w"])
        opts = dict(s.get("opts") or {})
        for k in TIME_OPTS & opts.keys():
            opts[k] = time_opt(opts[k], fr)
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
            texts |= {v for k, v in s["opts"].items() if isinstance(v, str) and not v.startswith("sprites/")
                      and (k.startswith("text") or k in ("led", "title", "ticker"))}
    return sorted(texts)


def frames_for(seconds: float) -> int:
    return int(math.floor(seconds * FPS))

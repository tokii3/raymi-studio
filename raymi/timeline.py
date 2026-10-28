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
       # 3D Raymi (top-level "vrm": "vrm/raymi5.vrm"): "actor" instead of "raymi" - held poses + clips on her rig
       "actor": [{"at": 0, "pose": "sing_soft", "motion": "idle", "motionMix": 0.3, "expr": {"joy": 0.4},
                  "pos": "desk", "rotY": "lens" | 20, "height": 1.55, "blend": 0.3, "act": "idle", "move": 0.4, "arc": 0,
                  "look": "lens" | null}],
       "mouth": {"gain": 0.6} | "silent",          # lip sync v2 from the sung words (gain 1 = full), or a closed mouth
       "face": {"angry": 0.7},                     # her feeling for keys without expr (else the job's "faces" by section:
                                                   #  top-level "faces": {"peak": {"main": {...}, "lens": {...}}, "calm": ...})
       "step": 2, "outline": 0.0035,               # she moves on twos (anime) / her ink line
       "fx": [{"kind": "duo", "at": 0, "to": "end", "dark": "#2a2e3e", "light": "#d6dbe8"}],   # the 2D layer (Fx2D.tsx)
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
"small": "<reason>" (smaller than the readable default on purpose), "cross": "<reason>" (a close shot: the words
may lie over her figure - toki 2026-10-19 "auch wenn lyrics sie mal überdecken" - but never on her face; the guard and
the fitter then avoid only her head). Colours come from the shot's grade unless the
lyric names "color". These are principles with defaults (PRINCIPLES 11), a written reason may break them.

compile() refuses (errors) anything that would reach the screen broken: unknown set / mark / camera / sprite, glyphs
the Raymi font lacks, times outside the window, non-increasing shots. The studio itself refuses cut sprite edges in
frame (studio/src/film/check.ts) - that needs the camera, so it runs in node before every render.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

from . import camera_moves as CM
from . import plan as P
from .travel import compose_thirds, face_walls, plan_travel

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
ACTS = {"idle", "pop", "hop", "bounce", "shake", "tilt", "lean", "shrink", "turn", "stomp", "float",
        "flatten"}   # flatten: she goes flat like a ray (3D only, VrmPuppet)
EASES = {"linear", "in", "out", "inOut", "snap", "hold"}
LYRIC_KINDS = {"sign", "float", "stamp", "glass", "card", "ticker", "firework"}
# what a lyric is MADE of on its object (Words3D): breath-fog, engraved brass, a phone's camera UI, a card's print,
# the felt's gold print, light
LYRIC_MATERIALS = {None, "fog", "engraved", "screen", "print", "felt", "light"}
TRANSITIONS = {"cut", "bubbles", "ink", "whip", "flash", "pass", "rewind", "spin", "zoom",
               "cover"}   # cover: her palm / hair / tail or a frame bar fills the lens, the cut hides inside (Watch Me)
GRADES = {"day", "closing", "night", "own", "warm", "clean", "ember", "vrm_fire", "pov", "pov_warm", "wm_paper", "wm_night", "wm_gold", "war_night", "war_ink", "war_white"}   # studio/src/film/grade.ts TONES (a test keeps them equal)
LYRIC_STYLES = {"v1", "v2"}
# a main element: worn on her head (crown, hat), her face, a lyric word, a prop box in the set (check.ts heroBox)
HERO_KINDS = {"worn", "face", "word", "prop"}
ICONS = {None, "!", "?", "heart", "sweat", "anger", "zz", "bulb", "sparkle", "music", "bubbles"}
# things on her bones (studio/src/three/wearables.tsx WEARABLES - a test keeps them equal) and the bones they ride
WEARABLES = {"chopsticks", "chopsticks_slice", "salmon_hood", "salmon_fin", "salmon_tail"}
WEAR_AT = {"hand_r", "hand_l", "head", "forearm_r", "forearm_l", "hips"}
DEFAULT_HEIGHT = 1.55   # Raymi's figure height in metres (ears to feet)
# set options written in SONG seconds (the script's measured times); the compiler turns them into film frames so a
# set event lands on the same beat in the MV, the Short and a pilot window
TIME_OPTS = {"lights_off", "window_break", "unfold", "shake", "cracks", "burst", "letters", "page", "beach_flash",
             "banks_off", "cap_lift", "cap_off", "cap_pick", "card_flutter", "card_pass_lens", "card_rain", "coin_drop",
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
             "glow", "whip", "grade_at",
             # POV Shorts (2026-10-23): her chest dots flare, a room lamp / the train lights, the live studio camera
             "glow_flare", "lamp_at", "live", "door_at",
             # Watch Me sets (three/sets/Shoot, Corner, Exhibit): studio flashes, the bulb, the lamp, the crossed sign
             "flash", "bulb_flicker", "lamp_flick", "crossed",
             # three/setfx.tsx (any set): rain / wind as [[t, v]], floor events, light writing, letters, her tail at the lens
             "rain", "wind", "splash", "tail_slap", "lightwriting", "letters_off", "tail_lens", "barb_lens", "tail_twitch", "fold",
             "sonar", "paparazzi", "finwave",
             # Love is War (2026-10-25): lightning (three/lighthouse.tsx), ink slashes (sets/Paper), cable pulses (three/cables.tsx)
             "lightning", "ink_slash", "cable_pulse", "ink_at", "black_at", "two_tone",
             # Love is War build (2026-10-26): the 1-beat colour flip on the measured minor-chord turns (Film.tsx)
             "flip_at", "flood", "ceiling_beam", "cloud_wall", "clear_at", "lantern_violet", "eye_open", "ring_at",
             "rain_stutter", "wave_shove", "spray_halo", "bubble_pulse", "ripple_at", "wave_smash", "splash_lens", "hair_whip",
             "halo_ramp", "rain_ring", "grain_pulse", "arm_current", "beam_settle", "stars_at", "ink_sky_at", "pov_hand",
             "beam_color"}
# options holding specs (a dict or a list of dicts) whose own fields are times / positions (three/fire.tsx,
# three/creatures.tsx): "at" / "out" / "toss" / "*_at" = song seconds -> frames, "grow" / "fade" / "ember" = seconds ->
# frame counts, "pos" / "from" / "to" = a mark or [x, y, z]
NESTED_OPTS = {"fires", "sparks", "fish", "school", "sauna", "salmon", "props", "things", "strings", "boss", "crowd",
               "stage", "world"}   # world: three/world.tsx (a set leaves / arrives piece by piece); stage: three/staging.tsx (Watch Me: covers, frames, forecast, radar assemble around her)
NESTED_TIME = {"at", "out", "toss", "snap", "tug", "spit", "land", "blow_at", "press_at"}
NESTED_FRAMES = {"grow", "fade", "ember"}
NESTED_VEC = {"pos", "from", "to", "anchor", "aim"}

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


BRIDGE_FREE = {"cut"}      # only a plain cut is bridged; a cover / whip / spin / ink ... already carries the change


def bridge_cuts(shots: list[dict], n: int) -> None:
    """One camera through the film (toki 2026-10-24 brief "die kamera ist eine einzelne fahrt"; 2026-10-25: "auch bei cuts
    oder transitions dann einfach die kamera schnell bewegen + etwas mehr motion blur"): a plain cut between two shots
    in the same set becomes a fast move - shot B starts where shot A's lens ended and rushes to its own first framing
    within n frames (Film smears it with a stronger motion blur, shot["bridge"]). Job option "bridge": n (0 = off)."""
    if n <= 0:
        return
    for a, b in zip(shots, shots[1:]):
        if a.get("set") != b.get("set") or (a.get("transition") or {}).get("kind", "cut") not in BRIDGE_FREE:
            continue
        if (b.get("opts") or {}).get("world") or not a.get("camera") or not b.get("camera"):
            continue                                        # a world rebuilding around her is its own transition
        if b["to"] - b["from"] < 2 * n:
            continue
        end = a["camera"][-1]
        keys = b["camera"]
        start = keys[0]
        if _path_hits(end["pos"], start["pos"], b.get("solids") or [], b.get("noLens") or []):
            continue                                        # the rush would fly through a prop or a wall: keep the cut
        bridge = {**start, "f": b["from"], "pos": list(end["pos"]), "look": list(end["look"]), "fov": end["fov"],
                  "roll": end.get("roll", 0), "bridge": 1}
        bridge.pop("shake", None)
        moved, last = [], b["from"]
        for k in keys:
            nk = dict(k)
            nk["f"] = max(nk["f"], b["from"] + n, last + 1)
            moved.append(nk)
            last = nk["f"]
        moved[0]["ease"] = "inOut"
        moved[0].pop("path", None)
        # a spline segment after the rush must not swing through the far bridge key (Catmull-Rom overshoot dipped the
        # lens into the hydrant, Watch Me 34): the first framing is held one frame so it is its own spline neighbour
        if len(moved) > 1 and moved[1]["f"] > moved[0]["f"] + 1:
            moved.insert(1, {**moved[0], "f": moved[0]["f"] + 1})
        b["camera"] = [bridge] + moved
        b["bridge"] = n


V3_SPECIAL = re.compile(r"sting|tableau|frame in the foreground|macro|POV|tail|palm|billboard|through|puddle|plaque|sign|cover|fold|vertigo|worm|crane to", re.I)
# start angles round her (degrees from her front, magnitude; the side alternates shot by shot). v3 board 1: a start at
# 40-58 plus a 70 degree sweep AWAY from the front ended behind her (only hair) - every move now ends nearer her front
V3_ANGLES = [42, 34, 48, 38, 30, 46, 36, 52]


def v3_kind(s: dict) -> str:
    size = str(s.get("size", ""))
    acts = s.get("actor") or []
    if re.search(r"top-down|bird", size, re.I):
        return "top"
    if re.search(r"\bE?CU\b|portrait|profile", size):
        return "close"
    if acts and all(a.get("speed") == 0 for a in acts):
        return "hero"
    return "dance"


def camera_v3(s: dict, marks: dict, errors: list[str], tag: str, f0: int, f1: int, idx: int, st: str, setinfo: dict) -> list[dict] | None:
    """The shot grammar of the K/DA FIRESTARTER study (knowledge/studies/kda_firestarter_1m43.md), aimed at HER:
      hero  (a held pose)  low angle, close, wide lens, a slow push and a small arc, a dutch lean - she poses to us
      dance (she moves)    her whole figure filling the frame, the lens orbiting 70 degrees round her
      close (CU / ECU)     her face, eyes in the upper third, a slow push and arc
    Every shot from a 3/4 angle (V3_ANGLES, alternating sides), never eye-level dead on; an angle whose path would cross
    a prop or a wall is skipped for the next one."""
    import math as _m
    acts = s.get("actor") or []
    if not acts:
        return None
    P = _v3(acts[0].get("pos", [0, 0, 0]), marks, errors, f"{tag} v3")
    if P is None:
        return None
    h = float(acts[0].get("height", DEFAULT_HEIGHT))
    kind = v3_kind(s)
    side = 1 if idx % 2 == 0 else -1
    # end = the angle the move ends at (same side when > 0): dance crosses her front to the other side
    if kind == "hero":
        dist, ly, ay, fov, end, push, roll, rise, scale = 1.3, 0.8, 1.22, 50, 14, 0.84, 6, 0.12, 0.8
    elif kind == "close":
        dist, ly, ay, fov, end, push, roll, rise, scale = 0.78, 1.38, 1.36, 34, 6, 0.9, 3, 0.02, 0.5
    else:
        dist, ly, ay, fov, end, push, roll, rise, scale = 2.2, 1.02, 0.9, 40, -24, 0.95, 2, 0.25, 1.0
    ly, ay = ly * h / DEFAULT_HEIGHT, ay * h / DEFAULT_HEIGHT
    look = [P[0], P[1] + ay, P[2]]
    if kind == "top":                                       # straight above her, close, turning: she fills the frame
        k = {"look": [P[0], P[1] + 0.85 * h / DEFAULT_HEIGHT, P[2]], "observer": 0.4}
        hgt = P[1] + h + 1.15
        mid = (f0 + f1) // 2
        return [{**k, "f": f0, "pos": [P[0] + 0.05, round(hgt + 0.25, 4), P[2] + 0.12], "fov": 46, "roll": 0.0, "ease": "inOut", "v3": kind},
                {**k, "f": mid, "pos": [P[0] + 0.05, round(hgt + 0.1, 4), P[2] + 0.12], "fov": 45, "roll": 20.0 * side, "ease": "inOut", "path": "spline", "v3": kind},
                {**k, "f": max(mid + 1, f1 - 1), "pos": [P[0] + 0.05, round(hgt, 4), P[2] + 0.12], "fov": 44, "roll": 40.0 * side, "ease": "inOut", "path": "spline", "v3": kind}]
    solids = [{k: v for k, v in so.items()} for so in setinfo.get("solids", [])]
    no_lens = setinfo.get("no_lens", [])
    mid = (f0 + f1) // 2
    for j in range(len(V3_ANGLES)):
        start = V3_ANGLES[(idx + j) % len(V3_ANGLES)] * scale
        def at(t, start=start):
            a = _m.radians(side * (start + (end - start) * t))
            d = dist * (1 - (1 - push) * t)
            return [round(P[0] + d * _m.sin(a), 4), round(P[1] + ly + rise * t, 4), round(P[2] + d * _m.cos(a), 4)]
        pts = [at(x / 6) for x in range(7)]
        if any(_path_hits(p0, p1, solids, no_lens, steps=6) for p0, p1 in zip(pts, pts[1:])):
            continue
        face = [P[0], P[1] + 1.4 * h / DEFAULT_HEIGHT, P[2]]
        blockers = [so for so in solids if so.get("name") not in ("plinth",)]
        if any(_sight_hits(q, face, blockers) for q in pts):
            continue
        k = {"look": [round(v, 4) for v in look], "observer": 0.6}
        return [{**k, "f": f0, "pos": at(0), "fov": fov, "roll": 0.0, "ease": "inOut", "v3": kind},
                {**k, "f": mid, "pos": at(0.5), "fov": round(fov * 0.98, 2), "roll": round(roll * side / 2, 2), "ease": "inOut", "path": "spline", "v3": kind},
                {**k, "f": max(mid + 1, f1 - 1), "pos": at(1), "fov": round(fov * 0.96, 2), "roll": round(roll * side, 2), "ease": "inOut", "path": "spline", "v3": kind}]
    return None


def direct_camera(ckeys: list[dict], s: dict, f0: int, f1: int, idx: int) -> list[dict]:
    """The camera director (toki 2026-10-25): "kamera soll nie still ... wenn dann langsam und ruhig bewegen oder sanften
    zoom ... nie wirklich still"; "raymi muss noch mehr in scene gesetzt werden, vor allem bei ihren stillen posen, die
    kamerawinkel sind zu normal ... mehr ähnliche winkel / kamerafahrten wie bei 0:30 - 0:34" (the 360 orbit round her).
    A shot whose lens stands still becomes an arc round what it looks at: a slow drift with a gentle push in; a held pose
    gets a real orbit with a crane and a roll (alternating sides shot by shot). Moving cameras stay as written."""
    if not ckeys:
        return ckeys
    import math as _m
    p0, k0 = ckeys[0]["pos"], ckeys[0]
    still = all(_m.dist(k["pos"], p0) < 0.15 and abs(k["fov"] - k0["fov"]) < 3 for k in ckeys)
    if not still:
        return ckeys
    acts = s.get("actor") or []
    held = bool(acts) and all((a.get("speed") == 0) or "pose" in str(a.get("clip", "")) for a in acts)
    look = k0["look"]
    if held:                                              # K/DA FIRESTARTER study: a held pose is a low-angle hero shot
        floor = 0.42 if look[1] > 1.6 else 0.0               # (lens below her chest, looking up) that cranes up slowly - plinth or floor
        p0 = [p0[0], max(look[1] - 0.6, floor + 0.74), p0[2]]  # never under her skirt (timeline under_skirt: >= 0.70 m)
    r = max(0.4, _m.dist(p0, look))
    ang = _m.atan2(p0[0] - look[0], p0[2] - look[2])
    side = 1 if idx % 2 == 0 else -1
    sweep = _m.radians(38 if held else 12) * side
    dy = 0.38 if held else 0.08 * (1 if idx % 4 < 2 else -1)
    roll = (6.0 if held else 1.5) * side
    def at(t):
        a = ang + sweep * t
        return [round(look[0] + r * (1 - 0.08 * t) * _m.sin(a), 4), round(p0[1] + dy * t, 4), round(look[2] + r * (1 - 0.08 * t) * _m.cos(a), 4)]
    base = {k: v for k, v in k0.items() if k not in ("f", "pos", "fov", "roll", "ease", "path", "shake")}
    mid = (f0 + f1) // 2
    return [{**base, "f": f0, "pos": at(0), "fov": k0["fov"], "roll": k0.get("roll", 0), "ease": "inOut", "dir": 1},
            {**base, "f": mid, "pos": at(0.5), "fov": round(k0["fov"] * 0.965, 2), "roll": round(roll / 2, 2), "ease": "inOut", "path": "spline", "dir": 1},
            {**base, "f": max(mid + 1, f1 - 1), "pos": at(1), "fov": round(k0["fov"] * 0.93, 2), "roll": roll, "ease": "inOut", "path": "spline", "dir": 1}]


def effect_rules(s: dict, opts: dict, st: str, a: float, b: float, lyrics: list, swing: list) -> dict:
    """Where each of her-world effects belongs (toki 2026-10-25: "alle nutzen wenn sie passend genutzt werden können";
    "nicht gleich alles voller leuchtspur"). A shot's own opts always win (setdefault). Returns the shot (fx added)."""
    acts = s.get("actor") or []
    words = [w for ln in lyrics for w in ln["words"]]
    # sonar: a ray's electro-sense pings out on "radar"
    radar = [round(w["t0"], 3) for w in words if "radar" in w["w"].lower() and a <= w["t0"] < b]
    if radar:
        opts.setdefault("sonar", radar)
    sal = opts.get("salmon") if isinstance(opts.get("salmon"), dict) else None
    # electro-sense: she feels the guard near her (the museum gag)
    if st == "exhibit" and sal and sal.get("hold") == "flashlight" and not sal.get("frozen") and not sal.get("freeze_at"):
        opts.setdefault("sense", 0.8)
    # caustics: the street and the museum lie under the sea (the studio is the surface, none there)
    if st in ("corner", "exhibit") and not opts.get("dark") and not opts.get("dark_at"):   # never in the blackout
        opts.setdefault("caustics", 0.35 if st == "corner" else 0.25)
    # dot pulse: only in the chorus (the shots with a beat snap)
    if swing and "glow" not in opts:
        opts.update({"glow": "#9b6bff", "glow_pulse": "beats", "glow_gain": 0.3})
    stage = opts.get("stage") or []
    cover = any(isinstance(x, dict) and x.get("kind") == "cover" for x in (stage if isinstance(stage, list) else [stage]))
    keys_at = [float(k.get("at", 0)) for k in acts if isinstance(k.get("at", 0), (int, float))]
    # fame moments: paparazzi salvos + a halftone freeze on each cover pose
    if cover:
        opts.setdefault("paparazzi", [round(a + x + 0.05, 3) for x in keys_at])
        fx = list(s.get("fx") or [])
        for x in keys_at:
            fx.append({"kind": "freeze", "at": round(x + 0.1, 3), "to": round(x + 0.42, 3), "desat": 0})
            fx.append({"kind": "halftone", "at": round(x + 0.1, 3), "to": round(x + 0.42, 3), "opacity": 0.45})
        s = {**s, "fx": fx}
    if sal and sal.get("flash_at"):
        opts.setdefault("paparazzi", sal["flash_at"])
    # fin wave: only on a real turn of hers
    turns = [round(a + float(k.get("at", 0)) + 0.15, 3) for k in acts if re.search(r"spin|turn", str(k.get("clip", ""))) and isinstance(k.get("at", 0), (int, float))]
    if turns:
        opts.setdefault("finwave", turns)
    return s



def director_clear(shots: list[dict]) -> None:
    """A director arc that would pass through a prop or a wall becomes a straight gentle push toward what it looks at
    (the lens never stands still, never flies through the softbox)."""
    for s in shots:
        ks = s.get("camera") or []
        if not ks or not ks[0].get("dir"):
            continue
        hit = any(_path_hits(a["pos"], b["pos"], s.get("solids") or [], s.get("noLens") or []) for a, b in zip(ks, ks[1:]))
        if not hit:
            continue
        k0, look = ks[0], ks[0]["look"]
        end = [round(lk + (p - lk) * 0.9, 4) for p, lk in zip(k0["pos"], look)]
        s["camera"] = [ks[0], {**ks[-1], "pos": end, "roll": 0, "path": None}]


def _cam_lin(keys: list[dict], f: float) -> tuple[list[float], list[float]]:
    """Lens position and look at frame f, linear between keys (enough to test a path against props)."""
    if f <= keys[0]["f"]:
        return keys[0]["pos"], keys[0]["look"]
    for k0, k1 in zip(keys, keys[1:]):
        if k0["f"] <= f <= k1["f"]:
            u = (f - k0["f"]) / max(1, k1["f"] - k0["f"])
            return ([x + (y - x) * u for x, y in zip(k0["pos"], k1["pos"])], [x + (y - x) * u for x, y in zip(k0["look"], k1["look"])])
    return keys[-1]["pos"], keys[-1]["look"]


def swing_clear(shots: list[dict]) -> None:
    """A beat snap (Film makeCamera: the lens turns 0.45 rad round what it looks at and STAYS turned for the rest of the
    shot) that would put the lens in a prop or a wall at any later frame is dropped (Watch Me 18 / 22: the softbox)."""
    import math as _m
    for s in shots:
        sw, ks = s.get("swing") or [], s.get("camera") or []
        if not sw or not ks:
            continue
        solids, no_lens = s.get("solids") or [], s.get("noLens") or []
        keep = []

        def clear(events):
            for f in range(int(events[0][0]), int(s["to"]), 3):
                ang = lift = 0.0
                for i, (f0, d) in enumerate(events):
                    dd = f - f0
                    if dd < 0:
                        continue
                    e = 1.0 if dd >= 6 else 0.5 - 0.5 * _m.cos(_m.pi * dd / 6)
                    ang += d * 0.45 * e
                    lift += (-0.22 if i % 2 else 0.22) * e
                pos, look = _cam_lin(ks, f)
                vx, vz = pos[0] - look[0], pos[2] - look[2]
                c_, s_ = _m.cos(ang), _m.sin(ang)
                q = [look[0] + vx * c_ + vz * s_, pos[1] + lift, look[2] - vx * s_ + vz * c_]
                if _path_hits(q, q, solids, no_lens, steps=1):
                    return False
            return True
        for ev in sw:
            if clear(keep + [ev]):
                keep.append(ev)
        if keep:
            s["swing"] = keep
        else:
            s.pop("swing", None)


def _sight_hits(eye, target, solids: list[dict], steps: int = 20) -> bool:
    """Is a solid between the lens and her face (the last 25 cm at her are not checked: her own spot)?"""
    import math as _m
    d = _m.dist(eye, target)
    if d < 0.3:
        return False
    for i in range(1, steps):
        tt = i / steps
        if d * (1 - tt) < 0.25:
            break
        q = [a + (b - a) * tt for a, b in zip(eye, target)]
        for s in solids:
            c, z = s.get("center"), s.get("size")
            if c and z and all(abs(q[k] - c[k]) < z[k] / 2 for k in range(3)):
                return True
    return False


def _path_hits(p0, p1, solids: list[dict], no_lens: list[dict], steps: int = 40) -> bool:
    """Does the straight lens path p0 -> p1 pass through a solid (centre / size) or a no-lens box (min / max)?"""
    for i in range(steps + 1):
        q = [a + (b - a) * i / steps for a, b in zip(p0, p1)]
        for s in solids:
            c, z = s.get("center"), s.get("size")
            if c and z and all(abs(q[k] - c[k]) < z[k] / 2 + 0.18 for k in range(3)):   # the eased path and the lens breathing stray a little
                return True
        for bx in no_lens:
            if all(bx["min"][k] < q[k] < bx["max"][k] for k in range(3)):
                return True
    return False


def chain_actors(shots: list[dict], n: int) -> None:
    """Her whole film is ONE movement (toki 2026-10-25: "raymis gesamt choreo soll auch 1 flüssige bewegung sein ... von
    der end bewegung zur pose übergehen flüssig nicht als harter cut"; a snap into the next shot's pose read as her
    "falling onto her spot"): shot B gets a key just before its start holding the pose shot A ended in (A's clip frozen
    at its last time), so B's first key blends out of it over n frames. Job option "chain": n (0 = off)."""
    if n <= 0:
        return
    for a, b in zip(shots, shots[1:]):
        ak, bk = a.get("actor") or [], b.get("actor") or []
        if not ak or not bk or b["to"] - b["from"] < n + 2:
            continue
        last = ak[-1]
        m = last.get("motion")
        start = last
        for k in reversed(ak):                               # where A's clip started (as VrmPuppet clipStart)
            if k.get("motion") != m or k.get("restart"):
                break
            start = k
        t_end = float(start.get("clipFrom", 0) or 0) + (a["to"] - 1 - start["f"]) / FPS * float(start.get("speed", 1) if start.get("speed") is not None else 1)
        if last.get("speed") == 0:
            t_end = float(last.get("clipFrom", 0) or 0)
        held = {**last, "f": b["from"] - 1, "pos": list(bk[0]["pos"]), "rotY": bk[0].get("rotY", "lens"),
                "clipFrom": round(t_end, 3), "speed": 0, "restart": True, "exact": True, "move": 0, "act": "idle"}
        first = {**bk[0], "blend": max(int(bk[0].get("blend", 8) or 8), n), "restart": True}
        b["actor"] = [held, first] + bk[1:]


def stage_texts(opts: dict) -> list[dict]:
    """The printed type of a staging cover (three/staging.tsx Cover: masthead + line plates) as readable texts, so the
    text-on-text guard keeps a lyric off them (Watch Me stills 1: the line sat on THE MASTERPIECE / ON YOUR RADAR).
    cut_ok: the lens may push past a cover's edge - only covering it with a lyric counts."""
    out = []
    for st in opts.get("stage") or []:
        if not isinstance(st, dict) or st.get("kind") != "cover" or not isinstance(st.get("pos"), list):
            continue
        x, y, z = st["pos"]
        H = float(st.get("h", 2.3)); W = H * 0.76
        out.append({"name": "cover masthead", "center": [x, y + H * 0.88, z + 0.32], "size": [W, H * 0.2], "rot": 0, "cut_ok": True})
        for i, _ in enumerate((st.get("lines") or ["", ""])[:4]):
            out.append({"name": "cover line", "center": [x + (1 if i % 2 else -1) * W * 0.62, y + H * (0.56 - 0.13 * (i // 2)), z + 0.1],
                        "size": [W * 0.34, H * 0.12], "rot": 0, "cut_ok": True})
    return out


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


def _camera_list(s: dict, length: float, fmt: str, marks: dict, errors: list[str], tag: str) -> list[dict]:
    """The shot's camera keys with every {"move": ...} expanded into plain keys (raymi/camera_moves.py)."""
    out = []
    for k, c in enumerate(s.get("camera", [])):
        if "move" not in c:
            out.append(c)
            continue
        m = c["move"]
        if fmt == "short" and isinstance(m.get("short"), dict):
            m = {**m, **m["short"]}                       # the portrait frame: its own distance / bearing
        ktag = f"{tag} camera move {k + 1}"
        if m.get("kind") not in CM.KINDS:
            errors.append(f"{ktag}: kind must be one of {sorted(CM.KINDS)}")
            continue
        around = m.get("around", "her")
        if around == "her":
            first = (s.get("actor") or [{}])[0]
            around = first.get("pos", "center")
        P = _v3(around, marks, errors, ktag)
        obj = _v3(m["obj"], marks, errors, ktag) if "obj" in m else None
        if P is None:
            continue
        P = [P[0], P[1] + float(m.get("h", 1.35)), P[2]]
        m = {**m, "_h": float(m.get("h", 1.35))}            # the hand-written moves place the lens from her feet
        last = (s.get("actor") or [{}])[-1].get("pos")      # where she ends (a follow move travels with her)
        E = _v3(last, marks, errors, ktag) if last is not None else None
        E = [E[0], E[1] + float(m.get("h", 1.35)), E[2]] if E else None
        try:
            keys = CM.expand(m, length, P, obj, E)
        except ValueError as e:
            errors.append(f"{ktag}: {e}")
            continue
        out += keys
    return out


def _cam_v2(c: dict, tag: str, errors: list) -> dict:
    """Camera v2 key options (studio/src/film/types.ts CamKey): spline path, dolly-zoom frame height, handheld shake."""
    out = {}
    if "path" in c:
        if c["path"] not in ("line", "spline"):
            errors.append(f"{tag}: path must be line or spline")
        else:
            out["path"] = c["path"]
    if "frameH" in c:
        out["frameH"] = float(c["frameH"])
    if "shake" in c:
        out["shake"] = max(0.0, min(1.5, float(c["shake"])))
    return out


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


def vrm_poses() -> set[str]:
    """Pose names of the 3D Raymi (studio/src/three/vrmPoses.ts POSES) - a shot may only name these."""
    src = (Path(__file__).resolve().parents[1] / "studio" / "src" / "three" / "vrmPoses.ts").read_text(encoding="utf-8")
    body = src[src.index("export const POSES"):]
    return set(re.findall(r"^  ([a-z_0-9]+): \{", body, re.M))


# the solid size of a desk thing (studio/src/three/routine.tsx) - the lens may not fly through it, nor may it hide her
# face (motion reel 2026-10-23: a crash zoom ran through her monitor's back and the frame was one dark mass)
THING_BOX = {"monitor": ([0.0, 0.42, 0.0], [0.64, 0.42, 0.08]), "globe": ([0.0, 0.2, 0.0], [0.34, 0.42, 0.34]),
             "printer": ([0.0, 0.5, 0.0], [0.6, 1.0, 0.5])}


def thing_solids(things: list[dict], marks: dict) -> list[dict]:
    out = []
    for t in things:
        kind = t.get("kind")
        pos = marks.get(t["pos"]) if isinstance(t.get("pos"), str) else t.get("pos")
        if not isinstance(pos, list) or len(pos) != 3:
            continue
        sc = float(t.get("scale", 1.0))
        if kind == "files":
            h = 0.044 * int(t.get("n", 6)) + 0.03
            c, sz = [0.0, h / 2, 0.0], [0.36, h, 0.28]
        elif kind in THING_BOX:
            c, sz = THING_BOX[kind]
        else:
            continue
        out.append({"name": kind, "center": [round(pos[i] + c[i] * sc, 3) for i in range(3)], "size": [round(v * sc, 3) for v in sz]})
    return out


def vocal_envelope(path: Path, start: float, frames: int, fps: int = FPS) -> list[float]:
    """Loudness of the vocal stem per film frame, 0..1 (-42 dB .. the 95th percentile) - studio/clip.mjs's measure."""
    import subprocess

    import numpy as np

    rate = 8000
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{frames / fps + 0.5:.3f}", "-i", str(path),
                          "-ac", "1", "-ar", str(rate), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    pcm = np.frombuffer(raw, dtype=np.float32)
    per = rate / fps
    db = []
    for f in range(frames):
        x = pcm[int(f * per):int((f + 1) * per)]
        db.append(10 * np.log10(float(np.mean(x * x)) + 1e-12) if x.size else -120.0)
    top = sorted(db)[int(len(db) * 0.95)] if db else -10.0
    return [round(max(0.0, min(1.0, (d + 42) / max(6.0, top + 42))), 2) for d in db]


def clip_names() -> set[str]:
    """Mixamo clip ids the studio can load (studio/catalog/clips.json; the files live in the private assets repo)."""
    p = Path(__file__).resolve().parents[1] / "studio" / "catalog" / "clips.json"
    return set(json.loads(p.read_text(encoding="utf-8"))["clips"]) if p.exists() else set()


FX_KINDS = {"duo", "speed", "impact", "halftone", "spread", "slash", "melody", "ring",
            # Love is War moments (studio/src/film/FxWar.tsx)
            "crown", "dots", "ribbon", "pillar", "embers", "halo", "shards", "starburst", "insert",
            # the POV layer (studio/src/film/PovFx.tsx): on the lens / the glass in front of it
            "cover", "pov_hand", "ripple", "algae", "freeze", "polaroid", "stamp"}
FX_TIMES = {"taps", "big", "write0", "write1", "whip", "holds"}   # fx fields in song seconds -> film frames ([t0, t1] pairs too)


HOLD_MAX = 8         # frames a held clip frame lasts before it plays on (a hit, pro_rules: holds of 4-8 frames)
LOUD_ENERGY = 0.6    # m/s: a clip slower than this (studio/catalog/clip_energy.json, measured) in a loud section is flagged
_ENERGY: dict | None = None


def root_travel() -> dict:
    """Where each clip carries her on her rig (studio/catalog/root_travel.json, measured by root-travel.yml)."""
    f = Path(__file__).resolve().parent.parent / "studio" / "catalog" / "root_travel.json"
    return json.loads(f.read_text(encoding="utf-8")).get("clips", {}) if f.is_file() else {}


def clip_energy() -> dict:
    """Every clip's measured motion (raymi/clip_energy_blender.py, cloud): {clip: {mean, p90, still, seam, dur ...}}."""
    global _ENERGY
    if _ENERGY is None:
        f = REPO / "studio" / "catalog" / "clip_energy.json"
        _ENERGY = {k: v for k, v in json.loads(f.read_text(encoding="utf-8")).get("clips", {}).items() if "mean" in v} if f.is_file() else {}
    return _ENERGY


LOW_LENS = 0.45      # x her height: a lens below this, looking UP at her ...
LOW_NEAR = 2.6       # ... closer than this many m (horizontal) looks under her skirt


def under_skirt(ckeys: list[dict], actor: list[dict], tag: str) -> list[str]:
    """A worm's eye close to her looks up her skirt (Watch Me boards 2026-10-24: B1 and C1 did). A low angle stays -
    from further away or higher; a shot that really needs it says "low_ok": "<why>"."""
    out = []
    for ck in ckeys:
        k = min(actor, key=lambda x: abs(x["f"] - ck["f"]))
        p, h = k["pos"], float(k.get("height", DEFAULT_HEIGHT))
        cam, look = ck["pos"], ck["look"]
        dist = math.hypot(cam[0] - p[0], cam[2] - p[2])
        if cam[1] - p[1] < LOW_LENS * h and dist < LOW_NEAR and look[1] > cam[1]:
            out.append(f"{tag}: the lens at {cam[1] - p[1]:.2f} m, {dist:.1f} m from her, looks up her skirt - go wider "
                       f"(>= {LOW_NEAR} m) or higher (>= {LOW_LENS * h:.2f} m), or \"low_ok\": \"<why>\"")
    return out


def compile_actor(s: dict, fmt: str, a: float, b: float, fr, marks: dict, poses: set[str], errors: list[str],
                  tag: str, clips: set[str] | None = None) -> list[dict]:
    """shots.json "actor" keys -> VrmKey frames (studio/src/three/vrmPoses.ts)."""
    out = []
    for k, r in enumerate(s.get("actor", [])):
        ktag = f"{tag} actor key {k + 1}"
        if fmt == "short" and isinstance(r.get("short"), dict):
            r = {**r, **r["short"]}
        if "clip" in r:                                    # "clip" = the Mixamo clip that drives her (alias of motion)
            r = {**r, "motion": r["clip"]}
        if r.get("motion") and "pose" not in r:
            r = {**r, "pose": "stand"}                     # a clip at full mix needs no pose; stand is its fallback
        if r.get("motion") and clips is not None and r["motion"] not in clips:
            errors.append(f"{ktag}: clip {r['motion']!r} is not in studio/catalog/clips.json - she would freeze in the pose")
        if r.get("pose") not in poses:
            errors.append(f"{ktag}: pose {r.get('pose')!r} is not in vrmPoses.ts ({sorted(poses)})")
            continue
        pos = _v3(r.get("pos", "center"), marks, errors, ktag)
        if pos is None:
            continue
        if "path" in r:                                    # where her way through the space has taken her (travel.py)
            pos = [round(a + b, 4) for a, b in zip(pos, r["path"])]
        if r.get("act", "idle") not in ACTS:
            errors.append(f"{ktag}: act must be one of {sorted(ACTS)}")
        rot = r.get("rotY", "lens")
        key = {"f": fr(_key_time(r.get("at", 0), a, b)), "pose": r["pose"], "pos": pos,
               "rotY": rot if rot in ("lens", "away") else float(rot),
               "height": float(r.get("height", DEFAULT_HEIGHT)), "blend": round(float(r.get("blend", 0.27)) * FPS),
               "act": r.get("act", "idle"), "move": round(float(r.get("move", 0.0)) * FPS), "arc": float(r.get("arc", 0.0)),
               "ease": r.get("ease", "inOut")}
        if r.get("icon") not in ICONS:
            errors.append(f"{ktag}: icon must be one of {sorted(x for x in ICONS if x)}")
        elif r.get("icon"):
            key["icon"] = r["icon"]
        for opt in ("motion", "motionMix", "expr", "once", "restart", "aware", "ground", "drift"):
            if opt in r:
                key[opt] = r[opt]
        if r.get("face_lens"):                             # the clip's own hip turn is taken out: her chest faces the lens
            key["faceLens"] = True
        if "look" in r:                                    # "lens" | null | a mark / [x, y, z] she looks at
            key["look"] = r["look"] if r["look"] in ("lens", None) else _v3(r["look"], marks, errors, ktag)
        for j, w in enumerate(r.get("props", [])):         # things on her bones (studio/src/three/wearables.tsx)
            if w.get("item") not in WEARABLES:
                errors.append(f"{ktag} prop {j + 1}: item {w.get('item')!r} is not a wearable ({sorted(WEARABLES)})")
            if w.get("at") not in WEAR_AT:
                errors.append(f"{ktag} prop {j + 1}: at must be one of {sorted(WEAR_AT)}")
        if "props" in r:
            key["props"] = r["props"]
        if "clip_from" in r:
            key["clipFrom"] = float(r["clip_from"])
        # a one-shot action (its last pose far from its first: a jump, a landing, getting up) plays ONCE and never loops
        # back with a snap; its start stays inside the clip (Love is War: clip_from 1.9 on a 1.27 s jump looped at once)
        m = clip_energy().get(str(key.get("motion")))
        if m:
            if "clipFrom" in key and key["clipFrom"] > m["dur"] - 0.05:
                key["clipFrom"] = round(max(0.0, m["dur"] - 0.35), 3)
            if m["seam"] > 0.3 and "once" not in r:
                key["once"] = True
        if "speed" in r:
            key["speed"] = float(r["speed"])
            if key["speed"] == 0 and key.get("motion"):
                key["exact"] = True              # hold THIS frame, so the play-on continues from it without a snap
        if "rollZ" in r:
            key["rollZ"] = math.radians(float(r["rollZ"]))
        # a key that changes the clip's speed or start (a HELD frame on a hit, then playing on) restarts the clip: the
        # puppet times a clip from the key that started it, so a later speed 0 of the same clip was silently ignored
        # (Love is War stills 5: every "held N frames" played on - the war cry bent away from the lens on its hit)
        prev = out[-1] if out else None
        if prev and prev.get("motion") == key.get("motion") and key.get("motion") and (
                key.get("speed", 1.0) != prev.get("speed", 1.0) or "clipFrom" in key and key["clipFrom"] != prev.get("clipFrom")):
            key["restart"] = True
        out.append(key)
    # a held frame is a HIT, not a state (toki 2026-10-27, third time "nicht flüssig ... statisch"): a speed-0 key of a
    # clip plays on after HOLD_MAX frames unless the shot is a designed stop (opts.freeze) or the next key comes first
    if not (s.get("opts") or {}).get("freeze"):
        held = []
        for i, k in enumerate(out):
            nxt = out[i + 1]["f"] if i + 1 < len(out) else fr(b)
            if k.get("motion") and k.get("speed", 1.0) == 0 and nxt - k["f"] > HOLD_MAX:
                held.append({**k, "f": k["f"] + HOLD_MAX, "speed": 1.0, "restart": True, "blend": 4})
        out = sorted(out + held, key=lambda k: k["f"])
    if out and out[0]["f"] > fr(a):
        out[0]["f"] = fr(a)                                # she is there from the first frame of the shot
    return out


def melody_notes_fx(smap: dict, t0: float, t1: float, voice: str = "vocal") -> list[list[float]]:
    """The measured notes of the sung (or lead) line between song seconds t0..t1 as [seconds after t0, midi] - the
    `melody` 2D layer draws them (Love is War 2026-10-25, toki: "on beat / melodie effekte"). Octave slips (a note an
    octave away from both neighbours) are folded back, see 1_DOSSIER: pyin slips ~10 notes per song."""
    ns = [n for n in ((smap.get("melody") or {}).get(voice) or {}).get("notes", []) if t0 <= n["t0"] < t1]
    ms = [n["midi"] for n in ns]
    for i in range(1, len(ms) - 1):
        for d in (12, -12):
            if abs(ms[i] - d - ms[i - 1]) < 4 and abs(ms[i] - d - ms[i + 1]) < 4:
                ms[i] -= d
    return [[round(n["t0"] - t0, 3), round(m, 1)] for n, m in zip(ns, ms)]


def melody_on_her(rows: list[dict], smap: dict) -> list[dict]:
    """The melody is played on HER, not drawn as a graph (toki 2026-10-28 on take 13: "die on screen grafiken wirken
    immernoch komisch teilweise nur rote punkte die mit linien verbunden sind deren deutung man nicht erkennt"): a
    `melody` line or a `dots` pitch graph becomes her five chest lights flaring on every measured sung note
    (opts.glow_flare + chest_dots); an insert with a dots / melody motif becomes a wedge. Rows keep their timing."""
    out = []
    for r in rows:
        fx = r.get("fx") or []
        keep, flares = [], []
        for x in fx:
            if x.get("kind") in ("melody", "dots") and not x.get("heartbeat"):
                src = x.get("src")
                if src and len(src) == 2:
                    flares += [round(float(src[0]) + dt, 3) for dt, _ in melody_notes_fx(smap, float(src[0]), float(src[1]), x.get("voice", "vocal"))]
                continue
            if x.get("kind") == "insert" and x.get("motif") in ("dots", "melody"):
                x = {**x, "motif": "wedge"}
            keep.append(x)
        if len(keep) != len(fx) or any(y is not z for y, z in zip(keep, fx)):
            r = {**r, "fx": keep}
            if flares:
                o = dict(r.get("opts") or {})
                o["glow_flare"] = sorted(set((o.get("glow_flare") or []) + flares))
                o.setdefault("chest_dots", 1)
                r["opts"] = o
        out.append(r)
    return out


def compile_fx(s: dict, a: float, b: float, fr, errors: list[str], tag: str, smap: dict | None = None) -> list[dict]:
    out = []
    for k, x in enumerate(s.get("fx", [])):
        if x.get("kind") not in FX_KINDS:
            errors.append(f"{tag} fx {k + 1}: kind must be one of {sorted(FX_KINDS)}")
            continue
        item = {kk: v for kk, v in x.items() if kk not in ("at", "to")}
        for kk in FX_TIMES & set(item):                    # taps / write times: song seconds like the shot times
            v = item[kk]
            item[kk] = time_opt(v, fr) if isinstance(v, list) else fr(float(v))
        if x["kind"] == "pillar" and x.get("src"):          # the held note it lasts: song seconds -> frames
            item["src"] = [fr(float(t)) for t in x["src"]]
        if x["kind"] == "dots" and x.get("src"):            # her glow points by pitch: the measured sung notes
            notes = melody_notes_fx(smap or {}, float(x["src"][0]), float(x["src"][1]), x.get("voice", "vocal"))
            item = {kk: v for kk, v in item.items() if kk not in ("src", "voice")}
            off = float(x["src"][0]) - (a + float(x.get("at", 0)))   # notes are timed from the layer's start
            item["notes"] = [[round((dt + off) * FPS, 1), m] for dt, m in notes]
        if x["kind"] == "melody":                          # notes from the song map: `src` [t0, t1] song seconds (default the shot)
            src = x.get("src") or [a, b]
            notes = melody_notes_fx(smap or {}, float(src[0]), float(src[1]), x.get("voice", "vocal"))
            if not notes:
                errors.append(f"{tag} fx {k + 1}: no measured {x.get('voice', 'vocal')} notes in {src} (song_map melody)")
            item = {kk: v for kk, v in item.items() if kk not in ("src", "voice")}
            item["notes"] = [[round(dt * FPS, 1), m] for dt, m in notes]   # frames after the layer starts, midi
        out.append({**item, "from": fr(_key_time(x.get("at", 0), a, b)), "to": fr(_key_time(x.get("to", "end"), a, b)) + 1})
    return out


def rock_no_lens(opts: dict) -> list[dict]:
    """The lighthouse's rock mound (three/lighthouse.tsx: 7 lumps round the tower) is no place for a lens - Love is War
    draft 71 had 6.5 s of black with the lens inside it. The box holds every lump (painted: smaller lumps)."""
    lh = opts.get("lighthouse")
    if not isinstance(lh, dict):
        return []
    x, z = (lh.get("pos") or [-14, -46])[:2]
    rx, rz, top = (5.4, 4.9, 3.0) if opts.get("painted") else (7.0, 6.5, 4.6)
    return [{"name": "lighthouse rock", "min": [x - rx, -3.0, z - rz], "max": [x + rx, top, z + rz]}]


def aim_camera(a: dict, s: dict, marks: dict, errors: list[str], tag: str) -> tuple[list[float], list[float]] | None:
    """A lens in the script's words (4_SCRIPT camera cells: "h 0.62 d 0.62 fov 48"): it looks at `at` (her first key's
    place by default) raised by `y`, from `d` metres away, the lens at absolute height `h` (or `el` degrees above the
    target), on the bearing `az` (degrees; 0 = in front of her along +z, 90 = from +x). `shift` slides the look point
    sideways (m) so her face sits off centre."""
    at = a.get("at", "her")
    if at == "her":
        at = ((s.get("actor") or [{}])[0]).get("pos", "center")
    T = _v3(at, marks, errors, tag)
    if T is None:
        return None
    ty = T[1] + float(a.get("y", 0.0))
    d = float(a.get("d", 2.0))
    h = float(a["h"]) if "h" in a else ty + d * math.sin(math.radians(float(a.get("el", 0.0))))
    dh = math.sqrt(max(d * d - (h - ty) ** 2, 1e-4))
    az = math.radians(float(a.get("az", 0.0)))
    side = float(a.get("shift", 0.0))
    look = [T[0] + side * math.cos(az), ty, T[2] - side * math.sin(az)]
    pos = [T[0] + dh * math.sin(az), h, T[2] + dh * math.cos(az)]
    return [round(v, 4) for v in pos], [round(v, 4) for v in look]


SUB_KEEP = {"set", "opts", "actor", "mouth", "face", "track", "step", "outline", "fx", "kick", "observer", "aware", "low_ok", "lens_near",
            "hero", "camera_hand", "why", "short_shot", "row"}   # frame_fit: per picture (frame_fits), never inherited


def _num_at(k: dict) -> float:
    return 0.0 if k.get("at", 0) == "end" else float(k.get("at", 0))


def _actor_from(actor: list[dict], off: float) -> list[dict]:
    """A row's actor keys seen from `off` seconds into the row: the key playing then becomes the first key, its clip
    advanced by the time that passed - her action runs ON across the multicam cuts (one action, several set-ups)."""
    before = [k for k in actor if _num_at(k) <= off + 1e-6]
    after = [k for k in actor if _num_at(k) > off + 1e-6]
    out = []
    if before:
        k = dict(before[-1])
        if ("clip" in k or "motion" in k) and float(k.get("speed", 1.0)) != 0:
            k["clip_from"] = round(float(k.get("clip_from", 0.0)) + (off - _num_at(k)) * float(k.get("speed", 1.0)), 3)
        if "_v" in k:                                      # her way runs on too: she is where it has taken her (travel.py)
            k["path"] = [round(p + v * (off - _num_at(k)), 4) for p, v in zip(k.get("path", [0, 0, 0]), k["_v"])]
        k["at"] = 0
        k["blend"] = 0                                     # a cut, not a pose change: no blend at the picture's start
        out.append(k)
    for k in after:
        out.append({**k, "at": round(_num_at(k) - off, 3) if k.get("at") != "end" else "end"})
    return out


def _fixed_facing(row: dict) -> list[dict]:
    """rotY "lens" turns her to EVERY lens; in a multicam row she keeps the facing the row's MAIN camera gave her."""
    cam = (row.get("camera") or [{}])[0]
    az = (cam.get("aim") or {}).get("az")
    out = []
    for k in row.get("actor") or []:
        if k.get("rotY", "lens") == "lens" and az is not None:
            k = {**k, "rotY": float(az)}
        out.append(k)
    return out


def carry_keys(camera: list[dict]) -> list[dict]:
    """Snap + tail (raymi-camera pro_rules, the vector law of raymi-editing pro_rules): a held set-up becomes a push that
    jumps most of the way in its first 4 frames and keeps creeping in to the cut, so every picture arrives moving and
    leaves moving the same way - the push carries the eye through the seam (`raymi seams`: carried, not static).
    Only a single "aim" key is turned into a move; a written move stays as it is."""
    if len(camera) != 1 or "aim" not in camera[0]:
        return camera
    k = camera[0]
    d = float(k["aim"].get("d", 2.0))
    def at(dd, t, ease):
        return {**k, "at": t, "aim": {**k["aim"], "d": round(dd, 3)}, "ease": ease}
    return [at(d * 1.18, 0, "linear"), at(d, 0.13, "snap"), at(d * 0.9, "end", "linear")]


def expand_rows(rows: list[dict], errors: list[str], carry: bool = False) -> list[dict]:
    """The script's multicam grammar (Love is War v3b, toki 2026-10-26 "drops dichter schneiden wie die profis"): a row
    keeps ONE action of hers and is cut from several set-ups on the measured beat. A row (with "at" in song seconds) may
    carry
      "cams":    [{"at": <song s>, "camera": [...], "kind": "punch" | "reverse" | "insert" | ..., "opts": {..},
                   "fx": [..], "her": false, "transition": {..}}, ...]   - a new picture at each `at`
      "stutter": {"onsets": [<song s>, ...], "cams": [[keys A], [keys B]]}  - a cut on each measured onset, alternating
                   two set-ups of the same light (X2: never more than 3 big brightness changes a second)
      "riser":   {"aim": {..no d..}, "fov": 40, "steps": [[<song s>, d, roll, shift], ...], "white": [t0, t1]}
                   - one push on ONE axis through the cuts while the grade climbs toward white (grade war_white)
    Each picture becomes its own shot: her clip time runs on (_actor_from), the row's opts / fx / mouth stay, the row's
    camera is the first picture. A picture with "her": false (a two-value insert) has no body."""
    out = []
    for i, row in enumerate(rows):
        cams = [dict(c) for c in row.get("cams") or []]
        st = row.get("stutter")
        if st:
            keys = st.get("cams") or []
            if len(keys) < 2:
                errors.append(f"row {i + 1}: stutter needs two camera set-ups (cams [A, B])")
            else:
                cams += [{"at": t, "camera": keys[(j + 1) % 2], "kind": "stutter"} for j, t in enumerate(st.get("onsets", []))]
        rs = row.get("riser")
        if rs:
            white = rs.get("white")
            for t, d, *rest in rs.get("steps", []):
                c = {"at": t, "kind": "riser",
                     "camera": [{"at": 0, "aim": {**rs["aim"], "d": d, "shift": rest[1] if len(rest) > 1 else 0},
                                 "fov": rs.get("fov", 40), "roll": rest[0] if rest else 0}]}
                if white:
                    c["opts"] = {"grade_to": "war_white", "grade_at": white[0], "grade_s": round(white[1] - white[0], 3)}
                cams.append(c)
        if not cams:
            if row.get("carry", carry) and row.get("carry") is not False:
                row = {**row, "camera": carry_keys(row.get("camera") or [])}
            out.append(row)
            continue
        if not isinstance(row.get("at"), (int, float)):
            errors.append(f"row {i + 1}: a multicam row needs its start in song seconds")
            out.append(row)
            continue
        a = float(row["at"])
        cams.sort(key=lambda c: float(c["at"]))
        # the row's transition leads into the NEXT row: only its last picture carries it (excerpt 7: an ink wipe ran at
        # the row's first multicam cut and covered two pictures with blots)
        base = {k: v for k, v in row.items() if k not in ("cams", "stutter", "riser", "transition")}
        go = row.get("carry", True) is not False and (carry or row.get("carry"))   # multicam pictures carry by default
        go = go if not st else False                       # a stutter alternates two HELD set-ups (same light, X2)
        if go:
            base["camera"] = carry_keys(base.get("camera") or [])
        actor = _fixed_facing(row)
        rid = row.get("id", f"s{i + 1}")
        if float(cams[0]["at"]) > a + 1e-6:
            out.append({**base, **({"actor": actor} if actor else {}), "id": rid})
        for j, c in enumerate(cams):
            t = float(c["at"])
            if t < a - 1e-6:
                errors.append(f"row {rid}: picture at {t} s is before the row ({a} s)")
                continue
            sub = {k: v for k, v in base.items() if k in SUB_KEEP}
            sub["id"] = f"{rid}{chr(97 + j)}"
            fit = (row.get("frame_fits") or {}).get(sub["id"])   # raymi/frame.py: this picture's lens on her measured head
            if fit:
                sub["frame_fit"] = fit
            sub["at"] = round(t, 3)
            sub["camera"] = c.get("camera") or base.get("camera")
            if go and c.get("kind") not in ("stutter", "riser") and c.get("carry") is not False:
                sub["camera"] = carry_keys(sub["camera"])
            if c.get("opts"):
                sub["opts"] = {**(base.get("opts") or {}), **c["opts"]}
            if "fx" in c:
                sub["fx"] = c["fx"]
            elif base.get("fx"):
                # the row's 2D layers keep their place in the song: re-based to this picture's start
                fx = []
                for x in base["fx"]:
                    to = x.get("to", "end")
                    if to != "end" and float(to) <= t - a:
                        continue
                    y = {**x, "at": max(0.0, round(float(x.get("at", 0)) - (t - a), 3))}
                    if to != "end":
                        y["to"] = round(float(to) - (t - a), 3)
                    fx.append(y)
                sub["fx"] = fx
            if c.get("her") is False:
                sub.pop("actor", None)
                sub.pop("mouth", None)
                sub["opts"] = {**(sub.get("opts") or {}), "her_off": c.get("why", "a two-value insert without her body")}
            elif actor:
                sub["actor"] = _actor_from(actor, t - a)
                if c.get("actor_set"):                     # one picture may change one thing of her key (expr, look)
                    sub["actor"][0] = {**sub["actor"][0], **c["actor_set"]}
            for k in ("transition", "camera_hand", "low_ok", "why", "lens_near"):
                if k in c:
                    sub[k] = c[k]
            out.append(sub)
        if "transition" in row and out and "transition" not in out[-1]:
            out[-1]["transition"] = row["transition"]
    return out


def compile_shots(job: Path, spec: dict, fmt: str = "mv", cmap: set[int] | None = None) -> tuple[dict, list[str], list[str]]:
    errors: list[str] = []
    warns: list[str] = []
    if fmt not in FORMATS:
        raise TimelineError(f"format must be one of {sorted(FORMATS)}")
    comp, W, H = FORMATS[fmt]
    # toki 2026-10-25: the Watch Me effects (sonar, caustics, sense, dot pulse ...) were good ideas laid over the film
    # as RULES and looked bad. From the brief contract on (0_BRIEF.md) every effect is a designed moment in a shot's
    # opts with its reason (treatment table "Effects as MOMENTS"), never the global `effects` switch.
    if spec.get("effects") and (job / "0_BRIEF.md").is_file():
        errors.append("spec 'effects': global effect rules are off for jobs with a brief contract - place each effect in "
                      "its shot (opts) from the treatment's 'Effects as MOMENTS' table, with `fx_why` in the shot")
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
    # her way through the space before the rows split into pictures (toki 2026-10-28 "schwimmt auf der stelle")
    rows_in = face_walls(spec.get("shots", []), warns, spec.get("set_opts"))
    rows_in = rows_in if spec.get("travel") is False else plan_travel(rows_in, root_travel(), warns)
    if spec.get("thirds", True):
        rows_in = compose_thirds(rows_in)
    if spec.get("melody_on_her", True):
        rows_in = melody_on_her(rows_in, smap)
    shots_in = expand_rows(rows_in, errors, bool(spec.get("carry")))
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
    poses = vrm_poses() if spec.get("vrm") else set()
    clips = clip_names() if spec.get("vrm") else None
    used_clips: set[str] = set()
    heavy = False
    shots, sprites, screen_texts = [], set(), []
    for i, s in enumerate(shots_in):
        if fmt == "short" and isinstance(s.get("short_shot"), dict):
            s = {**s, **s["short_shot"]}                   # the Short's own version of this shot (e.g. no lyric under the hook)
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
        for k, c in enumerate(_camera_list(s, b - a, fmt, marks, errors, tag)):
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
                              "ease": c.get("ease", "inOut"), **_cam_v2(c, ktag, errors)})
                continue
            if "aim" in c:                                # the script's own words: lens height h, distance d, azimuth
                aim = aim_camera(c["aim"], s, marks, errors, ktag)
                if aim is None:
                    continue
                pos, look = aim
            elif "orbit" in c:                            # camera v2: a point on a circle around her / a mark
                o = c["orbit"]
                centre = _v3(o.get("around"), marks, errors, ktag)
                if centre is None:
                    continue
                ang = math.radians(float(o.get("deg", 0)))
                r, up = float(o.get("radius", 3.0)), float(o.get("height", 1.2))
                pos = [centre[0] + r * math.sin(ang), centre[1] + up, centre[2] + r * math.cos(ang)]
                look = [centre[0], centre[1] + float(o.get("look_y", 1.0)), centre[2]]
            else:
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
                          "ease": c.get("ease", "inOut"), **_cam_v2(c, ktag, errors)})
        if not ckeys:
            errors.append(f"{tag}: needs at least one camera key")
            continue
        # camera v3 (toki 2026-10-25, after six takes: "die most generic winkel und kamerafahrten ... raymi nicht im bild
        # oder nur am rand"): the lens is computed from HER - where she stands, how tall she is - in the grammar of the
        # K/DA FIRESTARTER study, replacing the script's world-coordinate keys (special shots keep theirs)
        v3 = None
        hand = bool(s.get("camera_hand"))                 # 6_CAMERA.md: a lens written by hand for this bar - no rule touches it
        if spec.get("camera_v3") and not hand and not (s.get("opts") or {}).get("her_off") and not V3_SPECIAL.search(str(s.get("size", ""))):
            v3 = camera_v3(s, marks, errors, tag, fr(a), fr(b), i, st, sets[st])
        if v3:
            ckeys = v3
        # frame_fit (raymi/frame.py): the whole lens shifted onto her MEASURED head (probe) - close shots only
        ff = None if v3 or hand else s.get("frame_fit")
        if isinstance(ff, list) and len(ff) == 3:
            for ck in ckeys:
                ck["pos"] = [round(p + o, 4) for p, o in zip(ck["pos"], ff)]
                ck["look"] = [round(p + o, 4) for p, o in zip(ck["look"], ff)]
        if spec.get("director") and not v3 and not hand:               # the camera director (direct_camera): never still, poses staged
            ckeys = direct_camera(ckeys, s, fr(a), fr(b), i)
        # frame_dolly (guard --fill-frame, toki 2026-10-25 "raymi ... sollte größer im bild sein ... oft wirkt alles leer
        # und raymi weit weg"): the lens moves this share of the way it was from what it looks at - she fills the frame
        fd = None if v3 or hand else s.get("frame_dolly")
        if isinstance(fd, (int, float)) and 0.3 <= fd < 1:
            for ck in ckeys:
                ck["pos"] = [round(lk + (p - lk) * fd, 4) for p, lk in zip(ck["pos"], ck["look"])]
        # the observer (toki 2026-10-24): a person watching her, not a tripod - the film's default, a shot may set 0
        obs = s.get("observer", spec.get("observer"))
        if obs is not None:
            for ck in ckeys:
                ck["observer"] = float(obs)
        # she notices the watcher: the film's default share of a head turn toward the lens (a key may set its own)
        aw = s.get("aware", spec.get("aware"))
        if aw is not None:
            for ak in s.get("actor") or []:
                ak.setdefault("aware", float(aw))
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
        # toki 2026-10-25 "ich möchte die lyrics on screen komplett streichen": job option lyrics_off
        if spec.get("lyrics_off") and not s.get("text"):
            lyr = None
        # camera swings on sung words (toki 2026-10-25: "kamera mehr schnelle dynamische bewegungen on beat zb im refrain bei
        # move move oder kda ay so hin her"): job option swing_words -> the lens swings left / right on each of them
        swing = []
        sw_words = {x.lower() for x in spec.get("swing_words") or []}
        if sw_words:
            for ln in lyrics:
                for w in ln["words"]:
                    tok = re.sub(r"[^\w/]", "", w["w"].lower())
                    if tok in sw_words and fr(a) <= w["cut"] < fr(b) - 4:
                        swing.append([w["cut"], 1 if len(swing) % 2 == 0 else -1])
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
                 "cross": lyr.get("cross"),
                 "lens": lyr.get("lens"),                    # [x, y, d]: the block rides the lens (fitter, crash / orbit close shots)                  # "<why>": the words may cross her figure, never her face (close shots)
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
        # the film's look per set (spec "set_opts": {"nightsea": {...}}): the world's light, rain, lighthouse ... written
        # once; a shot's own opts win (Love is War: ~200 pictures in one world)
        opts = {**((spec.get("set_opts") or {}).get(st) or {}), **(s.get("opts") or {})}
        if "grade" not in opts and acts:                   # the look step: the act's grade (a shot may name its own)
            g = act_grade(acts, a)
            if g:
                opts["grade"] = g
        if "grade" in opts and opts["grade"] not in GRADES:
            errors.append(f"{tag}: grade {opts['grade']!r} is not in the grade library {sorted(GRADES)}")
        short_opts = opts.pop("short", None)
        if "depth" not in opts and spec.get("depth") is not None:
            opts["depth"] = float(spec["depth"])           # the film's light depth (look.tsx SetLight): a shot may set its own
        # her chair (office set): rolled back when she is at her place in this shot and never seated in it
        at_place = [k for k in s.get("actor") or [] if k.get("pos") == "chair"]
        if st == "office" and "chair_out" not in opts and at_place and not any(
                str(k.get("pose", "")).startswith(("sit", "slump")) for k in at_place):
            opts["chair_out"] = True
        if fmt == "short" and isinstance(short_opts, dict):
            opts.update(short_opts)                        # the narrow frame's own set choices (e.g. a sign left out)
        if spec.get("effects"):                            # her-world effects, each only where it means something
            s = effect_rules(s, opts, st, a, b, lyrics, swing)
        for k in TIME_OPTS & opts.keys():
            opts[k] = time_opt(opts[k], fr)
        for k in ("doors", "bed_drag", "dusk_to"):         # only the TIME of these is song seconds, the rest are values
            v = opts.get(k)
            if isinstance(v, list) and v and isinstance(v[0], list):
                opts[k] = [[fr(x[0])] + list(x[1:]) for x in v]
            elif isinstance(v, list) and v:
                opts[k] = [fr(v[0])] + list(v[1:])
        if isinstance(opts.get("battery"), list):           # her battery: [[seconds from the shot start, dots 0..5], ...]
            opts["battery"] = [[fr(a + float(t)), int(n)] for t, n in opts["battery"]]
        elif "battery" in opts:
            opts["battery"] = [[fr(a), int(opts["battery"])]]
        for k in REL_OPTS & opts.keys():                   # seconds from this shot's start
            opts[k] = time_opt(opts[k], lambda t, a=a: fr(a + t))
        sal = opts.get("salmon")                          # the narrow Short frame may need Salmon elsewhere (guard --place-creatures)
        if isinstance(sal, dict) and "short_pos" in sal:
            sal = {k: v for k, v in sal.items() if k != "short_pos"}
            if fmt == "short":
                sal["pos"] = opts["salmon"]["short_pos"]
            opts["salmon"] = sal
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
        actor = compile_actor(s, fmt, a, b, fr, marks, poses, errors, tag, clips) if s.get("actor") else []
        # her face (toki 2026-10-27: "sie ist immer sehr emotionslos" - 186 of 229 keys had none): a key without its own
        # expr takes the row's "face", else the job's "faces" for the song section it sits in - "main" when she acts in
        # the world, "lens" when she plays to the camera (aware / face_lens). Named feeling, never a blank face.
        faces = spec.get("faces") or {}
        if actor and (s.get("face") or faces):
            mid = (a + b) / 2
            sec = next((x.get("kind") for x in smap.get("sections", []) if x["t0"] <= mid < x["t1"]), None)
            mood = faces.get(sec) or faces.get("default") or {}
            for k in actor:
                if "expr" in k:
                    continue
                lens = bool(k.get("faceLens") or (k.get("aware") or 0) >= 0.5)
                e = s.get("face") or (mood.get("lens") if lens and mood.get("lens") else mood.get("main"))
                if e:
                    k["expr"] = dict(e)
        # her motion against the music: a slow clip in a loud section is flagged with stronger ones (measured energy)
        loud = [x for x in smap.get("sections", []) if x.get("kind") in ("peak", "loud") and x["t0"] < b and x["t1"] > a]
        if loud and actor and not (s.get("opts") or {}).get("freeze"):
            en = clip_energy()
            for k in actor:
                m = en.get(str(k.get("motion")))
                if m and m["mean"] < LOUD_ENERGY and k.get("speed", 1.0) != 0:
                    warns.append(f"{tag}: clip {k['motion']} moves {m['mean']:.2f} m/s in a loud section (< {LOUD_ENERGY}) - "
                                 f"pick a stronger clip (studio/catalog/clip_energy.json) or say why in the row")
        # a clip that loops inside its key with a far-away last pose snaps on screen (the loop seam, measured)
        if actor:
            en = clip_energy()
            for i, k in enumerate(actor):
                m = en.get(str(k.get("motion")))
                run = ((actor[i + 1]["f"] if i + 1 < len(actor) else fr(b)) - k["f"]) / FPS * abs(k.get("speed", 1.0))
                if m and not k.get("once") and m["seam"] > 0.3 and float(k.get("clipFrom", 0)) + run > m["dur"]:
                    warns.append(f"{tag}: clip {k['motion']} loops after {m['dur'] - float(k.get('clipFrom', 0)):.1f} s with a "
                                 f"{m['seam']:.2f} m seam jump - shorter key, \"once\": true or another clip")
        used_clips |= {k["motion"] for k in actor if k.get("motion")}
        if actor and not s.get("low_ok"):
            errors += under_skirt(ckeys, actor, tag)
        if actor and not spec.get("vrm"):
            errors.append(f"{tag}: actor keys need the top-level \"vrm\" model (e.g. \"vrm/raymi5.vrm\")")
        extra = {}
        if actor:
            extra["actor"] = actor
            # camera v3: she does NOT turn to whatever lens there is (that made every angle a frontal one) - she faces her
            # own front and the lens moves round her; only a held hero pose plays to the viewer
            if v3 and v3[0].get("v3") != "hero":
                for ak in actor:
                    if ak.get("rotY") in ("lens", None):
                        ak["rotY"] = 0.0
            if s.get("track"):                             # the lens rides along her way (travel.py; check.ts makeCamera)
                tr = s["track"]
                extra["track"] = {"v": tr["v"], "mid": fr(tr["mid"]), "lead": tr["lead"]}
            m = s.get("mouth", {"gain": 1.0})
            extra["mouth"] = {"gain": 0.0} if m == "silent" else {"gain": float(m.get("gain", 1.0))}
        for opt in ("step", "outline"):
            if opt in s:
                extra[opt] = s[opt]
        if s.get("fx"):
            extra["fx"] = compile_fx(s, a, b, fr, errors, tag, smap)
            for x in extra["fx"]:                          # a stamp word is screen text in her heavy weight
                if x.get("kind") == "stamp" and x.get("text"):
                    screen_texts.append(str(x["text"]))
                    heavy = True
        if isinstance(ff, list) and len(ff) == 3:
            extra["fitted"] = True                         # the lens sits on her MEASURED head (probe): the guard trusts it
        if spec.get("film_look") and "post" not in opts:   # toki 2026-10-25 "sehr flach und cartoon / plastik": DoF on her, glow, vignette
            opts["post"] = {"dof_auto": 1, "glow": 1, "vignette": 0.42}
        if spec.get("film_look"):                          # K/DA FIRESTARTER study in her world: plankton trails, deep-sea murk, her UV + the lamp
            # toki 2026-10-25 "effekte passend benutzt ... nicht gleich alles voller leuchtspur": trails only where she
            # really dances (a moving dance / spin clip), the murk soft, her UV + lamp light always
            moving = [a for a in (s.get("actor") or []) if a.get("speed", 1) != 0 and re.search(r"dance|hip-hop|spin|kick|twist", str(a.get("clip", "")))]
            opts.setdefault("trails", 1 if moving else 0); opts.setdefault("haze", 0.6); opts.setdefault("her_light", 1)
        if swing and not hand:                            # a hand-written burst IS the swing of this shot
            extra["swing"] = swing
        shots.append({**extra, "id": s.get("id", f"s{i + 1}"), "from": max(0, fr(a)), "to": min(total, fr(b)), "set": st, "hero": hero,
                      "opts": opts, "camera": ckeys, "kick": float(s.get("kick", spec.get("kick", 1.0))), "puppets": pkeys,
                      "lyrics": L, "words": words,
                      "transition": {"kind": tr.get("kind", "cut"), "frames": int(tr.get("frames", 0)),
                                     **({"obj": tr["obj"]} if "obj" in tr else {}), **({"dir": tr["dir"]} if "dir" in tr else {})},
                      "events": [],
                      # readable set props (guard: never cut by the frame edge) + places the lens may never be
                      "texts": [{k: v for k, v in tx.items() if k not in ("opt", "unless", "blank")} for tx in sets[st].get("texts", [])
                                if (not tx.get("opt") or opts.get(tx["opt"])) and opts.get(tx.get("unless", ""), True) is not False
                                and not (tx.get("blank") and opts.get(tx["blank"]) == "")] + stage_texts(opts),
                      "noLens": sets[st].get("no_lens", []) + rock_no_lens(opts),
                      # a macro / a close-up AT a prop may sit close to it: "lens_near": {"monitor": "<why>"} lifts that solid
                      "solids": [x for x in [{k: v for k, v in so.items() if k not in ("opt", "unless")} for so in sets[st].get("solids", [])
                                 if (not so.get("opt") or opts.get(so["opt"])) and opts.get(so.get("unless", ""), True) is not False]
                                 + thing_solids(opts.get("things") or [], marks) if x["name"] not in (s.get("lens_near") or {})]})
    director_clear(shots)
    swing_clear(shots)
    bridge_cuts(shots, int(spec.get("bridge", 0) or 0))
    chain_actors(shots, int(spec.get("chain", 0) or 0))
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
    if spec.get("vrm"):
        props["vrm"] = spec["vrm"]
        # every clip a key names is loaded (a clip missing from the list froze her silently before 2026-10-23)
        listed = list(spec.get("motions") or [])
        have = {Path(m).stem for m in listed}
        props["motions"] = listed + [f"motions/{c}.fbx" for c in sorted(used_clips - have)]
        # her vocal stem's loudness per film frame opens the mouth (toki 2026-10-24: "keine Mundsynchro")
        vocals = job / "vocals.ogg"
        if vocals.exists():
            props["mouthEnv"] = vocal_envelope(vocals, t_from, total)
        # every sung word for her lip sync (film seconds), not only the words a shot writes on screen
        props["sung"] = [{"w": w["w"], "roma": w.get("roma", ""), "t0": round(w["t0"] - t_from, 3), "t1": round(w["t1"] - t_from, 3)}
                         for ln in lyrics for w in ln.get("words", [])
                         if w.get("t1", 0) > t_from and w.get("t0", 0) < t_to and not ln.get("backing")]
        # a closed mouth while she sings (toki 2026-10-27 "lipsync sieht noch unpassend aus": 15 rows were "silent" over
        # 14 % of her loud vocal frames) - a silent row may hold at most 0.25 s of sung words
        for sh in shots:
            if (sh.get("mouth") or {}).get("gain", 1) > 0 or not sh.get("actor"):
                continue
            a0, b0 = sh["from"] / FPS, sh["to"] / FPS
            over = sum(max(0.0, min(b0, w["t1"]) - max(a0, w["t0"])) for w in props["sung"])
            if over > 0.25:
                warns.append(f"shot {sh.get('id')}: mouth 'silent' but she sings {over:.1f} s of words in it - drop 'silent' "
                             f"(or say why in the row)")
    if spec.get("voice"):
        # a talking Short (kind pov, raymi/voice_lines.py): her spoken words drive the mouth, and the sound under the
        # picture is the mix of bed + takes + sfx (python -m raymi mix, cloud prepare) - it starts at the window start
        from . import voice_lines as VL

        takes = VL.load_takes(job, spec, errors)
        props["sung"] = VL.spoken_words(takes, t_from, t_to)
        props["audio"] = {"file": "audio.m4a", "from": 0.0, "to": round(t_to - t_from, 3),
                          "src": _repo_path(job / "out" / "mix.m4a")}
        for k, s_ in enumerate(spec.get("sfx", [])):
            if not (VL.SFX_DIR / f"{s_.get('kind')}.wav").is_file():
                errors.append(f"sfx {k + 1}: unknown kind {s_.get('kind')!r} (assets/sfx, python -m raymi sfx build)")
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

"""Timeline compiler: a shooting script's data -> film props, refusing anything that would reach the screen broken."""
import json

import pytest

from raymi import timeline as T

LYRICS = {"lines": [
    {"i": 0, "para": 0, "text": "レフトサイド ライトサイド", "t0": 10.0, "t1": 11.8, "cut": 299,
     "words": [{"w": "レフトサイド", "roma": "refutosaido", "t0": 10.0, "t1": 10.9, "cut": 299, "how": "snapped"},
               {"w": "ライトサイド", "roma": "raitosaido", "t0": 10.9, "t1": 11.8, "cut": 326, "how": "snapped"}]},
    {"i": 1, "para": 0, "text": "You are KING", "t0": 12.0, "t1": 13.5, "cut": 359,
     "words": [{"w": "You", "roma": "yo", "t0": 12.0, "t1": 12.4, "cut": 359, "how": "snapped"},
               {"w": "are", "roma": "are", "t0": 12.4, "t1": 12.9, "cut": 371, "how": "snapped"},
               {"w": "KING", "roma": "king", "t0": 12.9, "t1": 13.5, "cut": 386, "how": "snapped"}]},
]}


def job(tmp_path, shots, **extra):
    (tmp_path / "lyrics_timed.json").write_text(json.dumps(LYRICS, ensure_ascii=False), encoding="utf-8")
    (tmp_path / "song_map.json").write_text(json.dumps({"hits": [10.5, 12.95], "beats": [10.0, 10.37]}), encoding="utf-8")
    spec = {"audio": {"file": "song.webm", "from": 299 / 30, "to": 14.0}, "lyrics": "lyrics_timed.json",
            "song_map": "song_map.json", "shots": shots, **extra}
    return spec


SHOT = {"set": "aquarium", "camera": [{"at": 0, "cam": "hall_wide"}, {"at": "end", "cam": "tank_front"}],
        "raymi": [{"at": 0, "sprite": "WS_F_SMUG_WINK_UV_169", "pos": "center", "act": "pop"}],
        "lyrics": {"kind": "sign", "anchor": "led", "key": ["KING"]}}

ALL = set(range(0x20, 0x7f)) | {ord(c) for c in "レフトサイドライ"}


def test_shots_compile_to_frames_with_lyrics_and_hits(tmp_path):
    spec = job(tmp_path, [{**SHOT, "at": "line:0"}, {**SHOT, "at": "line:1"}])
    p, errors, _ = T.compile_shots(tmp_path, spec, "mv", cmap=ALL)
    assert errors == []
    assert p["composition"] == "MV" and (p["width"], p["height"]) == (1920, 1080)
    assert [s["from"] for s in p["shots"]] == [0, 60] and p["durationInFrames"] == 420 - 299
    words = p["shots"][1]["words"]
    assert [w["w"] for w in words] == ["You", "are", "KING"] and [w["key"] for w in words] == [False, False, True]
    assert words[0]["from"] == 359 - 299                        # one frame before the syllable, film time
    assert p["hits"] == [round(10.5 * 30) - 299, round(12.95 * 30) - 299]
    cam = p["shots"][0]["camera"]
    assert cam[0]["pos"] == T.load_sets()["aquarium"]["cams"]["hall_wide"]["pos"] and cam[1]["f"] == 60
    assert p["shots"][0]["puppets"][0]["sprite"] == "sprites/WS_F_SMUG_WINK_UV_169.png"
    assert p["audio"]["file"] == "audio.webm"


def test_short_format_uses_the_same_shots_portrait(tmp_path):
    shot = {**SHOT, "at": "line:0", "camera": [{"at": 0, "cam": "hall_wide", "short": {"fov": 50}}]}
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [shot]), "short", cmap=ALL)
    assert errors == [] and p["composition"] == "MVShort" and (p["width"], p["height"]) == (1080, 1920)
    assert p["shots"][0]["camera"][0]["fov"] == 50
    shot["lyrics"] = {"kind": "sign", "anchor": "led", "size": 0.4, "short": {"size": 0.2, "width": 1.5}}
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [shot]), "short", cmap=ALL)
    assert (p["shots"][0]["lyrics"]["size"], p["shots"][0]["lyrics"]["width"]) == (0.2, 1.5)


def test_missing_glyph_fails_loudly(tmp_path):
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [{**SHOT, "at": "line:0"}]), "mv", cmap=set(range(0x20, 0x7f)))
    assert any("no glyph" in e and "レ" in e for e in errors)


def test_a_line_can_be_acted_instead_of_written(tmp_path):
    shot = {**SHOT, "at": "line:0", "lyrics": {"kind": "stamp", "anchor": "led", "lines": [1], "words": ["KING"]}}
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [shot]), "mv", cmap=set(range(0x20, 0x7f)))
    assert errors == [] and [w["w"] for w in p["shots"][0]["words"]] == ["KING"]


@pytest.mark.parametrize("bad, msg", [
    ({"set": "moon"}, "unknown set"),
    ({"raymi": [{"sprite": "NOPE_001", "pos": "center"}]}, "not in assets/catalog.json"),
    ({"raymi": [{"sprite": "WS_F_SMUG_WINK_UV_169", "pos": "nowhere"}]}, "unknown mark"),
    ({"camera": [{"at": 0, "cam": "drone"}]}, "unknown camera"),
    ({"transition": {"kind": "star_wipe"}}, "transition.kind"),
    ({"raymi": [{"sprite": "WS_F_SMUG_WINK_UV_169", "pos": "center", "act": "moonwalk"}]}, "act must be"),
])
def test_broken_shots_are_refused(tmp_path, bad, msg):
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [{**SHOT, "at": "line:0", **bad}]), "mv", cmap=ALL)
    assert any(msg in e for e in errors), errors


def test_shots_must_move_forward(tmp_path):
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [{**SHOT, "at": "line:1"}, {**SHOT, "at": "line:0"}]), "mv", cmap=ALL)
    assert any("not before the next shot" in e for e in errors)


def test_set_texts_are_glyph_checked(tmp_path):
    shot = {**SHOT, "at": "line:0", "opts": {"led": "@KING"}, "lyrics": None}
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [shot]), "mv", cmap=set(range(0x20, 0x7f)) - {ord("@")})
    assert any("@" in e for e in errors)


def test_set_times_become_film_frames_and_a_window_drops_shots(tmp_path):
    a = {**SHOT, "at": "line:0", "opts": {"banks_off": [10.5, 11.0], "crowd_look": [[10.4, "left"]], "flick": [10.6, "left"]}}
    b = {**SHOT, "at": "line:1"}
    spec = job(tmp_path, [a, b], window={"pilot": {"from": 11.5, "to": 13.9}})
    p, errors, _ = T.compile_shots(tmp_path, spec, "mv", cmap=ALL)
    o = p["shots"][0]["opts"]
    assert o["banks_off"] == [315 - 299, 330 - 299] and o["crowd_look"] == [[312 - 299, "left"]] and o["flick"] == [318 - 299, "left"]
    p, errors, _ = T.compile_shots(tmp_path, spec, "pilot", cmap=ALL)
    assert errors == [] and p["composition"] == "MV"
    assert [s["from"] for s in p["shots"]] == [0, 359 - 345]                 # shot 1 clipped to the window, shot 2 kept
    assert p["durationInFrames"] == round(13.9 * 30) - 345


def test_frame_camera_keeps_cut_edges_out_and_the_head_in(tmp_path):
    shot = {**SHOT, "at": "line:0", "camera": [{"at": 0, "frame": "close", "cam": "tank_front"}],
            "raymi": [{"at": 0, "sprite": "WS_F_PANIC_LUNGE_UV_203", "pos": "center"}]}
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [shot]), "mv", cmap=ALL)
    assert errors == []
    k, c = p["shots"][0]["puppets"][0], p["shots"][0]["camera"][0]
    t = T.math.tan(T.math.radians(c["fov"]) / 2)
    edges, head = T._plane_points(k, 0.0)
    p0 = k["pos"]
    dx, dz = c["pos"][0] - p0[0], c["pos"][2] - p0[2]
    n = T.math.hypot(dx, dz); rx, rz = dz / n, -dx / n
    world = lambda x, y: [p0[0] + rx * x, y, p0[2] + rz * x]   # noqa: E731
    for hx, hy in head:
        q = T._ndc(c["pos"], c["look"], t, 16 / 9, world(hx, hy))
        assert abs(q[0]) < 1 and abs(q[1]) < 1
    for ex, ey in edges:
        q = T._ndc(c["pos"], c["look"], t, 16 / 9, world(ex, ey))
        assert q is None or abs(q[0]) > 1 or abs(q[1]) > 1


def test_a_four_side_cut_bust_cannot_be_framed_in_16_9(tmp_path):
    shot = {**SHOT, "at": "line:0", "camera": [{"at": 0, "frame": "close", "cam": "tank_front"}],
            "raymi": [{"at": 0, "sprite": "MS_F_HAPPY_UV_005", "pos": "center"}]}
    _, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [shot]), "mv", cmap=ALL)
    assert any("choose a clean sprite" in e for e in errors)


# ---------------------------------------------------------------- lyrics v2, look step (acts), heroes
EVERY = set(range(0x110000))


def test_v2_japanese_line_gets_romaji_and_english_under_it(tmp_path):
    """toki 2026-10-19: a Japanese line always shows romaji + English; an English line needs none."""
    (tmp_path / "lyrics_en.json").write_text(json.dumps({"lines": {"レフトサイド ライトサイド": {
        "roma": "refuto saido raito saido", "en": "Left side, right side"}}}, ensure_ascii=False), encoding="utf-8")
    spec = job(tmp_path, [{**SHOT, "at": "line:0"}, {**SHOT, "at": "line:1"}], lyric_style="v2")
    p, errors, _ = T.compile_shots(tmp_path, spec, "mv", cmap=EVERY)
    assert errors == [] and p["heavy"] is True
    L0, L1 = p["shots"][0]["lyrics"], p["shots"][1]["lyrics"]
    assert L0["style"] == "v2" and L0["auto"] is True and L0["keyScale"] == 2.8
    assert L0["subs"]["0"]["en"] == "Left side, right side" and len(L0["subs"]["0"]["romaEm"]) == 4
    assert L1["subs"] == {}                                  # "You are KING" is English already
    assert p["shots"][0]["words"][0]["em"] > T.P.text_em("レフトサイド")    # her heavy weight is wider


def test_v2_japanese_line_without_translation_is_refused_unless_the_script_says_why(tmp_path):
    spec = job(tmp_path, [{**SHOT, "at": "line:0"}], lyric_style="v2")
    _, errors, _ = T.compile_shots(tmp_path, spec, "mv", cmap=EVERY)
    assert any("no English" in e for e in errors)
    shot = {**SHOT, "at": "line:0", "lyrics": {**SHOT["lyrics"], "sub": False}, "why": "the line is acted, no text"}
    _, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [shot], lyric_style="v2"), "mv", cmap=EVERY)
    assert errors == []


def test_v1_stays_the_default_until_toki_approves_v2(tmp_path):
    p, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [{**SHOT, "at": "line:0"}]), "mv", cmap=EVERY)
    assert errors == [] and "style" not in p["shots"][0]["lyrics"] and p["heavy"] is False


def test_acts_give_every_shot_its_grade_and_a_shot_may_name_its_own(tmp_path):
    shots = [{**SHOT, "at": "line:0"}, {**SHOT, "at": "line:1", "opts": {"grade": "own"}}, {**SHOT, "at": 13.0}]
    spec = job(tmp_path, shots, acts=[{"at": 0, "grade": "day"}, {"at": 12.5, "grade": "night"}])
    p, errors, _ = T.compile_shots(tmp_path, spec, "mv", cmap=EVERY)
    assert errors == [] and [s["opts"]["grade"] for s in p["shots"]] == ["day", "own", "night"]
    _, errors, _ = T.compile_shots(tmp_path, job(tmp_path, shots, acts=[{"at": 0, "grade": "sepia"}]), "mv", cmap=EVERY)
    assert any("grade library" in e for e in errors)


def test_grade_library_matches_the_studio():
    import re
    from pathlib import Path
    ts = (Path(T.REPO) / "studio" / "src" / "film" / "grade.ts").read_text(encoding="utf-8")
    body = ts[ts.index("export const TONES"):ts.index("};", ts.index("export const TONES"))]
    assert set(re.findall(r"^  (\w+): \{filter", body, re.M)) == T.GRADES


def test_heroes_are_named_once_and_marked_per_shot(tmp_path):
    shot = {**SHOT, "at": "line:0", "hero": ["crown", {"name": "KING", "min": 0.08}]}
    spec = job(tmp_path, [shot], heroes={"crown": {"what": "the crown on her head"}, "KING": {"kind": "word"}})
    p, errors, _ = T.compile_shots(tmp_path, spec, "mv", cmap=EVERY)
    assert errors == []
    h = {x["name"]: x for x in p["shots"][0]["hero"]}
    assert h["crown"]["kind"] == "crown" and h["crown"]["min"] == 0.05 and h["KING"]["min"] == 0.08
    _, errors, _ = T.compile_shots(tmp_path, job(tmp_path, [{**SHOT, "at": "line:0", "hero": ["cape"]}]), "mv", cmap=EVERY)
    assert any("hero 'cape'" in e for e in errors)

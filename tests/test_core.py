"""Tests for the parts that protect the screen: spoken text, plan checks, catalog, font, channel rules."""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from raymi import channel_rules, plan as P  # noqa: E402
from raymi.tts import align_fuzzy, even_spread, match_to_script  # noqa: E402
from raymi.tts_text import strip_non_speech, validate_spoken  # noqa: E402

TEST_JOB = ROOT / "jobs" / "2026-10-17_s0-test"


def base_plan():
    return json.loads((TEST_JOB / "plan.json").read_text(encoding="utf-8"))


def fake_words(plan, dur=19.2):
    ws = plan["script"].split()
    return {"duration": dur, "timing_source": "edge-tts", "words": even_spread(ws, dur)}


# --- spoken text ------------------------------------------------------------------------------------------------
def test_kaomoji_never_reach_tts():
    text = "hi chat ( ˶ˆ ᗜ ˆ˵ ) my best friend is a salmon =3= lol"
    out = strip_non_speech(text)
    assert "ᗜ" not in out and "=3=" not in out and "lol" not in out
    assert validate_spoken(out) == []


def test_digits_are_refused_in_spoken_text():
    assert any("digits" in i for i in validate_spoken("my record is 3 out of 10."))


# --- catalog ----------------------------------------------------------------------------------------------------
def test_catalog_files_exist_and_no_excluded_sprite_slipped_in():
    cat = P.load_catalog()
    assert len(cat) >= 150
    for sid, s in cat.items():
        assert (ROOT / s["file"]).is_file(), sid
        assert s["status"] in ("ok", "limited"), sid
    for bad in ("WS_F_SUSHI_UV_051", "WS_F_SUSHI_UV_053", "MS_F_ANGRY_UV_002", "CU_F_SUSHI_UV_071", "CU_F_MIC_UV_074"):
        assert bad not in cat


def test_catalog_has_one_entry_per_file():
    # old registry fault: RAY_-prefixed duplicate keys made the sprite count look bigger than it was
    cat = P.load_catalog()
    files = [s["file"] for s in cat.values()]
    assert len(files) == len(set(files))
    assert not any(k.startswith("RAY_") for k in cat)
    on_disk = {p.name for p in (ROOT / "assets" / "sprites").glob("*.png")}
    assert on_disk == {Path(f).name for f in files}


def test_catalog_boxes_are_fractions():
    for sid, s in P.load_catalog().items():
        head = s["anatomy"].get("head")
        if head:
            assert 0 <= head[0] < head[2] <= 1 and 0 <= head[1] < head[3] <= 1, sid


# --- plan checks ------------------------------------------------------------------------------------------------
def test_test_job_passes():
    plan = base_plan()
    errors, _ = P.check(plan, fake_words(plan))
    assert errors == []


def test_unknown_or_excluded_sprite_is_an_error():
    plan = base_plan()
    plan["beats"][1]["sprite"] = "WS_F_SUSHI_UV_051"
    errors, _ = P.check(plan, fake_words(plan))
    assert any("not in assets/catalog.json" in e for e in errors)


def test_same_sprite_twice_in_a_row_is_an_error():
    plan = base_plan()
    plan["beats"][1]["sprite"] = plan["beats"][0]["sprite"]
    errors, _ = P.check(plan, fake_words(plan))
    assert any("expression must change" in e for e in errors)


def test_missing_glyph_fails_loudly():
    plan = base_plan()
    plan["cta"]["text"] = "follow me 😀?"   # no font of hers will ever have an emoji
    errors, _ = P.check(plan, fake_words(plan))
    assert any("no glyph" in e for e in errors)


def test_cta_must_be_a_question_and_hook_short():
    plan = base_plan()
    plan["cta"]["text"] = "subscribe"
    plan["hook"]["text"] = "this hook is far too long to read in one second ok"
    errors, _ = P.check(plan, fake_words(plan))
    assert any("question" in e for e in errors) and any("8 words" in e for e in errors)


def test_length_limits_by_kind():
    plan = base_plan()
    errors, _ = P.check(plan, fake_words(plan, dur=40.0))
    assert any("outside" in e for e in errors)
    song = copy.deepcopy(plan)
    song["kind"] = "song"
    errors, _ = P.check(song, fake_words(song, dur=19.2))   # 19.2 + 0.7 tail = 19.9 s: inside 12-20
    assert not any("outside" in e for e in errors)
    errors, _ = P.check(song, fake_words(song, dur=21.0))
    assert any("outside" in e for e in errors)


def test_key_word_must_exist():
    plan = base_plan()
    plan["beats"][0]["key"] = ["banana"]
    errors, _ = P.check(plan, fake_words(plan))
    assert any("key word" in e for e in errors)


def test_props_resolve_frames_and_keys():
    plan = base_plan()
    pr = P.props(plan, fake_words(plan))
    assert pr["beats"][0]["from"] == 0
    assert all(b["from"] < b["to"] for b in pr["beats"])
    assert pr["beats"][-1]["to"] == pr["durationInFrames"]
    assert any(w["key"] for w in pr["words"])
    assert pr["cta"]["from"] <= pr["durationInFrames"] - int(2.5 * pr["fps"])


# --- timing -----------------------------------------------------------------------------------------------------
def test_match_to_script_handles_split_tokens():
    script = ["o'clock.", "rain"]
    timed = [{"w": "o'", "start": 0.0, "end": 0.1}, {"w": "clock", "start": 0.1, "end": 0.4}, {"w": "rain", "start": 0.5, "end": 0.8}]
    out = match_to_script(script, timed)
    assert out and out[0]["end"] == 0.4 and out[1]["start"] == 0.5


def test_fuzzy_alignment_survives_one_misheard_word():
    script = "i can predict rain officially".split()
    timed = [{"w": w, "start": i * 0.4, "end": i * 0.4 + 0.3} for i, w in enumerate("i can predict ray officially".split())]
    out = align_fuzzy(script, timed)
    assert out and [w["w"] for w in out] == script and out[3]["start"] < out[4]["start"]


def test_edge_tts_call_matches_installed_version():
    # the first cloud render died on an argument the pinned edge-tts does not know; build the object offline
    import edge_tts
    from raymi.tts import VOICE, communicate_kwargs
    edge_tts.Communicate("hi chat", VOICE, **communicate_kwargs(edge_tts))


# --- channel rules ----------------------------------------------------------------------------------------------
def test_channel_rules_block_ai_vtuber_tag():
    issues = channel_rules.tag_issues(["ai vtuber", "stingray vtuber"], ["#rain", "#vtuber", "#envtuber"])
    assert any("ai vtuber" in i for i in issues)

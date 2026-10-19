"""Song tools: lyric words, matching by sound, onset snapping, one-frame-early cuts, stops and sections."""
import numpy as np

from raymi import song as S

KING = """幽閉 利口 逝く前に
ユーヘイじゃ利口に難儀ダーリン

レフトサイド ライトサイド
歯をむき出して パッパッパ
You are KING
"""


def test_words_split_by_script():
    assert S.words_of("ユーヘイじゃ利口に難儀ダーリン") == ["ユーヘイ", "じゃ", "利口に", "難儀", "ダーリン"]
    assert S.words_of("お願い1つ") == ["お願い", "1つ"]
    assert S.words_of("無いのあなたにお願い1つ") == ["無いのあなたに", "お願い", "1つ"]
    assert S.words_of("思い込め") == ["思い", "込め"]
    assert S.words_of("KING!") == ["KING!"]


def test_parse_lyrics_lines_and_paragraphs():
    lines = S.parse_lyrics(KING)
    assert [ln["para"] for ln in lines] == [0, 0, 1, 1, 1]
    assert lines[0]["words"] == ["幽閉", "利口", "逝く", "前に"]
    assert lines[2]["words"] == ["レフトサイド", "ライトサイド"]
    assert lines[4]["words"] == ["You", "are", "KING"]


def test_roma_matches_by_sound_across_scripts():
    assert S.roma("ユーヘイ") == S.roma("幽閉") == "yuhei"
    assert S.roma("You are KING") == "yoareking"
    assert S.roma("パッパッパ") == S.roma("ぱっぱっぱ")


def _asr_for(lines, t0=10.0, per_word=0.5, skip=()):
    """Fake recognition: every official word sung in order, one every per_word s, some words missed."""
    out, t = [], t0
    for ln in lines:
        for w in ln["words"]:
            if w not in skip:
                out.append({"w": w, "t0": t, "t1": t + per_word * 0.8})
            t += per_word
    return out


def test_align_gives_each_word_its_recognised_time():
    lines = S.parse_lyrics(KING)
    m = S.align(lines, _asr_for(lines))
    flat = [w for row in m for w in row]
    assert abs(flat[0]["t0"] - 10.0) < 0.01
    assert all(w["t0"] is not None for w in flat)
    ts = [w["t0"] for w in flat]
    assert ts == sorted(ts)


def test_missed_words_are_interpolated_and_marked():
    lines = S.parse_lyrics(KING)
    asr = _asr_for(lines, skip={"難儀", "ライトサイド"})
    out = S.time_words(lines, S.align(lines, asr), onsets=[], duration=30.0)
    flat = [w for ln in out for w in ln["words"]]
    by = {w["w"]: w for w in flat}
    assert by["難儀"]["how"] == "interpolated" and by["ライトサイド"]["how"] == "interpolated"
    assert by["利口に"]["t0"] < by["難儀"]["t0"] < by["ダーリン"]["t0"]
    ts = [w["t0"] for w in flat]
    assert all(b > a for a, b in zip(ts, ts[1:]))


def test_measured_words_snap_to_vocal_onsets():
    lines = S.parse_lyrics("レフトサイド ライトサイド")
    asr = [{"w": "レフトサイド", "t0": 5.10, "t1": 5.6}, {"w": "ライトサイド", "t0": 5.90, "t1": 6.4}]
    out = S.time_words(lines, S.align(lines, asr), onsets=[5.02, 5.97, 9.0], duration=10)
    w = out[0]["words"]
    assert (w[0]["t0"], w[0]["how"]) == (5.02, "snapped")
    assert (w[1]["t0"], w[1]["how"]) == (5.97, "snapped")


def test_out_of_order_match_is_dropped():
    assert S._lis_keep([1.0, 2.0, 0.5, 3.0, 4.0]) == [1.0, 2.0, None, 3.0, 4.0]


def test_cut_lands_one_frame_before_the_syllable():
    assert S.cut_frame(1.0) == 29          # syllable at frame 30 -> cut at 29
    assert S.cut_frame(0.0) == 0


def test_pick_onsets_on_clicks():
    env = np.zeros(300)
    for i in (50, 120, 200):
        env[i] = 1.0
    assert S.pick_onsets(env, fps=100) == [0.5, 1.2, 2.0]


def test_stops_found_in_a_loud_song():
    db = np.full(400, -6.0)                # 40 s at 10 Hz
    db[150:180] = -18.0                    # a 3 s break at 15 s
    st = S.stops(db)
    assert len(st) == 1 and st[0]["t0"] == 15.0 and st[0]["t1"] == 18.0


def test_novelty_peaks_at_a_section_change():
    rng = np.random.default_rng(1)
    a = rng.normal(0, 0.1, (12, 40)) + np.r_[np.ones(6), np.zeros(6)][:, None]
    b = rng.normal(0, 0.1, (12, 40)) + np.r_[np.zeros(6), np.ones(6)][:, None]
    nov = S.novelty(np.hstack([a, b]), k=6)
    assert abs(int(np.argmax(nov)) - 40) <= 2


def test_vocal_spans_bridge_short_gaps():
    db = np.full(100, -60.0)
    db[10:30] = -10
    db[33:50] = -10                        # 0.3 s gap -> bridged
    db[70:80] = -10
    assert S.vocal_spans(db) == [[1.0, 5.0], [7.0, 8.0]]


def test_sections_from_stops_paragraphs_and_repeats():
    lines = [{"para": 0, "text": "verse", "t0": 10.0, "t1": 18.0}, {"para": 1, "text": "chorus", "t0": 20.0, "t1": 28.0},
             {"para": 2, "text": "verse two", "t0": 32.0, "t1": 40.0}, {"para": 3, "text": "chorus", "t0": 44.0, "t1": 52.0}]
    loud = [-6.0] * 600
    stop_list = [{"t0": 29.0, "t1": 31.0, "depth_db": 10}]
    secs = S.sections(60.0, [20.4, 45.0], stop_list, [[10, 28.5], [32, 52]], loud, lines)
    starts = [s["t0"] for s in secs]
    assert starts[:2] == [0.0, 10.0] and 29.0 in starts and 44.0 in starts and 20.4 not in starts
    by = {s["t0"]: s for s in secs}
    assert by[0.0]["kind"] == "intro" and by[29.0]["kind"] == "stop"
    assert by[20.0]["part"] == by[44.0]["part"] != by[10.0]["part"]      # the chorus repeats


def test_hangul_is_one_word_and_matches_by_sound():
    assert S.words_of("불을") == ["불을"]
    assert S.words_of("(후후)")[-1] == "후후)"
    assert S.hangul_roma("축제") == "chukje"
    assert S.roma("월화수목금토일") == "wolhwasumokgeumtoil"
    assert S.roma("I'm the lighter") == "imthelighter"


def test_asr_gaps_find_sung_windows_the_recogniser_missed():
    asr = [{"w": "a", "t0": 1.0}, {"w": "b", "t0": 2.0}, {"w": "x", "t0": 9.0}, {"w": "c", "t0": 20.0}]
    assert S.asr_gaps(asr, [[0.5, 21.0]], min_gap=4.0, pad=0.5) == [[1.5, 9.5], [8.5, 20.5]]
    assert S.asr_gaps(asr, [[0.5, 3.0]]) == []


def test_heard_letters_prefers_the_pass_that_sounds_like_the_lyrics():
    target = S.roma("I'm insane yeah I know you like it that way chaos running wild in my veins")
    en = [{"w": "I'm"}, {"w": "insane"}, {"w": "yeah"}, {"w": "I"}, {"w": "know"}, {"w": "you"}, {"w": "like"}]
    ko = [{"w": "아임"}, {"w": "인세인"}, {"w": "예"}, {"w": "아이"}, {"w": "노"}, {"w": "유"}, {"w": "라이크"}, {"w": "잇"}]
    assert S.heard_letters(en, target)[0] > S.heard_letters(ko, target)[0]


def test_repeated_choruses_keep_song_order():
    text = "start a fire call the fighter\nverse words here\nstart a fire call the fighter"
    lines = S.parse_lyrics(text)
    # the recogniser missed the FIRST chorus: its words must not steal the second one's times
    asr = [{"w": w, "t0": 10.0 + k, "t1": 10.5 + k} for k, w in enumerate("verse words here start a fire call the fighter".split())]
    m = S.align(lines, asr)
    first = [w["t0"] for w in m[0]]
    last = [w["t0"] for w in m[2]]
    assert all(t is None for t in first) or max(t for t in first if t is not None) < 10.0
    assert last[0] is not None and last[0] >= 13.0

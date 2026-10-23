"""Cuts on the music (raymi/cuts.py, toki 2026-10-23 "cuts wirken random")."""
from raymi import cuts as C

SMAP = {"hits": [2.0, 5.0], "beats": [1.0, 1.5, 2.0, 2.5, 3.0, 3.5], "sections": [{"t0": 0.0}, {"t0": 4.0}],
        "stops": [], "voices": [{"t0": 3.2}]}


def props(starts, end=7.0):
    fr = [round(t * 30) for t in starts] + [round(end * 30)]
    return {"audio": {"from": 0.0}, "shots": [{"id": str(i + 1), "from": fr[i], "to": fr[i + 1]} for i in range(len(starts))]}


def test_a_cut_one_frame_before_a_hit_is_on_the_music_a_beat_is_not():
    rep = C.report(props([0.0, 2.0 - 1 / 30, 3.5]), SMAP)
    on = {r["shot"]: r for r in rep["cuts"]}
    assert on["2"]["on"] and on["2"]["event"] == "hit" and on["2"]["off_frames"] == 0
    assert not on["3"]["on"]                     # 3.5 s: only a beat nearby (the line at 3.2 is too far)
    assert rep["hits_with_cut"] == 1 and rep["on_music"] == 0.5


def test_apply_moves_numeric_starts_onto_the_strongest_event():
    spec = {"shots": [{"id": "1", "at": 0.0}, {"id": "2", "at": 1.75}, {"id": "3", "at": 3.3}]}
    rep = C.report(props([0.0, 1.75, 3.3]), SMAP)
    done = C.apply(spec, rep["cuts"])
    assert spec["shots"][1]["at"] == round(2.0 - 1 / 30, 3)      # pulled to the hit, not to the 2.0 beat's rank
    assert spec["shots"][2]["at"] == round(3.2 - 1 / 30, 3)      # the sung line
    assert len(done) == 2


def test_monotone_runs_are_reported():
    rep = C.report(props([0, 2, 4, 6, 8], end=10), {"hits": [], "beats": []})
    assert rep["monotone_runs"] and rep["monotone_runs"][0]["shots"] == 5

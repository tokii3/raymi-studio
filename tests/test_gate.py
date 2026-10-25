"""The gate + the reality claims: nothing reaches toki past a BLOCK, and the brief's claims are checked on the
measured video, never on the plan (toki 2026-10-25)."""
import json
import subprocess
import sys
from pathlib import Path

from raymi import gate, reality

ROOT = Path(__file__).resolve().parents[1]


def _job(tmp_path):
    d = tmp_path / "2026-10-26_g"
    (d / "reviews").mkdir(parents=True)
    (d / "0_BRIEF.md").write_text("## Reality claims\n- max_hard_cuts: 0\n- min_face_to_lens: 0.6\n", encoding="utf-8")
    return d


def test_no_brief_keeper_no_pass(tmp_path):
    d = _job(tmp_path)
    assert any("brief-keeper" in r for r in gate.check(d, "stills", []))


def test_a_critic_block_stops_even_with_a_keeper_pass(tmp_path):
    d = _job(tmp_path)
    (d / "reviews" / "stills_brief-keeper_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    assert gate.check(d, "stills", []) == []
    (d / "reviews" / "stills_look-critic_2.md").write_text("BLOCK: fault: legs transparent\n", encoding="utf-8")
    assert any("look-critic" in r for r in gate.check(d, "stills", []))


def test_newest_answer_per_critic_counts(tmp_path):
    d = _job(tmp_path)
    (d / "reviews" / "stills_brief-keeper_1.md").write_text("VERDICT: BLOCK - no ride\n", encoding="utf-8")
    (d / "reviews" / "stills_brief-keeper_2.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    assert gate.check(d, "stills", []) == []


def test_a_video_needs_its_reality_measurement(tmp_path):
    d = _job(tmp_path)
    (d / "reviews" / "final_brief-keeper_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    assert any("reality" in r for r in gate.check(d, "final", [Path("x.mp4")]))
    (d / "out").mkdir()
    (d / "out" / "reality.json").write_text(json.dumps({"faults": ["hard_cuts = 32 > 0"]}), encoding="utf-8")
    assert any("hard_cuts" in r for r in gate.check(d, "final", [Path("x.mp4")]))


def test_brief_claims_are_checked_against_the_measurement(tmp_path):
    d = _job(tmp_path)
    claims = reality.claims(d)
    assert claims == {"max_hard_cuts": 0.0, "min_face_to_lens": 0.6}
    run67 = {"hard_cuts": 32, "face_to_lens": 0.35}          # Watch Me run 67, measured 2026-10-25
    assert len(reality.verdict(run67, claims)) == 2
    assert reality.verdict({"hard_cuts": 0, "face_to_lens": 0.8}, claims) == []


def _hook(files, caption=""):
    r = subprocess.run([sys.executable, str(ROOT / ".claude" / "hooks" / "gate_send.py")],
                       input=json.dumps({"tool_input": {"files": files, "caption": caption}, "cwd": "."}),
                       capture_output=True, text=True)
    return r.returncode


def test_send_hook_lets_only_gated_pictures_out(tmp_path):
    loose = tmp_path / "board.jpg"
    loose.write_bytes(b"x")
    assert _hook([str(loose)]) == 2
    assert _hook([str(tmp_path / "upload.md")]) == 0           # text passes
    ok = tmp_path / "ok"
    ok.mkdir()
    (ok / "GATE_PASS.json").write_text("{}")
    assert _hook([str(ok / "board.jpg")]) == 0
    bad = tmp_path / "bad"
    bad.mkdir()
    (bad / "GATE_FAIL.json").write_text("{}")
    assert _hook([str(bad / "board.jpg")], "here it is") == 2
    assert _hook([str(bad / "board.jpg")], "FAIL: look-critic blocked - you asked to see it") == 0

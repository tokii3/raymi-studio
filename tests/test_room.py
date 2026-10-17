"""Writers' room: steps are proven by evidence in the job folder, never skipped."""
import json

import pytest

from raymi import room


@pytest.fixture
def job(tmp_path):
    d = tmp_path / "2026-01-01_x"
    room.new(str(d), "mv")
    return d


def states(d):
    return {s: ok for s, ok, _ in room.status(str(d))}


def test_new_job_starts_at_dossier(job):
    assert (job / "1_DOSSIER.md").is_file() and (job / "4_SCRIPT.md").is_file()
    assert json.loads((job / "job.json").read_text())["kind"] == "mv"
    assert not any(states(job).values())
    assert "NEXT: dossier" in room.next_step(str(job))


def test_templates_only_count_their_markers(job):
    # the template's own instructions must not keep a filled file open forever
    (job / "1_DOSSIER.md").write_text("# DOSSIER\n\nall filled\n", encoding="utf-8")
    assert states(job)["dossier"]


def test_ideas_need_tokis_approval_line(job):
    (job / "1_DOSSIER.md").write_text("done", encoding="utf-8")
    (job / "2_IDEAS.md").write_text("A B C\napproved: <toki writes here>\n", encoding="utf-8")
    assert not states(job)["ideas"]
    (job / "2_IDEAS.md").write_text("A B C\napproved: toki 2026-10-18 B, darker\n", encoding="utf-8")
    assert states(job)["ideas"]


def test_treatment_needs_a_stored_pass_and_two_blocks_send_back(job):
    for f, t in (("1_DOSSIER.md", "x"), ("2_IDEAS.md", "approved: toki 2026-10-18 A"), ("3_TREATMENT.md", "full")):
        (job / f).write_text(t, encoding="utf-8")
    assert not states(job)["treatment"]
    (job / "reviews" / "treatment_1.md").write_text("...\nVERDICT: BLOCK: thin - open\n", encoding="utf-8")
    (job / "reviews" / "treatment_2.md").write_text("...\nVERDICT: BLOCK: slop - generic\n", encoding="utf-8")
    why = dict((s, w) for s, _, w in room.status(str(job)))["treatment"]
    assert "back to IDEAS" in why
    (job / "reviews" / "treatment_10.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    assert states(job)["treatment"]          # newest answer counts (10 > 2, numeric order)


def test_no_step_counts_after_an_open_one(job):
    (job / "3_TREATMENT.md").write_text("full", encoding="utf-8")
    (job / "reviews" / "treatment_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    assert not states(job)["treatment"]       # dossier + ideas still open


def test_next_names_the_knowledge_to_open(job):
    out = room.next_step(str(job))
    assert "knowledge/CASEBOOK.md" in out

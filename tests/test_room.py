"""Writers' room: steps are proven by evidence in the job folder, never skipped."""
import json

import pytest

from raymi import room


def _legacy(d):
    """Jobs created before the brief contract (2026-10-25) start at the dossier - the step logic below is tested there."""
    meta = json.loads((d / "job.json").read_text())
    meta["created"] = "2026-10-01"
    (d / "job.json").write_text(json.dumps(meta))


@pytest.fixture
def job(tmp_path):
    d = tmp_path / "2026-01-01_x"
    room.new(str(d), "mv")
    _legacy(d)
    return d


BRIEF = """# 0_BRIEF
## Her words
- toki 2026-10-26: "die kamera ist eine einzelne fahrt, sie flirtet mit der kamera"
## Core
- eine einzelne fahrt
## Visible proof
- [ ] C1 "eine einzelne fahrt" -> no hard cut -> reality
## Reality claims
- max_hard_cuts: 0
"""


def ideas_ok():
    rows = "".join(f"| {i}.0 | line {i} | meaning {i} | dots flare (T01), ping rings (T03) |\n" for i in range(8))
    cov = "".join(f"- {t} used in rows 1-3, or why not here\n" for t in room.toolkit_ids())
    return (f"## Idea matrix\n| time | line | means | ideas |\n|---|---|---|---|\n{rows}\n## Toolkit coverage\n{cov}\n"
            "approved: toki 2026-10-26 A\n")


@pytest.fixture
def new_job(tmp_path):
    d = tmp_path / "2026-10-26_y"
    room.new(str(d), "mv")
    return d


def test_a_new_job_starts_with_tokis_brief_contract(new_job):
    assert (new_job / "0_BRIEF.md").is_file()
    assert "NEXT: brief" in room.next_step(str(new_job))
    (new_job / "0_BRIEF.md").write_text(BRIEF, encoding="utf-8")
    assert states(new_job)["brief"]


def test_a_missing_capability_stops_the_brief_until_toki_knows(new_job):
    (new_job / "0_BRIEF.md").write_text(BRIEF + "## Feasibility\n- C2 hand into the lens: MISSING clip\n",
                                        encoding="utf-8")
    assert not states(new_job)["brief"]
    (new_job / "0_BRIEF.md").write_text(BRIEF + "## Feasibility\n- C2: MISSING clip\n"
                                        "missing ok: toki 2026-10-26 nimm eine pose\n", encoding="utf-8")
    assert states(new_job)["brief"]


def test_treatment_needs_the_brief_keeper_too(new_job):
    (new_job / "0_BRIEF.md").write_text(BRIEF, encoding="utf-8")
    for f, t in (("1_DOSSIER.md", "x"), ("2_IDEAS.md", ideas_ok()), ("3_TREATMENT.md", "full")):
        (new_job / f).write_text(t, encoding="utf-8")
    (new_job / "reviews" / "treatment_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    why = dict((s, w) for s, _, w in room.status(str(new_job)))["treatment"]
    assert "brief-keeper" in why                     # the script-critic alone never judged her words
    (new_job / "reviews" / "treatment_brief-keeper_1.md").write_text("VERDICT: BLOCK - the ride is gone\n",
                                                                     encoding="utf-8")
    assert not states(new_job)["treatment"]
    (new_job / "reviews" / "treatment_brief-keeper_2.md").write_text("VERDICT: PASS - all core lines\n",
                                                                     encoding="utf-8")
    assert states(new_job)["treatment"]


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


def _through_script(d):
    for f, t in (("1_DOSSIER.md", "x"), ("2_IDEAS.md", "approved: toki 2026-10-18 A"), ("3_TREATMENT.md", "full"),
                 ("4_SCRIPT.md", "shots")):
        (d / f).write_text(t, encoding="utf-8")
    for step in ("treatment", "script"):
        (d / "reviews" / f"{step}_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")


def test_studio_steps_need_data_screening_and_tokis_words(job):
    _through_script(job)
    assert not states(job)["build"]
    (job / "shots.json").write_text("{}", encoding="utf-8")
    assert states(job)["build"] and not states(job)["stills"]
    (job / "toki.md").write_text("stills: toki 2026-10-22 passt\n", encoding="utf-8")
    assert not states(job)["stills"]                         # her word alone is not enough: the board must exist
    for i in range(12):
        (job / "boards" / f"still_{i:02d}.jpg").write_bytes(b"x")
    assert states(job)["stills"] and not states(job)["final"]
    (job / "toki.md").write_text("stills: toki 2026-10-22 passt\nfinal: toki 2026-10-23 ok\n", encoding="utf-8")
    assert not states(job)["final"]                          # the final is screened before it counts
    (job / "reviews" / "final_blind-viewer_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    assert states(job)["final"]


def test_thumbs_want_four_per_format_a_critic_and_her_pick(job):
    _through_script(job)
    (job / "shots.json").write_text("{}", encoding="utf-8")
    (job / "reviews" / "final_blind-viewer_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    for i in range(12):
        (job / "boards" / f"still_{i:02d}.jpg").write_bytes(b"x")
    (job / "toki.md").write_text("stills: toki 2026-10-18 ok\nfinal: toki 2026-10-19 ok\n", encoding="utf-8")
    why = lambda: dict((s, w) for s, _, w in room.status(str(job)))["thumbs"]          # noqa: E731
    assert "0 mv thumbnail" in why()
    for i in range(1, 6):
        (job / "boards" / f"thumb_mv_M{i}.jpg").write_bytes(b"x")
    assert "0 short thumbnail" in why()                      # toki 2026-10-19: the Short gets its own, too
    for i in range(1, 6):
        (job / "boards" / f"thumb_short_S{i}.jpg").write_bytes(b"x")
    assert "thumb-critic" in why()
    (job / "reviews" / "thumbs_1.md").write_text("VERDICT: PASS\n", encoding="utf-8")
    assert "pick" in why()
    (job / "5_THUMBS.md").write_text("picked: toki 2026-10-20 MV=M2 SHORT=S3\n", encoding="utf-8")
    assert states(job)["thumbs"] and not states(job)["upload"]
    (job / "upload.md").write_text("title ...", encoding="utf-8")
    (job / "toki.md").write_text("stills: toki 2026-10-18 ok\nfinal: toki 2026-10-19 ok\nuploaded: toki 2026-10-20 MV + Short\n",
                                 encoding="utf-8")
    assert all(states(job).values()) and "all steps done" in room.next_step(str(job))


def test_new_job_gets_the_thumbs_template_and_tokis_page(job):
    assert (job / "5_THUMBS.md").is_file() and (job / "toki.md").is_file()


def _brief_through_dossier(d):
    (d / "0_BRIEF.md").write_text(BRIEF, encoding="utf-8")
    (d / "1_DOSSIER.md").write_text("x", encoding="utf-8")


def test_a_conflict_between_her_messages_holds_the_brief_until_she_answers(new_job):
    x = BRIEF + '## Conflicts\n- X1 "nur an 1 ort" vs "alle ideen verwenden" -> my guess: one place, ideas as stagings -> ASK\n'
    (new_job / "0_BRIEF.md").write_text(x, encoding="utf-8")
    assert not states(new_job)["brief"]
    (new_job / "0_BRIEF.md").write_text(x + "answered X1: toki 2026-10-26 ein ort, ideen als inszenierungen\n",
                                        encoding="utf-8")
    assert states(new_job)["brief"]


def test_ideas_need_the_matrix_and_every_toolkit_entry(new_job):
    _brief_through_dossier(new_job)
    (new_job / "2_IDEAS.md").write_text("A B C\napproved: toki 2026-10-26 A\n", encoding="utf-8")
    why = dict((s, w) for s, _, w in room.status(str(new_job)))["ideas"]
    assert "idea matrix" in why                      # radar / sonar ideas must come HERE, not in take 6
    rows = "".join(f"| {i}.0 | line {i} | meaning {i} | dots flare (T01), ping rings (T03), ref kda-more@{i} |\n"
                   for i in range(8))
    cov = "".join(f"- {t} used in rows 1-3 / or not: no water here\n" for t in room.toolkit_ids()[:-1])
    text = f"## Idea matrix\n| time | line | means | ideas |\n|---|---|---|---|\n{rows}\n## Toolkit coverage\n{cov}\n"
    (new_job / "2_IDEAS.md").write_text(text + "approved: toki 2026-10-26 A\n", encoding="utf-8")
    why = dict((s, w) for s, _, w in room.status(str(new_job)))["ideas"]
    assert room.toolkit_ids()[-1] in why             # one entry skipped in silence
    last = room.toolkit_ids()[-1]
    (new_job / "2_IDEAS.md").write_text(text.replace("## Toolkit coverage\n", f"## Toolkit coverage\n- {last} not in "
                                        "this song: no food in a club\n") + "approved: toki 2026-10-26 A\n",
                                        encoding="utf-8")
    assert states(new_job)["ideas"]


def test_a_brief_era_job_has_a_storyboard_before_the_build(new_job):
    names = [s for s, _, _ in room.status(str(new_job))]
    assert names.index("script") < names.index("storyboard") < names.index("build")


def test_legacy_jobs_keep_their_steps(job):
    names = [s for s, _, _ in room.status(str(job))]
    assert "brief" not in names and "storyboard" not in names

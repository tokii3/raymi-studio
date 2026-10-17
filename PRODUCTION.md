# PRODUCTION - how a Raymi video is made (one page)

## Music video package (MV + Short)
1. `python -m raymi new <date>_<slug> --kind mv` - creates `jobs/<job>/` with the writers' room templates.
2. **Dossier** (`1_DOSSIER.md`): research the song (meaning of every line, what exists, the gap, who loves it),
   download the official audio into the job, measure the song map. Nothing guessed.
3. **Ideas** (`2_IDEAS.md` + `boards/`): three really different worlds with 3 key frames each -> toki picks one and
   writes `approved: toki <date> <idea>`.
4. **Treatment** (`3_TREATMENT.md`) at the depth of `knowledge/exemplars/lets-get-weird_TREATMENT.md` ->
   script-critic (`.claude/agents/script-critic.md`) -> its answer verbatim in `reviews/treatment_<n>.md` until PASS.
5. **Shooting script** (`4_SCRIPT.md`): every shot decided (time, set, camera, what Raymi does, lyric treatment,
   transition, why) + the build list -> script-critic -> `reviews/script_<n>.md` until PASS.
6. **Build** what the build list needs as reusable studio components (phase 2).
7. **Pilot** with sound (a 20-40 s section) rendered in the cloud -> screening -> toki watches it.
8. **Final** MV + Short (cut from the MV) in the cloud -> screening -> toki. Upload texts follow
   `canon/12_titles_descriptions.md` + `raymi/channel_rules.py`; toki uploads.
9. **Learn**: one line in `canon/07_video_catalog.md`, a section in `knowledge/CASEBOOK.md` (idea, verdict, why);
   a new reusable trick is already a studio component.
`python -m raymi next <job>` shows where a job stands at any time.

## Lore Short
`python -m raymi new <job> --kind lore` -> dossier (light: what works now, `canon/10_kanal_puls*`, catalog) -> 3 claims
in `2_IDEAS.md` (toki picks) -> `plan.json` (format: `jobs/2026-10-17_s0-test`; beats keyed to word indexes, a sprite
per beat whose expression fits the line, shot / side / act / icon / key words, `look.world`, `hook.text` <= 8 words,
`cta.text` a question) -> `python -m raymi check <job>` -> push -> cloud draft.

## Render (cloud, parallel - toki's PC stays free)
- Start: push `jobs/<job>/plan.json` (draft), or push `jobs/<job>/render.json` = `{"quality": "draft"}` / `"final"`
  (works from any Claude session, no gh needed), or Actions -> render -> Run workflow.
- What happens: prepare (tests, voice, check, props, frame ranges: 240 frames per worker for drafts, 150 for finals,
  max 20 workers) -> one worker per range renders muted -> assemble joins the parts, lays the audio under them once,
  loudness -14 LUFS, QC, contact sheet.
- Results: a pre-release `render-<job>-<run>` (final.mp4, sheet.jpg, qc.json - toki can open it on her phone) and
  `reports/<job>/` on branch `renders` (status.json, qc.json, sheet.jpg, preview.mp4):
  `git fetch origin renders && git show origin/renders:reports/<job>/status.json`.
- Look at sheet + qc BEFORE telling toki; fix what fails. Free quota: 2,000 Actions minutes / month (private repo);
  every worker pays its own setup (~2-3 min), so do not split short drafts finer than needed.
- Layout check without a full render: `cd studio && node render.mjs <job> --draft` once, then
  `node stills.mjs <job> 20,200,500`.

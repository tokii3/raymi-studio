# PRODUCTION - how a Raymi video is made (one page)

## Music video package (MV + Short)
1. `python -m raymi new <date>_<slug> --kind mv` - creates `jobs/<job>/` with the writers' room templates.
2. **Dossier** (`1_DOSSIER.md`): research the song (meaning of every line, what exists, the gap, who loves it),
   download the official audio into the job, put the official lyrics into `lyrics.txt`, push `analyze.json` ->
   the cloud measures everything (`analyze.yml`: Demucs vocal stem, every word timed, song map). Nothing guessed.
3. **Ideas** (`2_IDEAS.md` + `boards/`): three really different worlds with 3 key frames each, rendered from board
   jobs (`jobs/<date>_<song>-board-<x>/shots.json`) with the studio's built sets -> toki picks one and writes
   `approved: toki <date> <idea>`.
4. **Treatment** (`3_TREATMENT.md`) at the depth of `knowledge/exemplars/lets-get-weird_TREATMENT.md` ->
   script-critic (`.claude/agents/script-critic.md`) -> its answer verbatim in `reviews/treatment_<n>.md` until PASS.
5. **Shooting script** (`4_SCRIPT.md`): every shot decided (time, set, camera, what Raymi does, lyric treatment,
   transition, why) + the build list -> script-critic -> `reviews/script_<n>.md` until PASS.
6. **Build** what the build list needs as reusable studio components (sets, props, lyric kinds, transitions), each
   with a still in `studio/catalog/`. `shots.json` = the shooting script as data (format: `raymi/timeline.py`).
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

## Film jobs (MV + its Short from ONE timeline)
- `jobs/<job>/shots.json` -> `python -m raymi timeline <job> mv|short` (checks sprites, glyphs, sets, marks, times)
  -> `out/props.json` for the `MV` (1920x1080) / `MVShort` (1080x1920) compositions (`studio/src/film/`).
- Authoring without rendering (pure math, safe on toki's PC): `cd studio && node guard.mjs <job> --report` (where
  head / feet / lyrics land per shot), `--place <shot#> <frame> <x> <y> <dist>` (the world point for a screen spot).
  The same guard refuses any cut sprite edge on screen before every cloud render.
- Look development: push `jobs/<job>/stills.json` (`stills.yml`) -> stills on branch `renders` (`reports/<job>/stills/`),
  or `"to": "boards"` / `"to": "catalog"`. NEVER render on toki's PC - not even one still.

## Her font grows (never a fallback font)
- A character her font lacks is BUILT in her marker style and added (`python -m raymi font ensure <job>`,
  `raymi/font.py`, skeletons in `assets/fonts/skeletons/`, OFL): any script with a skeleton - Japanese, Chinese,
  Hangul, Latin symbols. The cloud does it automatically before every stills / render run and commits the font; the
  log is `assets/fonts/glyphs_built.txt`. Existing glyphs are never touched. A character no skeleton has fails loudly.

## Screening (after every cloud render)
- `render.yml` builds the critic kit (`python -m raymi screen`, `raymi/screen.py`) -> `reports/<job>/kit/` on `renders`.
- Critics (`.claude/agents`): blind-viewer FIRST (gets only `kit/view/`), then look / motion / type / cut / story,
  then vision (wanted vs felt). Their answers go VERBATIM into `jobs/<job>/reviews/<stage>_<critic>.md`; only
  `BLOCK: fault|slop` stops; everything else goes to toki as notes. The builder never writes or edits a review.

## Render (cloud, parallel - toki's PC stays free)
- Start: push `jobs/<job>/plan.json` (draft), or push `jobs/<job>/render.json` = `{"quality": "draft" | "final",
  "format": "mv" | "short"}` (a job with shots.json renders the film)
  (works from any Claude session, no gh needed), or Actions -> render -> Run workflow.
- What happens: prepare (tests, voice, check, props, frame ranges: 240 frames per worker for drafts, 150 for finals,
  max 20 workers) -> one worker per range renders muted -> assemble joins the parts, lays the audio under them once,
  loudness -14 LUFS, QC, contact sheet.
- Results: a pre-release `render-<job>-<run>` (final.mp4, sheet.jpg, qc.json - toki can open it on her phone) and
  `reports/<job>/` on branch `renders` (status.json, qc.json, sheet.jpg, preview.mp4):
  `git fetch origin renders && git show origin/renders:reports/<job>/status.json`.
- Look at sheet + qc BEFORE telling toki; fix what fails. Free quota: 2,000 Actions minutes / month (private repo);
  every worker pays its own setup (~2-3 min), so do not split short drafts finer than needed.
- Layout check without a full render: push `stills.json` (cloud stills), never local renders.

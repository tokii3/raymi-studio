# PRODUCTION - how a Raymi video is made (one page)

## Music video package (MV + Short)
1. `python -m raymi new <date>_<slug> --kind mv` - creates `jobs/<job>/` with the writers' room templates.
2. **Dossier** (`1_DOSSIER.md`): research the song (meaning of every line, what exists, the gap, who loves it),
   download the official audio into the job, put the official lyrics into `lyrics.txt`, push `analyze.json` ->
   the cloud measures everything (`analyze.yml`: Demucs vocal stem, every word timed, song map). Nothing guessed.
3. **Ideas** (`2_IDEAS.md` + `boards/`): three really different worlds with 3 key frames each, rendered from board
   jobs (`jobs/<date>_<song>-board-<x>/shots.json`) with the studio's built sets -> toki picks one and writes
   `approved: toki <date> <idea>`.
4. **Treatment** (`3_TREATMENT.md`, names the MAIN ELEMENT(S) and one grade per act) at the depth of
   `knowledge/exemplars/lets-get-weird_TREATMENT.md` ->
   script-critic (`.claude/agents/script-critic.md`) -> its answer verbatim in `reviews/treatment_<n>.md` until PASS.
5. **Shooting script** (`4_SCRIPT.md`): every shot decided (time, set, camera, what Raymi does, lyric treatment,
   transition, why) + the build list -> script-critic -> `reviews/script_<n>.md` until PASS.
6. **Build** - reuse first: `studio/catalog/status.json` says what toki liked / approved / named a fault in; build
   only what is missing as reusable studio components (sets, props, lyric kinds, transitions, grades), each with a
   still in `studio/catalog/`. `shots.json` = the shooting script as data (format: `raymi/timeline.py`): `acts` (the
   look step: one grade per act), `heroes` + per shot `hero` (the main element), `lyric_style`, `translation`.
7. **Stills board** (toki 2026-10-22: no pilot any more - it ate time and was too short to judge the video): >= 12 cloud
   stills across the WHOLE MV (every act, every key moment, the Short's hook) as `boards/still_<nn>.jpg` -> toki
   (`toki.md` line `stills: toki <date> ...`). Then straight to the full MV. The board goes to toki only AFTER the
   look-critic has judged it (answer verbatim in `reviews/stills_look-critic_<n>.md`) and its faults are fixed - 2026-10-23
   toki saw a board that was "billig, flach, leer, lieblos" before any critic had looked at it.
8. **Final** MV + Short (cut from the MV) in the cloud -> screening -> toki. Upload texts follow
   `canon/12_titles_descriptions.md` + `raymi/channel_rules.py`; toki uploads.
9. **Thumbnails** (`5_THUMBS.md`): 5 candidates for the MV AND 5 for the Short, rendered in the cloud from the
   studio's sets (a thumbs board job, stills.json `passes` mv + short, `"thumbs": true` -> boards/thumbs_168.jpg, the
   feed view) -> thumb-critic (`reviews/thumbs_<n>.md`) -> toki picks (`picked: toki <date> MV=.. SHORT=..`).
10. **Upload**: `upload.md` (canon/12 + channel_rules.py); toki uploads -> `toki.md` line `uploaded: toki <date> ...`.
11. **Learn**: toki's words verbatim in `toki.md`; one line in `canon/07_video_catalog.md`; a section in
   `knowledge/CASEBOOK.md`; the catalog status of every part used (`studio/catalog/status.json`); the critic
   calibration (`knowledge/calibration/<date>_<song>.md`: what they caught, over-blocked, missed -> the agents change).
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

## Lyrics v2 - the default since 2026-10-19 (toki: "ja, v2 wird der Standard"; old jobs pin `"lyric_style": "v1"`)
- Her heavy weight (`assets/fonts/Raymi-Heavy.ttf`, `python -m raymi font heavy`, rebuilt in the cloud before every
  stills / render run), no outline ring, a soft shadow in the scene's shadow colour, colours from the shot's grade,
  lit by the set + a real cast shadow, `tilt` / `roll` put the block on a floor / table / diagonal, words swell while
  sung. A Japanese line shows romaji + English under it from `lyrics_en.json` (`{"<line>": {"roma", "en"}}`, our own
  safe translation); a line without English is refused unless the shot says `"sub": false` with a why.
- Readable at phone size: a normal word >= 7 % of the frame height, romaji / English >= 5 % (`"small": "<why>"`
  breaks it on purpose). Style frames: `jobs/2026-10-19_lyrics-v2` (+ v1 twin), `stills.pending.json` -> stills.json.

## The main element (hero)
- `shots.json` `"heroes": {"crown": {"kind": "worn", "size": [0.13, 0.07], "min": 0.05}}` (kinds: worn, face, word,
  prop), per shot `"hero": ["crown"]`. Before every render: on screen and >= min of the frame height in >= 60 % of
  the shot (`why_small` = the written exception). After every render / stills run: value contrast at phone size
  (`raymi/hero.py` -> `out/hero.json`, kit `facts/hero.json`). `node guard.mjs <job> --summary` lists HERO lines.

## Her font grows (never a fallback font)
- A character her font lacks is BUILT in her marker style and added (`python -m raymi font ensure <job>`,
  `raymi/font.py`, skeletons in `assets/fonts/skeletons/`, OFL): any script with a skeleton - Japanese, Chinese,
  Hangul, Latin symbols. The cloud does it automatically before every stills / render run and commits the font; the
  log is `assets/fonts/glyphs_built.txt`. Existing glyphs are never touched. A character no skeleton has fails loudly.

## Screening (after every cloud render)
- `render.yml` builds the critic kit (`python -m raymi screen`, `raymi/screen.py`) -> `reports/<job>/kit/` on `renders`.
- Critics (`.claude/agents`): blind-viewer FIRST (gets only `kit/view/`), then look / motion / type / cut / story,
  then vision (wanted vs felt). Every shot critic answers MAIN ELEMENT first (kit `script/heroes.json`), the
  type-critic WEIGHT + SIZE first; calibration: `knowledge/calibration/`. Their answers go VERBATIM into `jobs/<job>/reviews/<stage>_<critic>.md`; only
  `BLOCK: fault|slop` stops; everything else goes to toki as notes. The builder never writes or edits a review.

## Scene probe before every 3D final (toki 2026-10-24: "hör auf punktuell zu fixen, das sind Strukturfehler")
- `stills.json` `"probe": 15` runs `studio/probe.mjs` over the whole film in the real scene graph (`film/Probe.tsx`);
  `python -m raymi probe <job> [mv|short]` prints the FAULT CLASSES: limb_in (her bones inside furniture / props),
  float / sink (her feet against the surface really under her), pop (her hips jump), thing_in / thing_air.
- A class that appears in several shots is fixed in the PART that makes it (support.ts grounding + resting things,
  the push-out in VrmPuppet, a set's chair / solids), never shot by shot. Then probe again; render only when the
  classes are empty or the rest is measured small and named to toki.
- The QC also refuses black picture (`no_black_picture_>0.25s`; Beach shot 31: bloom / DoF / AO spread one invalid
  pixel into black frames - the post buffer is 8-bit since).

## Render (cloud, parallel - toki's PC stays free)
- Private assets (toki 2026-10-23): this repo is PUBLIC (unlimited Actions minutes), so licensed / personal files live in
  the private `tokii3/raymi-private-assets`: Mixamo clips (`motions/<slug>.fbx`, toki's downloads) and her VRM models
  (`vrm/*.vrm`). Every render / stills / clip workflow checks it out with the read-only deploy key (secret
  `ASSETS_DEPLOY_KEY`) onto the runner only (`studio/.motions/`, `assets/vrm/`). Never commit either to this repo. A new
  clip: add the FBX to that repo; a job names the clips it uses (`shots.json` "motions": ["motions/<slug>.fbx", ...]).
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

- Lyrics v2 (toki 2026-10-20): every sung word is written (keys = the big words; `"acted": [line]` to act one instead); `node guard.mjs <job> --fill <shot#...>` places a block in the frame's empty space as big as the guards allow -> store it as the shot's `lyrics_fit` {mv, short}.

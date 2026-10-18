# PROGRESS - Raymi Studio (newest first, kept short)

## 2026-10-18 - phase 2: studio core built (song tools, 3D film studio, screening), KING boards
- Song tools (`raymi/song.py`, `analyze.yml`, 13 min in the cloud): Demucs vocal stem -> faster-whisper -> official
  words matched by sound (romaji) -> snapped to vocal onsets -> `cut` = one frame before the syllable. KING: 85/112
  words measured, 27 interpolated (verse 1: GUMI's English voicebank, whisper hears English). Found: "You are KING" is
  sung twice per chorus (around each stop). Dossier done (`python -m raymi next` -> ideas).
- Studio (`studio/src/film`, `studio/src/three`): ONE timeline (`shots.json` -> `raymi timeline` -> props) drives MV
  1920x1080 and MVShort 1080x1920. Built sets with marks + named cameras (`sets.json`): aquarium, card table, weather
  studio. Real camera keys, Raymi's sprite standing in the set (unlit = skin stays pale, cast + contact shadow,
  breathing, squash/stretch, smears, held poses, icons, glow), lyrics as objects (sign, glass, float, stamp, card,
  ticker; Raymi font only, glyphs checked), transitions through things (bubbles, ink, pass, whip, flash).
- Guards before every render (pure math, `node guard.mjs <job>`): no cut sprite edge on screen, no lyric line leaving
  the frame. Authoring aids: `--report`, `--place`. Stills only in the cloud (`stills.yml`, ~2-5 min per round).
- Screening: `raymi screen` builds the critic kit after every cloud render (`reports/<job>/kit/`); 7 critics ported
  (`.claude/agents`). Style test (`jobs/2026-10-18_style-test`, 12 s, 5 shots): render 7 QC PASS (1080p, 8.5 min in
  the cloud). Screened 5 rounds by the blind viewer (answers verbatim in its `reviews/`): FAIL, FAIL, PASS, PASS, PASS.
  Every fault class it found became a guard, not a patch: cut edges, lyrics leaving the frame, lyrics on her face,
  her face sliced by the frame edge or buried in sand. Left: text size at phone size in the far wide (BACKLOG).
  Final style test: release `render-2026-10-18_style-test-12`; a 9:16 Short rendered once (run 10).
- KING: `2_IDEAS.md` (A Star Exhibit / B King of Spades / C Storm Warning), boards rendered from board jobs
  (`jobs/2026-10-18_king-board-*`) into `jobs/2026-10-18_king/boards/` (+ `overview.jpg`). Waiting for toki's pick.
- toki 2026-10-18: NEVER render on her PC, not even single stills (memory saved; brief's "local stills" overruled).

- KING: toki picked A+B mixed (day aquarium / night card game); treatment done with script-critic PASS (own session).
- Her font grows (toki OK 2026-10-18): `raymi/font.py` builds any missing glyph in her marker style (port of the old
  builder, rebuilds existing glyphs 1:1 in tests), automatic in the cloud before stills / renders. Built: 27 KING
  kanji + 〇 + @ (log: assets/fonts/glyphs_built.txt).

## NEXT
- KING shooting script (4_SCRIPT.md + shots.json) -> script-critic -> build list -> pilot (cloud).


## 2026-10-18 - phase 1 done: writers' room studio + parallel cloud render; KING dossier started
- toki: "das Problem ist nicht der Renderer oder schlechte Assets, sondern schlechte Umsetzung, blinde QC und
  langweilige Skripts" -> effort moves into the writers' room (CLAUDE.md, PRODUCTION.md rewritten).
- knowledge/ (PRINCIPLES, CASEBOOK, LESSONS, exemplars, studies, craft 00-12), writers_room/ (steps + templates),
  raymi/room.py (`python -m raymi new|next`), .claude/agents/script-critic.md. Tests 34 green.
- Parallel render (render.yml: prepare -> up to 20 workers -> assemble): S0 draft run 6 = 8 min total (3 workers
  ~5 min each incl. setup) vs 15 min single; 592 frames, seams invisible, QC PASS (-14.7 LUFS, -1.5 dBTP).
  Start a render by pushing jobs/<job>/render.json (no gh needed).
- Claude cloud worker: brief in render/CLOUD_WORKER.md; NOT tested - toki's account has no cloud environment yet
  (New session -> Cloud). Actions is the main path anyway (0 tokens).
- KING (jobs/2026-10-18_king): official GUMI audio (song.webm), 1_DOSSIER.md filled except lyric line times
  (need the vocal stem tool, phase 2).


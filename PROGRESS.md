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
  the cloud), blind viewer FAIL with 4 real faults (ghosting smears, lyrics leaving the frame) -> fixed in the studio
  (lyrics guard, smear), re-render.
- KING: `2_IDEAS.md` (A Star Exhibit / B King of Spades / C Storm Warning), boards rendered from board jobs
  (`jobs/2026-10-18_king-board-*`) into `jobs/2026-10-18_king/boards/`. Waiting for toki's pick.
- toki 2026-10-18: NEVER render on her PC, not even single stills (memory saved; brief's "local stills" overruled).

## NEXT
- toki picks a KING idea (`approved:` line) -> treatment -> script-critic.
- Font: 27 KING kanji missing in Raymi-Regular (BACKLOG) - needs toki's OK for the glyph tool.


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


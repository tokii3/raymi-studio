# PROGRESS - Raymi Studio (newest first, kept short)

## 2026-10-19 - toki's KING verdict became studio parts (engine only, no render)
- toki: colours better after the per-act grade; animation, transitions, effects "mag ich alle sehr"; MV uploaded
  "trotz kleiner fehler"; the crown (main element) hard to read - must be caught by the studio itself; lyrics still too
  small / thin / pasted on, Japanese lines need romaji + English; thumbnails for the Short too, 4-5 to choose from.
  Then: principles not hard rules, the engine serves every video (no KING clones), no new render.
- Lyrics v2 (opt-in `"lyric_style": "v2"` until toki approves): her heavy weight (raymi/font.py builds
  Raymi-Heavy.ttf, every gap stays open; the cloud keeps it in sync), colours from the grade, toon-lit + cast shadow,
  tilt / roll onto surfaces, romaji + English under Japanese lines (lyrics_en.json, own safe translation), words swell
  while sung; one layout for renderer + guards (lyricLayout.ts); readable default 7 % / subs 5 % at phone size (subs 0.7 of a line).
  Style frames prepared, NOT rendered: jobs/2026-10-19_lyrics-v2 (+ v1 twin), all guards pass.
- Main element: heroes in shots.json, size guard before every render (KING's timeline: 28 of 30 crown shots flagged),
  value contrast after (raymi/hero.py), kit script/heroes.json + facts/hero.json, every critic answers it first.
- Writers' room to the end: build / pilot / final / thumbs / upload proven by evidence (toki.md = her words),
  5_THUMBS.md, stills `passes` (MV + Short in one run), 168 px feed sheet, thumb-critic.
- Asset library: studio/catalog/status.json (toki-liked / approved / open / new with her words); grade library
  (grade.ts: day, closing, night, own + new warm, clean) and shots.json `acts` = the look step.
- Critic calibration: knowledge/calibration/ (right: lyrics; over-blocked: crowd / props / holds / rhythm / story;
  missed: the crown); agents updated. Knowledge: PRINCIPLES 11 + 16, CASEBOOK, LESSONS 5, PRODUCTION, README.
- Tests: 91 python + 13 studio green.

## NEXT
- toki looks at the lyric style frames: rename jobs/2026-10-19_lyrics-v{1,2}/stills.pending.json -> stills.json
  (one cloud stills run, ~5 min) when she says go; type-critic on them; her OK -> v2 becomes the default
  (timeline.py job_style default "v2", catalog status).
- Next package: treatment names the main element(s) + grade per act; thumbs step at the end.

## 2026-10-18 (late) - KING full package rendered; final screening FAIL x2 -> STOP, toki decides
- toki on the pilot: camera / lyrics / effects good, "fehler sehe ich keine"; asked for a real crown (built: the cap
  worn upside down) and a deeper grade (built: per-act grade + deeper toon steps). Then "gerne jetzt das mv bzw volles
  paket".
- Built for the full MV (all reusable set options + catalog stills): night card table (pool + aim + gust, deal on beats,
  house keys / collapse, pile, coin towers + topple, PICK UP, king card float / held / bend / rot / kick, warning cards
  + slash, slaps, flick, coin flick / roll / spin, bulb pop + live black, spade glow, peeling rays), aquarium story props
  (hero phone, knuckle taps, glass hands, screen crops, coins drop / rain / pile, ledge deck, card rain + felt mat,
  scattered deck, dead work lamp, salmon, child, cap lift), film props (crown drop-in, ray ring + beam, glow pulse / out,
  ride card, cards / rays passing the lens), puppet height tween, plane tilts to a high lens, Short overrides + hook /
  CTA overlay. script-critic round 3 PASS (+ its fixes); upload texts in jobs/2026-10-18_king/upload.md.
- New guards from every screening round: lyric safe area + real font widths + camera kick + floats, readable minimum
  size (4.4 % of the frame height), stamp slam, text over her figure, text over a readable sign, readable set props
  never held cut, lens never in sand / floor / inside or right against a solid prop, face never hidden behind a prop,
  Short hook / CTA never on her face. Authoring aids: guard --summary / --fit / --fit-lyrics / --fit-lens.
- Renders: MV run 16 (final 1) and run 18 (final 2), Short run 17 and round 2. Final 1 faults (clipped LED strip, coin
  tower in the lens, text on the sign) are gone in final 2.
- Final 2 screened by all 7 critics (reviews/final_*_2.md): all FAIL. The recurring roots, the same as the pilot STOP:
  1. the crowd reads as placeholder primitives (studio component; toki did not mind it in the pilot);
  2. Raymi tiny / still in the opening wide (shot 2) - the swipe point at 0:04;
  3. story beats too short / too small to read muted (cap, grin practice, deck, shrink, coin in the lamp, rays);
  4. props primitive and flat next to her painting, black voids in the night (look);
  5. long held poses (motion), flat outlined lyrics (type), uniform cuts in the night (cut).
- STOP (anti-loop, 2 final FAILs): no round 3 without toki. She judges the final MV + Short herself and decides.

## 2026-10-18 - KING build + pilot: STOP after 3 blind-viewer FAILs (anti-loop, toki decides)
- Built (reusable, catalog stills in studio/catalog): frame camera (`camera[].frame`: head in, cut edges out, checked
  by projection), pilot / Short window, set times in song seconds, lyric materials (fog, engraved, screen, print,
  felt, light), aquarium crowd waves / head turns / phones up with camera UI / beat flares / light banks / LED flip +
  blink / wish chute / cap_off / SandBury, crown on her head box. Guard aids: `--summary`, `--fit`, `--fit-lyrics`.
- All 82 MV shots pass every guard. Finding: with the face guard, no top-cut sprite (all CU / MS busts,
  PEACE_WINK_131) can be framed in 16:9 - clean full-body sprites framed close replace them (4_SCRIPT rows still name
  the old ones -> script-critic round 3 needed).
- Pilot (shots 23-38, 49.57-70.15 s): renders 13 / 14 / 15, QC PASS each; blind viewer FAIL x3
  (`reviews/pilot_blind-viewer_1..3.md`). Faults that became guards and did NOT come back: lyrics clipped by the
  frame / camera kick / font width, set signs cut by the edge, lens in impossible places, text over her figure,
  per-word caption boxes, blurred water surface, crowd right in front of the lens.
- Faults that came back all 3 rounds (the real roots, not guards):
  1. the crowd reads as unfinished placeholder blobs (studio component - same note as the style test, BACKLOG look pass);
  2. Raymi is a dot in the crowd-POV wides (script: many hall wides; the frame camera only fixes close shots);
  3. the key idea ("You are KING" on the LED) is unreadable at phone size (script / set: LED far above her);
  4. no hook in the first second (the pilot window starts mid-song on a busy wide).
- STOP: no round 4 without toki. Options: (a) crowd look pass + wides rewritten to MS/CU + pilot starts on a hook,
  then round 4; (b) pilot on the night section (shots 44-52, card table, no crowd); (c) she judges round 3 herself.
  Craft critics (look / motion / type / cut / story / vision) not run yet - pointless before the roots are decided.

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


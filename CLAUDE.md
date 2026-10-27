# CLAUDE.md - Raymi Studio (since 2026-10-17, rebuilt around the writers' room 2026-10-18)

You are the writer, director, editor and engineer of **Raymi** (Touyami Raymi, 灯闇レイミ), a stingray-girl VTuber on
YouTube (@TouyamiRaymi). This repo is built only for her. It renders in the cloud (GitHub Actions, parallel), never on
toki's PC. The old engine (C:\raymi, tokii3/raymi-vtuber) is read-only history: take lessons, never code.

**Why this studio looks like this (toki 2026-10-18):** "das Problem ist nicht der Renderer oder schlechte Assets,
sondern schlechte Umsetzung, schlechte und blinde QC und langweilige Video-Skripts." The best videos (Renai, POP IN 2,
Let's Get Weird) came from ONE strong idea and a deep hand-written treatment; the worst from heavy process around a
weak idea (`knowledge/CASEBOOK.md`, `knowledge/LESSONS.md`). So the effort goes into the WRITERS' ROOM, the studio
turns the script into pictures with reusable components, and screening judges the real video, not proxies.

Read at session start: the SessionStart briefing (sync with origin/main first if it warns) -> skill
`raymi-reading-toki` -> this file -> the newest
`knowledge/HANDOFF_*.md` -> the top of `PROGRESS.md` -> `PRODUCTION.md` -> `knowledge/PRINCIPLES.md` -> `canon/01_character.md`.
toki's standing verdicts (the acceptance list) + start protocol: skill `raymi-video-production` (.claude/skills).
Before planning a video also: `knowledge/CASEBOOK.md`, `canon/07_video_catalog.md` (no repeats), the newest
`canon/10_kanal_puls*.md`. Then `python -m raymi next <job>` tells you the step and what to open.

## 1. toki (the user)
- Talk German, casual, a bit of humour, no emojis. Technical content in short bullets, reasons included.
- She learns Japanese (total beginner): 2-3 useful bits per chat reply (kanji/kana + romaji, a grammar point or set
  phrase). Only in chat, never in files, code or videos.
- Plan first for anything bigger, name assumptions, get her OK; then do the whole plan in one go.
- Mistakes openly: fix, explain why it happened, change the process so it cannot recur.
- Free options first. Ask before new accounts or anything that costs money.
- She judges PICTURES: ideas go to her as image boards, then a pilot with sound, then the final. Never a text plan
  for a look, never anything below the bar, no routine frame reports.
- Her example is the intent, not the spec - restate her core first (`knowledge/PRINCIPLES.md` D).
- Not sure -> "weiss ich nicht sicher" + best guess, labelled.

## 2. Hard rules (each one exists because the old engine broke it)
0. **Her words are the goal, her examples are classes** (2026-10-25, `knowledge/ANALYSE_2026-10-25_warum_es_scheitert.md`).
   Skill `raymi-reading-toki` first; every job starts with `0_BRIEF.md`; `brief-keeper` judges treatment, script,
   boards and renders against HER words (never against my plan); the bar is professional references
   (`knowledge/references/`), never our own videos; checks measure the real video (`raymi reality`); nothing reaches
   her without `raymi gate` (the SendUserFile hook enforces it). A missing capability or a conflict between her
   messages is said on day 1. IDEAS start from the idea matrix x `canon/02_raymi_toolkit.md`; effects are designed
   moments (fx-designer), never global rules; a storyboard (reference | previz) goes to her before the build.
1. **The writers' room comes first.** No studio work for a video before its step allows it (`python -m raymi next`).
   A treatment / script is done only with a stored script-critic PASS; two BLOCKs on one step -> back to IDEAS.
2. **A video is data, never code.** A job = its writers' room files + timeline data. New looks, sets, moves, effects
   go into `studio/src` as reusable components every later video can use - never a per-video script.
3. **Reviews are never self-written.** Critic answers (agents in `.claude/agents`) are stored verbatim in the job's
   `reviews/`; the builder never writes, edits or summarises one into a PASS.
4. **Nothing reaches the screen unchecked.** `python -m raymi check` before a render (the workflow refuses otherwise);
   only sprites in `assets/catalog.json`; `limited` ones carry their limits in `notes`.
5. **Brand font or nothing.** `assets/fonts/Raymi-Regular.ttf`; a missing glyph is built in her style (`raymi font
   ensure`, automatic in the cloud), never replaced by another font; a glyph no skeleton has is an error.
6. **Spoken text is clean.** No kaomoji, emoji, digits, URLs or symbols reach TTS (`raymi/tts_text.py`).
7. **Voice is fixed:** edge-tts `en-US-AnaNeural`, rate `+17%`, pitch `-7Hz` (`raymi/tts.py`).
8. **Only Raymi is AI-generated.** Places, props, creatures are built (studio components or Blender) and stay
   identical between videos. A generated background never enters a video.
9. **Cut edges stay invisible** (`studio/src/framing.ts`); her skin stays pale grey-blue under any light.
10. **Measure the song, never guess** (sections, lyric times from the vocal stem, cut one frame before the syllable).
11. **Anti-loop.** A fix that fails twice is parked in `BACKLOG.md` with what was tried; production continues.
12. **No secrets in the repo.** Keys only as GitHub secrets / local .env (gitignored). Never print them.
13. **Budget.** One session = one stage (studio work OR one video's steps). Subagents: critics, render workers and
    the maker agents (camera-director, choreographer, editor, look-designer, fx-designer; toki 2026-10-25) - a whole video ~20 % of
    her weekly limit over 1-2 days, sonnet, small briefs; bulk looking goes to Gemini (`raymi gemini`).

## 3. Map
- `knowledge/` - PRINCIPLES, CASEBOOK, LESSONS, exemplars, studies, craft modules 00-12 (README says which is used where).
- `writers_room/` - the steps, templates, what each must achieve.
- `canon/` - who Raymi is, the channel's catalog, analytics snapshot, upload text rules.
- `raymi/` - Python: writers' room steps (`room.py`), plan checks + props (`plan.py`), voice (`tts.py`), parallel
  render split / join (`parts.py`), QC (`qc.py`), upload text rules (`channel_rules.py`).
  CLI: `python -m raymi new|next|voice|check|props|parts|assemble|finish <job>`.
- `studio/` - Remotion 4.0.532 (React) + @remotion/three. `Short` (lore Shorts, 2D) and the film compositions `MV` /
  `MVShort` (built 3D sets with a real camera, Raymi's sprites in the space, lyrics as objects, transitions through
  things) driven by one timeline (`raymi/timeline.py` <- `jobs/<job>/shots.json`). Catalog: `studio/catalog/`.
- 3D film tools (2026-10-24): scene probe (`studio/probe.mjs`, `python -m raymi probe`), cuts on the music
  (`python -m raymi cuts`), the camera through each cut (`python -m raymi seams`), camera moves (`raymi/camera_moves.py`), bodies on real surfaces (`studio/src/three/support.ts`);
  read `knowledge/HANDOFF_2026-10-24_beach_3d_film.md` before a 3D video.
- Song tools: `raymi/song.py` + `.github/workflows/analyze.yml` (vocal stem, word-timed lyrics, song map).
  Screening: `raymi/screen.py` (critic kit) + critic agents in `.claude/agents` (calibrated per package:
  `knowledge/calibration/`), main element: `raymi/hero.py` + check.ts heroFaults. Stills: `.github/workflows/stills.yml`.
  Asset library: `studio/catalog/status.json` (what toki liked / approved / named a fault in - reuse proven parts first).
- Skill packs adopted 2026-10-27 (`knowledge/skillpacks/README.md`): area skills' `pro_rules.md`, looks measured on
  references (`python -m raymi style`, `knowledge/styles/`).
- `.github/workflows/render.yml` - parallel cloud render (see PRODUCTION.md "Render").
- `assets/` - 172 checked Raymi sprites (`catalog.json`, MIGRATION.md), the brand font.

## 4. Content strategy (from real analytics, details in canon/)
- Lore Shorts (one absurd personal claim, 15-35 s) bring the most subscribers per view.
- Song packages: evergreen songs the VTuber audience loves (vocaloid, anime openings, J-/K-pop, gaming) -> full MV +
  a Short cut from it (12-20 s) with a Raymi line or gag. No meme trends that will die.
- Song rights: K/DA and True Damage are NOT creator-safe (Riot). Japanese label songs are usually claimed by Content
  ID (revenue to the label) - reach, not income; decide per song with toki.
- Monetisation from 1 Feb 2027: long-form watch time and owned content (Raymi songs, stories) are the path.
- Every Short: hook a swiper reads in < 1 s (<= 8 words), visual change every 2-4 s, a comment question readable
  >= 2.5 s before the end, no text in the UI bands.
- Never call Raymi AI; "are you AI?" -> vague ocean joke (canon/01). Upload texts in her voice, titles search-first.

## 5. Roadmap (toki approved 2026-10-18)
1. Phase 1: knowledge + writers' room + parallel cloud render (2026-10-18), KING dossier started.
2. Phase 2: studio core (3D set + camera, Raymi in the space, lyric objects, transitions, MV composition, screening
   tools) - proven on a style frame toki approves.
3. Phase 3: KING (Kanaria) package through the whole flow. Then daily packages / lore Shorts.
4. Later: Live2D Raymi replaces the PNG puppet as a component; long-form; streams.

# PROGRESS - Raymi Studio (newest first, kept short)

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

## NEXT (phase 2, its own session): studio core
- Song tools ported with tests: Demucs stems (cloud), lyric word times from the vocal stem, song map.
- 3D sets + real camera (three.js in Remotion), Raymi puppet in the space, lyrics as objects, transitions,
  MV composition (16:9) + Short cut, a component catalog with stills.
- Screening tools: critic kit (phone-size sheets, motion strips), Gemini viewer, script-vs-screen comparison.
- Then KING: lyric times -> dossier done -> 3 ideas as image boards for toki.

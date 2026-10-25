---
name: raymi-references
description: Use whenever a Raymi video needs a reference or a bar to measure against - finding professional MV segments for a camera move, pose, emotion, tempo or light, analysing a new reference video (toki's links too), pairing our frames with reference frames, or calibrating a critic.
---

# References - professionals are the bar, never our own videos

toki 2026-10-25: "den Kritiker bitte nicht an unseren Videos messen, sondern an ähnlichen professionellen Videos - du
vergleichst Slop mit Slop, das Ergebnis Slop. Du musst dir Originale anschauen, 20 oder 30 Videos als Referenz für
verschiedene Szenen, Kameras, Emotionen, schnell, langsam."

## The library (raymi/refs.py, knowledge/references/)
- `catalog.json` - 31 professional videos (K/DA, True Damage, HEARTSTEEL, Arcane, HSR, ZZZ, Genshin, a SANZIGEN VTuber
  MV, YOASOBI, Ado, Chainsaw Man, Kanaria, Yorushika, ZUTOMAYO, Edgerunners, K-pop MVs, a STUDIO CHOOM oner).
- `analysis/<slug>.md` - Gemini WATCHED each video in 20 s chunks at 4 fps with sound, verbatim JSON per segment:
  shot, angle, move, lens_play, tempo, music, emotion, transition_out, light, craft.
- `segments.json` - all segments; `python -m raymi refs find <term> <term>` (all terms must match).
- `frames/` - 3 stills per segment, LOCAL only (`refs frames <slug>`; not our footage, never committed / published).

## Use
- **Makers**: for every key moment pick 1-3 segments (`refs find hand_to_lens low`, `refs find flirt cu`,
  `refs find oner`, `refs find burst chorus`) and write the ref id into the script row.
- **Boards**: every key frame is shown as a pair - reference left, ours right, her core on top
  (`python -m raymi refs pair <ref> <our still> <out.jpg> "<core>"`).
- **Critics**: judge the GAP to the reference, never "better than our last video".
- **toki gives a new reference**: add it to catalog.json (verify the id with a YouTube search), `refs analyze <slug>`,
  then study the exact moment she named at frame level (`python -m raymi gemini <url> --start --end --fps 6`).
- Gemini answers are a first pass; a key reference moment is confirmed by looking at its frames myself.

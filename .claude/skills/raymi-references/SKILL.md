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
  MV, YOASOBI, Ado, Chainsaw Man, Kanaria, Yorushika, ZUTOMAYO, Edgerunners, K-pop MVs) + 3 REAL oners verified by measurement (feist-1234, okgo-this-too-shall-pass, billie-party-over: 0 visible cuts). 34 videos.
- `analysis/<slug>.md` - Gemini WATCHED each video in 20 s chunks at 4 fps with sound, verbatim JSON per segment:
  shot, angle, move, lens_play, tempo, music, emotion, transition_out, light, craft.
- `segments.json` - all segments; `python -m raymi refs find <term> <term>` (all terms must match).
- `frames/<slug>/` - a still every 0.5 s (`<t>.jpg`) + `sheet_<minute>.jpg` to browse, LOCAL only (`refs download`,
  `refs frames`; not our footage, never committed / published). `reality_calibration.json` - the measured bar.
- A reference moment is `slug@<seconds>` (e.g. `kda-firestarter@106.9`) or a Gemini segment `slug#021`.

## Use
- **Makers**: for every key moment pick 1-3 segments (`refs find hand_to_lens low`, `refs find flirt cu`,
  `refs find oner`, `refs find burst chorus`) and write the ref id into the script row.
- **Boards**: every key frame is shown as a pair - reference left, ours right, her core on top
  (`python -m raymi refs pair <ref> <our still> <out.jpg> "<core>"`).
- **Critics**: judge the GAP to the reference, never "better than our last video".
- **toki gives a new reference**: add it to catalog.json (verify the id with a YouTube search), `refs analyze <slug>`,
  then study the exact moment she named at frame level (`python -m raymi gemini <url> --start --end --fps 6`).
- Gemini answers are a first pass; a key reference moment is confirmed by looking at its frames myself.

## Learn the RULES, not only the frames (toki 2026-10-26: "alles hat grund und wirkung ... jede entscheidung von den
profis abschauen wie und warum") - knowledge/references/LEARNED.md
- `refs learn all` (frame rules: value, contrast, light / dark share, two-tone, palette + harmony, light position,
  grit, placement, negative space), `refs shots all` (picture changes: length, motion speed, rules per shot),
  `refs why <slug>` (Gemini on our measured shots: decision -> why -> effect -> music + director rules, verbatim),
  `refs rules` (per effect class: the measured range of choices that produced it).
- **No frame matches a moment?** Never stretch an unmatched frame (the Love is War storyboard was BLOCKed twice for
  that). Search by numbers (light / dark share, two-tone, empty room) + look at the candidates, then a principle card:
  `refs card <class> <slug@t>.. --why ".."`; judge our still with `refs measure <still> --card <class>`.
- **A strip, not a frame**, for a burst of cuts: storyboard moment `"refs": [..]` (4-6 frames).
- **Every decision a maker writes names its reason + effect** the way the pros' why answers do.
## Trying a new style
`style_from_refs.md` (this folder): measure a look on reference frames (`python -m raymi style measure`),
match 2-4 of our stills (`style compare`), one check-in with toki, then keep it as `knowledge/styles/<name>.md`.

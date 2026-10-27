# Trying a new style - measure it on references, match frames, keep the style card (2026-10-27)

toki 2026-10-27: packs like the ones she showed are meant to "andere styles ausprobieren und die Videoqualität
steigern", with NO generative AI. The method is from the free `animate` skill (cth9191, MIT,
`knowledge/skillpacks/README.md`), adapted. A style is a reusable thing (CLAUDE.md rule 2): a card in
`knowledge/styles/<name>.md` + studio parameters (PostFX, TwoTone, Fx2D, VrmPuppet step / outline, sets), never a
per-video hack. Raymi stays Raymi (pale grey-blue, her model never posterised).

## 1. Gather (3-6 frames that show the range)
- From the reference library: `refs find <terms>` -> `refs frames <slug>` -> pick a wide, a close-up, a light
  moment, a busy moment. toki's own link: add it to the catalog first (raymi-references SKILL.md).
- Frames of other people's videos stay local (`knowledge/references/frames/`, gitignored). Never commit them,
  never copy their frames.

## 2. Measure (write the numbers into the style card)
- `python -m raymi style measure <frames>`: palette with shares, value (key), contrast, saturation, accent share,
  edge density (line art), grain, empty space.
- By eye, from 12 consecutive frames (`refs frames` at full rate or `raymi gemini --fps 12`): the clock (on ones /
  twos / threes, does the line boil?), the blur grammar (smear / crisp / shutter), eases (snappy or soft), what
  moves when nothing happens.
- Cuts and camera: `refs find` segments of that video (tempo, move, transition_out) and `reality` on the reference
  if it is local. Composition: how much is empty, one subject or a full world, where text sits.
- Note what each colour MEANS (ground, her, the accent, danger), not only its hex.

## 3. Match 2-4 frames
1. Build 2-4 of the video's own key moments in the style (stills: `stills.yml` in the cloud, locally only as a
   fallback).
2. `python -m raymi style compare <reference frames> -- <our stills>` -> gap per number, "not matched" marks.
3. Order of fixing: proportions (subject size, margins, line weight relative to the subject) -> the palette numbers
   -> texture / grain -> type. Repeat until every remaining gap is deliberate.
4. A pair board for toki: `refs pair <ref> <ours> <out> "<core>"`. ONE check-in, with three choices:
   thumbs up / closer to the reference (where) / push further away from it.

## 4. Keep it
After toki's thumbs up and the finished video: `knowledge/styles/<name>.md` from `_TEMPLATE.md` - what the look is,
the measured numbers, the studio parameters that make it, a frame checklist for this look, do / don't, NOT matched,
proven on (job + her verdict). The next video can then pick the look instead of re-deriving it.

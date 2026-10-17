> Copied 2026-10-18 from the old engine (brain/research/typography.md) as evidence. Paths and tool names in it refer to the old engine (tokii3/raymi-vtuber) and do not exist here; the findings are what counts.

# Lyric typography (2026-10-12)

## STEP 4 (2026-10-12 night) - energy + timing
toki on v3: "schon besser - mehr Energie, Elan, Power, 1-2 schlaue Tricks mehr; und die Worte sind oft zu frueh da,
z.B. FIRE steht schon da bevor es gesungen wird, fast immer beim ersten Wort eines neuen Verses".
- Timing cause: the aligner pins word 1 of every line to the LINE timestamp (Fire@32.32, in@34.02). refine_starts():
  if word 1 -> word 2 is far longer than word 1 takes to sing, word 1 starts just before word 2 and snaps to the
  strongest vocal hit (vocal_env). Applied inside line_block / stack automatically and by prepare() for whole songs.
  Know My Name: Now 30.06->30.30, Fire 32.32->33.65, Tried 37.23->37.55, Always 40.18->40.38.
- Energy: camera() = zoom punch + rotational shake + RGB split on heavy words, a breath on every beat, and a 2-frame
  anime IMPACT FRAME (inverted, high contrast) on the strongest words (fire, out); burst() = a short landing flare
  behind each performing word; the block pumps on the beat and the camera flies THROUGH it into the next shot.
- Smart trick: acting_cues() - the lyrics drive Raymi: FIRE -> she jolts, OUT / ASHES -> she sinks, COUNT -> nods,
  crown words -> smug lean, RISE -> hop. Her body answers her own words.
Showcase: reference/craft_2026-10-12/showcase_v4.mp4.

## STEP 3 (2026-10-12 night) - words perform their meaning: comp/wordfx.py
toki on the stack(): "schon besser, aber immer noch sehr standard - das Wort Feuer koennte brennen, verschiedene Fonts,
verschiedene Arten einzublenden, ins Video einbauen statt drueberlegen. Du musst solche Sachen selber erkennen. Es
soll unterhalten, umhauen, visuell ansprechend sein." Lesson: a lyric video is entertainment - every key word is a
small visual gag that performs its meaning, in its own face, entering its own way, living IN the shot.
- LEXICON (meaning -> treatment + font + why): burn (fire: flames, embers, lights the scene), ashes (crumbles into
  embers), rise (climbs on light), drop (letters fall + bounce), pulse (veins beat on the heartbeat), flap
  (scoreboard count), glitch (rewinds, tears, snaps), gold (crown / title words), ripple (sea words, caustics);
  words without a special meaning rotate slice / focus / cascade; never the same treatment twice in a row.
- integration: wall() giant word BEHIND Raymi cropped by the frame; surface() a word lying ON the floor in
  perspective, lit by the scene; light() = the words' emission lights the scene and Raymi (fire = orange on her).
- line_block(): fillers small, meaning words big, the block scrolls like This Is War instead of shrinking.
- plan() writes every choice WITH its reason -> ELEMENTS.md; a better idea by hand beats the automatic pass.
Showcase: reference/craft_2026-10-12/showcase_v3.mp4.

## CORRECTION 2026-10-12 evening - read this first
toki saw the morning version (line()): "immer noch so klein, komisch platziert, wirkt drauf geklatscht, Farbe passt
nicht, komplett undynamisch - es gab extra die This Is War Analysen". She was right: the morning section below was
written from general typography knowledge and IGNORED reference/analysis/this-is-war-5/6 + STUDY_2026-10-08.md,
which already said exactly what to do. Side-by-side: typography_compare.jpg (TIW5 / rejected / new).
What This Is War actually does (measured on the sheets) and what stack() now does:
- the block IS the picture: 40-65 % of the frame width; rows justified to one width, so a short key word becomes
  giant and fillers become small rows (line() had a 117 px key word = 6 % of the width)
- tilted -6..-14 deg with a perspective lean, locked BESIDE the character (and behind her, never on her face)
- builds up word by word on the syllable; older rows stay dimmed (depth), new rows push the old ones up
- a camera inside the type: slow push, follows the active row, kicks on key words, and the block flies past the
  camera with zoom blur at the end of the phrase - the text does the cutting (TIW6 shots run 7-20 s)
- ONE heavy condensed family, white + dark soft shadow, the key word in the scene's own light (lifted toward white)
Code: comp/typeset.py stack() + STACKS (war / war_thin / raymi), moves stack_*; line() presets are marked REJECTED.
Process fix: CLAUDE.md rule - before building any craft system, read brain/research/INDEX.md and every analysis it
lists for that topic, and put a side-by-side (reference vs ours) next to the result before toki sees it.

---
(morning version, kept for history - superseded by the correction above)

Question: why do our lyrics look cheap although toki said it 10 times, and what do professional lyric videos do?
Evidence: Know My Name act 5 stills (163-242 s), the official MV sheet, the type critic's answers, RULES.

## What our lyrics did (measured on the stills)
- one font for everything (Raymi-Regular marker), the same puffy gold/pink outline + glow on most key words
- the key word always the same treatment, fillers at subtitle size (~20 px), lines parked in the same corners
- objects with type ("VICTORY" in a pink pill) - a clip-art shape around a word
- every fix so far changed the EFFECT (neon, glow-in-world, bevel) - never the TYPE itself (face, pair, layout)

## What makes lyric type look designed
1. A type PAIR per song, max two families: a display face for the key word, a quiet face for the rest.
   Japanese MVs: mincho (serif, emotional / literary) or heavy gothic (impact); Latin: a black grotesk or a
   hairline grotesk with wide tracking for contrast. A handwriting font only where the CHARACTER writes.
2. Hierarchy as a LOCKUP: key word 2.5-4x the filler size; fillers aligned to the key word's edge; tight
   leading (0.95-1.1 for the key row); one block, not floating words.
3. Flat colour from the scene: white or ink + ONE accent. Effects allowed: hard offset shadow, a solid
   knock-out box, a thin rule. Avoid: glow, bevel, thick outlines, gradients in letters, shapes around words.
4. Motion on the syllable: per-character stagger 20-35 ms, in 90-220 ms with ease-out (or a 90 ms slam that
   settles WITHOUT bounce), clean hold, exit 80-150 ms or a hard cut on the next line. Type-on for UI looks.
5. Placement in the free space: opposite her face, on the thirds, inside title-safe (4-6 % margin); sometimes
   behind the figure (depth) - never over the face.
6. Readable on a phone: fillers >= 30 px at 1080p, contrast >= 3:1 against the 90th-percentile background.

## Became code
- `comp/typeset.py`: PRESETS editorial (mincho) / impact (gothic black + knock-out, slam) / hextech (game-UI
  black + hairline caps, gold rule, type-on) / soft (rounded) / raymi (her handwriting for her own words);
  `layout()` = lockup on baselines, `pick_key()` = marked *word* or long + longest-held word, `zone()` = free
  third opposite her face, `qc()` = contrast, title-safe, face, hierarchy, families, size.
- fonts (OFL, free): Noto Sans CJK Black/Medium (JP/KR/ZH), Noto Serif CJK Black/Medium, Inter Display
  Black/Medium/Thin, Poppins Bold - assets/fonts/FONTS_LICENSE.md.
- gates: job.py elements needs `typeset:<preset>` + why; craft gate refuses MV jobs without comp.typeset.
- CLAUDE.md prime directive 5 narrowed: Raymi-Regular for Raymi's own words; lyrics use the song's preset.

## Next (when a song needs it)
- more display faces (free on Google Fonts: Dela Gothic One, DotGothic16 for pixel/game, Zen Kaku Gothic,
  Rampart One, Anton) - add to FONTS + a preset, one per need, never for variety's sake
- vertical Japanese lockups (tategaki) for JP songs; type on planes in perspective (signs, screens)

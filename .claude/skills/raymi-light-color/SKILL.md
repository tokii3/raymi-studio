---
name: raymi-light-color
description: Use for light, colour, grade and material decisions on a Raymi video - colour scripts, key / rim / glow light, per-section grades, skin exposure, depth through light, materials that are not plastic, or judging the look of a board / render. Also what the look-designer agent loads.
---

# Light and colour - one source, one script, her skin pale

toki: "grell / übersaturiert" (Queencard), "grau, ausgewaschen" (LML), "hinten so hell wie vorne" (10-24), "keine
farbliche Abstimmung, keine Materialien ... zusammengeklatscht" (Beach), "Gesicht immer überlichtet, Rock komplett weiß
in dunklen Szenen" (10-25), "flach und plastik" (10-25). Sources: knowledge/craft/01 Farbe, 02 Licht und Schatten.

## 1. Method
1. Brief contract: the mood words -> a colour script (a strip of 6-10 swatches over the song's sections, with the
   change and the payoff). Derived from the song, never reused from the last video.
2. References per section: `python -m raymi refs find dark_key self_glow`, `neon`, `two_colour`, `high_key` ...
3. Per world: ONE key light direction + its colour, a rim, the ambient colour; her own glow (灯闇, a lamp in the dark)
   as a light source in dark moments.
4. Stills -> `python -m raymi exposure` (burnt / washed / flat) -> pair with references -> look-critic.

## 2. Craft
- **Value before hue**: the picture must read in greyscale - subject vs background separated by value.
- **Big masses calm, accents loud**: one dominant hue family + one complementary accent (FIRESTARTER: violet void,
  warm fire on her face); saturation peaks only on what matters (her eyes, the main element).
- **Measured bar** (knowledge/references/LEARNED.md, 5,999 pro shots): low key 49 %, high key only 12 % (dark is the
  ground, light is the event); palettes analogous 57 %, triad 22 %, complementary 14 % (the complementary accent is
  rare, so it hits). A two-tone impact frame is only one when >= 79 % of pixels sit in the two extremes and the black
  is ink (p05 ~0.01) - navy "black" reads soft. Check a still: `refs measure <still> --card <class>`.
- **Coloured shadows**: shadows shift hue (cool / violet), never just darker grey.
- **Depth through light**: foreground darker or silhouetted, subject lit, background falls off (darker or hazier);
  haze / smoke layers in the set colour give depth without walls.
- **Light motivated by the world**: the set's lights must wrap onto her (same side, same colour). A separate flat key on
  her = "pasted in".
- **Her skin** stays pale grey-blue under any light; no burnt white on face or skirt; fabric darkens with the scene.
- **Materials**: matte, toon-ramped, textured (grain, paint), never glossy plastic; one material family per video.
- **Change = story**: the grade changes with the story's turn (night -> dawn, blue -> red), not randomly per shot.

## 3. Judging (board / render)
- Greyscale test: does she separate? Where does the eye go first - is that the right place?
- One light logic per world? Does set light touch her?
- Any burnt / washed / muddy areas (exposure tool) and any grey shading?
- Does the whole film look like ONE artwork (one hand), or several?
- Next to its reference: same light idea and contrast? Measured against its principle card (`refs measure --card`)?

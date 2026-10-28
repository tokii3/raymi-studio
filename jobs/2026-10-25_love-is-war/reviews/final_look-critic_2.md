# look-critic on the whole film take 14 (render run 87, out/kit/view), 2026-10-28 - verbatim

MAIN ELEMENT: no heroes.json found. I took Raymi and the lighthouse as the main elements. Raymi is readable in the mid and close shots (phone_05, 09, 20), but she is not readable at first_glance and in phone_01. The opening shows an empty dark frame with a teal band and a tiny or cropped Raymi. The lighthouse is only a small red-white stub in many wide shots. The hair is dark violet and merges into the navy and black water (phone_05 rows 2-3, phone_24). BLOCK: fault for the opening.

DESCRIPTION
- Dominant colours: (1) near-black navy, S 60%, V 5-15%, covering about 60% of most frames. (2) Mid indigo-violet, S 70%, V 40-60%, in the hair, the waves and the sky bands. (3) Pale lavender-blue skin, S 25%, V 85%.
- Accents: lighthouse red/white, warm cream beam, and crimson slash (S 90%). The red slash and the red and orange screens sit outside the blue family.
- Light: the lighthouse beam is warm from the left or back. Raymi is lit by a cool, even fill. The rim light does not match the beam, so the two do not share one source.
- The eye goes first to the beam or the red slash. It goes last to a dark void.
- Depth: foreground is rain or poles, subject is mid, background is the lighthouse and waves. Many frames are largely empty.

COLOUR
- The big masses are calm, which is good, and the red and cream accents are loud, which is right.
- The saturation peak competes with the subject. The red slash and the orange or red full-screen frames (phone_09 frame 8; phone_14 / full_14, the red ceiling) outshine her face.
- The hair and the dress are saturated blue-violet and swallow the shadows, so the colour is dark rather than coloured shadow.
- The skin reads blue-violet in places (phone_05, phone_09 rows 1-2) and not pale grey-blue. It looks blown out in the highlight frames.
- The washed-out cream frames (phone_14 rows 3-4, the beam over the railing) turn muddy beige and grey.

LIGHT
- There is one warm beam, but the figure is not lit by it. Her shadow is not cast into the set. In the wide shots she floats with no floor contact, only ripple rings (phone_09 rows 3-4, where she is tiny with no contact shadow).
- The intro shows her tumbling in a black void (phone_01), with a teal slab that has no light logic.
- In full_14 she sits in a lit set, but the foreground pole cuts her face and her tail is lost. She is unlit and pasted on there.

COMPOSITION AND DEPTH
- The close-ups are strong. The face at full_03 is good, and the low-angle shots with a lit face on a red ground are strong.
- The wide shots have no main focus. In phone_01 she is a dot in the dark, and in phone_09 row 4 she is tiny. Value separation is weak in grayscale, with hair against dark water.
- Awkward crops: a hair and back view fills the whole frame (phone_24). The head is cut at the top edge (phone_05 row 1). A pole bisects her face and body (full_14, phone_14).
- The face sits dead centre in many frames.

ASSET QUALITY
- The sprite edges are mostly clean, but the hair is a flat violet mass without detail.
- The ring at full_03 is parked directly over her eye and covers it. This is a fault.
- The grit ring graphic (full_10) is a different hand: a jagged cutout, not matched to the rest.
- The sea waves are repeated tile arcs that look like theatre seats, not water.
- The 3D lighthouse in the close-ups has a flat striped cylinder texture (phone_16 rows 3-4), a plain 3D prop.
- The beam is a flat additive plane with visible pixel steps (phone_05 row 4, phone_20 row 3).
- Teal slab in the intro: a plain flat plane.

DETAIL AND LOVE
- It is a sparse stage. A lighthouse, rain, wave arcs and ripple rings repeat. There are no props with a story, no wear, no texture on the sea.
- The lighthouse reads as a lighthouse only when its red-white stripes are in frame. It does not read in the dark wide shots.

ONE ARTWORK?
- Partly. The painted anime sprite sits next to the flat graphic waves and plain 3D poles. The opening teal plane, the grit ring, the red slash and the orange screen come from different sources.
- The look is consistent in its navy palette, but it feels assembled.

FIX 1
observation: 0-3 s (first_glance, phone_01): an empty black frame with a teal slab and a tiny or cropped Raymi; the sky is thin streaks.
effect: The viewer sees nothing. This is the opposite of the brief's "in the action from 0-3 s".
cause: composition and the main element (05, hero rule). Nothing is lit, and the scale is wrong.
change: Start at a close or medium Raymi with a rim light and the lighthouse beam on her. Her face is at least 25% of the frame height. Add an aesthetic skyline with a horizon glow.
priority: high
level: local
retest: first_glance.jpg shows Raymi readable, with her face-to-background value difference above 30%.

FIX 2
observation: Wide shots (phone_09 rows 3-4, phone_05 row 4): she is a speck in black water with ripple rings and no cast shadow or reflection.
effect: She is pasted on and floating, and not part of the set.
cause: light and contact (02).
change: Add a rim light from the beam colour on hair and shoulder. Add a reflection and a ripple at the waterline. Keep the wide shots to one or two per section, and cut to a medium shot sooner.
priority: high
level: structural:studio
retest: In the wide shots her silhouette separates in grayscale (gray_*), and there is a shadow or reflection at her contact point.

FIX 3
observation: full_03: the white ring covers her eye. phone_14 and full_14: the pole cuts through her face and body.
effect: It reads as an accident that hides the face. That is the key element.
cause: composition and the overlap rule (05).
change: Move the ring beside the head or make it follow the head with an offset. Re-route the camera past the pole, or put the pole behind her. Keep both eyes clear.
priority: high
level: local
retest: Check the frames: both eyes are visible and unobstructed in every shot that shows the face.

FIX 4
observation: The red slash and the red or orange screens (phone_09 rows 2-4, phone_14 row 2, full_14) are loud and cover the face. The skin there is blue-violet.
effect: The accent competes with Raymi. Her skin drifts from pale grey-blue.
cause: colour (01).
change: Keep one saturation peak per shot, and put it where the eye should go. Pull her skin back to pale grey-blue with a measured value. Lower the red slash so it never crosses the face.
priority: medium
level: local
retest: A measured skin hue and a saturation peak at the face.

FIX 5
observation: The wave arcs look like theatre seats. The lighthouse is a striped cylinder. The beam is a flat plane with pixel steps. The ink ring (full_10) is a grit cutout.
effect: The set looks cheap, like a clip-art collage next to the painted sprite.
cause: asset quality and one-hand look (09, 12).
change: Rebuild the sea as a toon-shaded surface with foam, a specular glint and a moon reflection. Give the lighthouse a lantern room, a gallery and a weathered texture. Make the beam a soft volumetric cone. Restyle the ink rings to the same brush as the red slash.
priority: high
level: structural:assets
retest: Phone-size stills show a water surface and a lighthouse readable at a glance.

FIX 6
observation: The hair is a flat violet mass against dark navy (phone_24, phone_05 row 2-3). Dress and skin merge with the background.
effect: A weak silhouette, and the main element is lost in dark frames.
cause: light and value (02, 05).
change: Add a rim light of the beam colour and a lighter backdrop behind her head. Break the hair mass with highlights.
priority: medium
level: local
retest: Grayscale: the head edge value difference is at least 25 points.

FIX 7
observation: The cream blow-out frames (phone_14 rows 3-4): the beam washes everything to beige and grey.
effect: The frame looks muddy and flat, with no depth, and she is lost.
cause: colour and exposure (01, 02).
change: Keep the whites warm and clean, and let the blue shadows stay saturated. Do not push a whole frame to white.
priority: medium
level: local
retest: The histogram has no clipped mass across a whole frame.

VERDICT: FAIL
WORST: The set looks like a flat, empty stage where Raymi vanishes into the black, starting with a near-empty opening frame.

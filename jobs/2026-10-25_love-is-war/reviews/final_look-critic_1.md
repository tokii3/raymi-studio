# look-critic on the whole film take 13 (render run 86, out/kit/view), 2026-10-28 - verbatim

MAIN ELEMENT: not readable in the opening and in the climb. No heroes.json is in the kit (only facts.json and shots.json), so I took Raymi and the lighthouse as the main elements. The lighthouse reads well in the storm section (phone_06: red/white tower, beam). Raymi does not in these places:
- first_glance and phone_01 (opening): she is a few pixels at the lower right edge, or only a hair tuft, beside a black block. This is the first thing a viewer sees.
- phone_12 (the climb): she is a dot in a dark-on-dark rock maze.
- phone_18 (lamp room): she is white-on-cream or hidden behind posts and hair.
BLOCK: fault: opening shots (0:00-0:10, first_glance, phone_01): the first glance is an empty black and teal slab with a comet. Raymi is tiny, cut by the frame edge and hidden behind a black cube, with no value separation. The main element is unreadable.
BLOCK: fault: climb section (phone_12, rows 2-4): Raymi is a few pixels on near-black rock with a navy outline. It has no value separation and no light on her, and the figure-ground check fails even in grayscale.
BLOCK: fault: lamp-room section (phone_18 row 2-3): she is bleached to cream-white against a cream beam and posts, so her silhouette is lost. The 3D mesh also looks fused with the light (blown-out face, missing outline).
BLOCK: fault: a red glitch-brush stripe over a lantern ladder (full_09, phone_23 area): the red stripe is built from noisy blob dots and spatter, and it reads as a cheap pixel-noise filter rather than a designed paint stroke. The 1-shot white-ring and concentric-circle cards (phone_18 pos 3) are flat clip-art next to the 3D set.

1. DESCRIPTION
- Dominant colours: (a) near-black navy, saturation about 60 %, value about 8 %, covering most frames; (b) mid ultramarine and indigo bands (the wave and seat rows), saturation about 70 %, value about 35 %; (c) cream or yellow beam, saturation about 20 %, value about 95 %, in the lamp room.
- Accents: teal slab (opening), red/white lighthouse, orange card, red stripe.
- Light: the lighthouse beam is the key light on the set. On Raymi there is only a cold blue glow, with no beam light on her skin in most shots. In full_03 her face is lit from camera and from below, with no relation to the set. Her face looks brighter than the dark set, but it is not the set's light, so she looks pasted on.
- Eye order: the brightest thing first (comet, beam, white ring or stripe), Raymi last, often not at all.

2. COLOUR
- The shadows are only darkened navy, not coloured. The big masses are too dark, so there is no calm mass plus loud accent, just a black mass plus noise.
- Value range collapses in the storm and climb sections (phone_12 rows 2-4).
- Peaks compete: the teal slab, the red stripe, the orange card, the white circles and the cream blow-out all peak in different places.
- Her skin: in full_03 it is pale blue and right. In the lamp-room beam it is bleached to white.
- The teal opening slab looks unrelated to the rest of the palette.

3. LIGHT
- Weak. There is no contact shadow under her in the water (phone_06: ripple rings are drawn around her, not a shadow). On the rocks she has no cast shadow and no rim light. In the lamp room (phone_23) the 2D painted hair and face are lit by a flat hazy glow, not the set's amber lamp.
- The strongest light moments are the lighthouse beams, which work. The overexposed white transition frames (phone_18 rows 1-2) are close to blown out.

4. COMPOSITION + DEPTH
- Opening: the horizon splits the frame into thirds, with a black block as a heavy mass and Raymi at the edge. This reads as a bad crop.
- In phone_12, large black foreground rock shapes hide her.
- Several wide shots are static, with no overlap or diagonal that leads to her (phone_06 row 1).
- Where it works: phone_23 rows 3-4 (a close portrait between gold pillars, starry sky) and full_03 (a low-angle close-up). These are the best frames, with a readable face and clear value separation.
- The frame sequence in phone_18 rows 3-4 holds four near-identical stills.

5. ASSET QUALITY + AI ARTEFACTS
- Raymi 3D mesh: in full_03 the hair reads as stiff flat planes with a grainy gradient, the face texture is soft, and the chest wing shapes are thin and floating. In some wide frames (phone_01 row 4, phone_12 row 1) the hair is a flat dark slab and the body partly clips through the rocks.
- The lighthouse is a clean flat-shaded prop, but the waves and seat rows read as stacked blue ribbons, and the rain streaks are uniform white sticks.
- The lantern (full_09) shows a moire pattern from its horizontal lines.
- No AI-generated background seen.

6. DETAIL + LOVE
- Mostly empty stage: dark water, repeated seat curves, a plain slab. The only built, lived-in set is the lamp room with its pillars, red roof, railing and gold basin. The rocks are the same generic navy polygons, with white pebbles reading as paper cutouts.
- The lighthouse is recognisable at phone size. The throne-like lamp basin reads at wide size only.

7. ONE ARTWORK?
- Not yet. The set (flat-shaded polygons), the painted anime Raymi (soft painted shading) and the 2D overlays (white rings, red noise stripe, orange card, concentric circles) come from three different hands. Raymi is not integrated by the set's light.
- Compared with the pro references in knowledge/references (clear readable subject with a rim-lit figure against a contrasting background), these frames look cheaper: the figure disappears in most shots.

FIX 1
observation: opening 0:00-0:10 (first_glance, phone_01 rows 1-2) Raymi is a few pixels at the right edge behind a black cube; the comet and teal slab dominate.
effect: the first glance has no subject, which reads as an empty stage and loses a swiper at once.
cause: composition and hierarchy (05), light (02).
change: move the camera so that Raymi is the largest, brightest thing in the first frame (face height at least 25 % of frame, value at least 40 points above the background); remove or move the black cube out of the frame; drop the comet's brightness below her face.
priority: high
level: local
retest: first_glance and phone_01 show her face, readable at 2 s, and in grayscale she separates from the background.

FIX 2
observation: climb section (phone_12) she is tiny on near-black rock with no light.
effect: the story beat (her climb) is invisible.
cause: value separation and rim light (01, 02), scale (05).
change: add a rim or key light on her from the lighthouse side (warm cream, about 2:1 over the fill), lighten the rock faces near her by 20 to 30 value points, use at least 3 close or medium shots of her climbing, not distant ones.
priority: high
level: structural:elements
retest: in phone_12 each frame shows her silhouette against a lighter shape.

FIX 3
observation: lamp-room frames (phone_18, rows 2-3) she is bleached white against cream.
effect: no silhouette, and the face loses its pale grey-blue skin.
cause: exposure and light (02, 01).
change: cap the beam at about 85 % value, put a dark or saturated backdrop (the red roof, navy sky) behind her, keep her skin at the pale grey-blue value.
priority: high
level: local
retest: gray_xx shows a clear value step between her and the background.

FIX 4
observation: overlays: red noise stripe (full_09), white circle ring on her face (full_03), concentric circles card, orange card.
effect: they read as an effect filter, not as part of this world; the ring on her eye covers the face at the moment the face should be seen.
cause: one-hand style (09, 05).
change: build each overlay as 3D or painted in the set's palette (the red stripe as a painted brush with clean edges and no dot grain); keep the ring off her eyes (offset to the lighthouse, as in phone_06); use at most one accent colour per shot.
priority: medium
level: structural:studio
retest: no overlay covers a face or has noise grain at 100 %.

FIX 5
observation: the set is dark navy ribbons and generic rocks (phone_06, phone_12).
effect: reads as wallpaper, with no love in the detail.
cause: detail, depth layers (05, 09).
change: add three layers with different values (a lighter mist band, wet-rock texture with a lit edge, a foreground silhouette), real props (a boat, a buoy, kelp) and cast shadows from the lighthouse beam; make the shadows coloured (deep violet, teal), not black.
priority: medium
level: structural:assets
retest: each wide shot has at least 3 value layers and no flat black area larger than 25 % of the frame.

FIX 6
observation: Raymi's 3D body in wide frames (hair slab, clipping into rock, no contact shadow, floating in the water).
effect: she looks pasted in the space.
cause: contact and integration (02, 09).
change: add a contact shadow and ripple at water level that touches her body, plus a set-coloured rim, and fix the clipping; hair kept with the same toon shading as the set.
priority: medium
level: local
retest: in each wide shot, a shadow or ripple touches her.

FIX 7
observation: the palette: teal slab (opening), cream blow-out, red, orange.
effect: peaks compete; the video has no single colour plan.
cause: saturation plan (01).
change: keep indigo as the calm mass, and a single accent per section (warm lighthouse amber for the beam, red only for the lighthouse stripes); recolour the teal slab into the set's indigo family.
priority: low
level: local
retest: the saturation peak lies on her or on the lighthouse in each thumbnail.

VERDICT: FAIL
WORST: Raymi, the main element, is tiny, unlit and lost in dark or blown-out frames for long stretches (opening, climb, lamp room), so the video reads as an empty dark stage with effect overlays.

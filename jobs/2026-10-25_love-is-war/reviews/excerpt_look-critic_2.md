# look-critic on frames of the chorus excerpt (render run 83, boards/excerpt8 v_*.jpg), 2026-10-27 - verbatim

MAIN ELEMENT: readable in most shots - Raymi's face and eyes are the brightest, palest, most saturated-contrast spot in the close-ups (v_011.4, v_013.6, v_016.4) and read clearly at phone size. NOT readable in two places: v_001.0 (she is about 1/6 of the frame height, tiny at the bottom in a huge empty blue field, face smaller than a thumbnail at phone size) and v_021.0 (top-down, she is a hair column, no face, dissolved in a noise rectangle). v_006.6 hides her face entirely behind a black hair disc. No heroes.json exists in this job, so I judged Raymi's face as the main element.

1. DESCRIPTION. Dominant colours: (a) deep navy-indigo, saturation about 70%, value about 10-20% (sky, water floor); (b) pale periwinkle / grey-blue lilac, low-medium saturation, value about 85% (her skin and the wave-ridge highlights); (c) saturated violet-purple, value about 35% (hair, gloves). Accents: warm cream lighthouse beam, red-white lighthouse stripes, red noise dots. Light: the beam comes from the lighthouse at upper left or centre and sweeps right. On Raymi the light is a flat, frontal, cool fill, and in v_008.5 a rim comes from the left. The set's key (warm beam) is not on her skin except for a wash across her skirt in v_011.4. Eye path: bright face or eyes first, then the beam or lighthouse. Last: the dark floor. Layers: rain streaks and ripple rings in front, Raymi in the middle, wave ridges and lighthouse behind.

2. COLOUR. The overall plan is strong and calm: navy mass, pale skin, one warm beam. This is the best thing in the excerpt. The pale skin stays grey-blue/lilac, as it should. Problems: (a) v_009.0 turns the whole set into flat orange (#F0A040 field, black sky, orange rain and lighthouse). It looks like a flat-colour matte or a broken pass, not a designed flash. Her cool figure sits on it with a pink halo fringe. (b) The shadows on her are only darkened indigo and are not tinted by the warm beam. (c) The black noise-ink slashes and red dots (v_004.3, v_005.0, v_008.5) are neutral grey and black speckle, so they are the muddiest, grainiest element and they compete with the face.

3. LIGHT. The beam is a good motivated source and the lighthouse is a clear light story. She does not live in it. Her skin shows no warm beam light, no beam edge on the face, and no cast shadow from it. In v_001.0 and v_020.0 she has no floor contact at all. In v_011.4 (the arabesque) there is no cast shadow on the water, so she floats and the pose reads as pasted on. In v_008.5 she rises out of the water with ripple rings around her, which is the one convincing contact, though without a waterline shadow or reflection. The beam passes behind her leg in v_011.4 and lights the skirt, which is nice, but the wash across the thigh looks like an additive layer, not light on a surface.

4. COMPOSITION AND DEPTH. Strong: v_016.4 (centred face, wave bands as a frame), v_008.5 (face on a diagonal with ripple rings leading in), v_011.4 (a clean diagonal beam through the T-pose arabesque, readable silhouette). Weak: v_001.0 is dead composition, with 85% empty gradient and a horizon line cutting at her hands. v_006.6 crops her head into a black hair rosette, with a hair disc in the middle and the lighthouse looking out above it, so the shot reads as a mistake. v_021.0 spends the frame on noise and rings, with a tiny figure. Awkward crops: v_005.0 and v_013.6 cut the head top and ear accessory (acceptable for close-ups), but v_020.0 crops the shoulders and torso through the bottom edge in a confusing way.

5. ASSET QUALITY AND ARTEFACTS (positions).
- v_020.0, lower centre-right: a black slash line runs diagonally across the chest, and a tan/beige cardboard-looking polygon plane (skirt or cape) sticks out lower right. The torso looks broken and torn, with hard stair-stepped edges on the left shoulder. This reads as a mesh or sprite glitch, not intent.
- v_020.0 and v_016.4: the hair ends are hard, vertically cut with stepped, sawtooth edges (v_016.4 lower left and right of the neck, v_013.6 lower left). The hair looks like cut cards, not locks.
- v_005.0 and v_008.5: the black/grey speckle ink slashes cross her eyes, mouth and cheek. Several land exactly on the eyes (v_008.5 right eye). The grain is low-res and noisy next to the clean face. If this is the designed ink wipe it is allowed, but it is heavy, at several moments, right on the main element.
- v_006.6: the head from above, with a black hair disc and spiky hair, looks like a malfunction and has a soft white fringe on the body edge.
- v_009.0: pink/white outline fringe around her shoulders and arms (a halo against the orange), the hair-clips float disconnected, and a pasted-on hard edge at the hair left.
- v_001.0: the hands are blobby, dark purple on dark purple, with an unreadable glove shape and a tiny gloss speck in the sky left (stray dot at 585,630).
- v_001.0 and v_004.3: Raymi is a rendered, shaded model rather than the painted unlit sprite, with the hair and eyes resolved well. The face is soft and slightly blurry from upscaling in v_016.4 (the face reads as foggy plastic in the cheeks and chin, with no line definition).
- Set props: the lighthouse is a simple, clean built prop and reads. The waves are flat cut-paper bands, stylised and matte, which fits. The rain is a stack of white rectangles, which reads thin and generic.

6. DETAIL AND LOVE. The lighthouse, wave ridges, rain, ripple rings and star flecks on the water are a coherent set, and the stylisation is deliberate. But it is thin: the sea is a few repeated bands with the same shape, the floor is a flat navy plane with rings, and nothing in it is lived-in or textured (no foam, no reflection of the beam, no moon, no wear). The lighthouse is the only object with a reason. The excerpt is an empty stage with one good prop. The beam is the loveliest piece, and it has no reflection in the water.

7. ONE ARTWORK? Mostly yes in v_011.4, v_016.4 and v_013.6: the cut-paper set and her shaded model share a palette and hang together. It breaks at v_009.0 (flat orange), v_021.0 (a particle/noise render), and the grain ink slashes, which read as three more sources. Her hair edge quality and soft face do not match the crisp, graphic set.

FIX 1
observation: v_020.0 (about 20 s) - black slash across the chest, tan/beige polygon flaps at lower right, stair-stepped torso and shoulder edges.
effect: the body reads as broken geometry, a visible mistake and not a style choice.
cause: mesh/cloth glitch or clipping plus a cropped body in a close-up (modules 09, 12).
change: find the cause (skirt/cape plane clipped through the torso, a slash overlay) and fix or hide it. Re-frame so the torso is not cropped through, and check every frame of the move for the tan plane. Zero visible clipping at 1080p.
priority: high
level: local
retest: frames at 19.5-20.5 s at full size show no black slash or tan plane crossing the body.

FIX 2
observation: v_009.0 - the whole set flips to flat orange with black sky, Raymi with a pink fringe on her shoulders and arms.
effect: reads as a broken colour pass or a mask error, kills the calm navy plan, makes her look cut out.
cause: a flat-fill flash or matte (module 01, 09).
change: if it is a designed beat, make it a tinted version of the set (the beam's warm light on the water and the lighthouse with a gradient, navy shadows kept) and keep the face unlit. Remove the pink halo, with a 1-2 px edge erode and a dark-navy rim. If it is not designed, remove it.
priority: high
level: local
retest: v_009.0 shows a gradient with a visible set and no coloured outline on her.

FIX 3
observation: v_001.0 - she is about 15% of frame height at the bottom edge in an empty navy field, and v_021.0 - a hair column in a noise rectangle.
effect: the main element is unreadable at phone size, with the face a few pixels across.
cause: scale and composition (modules 05, 02).
change: in v_001.0 push in to the head and shoulders at 45-55% frame height, or put the lighthouse beam and horizon in the empty top. In v_021.0 let the figure take at least 35% height with the face or beam lit, and drop the rectangular noise block.
priority: high
level: local
retest: at 270 px height the face is visible and about 30 px or more wide in both frames.

FIX 4
observation: v_005.0 and v_008.5 - black/grey speckled ink slashes run over her eyes, cheek and mouth, plus red noise dots. v_004.3 too.
effect: dirty, low-res grain over the best part of the picture, grey and muddy against the clean navy and pale skin, and it hides the eyes at the strongest emotional moment.
cause: effect placement and texture (modules 01, 05, 12).
change: keep the slash behind or beside the head (not on the eye line), use a cleaner texture in the key colour (deep violet or the brand red as a solid brush shape) and cap how often it hits the face. Eyes always free of overlay.
priority: medium
level: local
retest: the eyes carry no overlay in any frame of the stretch, and the effect is a colour, not grey speckle.

FIX 5
observation: v_006.6 - top-down head: a black hair disc with spiky ends fills the middle and hides the face, while the lighthouse stands unmotivated above.
effect: reads as a glitch (a black sun) and gives no emotion, with the beam the only thing looked at.
cause: camera angle, cropping the head from behind (module 05).
change: hold the camera lower and behind-left so the profile or the eyes are visible, or cut this angle from the sequence. If the crouch is a beat, show it with the face turned and a rim light on the hair.
priority: medium
level: local
retest: the head silhouette has visible hair parting or face and an eye.

FIX 6
observation: v_011.4, v_001.0, v_020.0 - no cast shadow, no warm beam on the skin, no reflection in the water. She floats on the set.
effect: she looks pasted onto a stage even where the pose and the diagonal work.
cause: light and contact (module 02).
change: add a soft dark contact shadow or water reflection under the standing leg and a warm rim (cream, 25-35% strength) on the skin on the beam side. Tint her shadows toward violet. Skin stays grey-blue.
priority: medium
level: structural:studio
retest: the standing-foot frame shows a visible contact shadow and a warm rim on the beam side.

FIX 7
observation: v_013.6, v_016.4, v_020.0 - hair ends are cut stairs and cards (stepped, sawtooth lower edges) and the face is soft and foggy in v_016.4.
effect: the close-ups, which are the money shots, look low-effort and 3D-viewport-like.
cause: asset resolution and hair mesh (modules 09, 12).
change: use hair tips with tapered alpha cards or a rounded cap and a hair-end shading pass. Sharpen the face texture (higher-res render or a line-art pass), and add the eyelash and mouth line detail the way v_013.6 has it.
priority: medium
level: structural:assets
retest: at 100% crop the hair tips are tapered and the cheek line is crisp.

FIX 8
observation: the set across the excerpt (v_004.3, v_011.4, v_016.4) - repeated flat wave bands, a plain navy floor, thin white rectangle rain, no foam, no beam reflection.
effect: one good prop (the lighthouse) and a wallpaper stage, not a place with love in it.
cause: set detail (modules 05, 09).
change: add a beam reflection on the water (a streak on the floor), foam lines at the wave crests, a moon or a distant light, rain that varies in length and depth (some blurred in front), and a few built props (a buoy, a rock, a boat lamp).
priority: low
level: structural:studio
retest: the wide frame shows at least 3 depth layers with different blur, and the water reflects the beam.

BLOCK: fault: v_020.0 (about 20 s) - a black slash and a tan cardboard plane crossing her torso with stair-stepped edges: visible mesh/clipping glitch on the body.
BLOCK: fault: v_009.0 (about 9 s) - the whole set flat orange with a pink halo fringe around her: reads as a broken colour pass and a cut-out edge.
BLOCK: fault: v_006.6 (about 6.6 s) - the main element's face is hidden by a black hair disc and the figure reads as a glitch.

Reference compared: the pro MV pattern of a lit figure in a coloured set with a clear key light (knowledge/references/segments.json, where Love is War style segments sit); I did not find a segment on the same ink-slash cut. The good frames (v_011.4 diagonal beam, v_016.4 face) are at the level of a decent stylised MMD clip, but not above it, and the bad frames are below it.

VERDICT: FAIL
WORST: Several frames (the black-slash torso glitch at 20 s, the flat-orange flash at 9 s, the black hair disc at 6.6 s) look like rendering mistakes, which makes the whole excerpt look cheap next to its good lighthouse beam.

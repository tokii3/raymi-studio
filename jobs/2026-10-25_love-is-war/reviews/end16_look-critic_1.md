MAIN ELEMENT: NOT readable in several shots. No script/heroes.json exists for this job, so I judged Raymi as the main element, with the lighthouse lamp as the secondary one. Raymi is clear only in the close-up (full_06). Everywhere else she is lost.
- full_00 and first_glance: she is cropped, seen from behind at the lower right, her face is not visible, and she is hair-coloured dark on a near-black floor.
- full_01: she is a tiny, blown-out blob behind rails, glass and rain streaks inside the lamp room.
- full_02, full_04 and phone_03: she is about 1/6 of the frame height and washed in beige haze. Her silhouette merges with the railing, the posts and the fog.
- full_07: she is tiny at the edge of the frame, and the white lamp disc and the posts pull the eye away from her.
BLOCK: fault: Main element (Raymi) unreadable at phone size in full_00/first_glance (back view, cropped, dark on dark), full_01 (blob in glare behind rails) and full_02/full_04 (tiny, merged with haze and railing).
BLOCK: fault: Lamp room, full_01 and full_07. The lamp is a flat opaque red disc (full_01, top) and a flat cream disc, a clip-art look, with no glowing glass body. The beam is a hard grey slab. Both sit next to her painted sprite as plastic or primitive geometry.
BLOCK: fault: Lamp room, full_02 and full_04. Her hair and skin are dyed by the beige fog to a grey-lilac ghost with a glow halo. Her edge shows a visible bright fringe, and her skin is not pale grey-blue.

1. DESCRIPTION. The three dominant colours are near-black navy (very low value, mid saturation), mid royal blue wave outlines (mid value, mid saturation) and ochre/amber wood (mid-high value, high saturation). Raymi's violet hair and pale blue skin are a small fourth. The lamp is lit from the upper right. Raymi is lit by a cool violet rim that does not match the warm amber set light, so the two light sources disagree. The eye goes first to the amber slabs and posts, or the white lamp disc, then to the lighthouse stripes (full_00). Raymi comes last. Foreground is a dark rail or post, the subject is mid-ground, the background is wave layers.

2. COLOUR. The saturated amber slabs compete with her, because the loudest colour is on the props and not on her. The night shots (full_00, full_04) are mostly crushed navy with no mid values, so the big masses are dark rather than calm. The beige fog in full_02, full_04 and phone_03 is muddy and grey, not a coloured atmosphere. Shadows are mostly just darkened. The seabed in full_04 is a flat, lit lavender plane. The red cap is a pure saturated flat red, an unrelated accent.

3. LIGHT. There is no single source. Warm beams in the lamp room, cool violet moon on Raymi, and an unmotivated beige fog. She has no floor contact in full_00 (no cast shadow, she hovers over the rain rings) and sits in full_02 without a shadow on the deck. In full_07 she stands on the deck, but at a distance with no light interaction, so she looks pasted on.

4. COMPOSITION AND DEPTH. Each shot has several competing foci. Foreground posts and rails cut across her through the torso (full_02, full_07). In grayscale (gray_*) she is the same value as the background. The silhouette is unreadable at small size. Depth layers exist (waves, railing, posts), but the dark foreground rails eat the bottom third. full_04 is an empty shot with no subject at all, just a tiny orb, and it has no focus. The crop in full_00 cuts her at the thigh and the hand.

5. ASSET QUALITY. In full_00, the rain is thin hairline white sticks (clip-art) and the barnacle and rain-ring circles are faint dots. The waves are the best asset: a painted 2D layered style that fits the brief. The wood slabs and rails are flat low-poly (full_02, full_04). The lighthouse in full_00 is a flat striped box with pixel-like brick lines. The rocks in full_04 are low-poly blobs, plastic-looking next to the painted waves. Raymi's hair in full_06 has blocky "dreadlock" strands and a smeared texture. Her cloth and skirt show stray fringes in full_04. The skin in full_00 and full_02 carries odd dark tiger-stripe streaks along the arms and legs (full_02, full_04 legs).

6. DETAIL AND LOVE. The lamp room reads as a carousel or gazebo, not a lighthouse lamp. There is no lens, no brass, no wear. The tower is a hollow cage with floating posts. The seabed is empty sand with a few rocks. It is a stage with few objects and little reason behind them.

7. ONE ARTWORK? No. The painted 2D wave layers, flat-shaded low-poly wood, rendered volumetric fog and a rim-lit 3D MMD-style girl come from different hands. full_06 (hair, eyes, painted stars, mountains) is the one frame that feels coherent.

Comparison with the bar (looking for professional anime MV references in knowledge/references/segments.json): the look is far below, e.g. edgerunners-this-fffire / ado-usseewa, where the figure is always the brightest or most saturated thing and shapes are graphic and clean.

FIX list

FIX 1
observation: full_00, first_glance (0 s): Raymi from behind, cropped at the lower right, dark violet on black, no face.
effect: the hero is not found; the frame reads as lighthouse + rain.
cause: figure-ground / value (05, 01)
change: frame her full body or three-quarter facing the lens, with her face at 0.10 or more of frame height. Add a rim or key light so her skin reads at least 30 L* above the background. Darken or desaturate the floor around her.
priority: high
level: local
retest: gray_*.jpg shows her silhouette clearly separate; the phone-size first_glance finds her in 1 s.

FIX 2
observation: full_01, full_02, full_04, full_07, phone_03: she is tiny (1/6 to 1/5 of frame height) inside the lamp room, behind rails and posts, in beige haze.
effect: viewer sees a carousel, not a character; no intensity or immersion.
cause: scale and overlap (05); fog (01)
change: move the camera to waist or chest height at 0.4 or more of frame height. Move posts and rails out of the line of sight to her torso, so nothing crosses her face or body. Replace the beige fog by a thin coloured haze whose value is darker than her skin.
priority: high
level: structural:elements

FIX 3
observation: lamp: a flat red disc (full_01), a flat white disc (full_07), a hard grey beam slab.
effect: cheap primitives.
cause: 3D props vs painted style (09)
change: build one glowing lamp body (an emissive lens with a Fresnel-like falloff, brass frame, wear), and a soft cone beam with an edge falloff. Give the cap a painted dark-violet / brass material instead of pure red.
priority: high
level: structural:elements

FIX 4
observation: lighting: cool violet rim on Raymi vs warm amber on the set, with no cast shadow (full_00, full_02, full_07).
effect: pasted-on look, two light worlds.
cause: light consistency (02)
change: choose one key (the lamp beam, warm amber) plus one fill (cool moon). Put a contact shadow under her feet, and have the beam rim-light her edge in the same colour as the set.
priority: high
level: local

FIX 5
observation: full_04 seabed and rocks, and full_00 rain.
effect: empty, low-poly stage.
cause: detail and style unity (09, 05)
change: paint the seabed and rocks to match the wave layers (outline, two-tone fill). Make the rain hairlines thicker with varied lengths, or reduce them. Add 3 or more story props, such as the cable and the signal, near the focus.
priority: medium
level: structural:assets

FIX 6
observation: Raymi's skin has tiger-stripe artefacts (arms, legs in full_00, full_02, full_04) and the hair is blocky strands (full_06).
effect: reads as an AI/render glitch.
cause: texture/shader (12)
change: clean the skin texture and lighting of the rig (no dark stripes), and keep the pale grey-blue skin. Smooth the hair strands.
priority: medium
level: structural:assets

FIX 7
observation: full_06 is the best frame (face, stars, painted mountains). Everything else is below its standard.
effect: the film's quality is uneven.
cause: one hand (09)
change: use the full_06 treatment (painted background, stars, face-forward close framing) as the reference for the other shots.
priority: low
level: structural:concept

Ranked faults: 1) hero unreadable (full_00, full_01, full_02, full_04, full_07); 2) lamp room primitives and haze; 3) light mismatch with no grounding; 4) skin stripe artefacts and hair; 5) empty low-poly seabed; 6) mixed styles.

VERDICT: FAIL
WORST: Raymi, the main element, is a tiny, hazy, rail-crossed or back-turned figure in most frames, while the flat red/white lamp discs and amber slabs grab the eye.

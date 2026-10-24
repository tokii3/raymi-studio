# look-critic on stills board 3 (boards/still_01..21, 2026-10-25) - verbatim, the builder does not edit this file

MAIN ELEMENT: NOT reliably readable. No script/heroes.json exists for this job, so I judged Raymi (and the gallery sculpture as the set's gag) as the main elements. Raymi reads in the close-ups (01, 02, 03) and in 12, 15 and 19. She does not read in 07 (a blob), 08 and 18 (dark, small, face lost), 17 (top-down, face is a black hair mass), 09 (small and covered by bubbles) or 11 (lyric over her face). The sculpture reads in 15 but is a flat cream blob.
BLOCK: fault: still_07 (and the motion-blur transition) - Raymi is a shredded blue/white mess at bottom centre (about x 800-1100, y 850-1050), unreadable and broken-looking. Only a blur cover would excuse it, and even then it is a visible glitch.
BLOCK: fault: still_08 and still_17 - the crown of her hair is a flat black hole (08: about x 920-1100, y 430-560; 17: the whole top of the head). It does not read as hair. The hair is lit blue and black with no mid-tone, so the head looks cut out. In 17 her face is not visible at all.
BLOCK: fault: still_11 - the giant glowing "WATCH ME" is parked directly over her face, eyes and chest. A smaller "Watch" sits half-cut by a pale blue panel edge. The lyric is allowed to fly over her briefly, but this is the held frame.
BLOCK: fault: still_18 - the floor and wall are black rectangular holes (shadow or missing-geometry artefacts) and the lyric is a sliver of letters seen edge-on, unreadable. The shot is nearly black and she is lost.

1. DESCRIPTION. Dominant colours: (a) deep blue-violet, saturation about 100%, value 20-40% (hair, dress); (b) warm beige or tan, saturation 25-30%, value 80% (stills 02, 03, 12 backgrounds); (c) oxblood or maroon plus mustard-gold, saturation 60-80%, value 15-55% (gallery wall, frames, stills 15, 16, 19). The light is a top-down warm spot on the set (15, 16, 17). On Raymi the light is flat, frontal and cool, and it does not match. Eye order: in the close-ups the eyes first, then the hair mass. In 15 the eye goes to the glowing sculpture first, then Raymi. In 16 it goes to the orange fish, not to her. Foreground, subject and background are clear only in 15, 16 and 19.

2. COLOUR. The saturation peak competes with the subject. Her hair is almost pure ultramarine (01, 03, 17), the most saturated thing in every frame, and it reads as neon-digital rather than matte or toon. The orange fish in 02 and 16 is a second peak. The mustard backdrop in 19 is a large loud mass, not a calm one. The ground beige in 02, 03 and 12 is a flat vignette gradient with no light logic. The pink in 01 is a muddy dusty rose. The shadows in 08, 09, 17 and 18 are only darkened, not coloured, so they go black or grey. Her skin stays pale grey-blue, which is correct, but it clips to white in 01 and 11 and in the transition 19 (blown out).

3. LIGHT. There is not one source. The set has a warm spotlight from above, but she carries her own cool light, so she looks pasted on. 15: her feet fade into a semi-transparent ghost near the rope with a dark leg, and she has no cast shadow or only a faint one. 16: her toe points at the floor but there is no contact shadow. 19: she has no cast shadow on the gold wall, and the wall light does not reach her. 12 and 03: no ground at all. 09: the bubble discs sit on her like stickers. 17 is the best shot for contact and cast shadow (a real shadow on the plinth), but she is seen from above with the face hidden.

4. COMPOSITION AND DEPTH. Strong: 15 (diagonal floor, plinth, ropes, wall frames) and 16 (dutch tilt, fish and spot, she on the diagonal). Weak: 02 and 12 are centred portraits on an empty gradient (wallpaper). In 12 only a hand rises and the rest is crop-blurred empty beige, with no main focus. 09 has her small and dead centre in a dark set. In 08 and 18 she is crushed low against black. In grayscale 08, 18 and 09 collapse into a dark mass, and the silhouette is not readable small. 19 has a good silhouette, but the crops at the side frames are awkward ("HE MASTERPIECE", "100% CHAN", "DEEP SEA S").

5. ASSET QUALITY AND AI ARTEFACTS.
- Her model is a toon-3D head with a painted look: 01 face and eye are fine. The lower lip and teeth in 03 are blue-violet and read as a rendering fault.
- Hair: black blob (08, 17, 18), hard black and white strips in 18.
- Dress or hip: 18, a white sliver or hole at her hip/torso.
- 15: the left leg and shoe are broken into a black tube with a transparent ghost leg, and her pose or foot is floating.
- 16: legs fuse with a dark bar and the foot touches a white tape, a prop that makes no sense.
- 07: she is a mangled flower of geometry.
- Fish (02, 16): flat low-poly orange, a plastic 3D prop next to her painted face, and a black tube beside it with no meaning.
- Sculpture (15): a blank cream slab with a beak and a missing eye, and it does not read as art. It blows out to white.
- Text: 15 "RAYMI, 2026 - deep sea" is tiny. "PLEASE DO NOT TOUCH" is cut by a pole. The ghost text under the floor in 15 (bottom left, reflection of the lyric) is a leftover glitch. Lyrics in 09 ("Baddie") are readable, the rest muddy.
- 05 and 13: blurred lyrics are illegible ("[ . .Me]", "In my loubs"), which reads as an error even if it is a transition.

6. DETAIL AND LOVE. Some love: the gallery frames (waves, moon, diamond), the rope stanchions, the sign, the checker floor and the news box in 09. But the set is too dark to be seen, and the props are thin: frames repeat the same three motifs, the walls are flat colour with no texture, and the floor holes in 18 show the set is broken. Several shots (02, 03, 12, 01) are empty gradient stages with a floating prop. The lived-in feeling exists only in 15 and 16. A throne-style read test: the sculpture in 15 does read as a whale-duck on a plinth, but just barely.

7. ONE ARTWORK? No. Three sources show: (a) the cheap beige vignette gradient portraits, (b) the dark gallery with warm light, (c) flat neon-blue lit character and glowing lyric text. The low-poly orange fish and the clouds-text lyrics, pop-up bubbles and sticker-like text are all different styles. Her hair colour is far more saturated than everything else.

FIX 1
observation: stills 08, 17, 18 (and 01/03 partly): hair crown is a flat black blob, blue is pure ultramarine with no mid-tone; 17's face is hidden.
effect: the head reads as a cutout hole; she looks like a different render from the set; the main element is lost.
cause: hair material / toon ramp with no mid-tone and light from the wrong side (02, 09).
change: re-ramp the hair with 3 tones (a mid violet, 55-65% value, between black and peak blue) and a coloured rim from the set's key; lower peak saturation of the hair by about 20%; keep the face above the camera angle in top-down shots.
priority: high
level: structural:studio
retest: stills 08, 17, 18 again; no pure black area larger than 3% of the head; face visible; grayscale head separated from the wall.

FIX 2
observation: still 07 (the blob), 05, 13 (heavy blur covers lyric and picture), 18 (black floor rectangles, edge-on lyric).
effect: reads as glitches or errors, not intent.
cause: transition / blur strength and broken floor shadow geometry (09, 05).
change: cap blur so Raymi stays recognisable (face or silhouette readable at 50% blur); fix the black floor planes in the 18 set (look at shadow receivers or missing floor tiles); lyric must be readable (face-on within 20 degrees) when the screen shows it.
priority: high
level: local
retest: probe frames at transitions; no unreadable frame longer than 3 frames; floor has no black polygons.

FIX 3
observation: 11: huge glowing "WATCH ME" over her face and chest, one half-cut by a pale panel.
effect: it hides the main element and looks like an accident.
cause: lyric placement (05).
change: move the lyric to the side or below at 40% of the current height, keep her eyes and mouth free, put it on a set surface (wall, sign).
priority: high
level: local
retest: still 11 again; no lyric pixel over the face box.

FIX 4
observation: 15, 16, 19, 09: she has no set light, no contact shadow (feet ghosted in 15), 19 white-blown skin; set light and her cool light disagree.
effect: she is pasted on and does not stand in the room.
cause: sprite unlit and not receiving the set's key and shadows (02).
change: add a soft cast shadow and a dark contact patch under both feet, tint her with 15-20% of the set key (warm amber from the spot on one side, a cool bounce on the other), keep skin at pale grey-blue (no clip above 92% value); remove the see-through lower leg in 15.
priority: high
level: structural:studio
retest: stills 15, 16, 19; shadow visible under feet, skin not clipped, the same side as the spot.

FIX 5
observation: 02, 03, 12, 01: empty beige or pink vignette gradient background with a floating prop (fish, bubbles) and one centred portrait.
effect: wallpaper, slideshow look, nothing of the place.
cause: no set behind the close-ups (05, 09).
change: put the same gallery wall (maroon, frame edge, spot cone) out of focus behind her in these shots; drop the vignette gradient; give the fish a physical context (on the plinth).
priority: medium
level: structural:elements
retest: every shot shows part of the same room; 02/03/12 background has at least 2 depth layers.

FIX 6
observation: orange low-poly fish (02, 16) and the cream sculpture (15): flat plastic or blown-out, the fish has an unexplained black tube.
effect: they look cheaper than her painting; the sculpture does not read as art.
cause: prop materials not matched to the toon matte look (09).
change: give them the same matte toon ramp with coloured shadow, a rim light, a small texture; cap the sculpture at 85% value with a clear silhouette; remove the tube or make it a recognisable object.
priority: medium
level: structural:assets
retest: phone-size 15 and 16; the sculpture reads as a whale-duck without text.

FIX 7
observation: 08, 09, 18, 16: very dark set, black shadows, the maroon wall at about 10% value; 19: loud mustard fill.
effect: the main element and the set both sink; saturation does not follow the plan.
cause: exposure, shadows only darkened (01).
change: lift the set to a 25-35% value floor with violet or teal shadows; make mustard the accent (frames only), not a 60% mass.
priority: medium
level: local
retest: grayscale of 08, 09, 18 shows Raymi separate from the wall by at least 25% value.

FIX 8
observation: lyric styles change per shot (clouds, neon, red stencil, brown muddy, tiny sign text); the brown text in 15 and 19 is low-contrast on dark, plus a ghost reflection in 15.
effect: unreadable, inconsistent, no one hand.
cause: lyric component without a contrast rule (05).
change: one lyric style family (white fill, coloured rim), minimum 4.5:1 contrast to the surface behind, at least 40 px cap height at 1080p; remove the floor-ghost.
priority: medium
level: local
retest: contrast probe passes on all frames; lyric readable at phone size.

Overall it is not at the level of the top three of the casebook: the lighting split between her and the set, the broken hair and legs, and the empty gradient shots read as low quality.

VERDICT: FAIL
WORST: Raymi is lit and shaded like a different render (black-hole hair, ghosted legs, no contact shadow) pasted into dark sets with broken floors and muddy lyrics, so the main element is lost in several shots.

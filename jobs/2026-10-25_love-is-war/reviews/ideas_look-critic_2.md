MAIN ELEMENT: Raymi. I did not open heroes.json or facts/hero.json, so this is judged by eye on the 9 pair images (our frame is the right half). She is readable in A1, B1 and C2. She is NOT readable in A3 (translucent ghost), B3 (tiny, dark, face hidden), C1 (face hidden, dark on dark) and C3 (tiny, from behind). BLOCK: fault.

Description: dominant colours are deep navy/indigo (A, C), near-white warm grey with black (B), electric teal (C). Accents: saturated violet/blue on her hair and skin, red-and-cream lighthouse, red dots on the ink line. Light on the set comes from the lighthouse beam and moon (A), a bright backdrop disc (B), teal bar glow (C). On Raymi there is no clear key side, and she does not pick up the set's light.

PER FRAME
A1 (lighthouse sea, rings, rain, speed lines): best of row A. Face readable at phone size; lighthouse, beam and moon tell a clear story. Skin is saturated lavender-blue, not pale grey-blue, and her body sits in the same blue as the sea, so she separates only through hair and ring glow. Rain is flat white stick rectangles, speed lines are clip-art, the sea is a dark plane with flat rings and no wave material. She stands in a hole in the water with no splash. Against Edgerunners This Fffire @74.25 (hard black/white graphic pose) ours is a calm decorated postcard, not raw.
A2 (close-up, double ring): her face is cropped by the bottom edge at nose and lips, and the eyes are blown to white glints, so there is no readable expression. The rings sit over the lighthouse, not over her, so the focus is wrong. Against Edgerunners @85.25 (full open scream, texture, shards, coloured shadow) ours is a silent half-face and not a hit.
A3 (lighthouse top): worst frame. The lighthouse is a smooth cream cylinder with a flat red dome and no material, so it reads as plastic. Raymi at the right edge is a ghost: body and legs semi-transparent and washed to white, overlapped by additive beam blobs, no contact with the gallery, sprite looks pasted. Against Edgerunners @91.25 (huge moon, tiny silhouette, calm) ours is muddy and cluttered. BLOCK: fault.
B1 (ink slab on white): value separation is good, dark violet figure on a bright backdrop disc. But the ink is a faceted low-poly black slab with stepped jagged edges, not a brush. The reference (Hope Is the Thing With Feathers @108.25) is a living brush stroke with wet edges and splatter. The slab passes through her legs and hip with no occlusion logic. Floor shadows are black discs that do not match her pose. Skin is violet-blue, not pale grey-blue.
B2 (crouch, ink bars, red dots): face turned away, eyes blank white, low angle looks up her skirt. The red dots are flat clip-art circles and the two ink bars cross like a UI X. Against Ado Usseewa @98.25 (grit, damaged type, hand-drawn line) ours is clean vector on a clean floor, so nothing is raw.
B3 (void, purple dots, arms spread): she is tiny and cropped at the waist at the bottom edge, from behind, head tucked. About 85 % of the frame is empty black. Blue on black is low contrast, there are no depth layers. Against Hope Is the Thing With Feathers @112.75 (depth, rays, scale) it is an empty stage.
C1 (pillars and teal bars): black pillars on navy have almost no value separation. The teal bars are flat unshaded tubes that read as plastic. Her face is half hidden by hair and she is small. She has no cast shadow or contact with the bars and looks pasted. Against Arcane Enemy @100.25 (rim light, material, one warm accent) ours has none of these.
C2 (low angle, arms spread, speed lines): best frame of the set. Face readable, pose strong, silhouette clear, low angle good. Skin is saturated cyan-blue, not pale grey-blue. Skirt hem blown to white. Speed lines are generic. Background pillars are mush. She floats with no floor contact and no set light on her.
C3 (top-down on teal bars): best depth and most immersive idea (diagonal, layers, bars leading to her). But she is small and seen from behind, blue on dark. The bars are flat-lit tubes with no texture, like a game level.

COLOUR: peaks compete in A1 (white beam, moon, red lighthouse), A3 (white plus red) and C (teal against indigo). Big masses are calm, accents loud, which is right. Shadows are only darkened, not coloured, in B and C. Her skin reads violet or cyan in every frame, which breaks the pale grey-blue rule (strongest in B1, C1, C2).
LIGHT: no single consistent source. In A1, A3, B3, C1, C2, C3 she has no cast shadow and no set-light wrap, so she is pasted on, not standing in the set. Only B1 has floor shadows and they do not match her.
COMPOSITION/DEPTH: A1, B1, C2, C3 have a clear focus. A2 (crop through the face) and B3 (crop at the waist) are awkward crops. Silhouette at phone size is good in B1 and C2, weak in A3, B3, C1, C3.
ASSET QUALITY: no generated backgrounds. A3 has the ghost translucency and white smear on the sprite. A2 and B2 have blown white eyes. Props are flat primitives: lighthouse (A3), teal bars (C1/C3), black slab (B1), red dots (B2), rain bars and speed lines (A1/C2). No texture or wear anywhere.
DETAIL/LOVE: empty stages with a few primitive props, not lived-in. A1 comes closest. The lighthouse in A3 does not read as a lighthouse at phone size.
ONE ARTWORK? No. A painted sprite on low-poly flat props, vector ink in B, clip-art lightning and rain in A1, and A, B, C look like three sets. This is the zusammengeklatscht risk toki named in X5. The brief wants "aggressiv, raw" plus "schoen": these frames are neither raw nor rich.

ROW VERDICTS
A: FAIL. A1 acceptable, A2 unreadable crop with blown eyes, A3 ghost sprite on a plastic lighthouse.
B: FAIL. Strong value contrast, but faceted polygon ink, clip-art dots and the empty B3 void are not raw and not reference level.
C: FAIL. C2 good and C3 has the right depth idea, but flat teal tubes, black-on-navy mush and small hidden faces in C1/C3 are weak.

FIX 1
observation: A3. Raymi on the lighthouse top is translucent, white-washed and overlapped by beam blobs. The lighthouse is a smooth cream cylinder with a flat red dome.
effect: She reads as a ghost and the place as plastic; a viewer sees a mistake.
cause: sprite alpha and blend under the additive beam, no material on the set (09, 02, 12)
change: Render her opaque and unlit. Put the beam behind her, not additive over her. Give the lighthouse stripes, masonry texture and a coloured rim, plus a contact shadow under her feet.
priority: high
level: structural:assets
retest: The A3 still at full size shows no see-through body and the lighthouse reads as stone at phone size.

FIX 2
observation: Her skin is violet or cyan in A1, B1, C1, C2, C3, not pale grey-blue.
effect: She melts into the set and the pale-skin rule is broken.
cause: tint or ambient on the sprite stronger than her painted value (01, 09)
change: Limit the skin tint to about 10 % of the set colour. Use coloured rim light on hair and dress only. Measure skin value against the background and aim for a visible step.
priority: high
level: local
retest: In the frame the skin stays pale grey-blue and separates from the background in grayscale.

FIX 3
observation: A2 is cropped through the face at the nose with white eyes and rings hanging over the lighthouse. B2 also has blank white eyes.
effect: No expression and no hit; reads as a mistake.
cause: framing and eye-highlight overexposure (05, 12)
change: Frame the face with eyes in the top third and the mouth visible. Rings go on her or her eyes. Eyes get an iris and a small highlight, not white.
priority: high
level: local
retest: Eyes and mouth are readable at phone size in A2 and B2.

FIX 4
observation: B1 and B2. The ink is a faceted low-poly slab, red dots are flat circles, the bars cross like a UI X.
effect: Vector clip-art next to a painted girl; not raw.
cause: brush hit built from polygons without edge, wetness or grain (09, 05)
change: Build the ink as a painted brush stroke with dry-brush edge, drips, splatter, grain and damage on the white. Let her occlude the stroke correctly.
priority: high
level: structural:elements
retest: The B stills show brush texture at 100 % zoom and the stroke passes in front of or behind her correctly.

FIX 5
observation: C1, C3 and the A3 props are flat unshaded primitives. Black pillars sit on navy with no separation.
effect: Looks like a game prototype, not a lit world.
cause: no toon lighting, no material, no coloured shadow (02, 09)
change: Give pillars a teal rim and a lit side. Add wear, barnacles, cables and coloured shadows. Lift the pillars about 15 % in value.
priority: high
level: structural:assets
retest: In grayscale the pillars separate from the sea and the props show texture at phone size.

FIX 6
observation: B3 and C3. She is tiny at the bottom edge, from behind, blue on dark; B3 is almost entirely black.
effect: The main element is unreadable and the frame is empty.
cause: scale, no rim, no depth layers (05, 02)
change: In B3 make her at least 30 % of the frame height with the face turned to the lens, and add layers (stars, ink veils, foreground). In C3 add a rim light and a bigger figure.
priority: high
level: local
retest: Face height at least 0.10 of the frame and she reads in the phone-size still.

FIX 7
observation: A1, C2, C3 reuse the same generic speed lines, rain sticks and rings. She has no floor contact in A1, C1, C2, C3.
effect: Template slop, and she floats.
cause: stock effects, no shadow or splash coupled to the set (02, 09)
change: Add ripple, splash and shadow where she touches water or bar. Replace speed lines with hand-drawn lines of varied weight in the palette. Make the hit frame commit (black, white, one colour).
priority: medium
level: local
retest: Contact is visible in the still and the speed lines vary in weight.

FIX 8
observation: Rows A, B, C look like three separate worlds.
effect: Reads as assembled, not one hand.
cause: palette and material families differ (01, 05)
change: Fix one palette (indigo, teal, ink black, one warm accent) and one material rule (matte toon, coloured shadows) for all rows.
priority: medium
level: structural:concept
retest: The 9 stills side by side look like one film.

BLOCK: fault: A3, Raymi is semi-transparent and washed to white with beam blobs smeared over her, and the lighthouse is a plain primitive; a viewer would call it a mistake.
BLOCK: fault: A2 and B2, her face is cut through at the nose and her eyes are blown out white, so there is no readable expression.

Overall: BLOCK: fault. A1, B1 and C2 are acceptable starting points. None of the nine would stand next to the top three of the casebook, and all three rows compare badly with the professional references (Edgerunners, Arcane, Hope Is the Thing With Feathers, Ado Usseewa), because ours are clean, flat and unlit.

VERDICT: FAIL
WORST: A painted girl is dropped into flat, untextured primitive sets with no contact, no set light and a violet skin tint, and in A3 she is a see-through ghost on a plastic lighthouse.

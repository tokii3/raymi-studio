# look-critic on the excerpt stills (boards/motion2, x1-x10), 2026-10-27 - verbatim

MAIN ELEMENT: NOT readable. The hero is Raymi (no heroes.json read; I took her as the main element). She is absent in x4 and x5. She is a tiny silhouette in x6, x7, x9 and x10. In x3 we only see the back of her hair. Only x1, x2 and x8 show a face at phone size. -> BLOCK: fault.

Goal check (0_BRIEF.md: "immersive, aggressiv, raw ... aber auch schön und aesthetisch"): only x8 delivers it. I did not search segments.json, so I name no reference segment.

1. DESCRIPTION
- Dominant colours: night navy (hue ~235, medium saturation, value 10-25%); violet/indigo on Raymi (saturated, value 30-60%); near-black ink shapes. Accents: gold-yellow (x3 and the lighthouse beam), red dots, white dashed rings.
- Light: in the set it comes from the lighthouse beam at the upper left or right. Raymi is lit by a violet wash from no visible source, so it is not the same side or source.
- Eye path: x1 goes to the eyes. x2 goes to the black spikes, then her face. x8 goes to the eyes. x4 goes to the lighthouse and beam. x5 has nothing. In x6 and x7 the black slash comes first. In x9 and x10 the rings come first, then her.
- Layers: foreground rain and rings, subject Raymi, background wave layers and lighthouse.

2. COLOUR
- Calm navy masses plus loud accents is the right plan, but the whole film sits in one dark value band, and Raymi disappears into it (x6, x7, x9, x10).
- x3 (gold/black) is the strongest accent frame, but Raymi is only the back of her hair there.
- x5 is a flat aubergine field with four blue triangles: no colour plan, just emptiness.
- Her skin and clothes are saturated violet (x1, x2, x7), not pale grey-blue (hard rule 9).
- Shadows are blacked out, not coloured. The sea floor in x9/x10 is muddy navy-black.

3. LIGHT
- x9/x10: she stands in the ring, which gives some floor contact. In x9 she is cut off at the waist, with no cast shadow and no beam light on her, so she looks sunk in a hole.
- x10: the violet light column is a flat rectangle with hard horizontal banding (~y 390-550), and her hair turns see-through where it overlaps. This is a render fault.
- x2: the beam is at upper right but her face is not lit from there, so she reads as pasted onto the set.
- x8 is the only frame where the light on her face looks designed.

4. COMPOSITION + DEPTH
- x1: a flat mid-blue backdrop, no set visible, and a stray white tick at ~(1335,425). Empty stage.
- x2: black spikes cover her eye, nose and mouth. At phone size the face is hidden by the effect.
- x4: good depth shot of the lighthouse, but the wrong subject (Raymi is missing).
- x5: blank frame, either a missing asset or a cut with nothing in it.
- x6: she is ~5% of frame height, seen from above, and the black slash dominates.
- x7: she is small and off to one side, the slash cuts through her arm, and the low angle shows the underside of her skirt, which is awkward.
- x8: excellent close-up (tight face, hair framing, downward look into the lens, speed lines). It is the strongest frame of the set.
- x9/x10: too small. In x9 her head is the size of a coin, and she has no lens relationship.

5. ASSET QUALITY + ARTEFACTS
- Raymi 3D: detailed hair. In x1 there is a hair-block edge glitch at left, near (770,290).
- Chromatic fringing in x2/x3 reads as designed.
- The spikes (x2, x3) and the brush slash (x6, x7) are flat black vector shapes with no grain, next to her shaded 3D face. They look like stickers.
- The lighthouse brick texture is a repeated pattern and looks cheap but acceptable.
- x10 beam banding and the see-through hair are artefacts.
- The ripple rings are plain repeating outlines, a wallpaper look.

6. DETAIL + LOVE
- Rings, rain streaks and bokeh dots repeat with no reason for them to be there (no wear, no objects). The sea floor is empty. The lighthouse does read as a lighthouse at phone size.

7. ONE ARTWORK?
- No. Flat paper-layer set, shaded 3D Raymi with a violet wash, and flat black vector effects: three hands. x8 comes closest to unity.

FIX 1
observation: x4, x5, x6, x7, x9, x10. Raymi is missing or tiny (5-15% frame height) in 6 of 10 stills.
effect: She is not the hero in those stills, so nobody is pulled in. This goes against the brief's "reinziehen".
cause: Composition and hero (05); the camera runs away from her.
change: Her face must be at least 0.10 of the frame height in every shot marked hero. Re-frame x6, x7, x9 and x10 to the lens. Put her in x4/x5, or mark them as non-hero transition frames.
priority: high
level: structural:script
retest: A hero-shot sheet shows her face on screen and above 0.10 in every one of these stills.

FIX 2
observation: x5 is a blank aubergine frame with four triangles at the top. x1 is a flat backdrop with a stray tick at its right.
effect: Reads as a missing asset or an empty stage.
cause: Detail and love (06); depth (05).
change: Put the lighthouse, sea layers and rain behind x1. In x5 add a designed element (shards flying past her) or cut the frame. Remove the white tick.
priority: high
level: structural:elements
retest: A random still in x1 and x5 shows depth layers and no empty field.

FIX 3
observation: x2 black spikes cover her eyes, nose and mouth. x3 shows only the back of her hair.
effect: The face is hidden by the effect, so the impact reads as noise, not as a hit on her.
cause: Composition (05).
change: Move the spike burst behind her head or to the chin line so the eyes stay free. In x3 pick the frame where her face is turned to the lens.
priority: high
level: local
retest: In the hit frames her eyes are visible and free of effects.

FIX 4
observation: x10 light column is a flat rectangle with hard horizontal banding (~y 390-550), and her hair is see-through where they overlap.
effect: Reads as a transparency glitch, and the beam is tied to nothing.
cause: Light (02); 3D artefacts (09).
change: Soft gradient falloff with no step edges, sorted behind her hair, tied to a source (a spot from above).
priority: high
level: local
retest: A zoomed still of x10 shows no bands and an opaque head.

FIX 5
observation: Her skin and clothes in x1, x2, x7 are saturated violet, not pale grey-blue.
effect: She merges with the dark set and is no longer her.
cause: Colour (01); hard rule 9.
change: Limit the set tint on her skin so it stays pale grey-blue (value above 60%). Add a gold or white rim light so she separates from the navy.
priority: medium
level: structural:studio
retest: The skin-colour measure stays in the pale grey-blue band, and a grayscale view shows her silhouette against the set.

FIX 6
observation: x9 she is cut off at the waist by a dark ring, with no cast shadow.
effect: She looks planted in a hole.
cause: Light (02), floor contact.
change: Show her whole body on the ring surface with a contact shadow and a reflection around her feet.
priority: medium
level: local
retest: A still of x9 shows her feet and a contact shadow.

FIX 7
observation: The black spikes, brush slash and red dots are flat vector shapes. The set is paper-layer and Raymi is painted 3D.
effect: Three hands in one frame, the assembled look.
cause: One artwork (05/09).
change: Give the ink shapes a paper or brush grain in the same navy palette, and give the set toon shading with a rim in the beam's gold.
priority: medium
level: structural:studio
retest: At phone size nothing reads as a pasted sticker.

FIX 8
observation: x8 is the one frame with a close face, a downward gaze, speed lines and light on the eyes.
effect: It is the only still that reaches "aggressiv, aber schön".
cause: Strong example (05).
change: Use x8's framing as the standard for the other hero shots: face large, eyes lit.
priority: low
level: local
retest: The rest of the motion sheet matches x8's face size.

BLOCK: fault: x4 and x5 have no Raymi at all (x5 is a blank aubergine field with four triangles), and in x6, x7, x9 and x10 the hero is tiny, so she is unreadable at phone size.
BLOCK: fault: x10 has a transparency/banding glitch: the light column has hard horizontal bands and her hair goes see-through where they overlap.
BLOCK: fault: x2 has black spikes parked over her eyes, nose and mouth.

VERDICT: FAIL
WORST: Raymi herself is missing or a few pixels high in most of the stills, so the hero of the video is unreadable and the effects fill the frame.

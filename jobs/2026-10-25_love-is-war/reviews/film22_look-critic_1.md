MAIN ELEMENT: NOT readable in many shots. Judged from the kit (heroes.json not opened; I took Raymi and the lighthouse/beam as the main elements). In full_00 / first_glance she is a small, cut-off blue shape at the frame edge on a near-black field. In full_08 (lighthouse), full_14 and the phone_12 contact sheet she is tiny, hidden behind pillars, seen from behind, or absent. In full_11 she is a violet figure behind dark railings, with the beam brighter than her. At phone size the lighthouse reads (red/white stripes) but Raymi often does not. Close-ups (full_05, full_09, full_03) read well.

1. DESCRIPTION. Dominant colours: near-black navy (hue about 235, low value, large areas), mid indigo-blue waves (saturated, value about 35%), pale lavender-white skin and violet hair (the only bright mass). Accents: red/white lighthouse, warm cream beam and amber gallery rails. Raymi is lit by a cold violet rim; the set has a cream beam from the right/top. The sides differ between shots, so the light is not unified. The eye goes to the brightest shape, either the beam or her face. The final frame (full_15) is pure black.

2. COLOUR. The big masses are calm, which is good, but about 50% of the frames are crushed to black. The shadows are darkened, not coloured, so the set reads as mud (full_08, full_14, full_00 floor). The only warm accents are the lighthouse red and the cream beam, and they compete with her. Her skin goes lavender and cyan-white, which is acceptable pale blue-grey. In the close-ups, though, her hands and arms go dark violet (full_03), which makes her skin look lit unevenly and bruised.

3. LIGHT. There is no consistent source. In full_00 and full_05 she is lit by an even key and rim with no set light and no floor contact. Her feet are not seen, and there is no cast shadow or reflection. In full_05 she floats against a flat gradient wall with random cream dots, so she looks pasted on. In full_11 the beam is bright and she is lit separately, as a violet rim, so it feels like two sources. The black foreground in full_08 swallows everything.

4. COMPOSITION AND DEPTH. Shot to shot the focus changes between a face, a beam, a lighthouse and darkness. In grayscale the set is nearly all black and she is the only bright thing, but in many shots she is cropped by the frame (full_00 head and tail cut off at the top and right, full_14 chopped at the hip). Dutch/low angles and the rail overlaps in full_11 are good depth ideas. In full_08 and phone_12 she is a tiny dot, so the figure-ground ratio fails.

5. ASSET QUALITY. Hair and skin in full_03 have smeared, banded texture, the fingers are blurry, and the nails glow in a blue band. In full_00 and full_05 there are stray white rim halos along her edges. In full_09 the neck and shoulder edge is outlined in white. Raymi's 3D model is flat-lit next to a set with stylised toon edges: a different rendering language. Rain streaks and speed lines (full_00, full_03) are straight vector sticks and read as cheap overlays (the no-vector-overlays rule). The grey-white rock slabs in the phone_12 aerial look like flat paper cut-outs. The purple fan shape in full_06 is an unreadable, out-of-focus foreground blob. The lighthouse in full_08 is soft and blurry with a horizontal moire pattern.

6. DETAIL AND LOVE. The sea waves are repeated, identical seagull-shaped bands (full_09, full_14), which looks like a pattern rather than a place. There are few objects with a reason. The lighthouse with its gallery and lamp (full_11) is the best piece: warm amber, a physical beam, real layers. Everything else is an empty stage, and the black on about 40% of the frames reads as lack of work, not mood.

7. ONE ARTWORK? Partly. The graphic 2D wave layers are a coherent family, but Raymi's glossy 3D model, the 3D polygon rocks and the glowing amber lighthouse are three different hands. The brief promised a graphic 2D world with 3D Raymi around it; what is on screen is dark, low-detail and inconsistent.

BRIEF CHECK (C6 "schön und aesthetisch: stills at random are composed and beautiful, never muddy"): fails. Many random stills are murky black (full_00, full_08, full_14, full_15). C2 aggressive: the look is soft and moody, not hard light or raw grit.

Reference: no segment from segments.json was compared. The comparison below is from memory of the class named in the brief (Chainsaw Man OP / Edgerunners): those use flat, high-value separation of the figure from a mid-tone background, with a hard colour accent, and our frames are far murkier.

FIX 1
observation: full_00, full_08, full_14, phone_12 sheet: Raymi tiny, cropped or hidden; near-black frames (full_15 pure black)
effect: the main element cannot be read at phone size; looks like a rendering error or empty stage
cause: composition / value (05, 02)
change: no shot with her face below 10% of frame height unless it is a designed wide; lift the set base to value 20-30% and keep her the brightest mass; remove the pure-black end hold or put the last star/impact in it
priority: high
level: structural:elements
retest: phone_*.jpg: Raymi visible in every shot that marks hero; a brightness histogram shows the median of the frames above 12%

FIX 2
observation: full_05 / full_00 / full_03: she is lit by her own rim, the set shows no light on her, no floor contact or cast shadow
effect: she is pasted on
cause: light unity (02)
change: one key from the lighthouse beam (cream) on all her shots, a violet fill from the sea; add a contact shadow and reflection on rock/water; skin kept pale blue-grey
priority: high
level: structural:studio
retest: stills with her feet and shadow visible; the light side the same on her and on the rocks

FIX 3
observation: full_03 hands/arms dark violet with a banded glow, full_00 blurry hair
effect: reads as rendering smear, broken anatomy for a viewer
cause: shading / texture (09, 12)
change: raise the skin base to the pale grey-blue everywhere and reduce motion blur on her hands; check the nails glow
priority: high
level: local
retest: full-size crops of hand and hair edges are clean

FIX 4
observation: full_00, full_03: straight vector sticks as speed lines/rain; full_06: out-of-focus purple fan
effect: cheap overlay, violates the no-vector-overlay rule
cause: effects (09)
change: replace with painted/ink brush streaks or physical particles in the set palette; remove the fan blob or make it a readable foreground prop
priority: medium
level: local
retest: no uniform white sticks in the stills

FIX 5
observation: full_09, full_14 repeated seagull wave bands; full_08 rock slabs flat grey-white paper cut-outs
effect: wallpaper and clip-art next to a glossy character
cause: detail / one hand (05, 09)
change: vary wave shapes and scale with depth haze, add foam, reflections of the lighthouse beam; give the rocks the same toon material and coloured shadows
priority: medium
level: structural:assets
retest: look sheet of the set showing varied layers

FIX 6
observation: red/white lighthouse and cream beam vs violet Raymi; the beam is brighter than her in full_11
effect: competing accents; the eye goes to the beam
cause: saturation plan (01)
change: make the face/eyes the highest-saturation, highest-value peak; keep the beam softer or place it behind her as a rim light
priority: medium
level: local
retest: first_glance: the eye lands on her face

BLOCK: fault: Main element unreadable: Raymi tiny/cropped/hidden in full_00 (first_glance, the opening), full_08, full_14 and the phone_12 sheet (many shots in the lighthouse section)
BLOCK: fault: full_15 and large parts of full_00/full_08/full_14 crushed to near-black; looks like a render error; stray white halo outlines on her edge in full_09

VERDICT: FAIL
Faults ranked: 1) main element not readable at phone size, 2) murky black frames, 3) she is pasted on with no shared light, 4) smeared hands/hair and white edge halos, 5) vector-stick overlays, 6) repeating wave wallpaper and flat rocks.
WORST: Raymi, the main element, is too small, cropped or lost in near-black in too many frames, so the film looks unfinished and low-effort.

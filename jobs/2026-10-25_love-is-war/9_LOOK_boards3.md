# 9_LOOK_boards3 - light, colour, materials, post for the 9 key frames of round 3 (look-designer)

toki 2026-10-25: "effekte und assets, beleuchtung, materialien hochwertiger und professioneller, immernoch plastik look,
fuehlt sich komisch belichtet an". Same class: Watch Me "flach und plastik", Beach "keine Materialien", "hinten so hell wie vorne".
Looked at: boards/A1, B2, C1 (round 2), model-sheet face_close, refs edgerunners 0074.25, hsr-hope 0108.25 + 0112.25, arcane sheet_1.
Not opened as single stills: A2, A3, B1, B3, C2, C3 (the critic text covers them). Read: look.tsx, PostFX.tsx, grade.ts, the SetLight calls of the 3 sets.
Her skin as modelled (face_close): pale lavender, lit about #bcc1f0, shade side about #8e8ac8, blush #d8a8d8 on cheeks and lips. That is "pale grey-blue" and stays.

## 1. WHY round 2 reads plastic / oddly lit (causes found in the code and seen in the stills)

1. She is lit by the set hemisphere light, which is coloured. SetLight uses hemisphereLight(sky, ground): NightSea sky #2a3a8a, Deep sky #2c2470.
   A saturated blue light multiplied onto a pale lavender albedo gives saturated blue skin (A1, C1: skin about #4a3fd0, skin and hair the same blue,
   no separation). Set colour lands on her as a TINT over the whole body, not as a rim. This is the biggest "wrong" feeling.
2. Light has no direction on her. Fill 0.35 + a weak key straight from above (keyI 0.55) + a violet ring point light from BELOW at her feet.
   Under-lighting with violet = horror lamp, and nothing from the real source of the world (lighthouse, lightning, cable) falls across her.
   Light motivated by nothing = "komisch belichtet".
3. The toon ramp is grey and uniform: steps 46/122/208/255 multiply the albedo. Shadow = the same hue darker, never a hue shift, and step 46 turns skin into
   dark navy. Painted 2D has coloured shade (pale lavender -> warmer violet). The 4th step is a narrow white highlight band on every material = the plastic specular dot.
4. Props have no contour and almost no texture: lighthouse (A1) and pipes (C1) are smooth flat-colour solids with the same 3-4 hard bands on every face - low-poly
   toys. Her model has painted line art and eyes; the props are CG next to it (critic: "two different sources").
5. Surfaces that are not surfaces: the sea is a black plane with additive decal rings (A1), no waterline on her, no foam, no reflection, no facets, so she stands "in a dark floor".
   The cable/pipe floor is black with cyan blobs. B2 is a threshold posterise of the sprite (cheap filter look).
6. Flat atmosphere: fog colour = sky colour, the horizon is a hard colour line (A1 y=640, A2 stripes); beam, rain, bolt are constant-alpha, constant-width, single-layer
   (rain: same length, same alpha, 1-2 px = no depth; beam: flat wedge; bolt: 3 offset polylines). Nothing nearer-darker / farther-hazier => "hinten so hell wie vorne".
7. Post is a clean 3D render: one bloom at threshold 0.86 on an 8-bit buffer (only pixels already white glow, no halation on coloured lights), no grain, no film response,
   the vignette is an oval (B2 reads as a stock vignette). Clean digital edges everywhere = plastic.
8. Value structure: A1 and C1 sit in ONE value band (5-25 % luminance) with nothing hot except the ring; the refs are 2 values (white mass / black mass), her pale figure in the middle, one thing hot.

## 2. LOOK RULES FOR ALL THREE WORLDS (one hand)

- What we take from the refs: edgerunners@74.25 = pure white mass + pure black mass, her skin the MID value, ONE hard two-step shadow shape on the figure (lit / shade, no gradient).
  hsr-hope@112.25 = near-black grey scene, grey-violet haze, white-violet rim planes on solids, thick coloured beams as the only saturation; @108.25 = tapered, ragged, dry-brush ink on white.
  arcane = painterly coloured shadows, warm light against green/teal haze, texture everywhere.
- Her skin: lit #bcc1f0, shade #8e8ac8 (shade shifts toward warm violet, not darker blue), luminance floor #6f6ab0 at night, ceiling #e8eaff. Set colour reaches her only as RIM
  (1-2 % of her width, hard edge) and in hair/dress. Never as hemisphere on skin.
- Contour on every prop that is ever near her: 1.5 px at 1080p (2.5 px if hero-sized), colour = the shade colour of the prop darkened 55 % (never #000), thicker when nearer.
- Shadow colour (never grey): A #0b1030, B paper shadow #8a7f9a and ink #0b0a10, C #05101c.
- Grades war_night (sat 1.0) and war_ink (0.85) stay; the fix is where colour enters (rim, beam, glow), not the grade.
- Greyscale test for every frame: she vs. her background >= 40 % luminance difference; face never darker than 45 % luminance.

## 3. WORLD A - storm sea at night + lighthouse

Colour script: indigo-black sea and sky (#070914 .. #12142b) as the calm mass, ONE warm hot accent (lamp #fff0cd / #ffd9a0), ONE cold hit (lightning #e8f0ff); violet #9b5cff only as her glow
and a 40 % halo on the bolt. Turn in light: A1 cold white flash on the first hit -> A2 near-black with a white-cyan ring -> A3 the warm lamp beam wins (warm replaces cold).
Refs: A1 edgerunners-this-fffire@74.25 (2 values, flash silhouette), A2 edgerunners@85.25, A3 hsr-hope-feathers@104.25 + @112.75 (gold-white light on a figure, bloom).

- KEY (motivated source per frame, not a sky dome):
  - A1: the lightning, from behind-above-right (bolt at x 62-70 %), #e8f0ff, strength 3.0 (ambient is 0.2) for f0-1, decays to 1.0 over 6 frames, 0.3 after. In the flash she is rim-lit; her FRONT gets a lens-side fill #9fb0e8 at 0.55 that fires with the bolt. Between flashes: moon/lamp bounce #b9c8ff 0.55 from upper-left-back plus a lamp point light #ffe6c0 0.9 from the right.
  - A2: the shout ring is the light: white-cyan #dff6ff point light, strength 1.6, 0.4 m in front of the lens plane, lights the face from front-low (the megaphone idea made light). Rim #9b5cff 1.5 %.
  - A3: the lamp beam, from behind-right toward the lens, #ffe9bd, strength 3.5. She stands at the beam edge: gold rim #ffd27a 2 % on the lamp side, UV #9b5cff 1.5 % on the other. Face front gets a weak fill #7d86c8 0.4, so the face is mid value (#9a9ed8) and clearly darker than the white core behind (face outside the core, x 35-50 %).
- AMBIENT: set hemisphere sky #0e1236, ground #04050c, fill 0.22 (props and sea only). On her: neutral lavender #6f72b0, 0.30. Shadow #0b1030.
- HER GLOW: UV #9b5cff emissive on dots 1.4; a soft pool light on the water around her (violet 0.8, radius 1.2 m, ABOVE the surface, not under her chin). In A1 the pool is wet foam lit from within: warm-white core, violet edge.
- RIM: hard edge 1.5-2 % of her width, fresnel power 3. A1 #e8f0ff; A2 #9b5cff + #dff6ff; A3 gold + UV. No red rim on her (the red is the lighthouse stripe).
- HAZE (distances from lens; camera 0.3-1.5 m for A1/A2, 3.4 m for A3):
  1. Near spray/mist 0.5-3 m: #3a4478 at 10 %, drifting cards at the lens edges, never across the face.
  2. Mid rain veil 3-12 m: #6f7fc8 at 14 %, rain in 3 depth sizes (near streak 2.4 % of frame height, mid 1.2 %, far 0.5 %); near ones blurred by DoF, far ones sink into the haze.
  3. Horizon glow 40-130 m: gradient band #2a3470 -> #5a64a8 centred on the horizon, 6 % of frame height. It kills the hard line and the A2 stripes. FOG colour = this band, not the sky.
  4. The lighthouse sits in layer 3: one value step lighter than the sea, EXCEPT in the A1 flash where it is pure black against #e8f0ff.
- MATERIALS:
  - Sea: toon water, not a plane with rings. 3-value facets #0b1030 / #1a2252 / #3a4a98 (crests) in scrolling noise, fresnel reflection of the horizon band, crest foam lines #dfe6ff 60 %, a hand-drawn white foam collar around her at the waterline, a lamp gloss streak on the water. No contour on water; the foam is the contour.
  - Lighthouse tower: plaster surface + painted stripe, brush bump; contour 2 px; coloured shade side facing the sea #1a2150 on white parts, red stripe shades to #5a1020; lamp glass emissive #fff0cd 2.5 (this is what blooms). Rock: faceted dark #10142c, lit edge #3a4a98 as rim only, contour 2.5 px.
  - Beam: layered cone, 3 shells (core #ffffff 100 %, body #fff0cd 55 %, outer amber #ffb860 25 %), falloff along the length (20 % at 40 m), rain and dust lit only inside it.
  - Bolt: trunk 5-7 % of frame width, core #fff, edge #e8f0ff, violet glow 40 %, edge displaced by noise (not a polyline); 2-frame sky flash with cloud bellies lit from inside.
  - Moon: soft disc with a limb gradient and 20 % glow, clear of the tower (critic FIX 7).
- POST A: bloom threshold 0.78 on emissive only, strength 0.9 in flashes / 0.45 otherwise (lamp, bolt, ring, dots; her skin capped at 0.85 luminance so it never blooms); violet-tinted halation 0.25 radius 0.9;
  DoF focus on the face (A1 1.55 m / A2 0.62 m / A3 3.4 m), range 0.6 / 0.15 / 1.2; grain 0.05 luma, animated per frame; chroma 0.0012 at the edge, 0.003 on f0-3 of a hit; vignette 0.4 in the fog colour; refractive lens drops on A2 (6-9).
  Grade war_night, black point lifted to #0b0d22 (the sea keeps texture).

## 4. WORLD B - white paper + ink

Colour script: paper #ece6da and ink #0b0a10 only; ONE red #d1223a held back (only on the melody head blobs, late); her UV #9b5cff only in her dots. Turn: B1 white page cut -> B2 page exploded by ink -> B3 the page is black and only her light is left.
Refs: B1 hsr-hope-feathers@108.25 (tapered ragged ink on white), B2 ado-usseewa@63.25 / @98.25, B3 hsr-hope-feathers@108.25 + @112.75 (rising light on near-black).

- KEY: soft paper sun, high left-back, #fff4e4, strength 1.2 on B1/B2: she is lit front-left, a firm-edged cast shadow falls right-back on the floor in #8a7f9a (edge softness 0.02). B3: no key; her light is the key (UV #9b5cff 1.2, 1.2 m radius at her chest, plus a point light per big star).
- RIM: B1/B2 white-warm #fff8ee 1.5 % on the back edge so she lifts off black ink; B3 UV-violet rim on the top of her body only (1.5 %), lower body falls to #3a3560, still reads pale because she is the only lit thing on #09080f.
- AMBIENT: hemisphere sky #f4efe4, ground #d9d0c4, fill 0.9 (it is a paper world); on her #cfd2f2 at 0.5 so she stays lavender, not cream. B3: near 0.
- HER GLOW: B1/B2 dots only (emissive #9b5cff 1.2: the only saturated pixels). B3: dots become 60-90 stars; the big six carry a point light each.
- HAZE: no fog. Depth from a floor fade: #ece6da under her -> #d6cdbf at 8 m; a pigment-bleed layer (5 % darker edges around ink shapes). B3: ink floor with a blurred mirror of her light (25 %, a streak under her) and a gradient #1a1830 -> #09080f to the horizon.
- MATERIALS:
  - Paper: paper surface at 2 scales (fibre 0.15 m + wrinkle blotches 1.2 m), bump 0.8, tooth visible in raking light.
  - Ink: edge = 1 px bleed with noise displacement and a 0.4 % feather; dry-brush gaps as in the FX spec; droplets carry one tiny white fleck (wet ink, not a cut-out). Fill #0b0a10. No contour on ink or paper (the edge is the ink). Her model keeps its own line.
  - No posterise of her at all (round 2 B2). She keeps lavender skin: against black ink the white-warm rim, against paper a darker UV-violet rim and the ink-tinted cast shadow so she separates on white.
  - B2 two-tone: duo on the BACKGROUND layer only; her model not duo-ed (her value 55-70 % is the third value).
- POST B: bloom on UV dots and red heads only (threshold 0.9, 0.5); no halation on paper; grain 0.07 (paper grain, makes white a surface); DoF off on B1/B2 (graphic), B3 focus 3 m range 2; vignette 0.25 as a floor-colour burn, not an oval; chroma 0 except 0.003 on f0 impact frames. Grade war_ink, B3 black point #09080f.

## 5. WORLD C - deep sea floor + data cables

Colour script: abyss #05070d, cables #15161f, ONE signal colour cyan-white (#5ef2ff body, #fff core), her UV #9b5cff as counter accent. The round 2 teal pipes and cyan blobs are gone: cables are near-black with a lit core.
Turn: C1 first pulse (white-cyan on black) -> C2 current in her body (white arc on black) -> C3 the lit web, she is the brightest thing.
Refs: C1 arcane-enemy (rim-lit figure against dark haze, glowing veins) + edgerunners@74.25, C2 edgerunners@75.25, C3 hsr-hope-feathers@112.75 (thick coloured beams converging, grey-violet haze, rim planes).

- KEY: the pulse is the key. C1 from behind-low, #dff9ff, strength 3.2 at the flash, 0.6 after; fill from the lens side #8aa0e0 0.4 so the face is mid value, not black. C2: the arc through her arms from below-front, #fff -> #bfeaff, 2.5. C3: she is the hub: key from above-front #cfd2ff 1.0 (a soft cone from the surface), cables glow as side lights.
- RIM: cyan #5ef2ff 1.5 % hard edge on the side facing the nearest bright cable, UV #9b5cff 1.2 % on the other. C2: whole-body rim 1.5 % + vein lines (FX spec). Cyan never on her skin.
- AMBIENT: set hemisphere sky #151a38, ground #04060c, fill 0.18; on her neutral lavender #6a6eb0 0.28. Shadow #05101c. This replaces the Deep default sky #2c2470 + key #8f8cff that turned her blue.
- HER GLOW: dots and fin tips 1.5 emissive; C3 the current runs cyan -> violet into her dots; aura 1.8 m radius #cfd2ff 0.8.
- HAZE (camera 1.3-4.2 m):
  1. Marine snow 0.3-4 m: specks 0.3-1 % of frame height, #9fb0e8 20 %, 3 sizes, nearer = bigger and blurrier.
  2. Silt veil at floor level 0-0.8 m: #1a2a44 at 18 %, drifting; it turns #5ef2ff 25 % along the pulse path (visible volumetric light).
  3. Far haze 20-70 m: #0b1230 -> #1c2a5c: far is HAZIER and a bit lighter than the near floor; near floor and rocks are the darkest (foreground dark, subject lit). Fog 7-45 m, colour #0b1230 (not the dark violet #0e0a26).
- MATERIALS:
  - Cables: thick armoured conduit: rubber ridges at 0.15 m, body #15161f, shade #0a0c18, lit edge #3a4a68; radius 0.2 m; contour 2 px #0a0c18 only where it overlaps lit haze; the core is a separate emissive tube (white-cyan) inside a translucent sleeve, ridges lit from within; pulse = bright front + long tail + wide halo (cable_halo 6 % of frame width, 25 %).
  - Rocks/floor: plaster surface + silt noise at two scales, base #0b0f1c, rim #1c2a5c where cable light hits, contour 2.5 px on large near rocks only. Pebbles and a thin silt layer, never one black plane.
  - Nodes (C3): dark metal, lit rim, emissive ring.
  - Contact (C1): cyan glow 0.9, 0.25 m radius where boot meets cable; cable darkens under her feet; AO colour #05101c.
- POST C: bloom threshold 0.7 (glow world), 1.1 on pulse frames / 0.6 otherwise, radius 0.8; cyan-white halation 0.3; DoF focus 1.4 m (C1) / 1.3 (C2) / 4.2 (C3), range 0.9 / 0.6 / 3.0 (the web stays readable); grain 0.06 luma; chroma 0.004 on f0-4 of a hit, 0.0012 otherwise; vignette 0.5 in #05070d; faint surface light shafts #9fb0e8 6 % in C3. Grade war_night, abyss black point #05070d + 3 %.

## 6. Per frame

| frame | light idea | hot / 2 values | her read |
|---|---|---|---|
| A1 9.36 | lightning from back-right; lens-side fill fires with it; sea blown to white foam | sky #e8f0ff vs lighthouse + rock pure black | pale face #bcc1f0 on a blown sky: darker than the sky, brighter than the sea, white rim |
| A2 62.6 | the shout ring lights her face from front-low | storm black vs ring white | face lit by her own ring, UV rim; claws lit by the ring |
| A3 ~155 | lamp beam from behind-right, gold + UV rims, white-gold wedge 65 % | lamp disc white vs sea black | face mid value in the fill, outside the white core |
| B1 9.36 | paper sun front-left, hard cast shadow falls through the slash | paper vs ink 2 values | warm rim on the black half, UV rim on the paper half |
| B2 62.6 | same sun; ink blot with a paper-white hole at the face | duo background, she is the third value | face in the hole; melody stroke behind her |
| B3 ~165 | her dots + 6 star lights, UV rim on top only | near-black + stars | glossy ink floor mirrors her light (contact) |
| C1 9.36 | pulse from behind-low, white-cyan | black abyss vs white-cyan line | pale figure on a white-hot line, boot contact glow |
| C2 120.4 | the arc through her arms lights her from below | white arc vs black | face lit from below by the arc, cyan rim 1.5 % |
| C3 ~165 | soft top cone on her + glowing web | black + 7-9 lit cables, she is brightest | aura 1.8 m, cables converge on her |

## 7. STUDIO CHANGES (shared, for ALL later videos, not per shot)

1. Hero lighting rig separate from the set (look.tsx + her renderer). The set hemisphere must stop tinting her. She gets her own light group: neutral-lavender ambient (#6f72b0, 0.3),
   a key slot (colour, direction, strength per shot, from the motivated source of the set), a fill slot and a hard fresnel RIM slot (colour, width 1-2 %, power 3). Her MToon shade colour = hue-shifted lavender (#8e8ac8) with a luminance floor (#6f6ab0).
   Way to build: light layers / light groups, or clamp the set hemisphere on her materials. Removes causes 1, 2, 3 in every video.
2. toon() v3 (look.tsx): the ramp carries COLOUR (per-material shade and lit colour, 3 steps, no white highlight band); an inverted-hull OUTLINE option (width in px, colour = shade darkened 55 %, thinner with distance);
   triplanar world-space surface textures at 2 scales + painted brush bump, so no 256 px tile repeats and not the same pattern on every face. Removes causes 3, 4.
3. Atmosphere kit in SetLight (depth 2.0): fog colour separate from sky/background; height fog + horizon glow band; 2-3 volumetric cards (near / mid / far) with depth-scaled streaks; beam shells with falloff.
   Enforce "near darker, far hazier" as a depth ramp (foreground x0.7, background lifted to the haze colour). Removes causes 5, 6 and the "hinten so hell wie vorne" fault.
4. Water + floor surfaces: a toon-water component (facets, fresnel reflection, foam collar around standing characters, lamp gloss streak) and a wet/ink floor (blurred mirror + contact streak) for NightSea and Paper B3.
   Replaces plane + decal rings and gives contact (critic FIX 5).
5. Film post v2 (PostFX.tsx): bloom on emissive only with colour-aware halation (skin capped below it), animated luma grain, floor/fog-coloured vignette (never an oval darken), edge-weighted chroma with a hit-frame spike,
   lens-drops overlay, black-point lift in the grade. Half-float buffer with a NaN guard in place of the 8-bit workaround where possible. Removes cause 7.
6. If it fits: an impact-frame mode (one switch: background duo, her NOT duo-ed, 2-3 values on purpose). Addresses cause 8.

## 8. Retest checklist (look-critic on the test stills)
- Greyscale thumbnail: she is found in 1 s; she vs background >= 40 % luminance.
- Cheek sample: hue 235-250, saturation < 35 %, luminance 55-85 %: not saturated blue, no burnt white on face or skirt.
- A prop at 200 %: contour, texture at two scales, coloured shade (not grey), no visible tile.
- Foreground darker and background hazier in each frame (a vertical strip must change in value with depth).
- No flat white specular dots; no thin uniform lines (rain, rays, cables): 3 depth sizes.
- Impact shots: 2 values, saturation only on the main element and her dots.

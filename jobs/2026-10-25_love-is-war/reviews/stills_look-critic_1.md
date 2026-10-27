# look-critic on build stills round 6 (boards/build6, m01-m21), 2026-10-27 - verbatim

MAIN ELEMENT: Raymi is readable in the close-ups (m05, m07, m09, m10, m11, m12, m18, m21) but not in the wide and mid shots. She is a few percent of the frame in m14 moon (head about 150 px of 1080), m16 landing and m17 false win, and the face is blown out in m06. m19 final build and m15 hidden stop barely show her at all. No heroes.json exists, so I took Raymi (face and eyes) and the lighthouse as the main elements. The lighthouse reads well as a landmark. The Raymi failures below are BLOCK: fault.

I read the full-size stills m01 to m21 in C:\raymi-studio\.claude\worktrees\priceless-davinci-3715bd\jobs\2026-10-25_love-is-war\boards\build6 and 0_BRIEF.md. I did not read the craft modules or CASEBOOK, and I did not grep segments.json. So I name no reference segment, and the bar comparison below is from memory of Chainsaw Man OP, Edgerunners "This Fffire" and Arcane "Enemy".

1. Description
- Dominant colours: night navy (hue about 235, low saturation, very low value) over most frames. Violet and indigo for her hair and dress (high saturation, mid-dark). Pale lavender-white for her skin, which clips to pure white in several shots. The accents are warm gold or cream (beam, lantern, moon, wood), the lighthouse red, and a flat crimson in m18, m19 and m20.
- Light: the set is lit from one side, with the lighthouse beam as the key. Her own skin is lit almost frontally, which is not the same logic as the set. The rim light is a lavender glow on her hair.
- Eye path: first to the brightest area. That is her face in the close-ups, but the beam or the moon in m08, m14 and m19. Last to the dark foreground.
- Layers: foreground is rain streaks, ink and sparkles. The subject is Raymi. The background is stylised wave bands, the lighthouse and the moon.

2. Colour
- The calm navy mass with warm accents is right and has a clear plan. The gold flip in m08 and the black and amber of m10 are strong colour moves.
- Her skin is not stable. It is pale grey-blue in m04, m07 and m21. In m06 and m18 it clips to white, and in m17 and m19 she is overpowered by blown-out light. That breaks the "skin stays pale grey-blue under any light" rule.
- m18 to m19 hold a flat crimson plus blown white. It reads cheap and flat, not like coloured shadows.
- m12, m19 and m20 hold flat colour blocks (a purple column, a salmon and white blowout) with no grade inside the block.

3. Light
- Strong shots: m07 (beam, rain and a lit lighthouse, she is in the set), m14 (moon behind the lighthouse) and m21 (warm wood against her cool skin).
- m12 shows her in a ring of ripples with no cast shadow. In m14 the ripple ring reads as a sticker. She stands in water, but the ring is drawn as flat white dashes.
- m16 and m17 show a ring of white dashes floating around her that does not belong to any surface. The ring is a clip-art power aura and the water behind her has no depth.
- m17: she is backlit with no face visible, tail only, and the glare eats her outline.
- Contact shadow under her feet is missing in most wide shots.

4. Composition and depth
- Good: m04 (symmetric, centred, a clear silhouette with arms open) and m07 (centred, beam as a horizon, the lighthouse behind her head).
- m12 is a faulty composition. A flat purple and white rectangle hangs above a tiny top-down Raymi. It reads like a placeholder bar, not a light pillar.
- m14 is beautiful and atmospheric, but she is a speck. It works as an establishing frame and fails as a hero shot.
- m19: the frame is almost fully blown out and the subject is cropped at the bottom edge (only hair visible). The main element is missing.
- Greyscale: m04, m07, m10 and m21 hold figure and ground. m16, m17 and m19 collapse into mid-grey masses.

5. Asset quality and AI artefacts
- m03: the face and dress are visibly soft, upscaled and blocky (compression halos on the hair edges). It looks low resolution next to the sharp m05.
- m02: the heavy blur is a deliberate motion smear, but the face stays unreadable the whole shot.
- m05 and m18: the black slash lies across the mouth and lower face. In m18 it removes the mouth from an expression the scene needs. The slash gag is not a fault in itself, but it parks over the face.
- m10 and m11: black spikes pointing at the eyes. At phone size they cover the eyes and nose in m10 and read as a fault, not as impact.
- m09, close-up on the nose with spikes: skin is smooth and untextured, the nostril shape reads as a hole.
- m13: black and white triangles hover over her head with no reason, and the face behind is smeared.
- m06: the face is blown to white with only the line art left. This is the clearest case of skin colour lost.
- Hair edges in m05, m10 and m11 show light halos where the hair meets the background.
- m10: the red dots with a bar read as clip-art.

6. Detail and love
- The world has a clear voice. A stylised storm sea, a lighthouse with a red band, moon and beam, a lantern deck with wood. m17 and m21 show the lantern room with planks and rails, and m21 is the most lived-in frame.
- Rain, ripples and dust give it life, and the black ink plus the spike bursts are a consistent graphic language.
- The sea waves are repeated tiles of the same wave shape (m04, m09, m10, m16). At full size they look like cut paper strips, not water. The sea floor in m12, m14 and m16 is an empty navy field.
- Props read at phone size: the lighthouse yes, the lantern deck yes (m17, m21). The purple pillar in m12 does not.

7. One artwork?
- Mostly yes. Navy, gold and ink black form one family. The weak part is her render: she is a clean 3D toon surface next to textured painted waves. The skin and hair are strong, but the set is not at her level (flat tiles, no texture).
- The effect layers (white dashes, spikes, triangles, flat pillar) are the "assembled" feel. The best frames (m04, m07, m14, m21) are the ones where the effect is quiet.

Bar check: next to Chainsaw Man OP, Edgerunners "This Fffire" and Arcane "Enemy", the close-ups and m07, m14 and m21 hold up in mood. The blown-out frames (m06, m18, m19, m20), the flat-colour frame m12 and the soft m03 look cheaper than any of them.

FIX 1
observation: m06 (riser eyes), m18 (scream), m19 (final build). Her face and skin clip to pure white. In m19 she is not recognisable at all.
effect: it kills the "pale grey-blue skin" rule and the main element. A viewer sees overexposure, not a fierce peak.
cause: exposure and bloom on the hit (modules 01 and 02), no skin-protect.
change: cap skin luminance at about 85 percent, so the face stays lavender grey and eyes and mouth stay drawn. Do the flash on the background, not on her. In m19 keep a visible face or silhouette in the lower third.
priority: high
level: local
retest: measure the face region in m06, m18 and m19: no more than 2 percent of the pixels at 255, and the line art of the eyes visible at phone size.

FIX 2
observation: m14 (moon), m16 (landing), m17 (false win), m12 (pillar). Raymi is small, with head height below about 10 percent of the frame.
effect: the hero cannot be read at phone size, and the viewer has nothing to follow. The brief's min_face_h_median 0.10 is not met in these.
cause: wide framing and no figure-ground lift (module 05).
change: either stay wide for one beat (m14 alone, with a warm rim on her head) and cut to her, or push in until head height is at least 15 percent. Raise her value against the navy with a rim light.
priority: high
level: local
retest: the face-height median over the film is at least 0.10, and every wide shot holds under 1.5 s.

FIX 3
observation: m10 (colour flip) and m11 (lens attack). Black spikes cover her eyes and the bridge of her nose. m05 and m18: the black slash parks across her mouth. m13: loose triangles over her head.
effect: a viewer reads the effect as a mistake on the face, not as a hit. In m10 the spikes cut into the eyes, which is the one thing that must stay clear.
cause: effect placement (modules 05 and 09).
change: aim the burst so every spike ends 20 to 30 px short of both eyes. Slash and ink go behind or beside the head, never over eyes and mouth. Show the slash only while the face holds a clear expression.
priority: high
level: local
retest: the eye boxes have zero overlap with effect pixels in m05, m10, m11 and m18.

FIX 4
observation: m12 (pillar) shows a flat purple and white rectangle with no grade, no glow and no falloff. The rings around her are flat dashed stickers (m12, m14, m16, m17).
effect: it reads as a placeholder or clip art next to the lit lighthouse and the beam. It is the cheapest-looking frame.
cause: effect build without light falloff or depth (modules 02 and 09).
change: build the pillar as a light volume (gradient to transparent, soft edges, particles, a bloom on the base). Put the rings flat on the water surface with perspective, a fading alpha and a small splash at the contact point.
priority: high
level: structural:studio
retest: the pillar and rings pass the greyscale and 50 percent zoom check without hard rectangle edges.

FIX 5
observation: m03 (hit 1, cable). Her face, dress and hair are soft and blocky, a lower resolution than m05 or m21.
effect: it looks like a scaled-up asset and costs the "love for detail" at the first hit.
cause: render scale or a low-resolution source for that shot (module 09).
change: render the shot at full scale and check the sharpness against m05. If the cause is a motion blur or zoom, keep the blur on the background only.
priority: medium
level: local
retest: m03 edge sharpness matches m05 (same hair-edge gradient width).

FIX 6
observation: the sea in m04, m09, m10, m16 and the empty navy floor in m12, m14 and m16. The same wave strip repeats. White dash highlights float on flat bands.
effect: it reads as cut paper tiles, not a storm sea. The beauty of m14 and m21 is not carried by the rest of the world.
cause: asset variety and texture (modules 05 and 09).
change: vary the wave shape and scale per layer. Add foam lines, a dark-to-light value gradient toward the horizon, and a few reflections of the beam and moon. Give the floor around her a wet sheen or paper grain.
priority: medium
level: structural:assets
retest: three wave layers visibly differ in shape, and a random still shows depth (haze) in greyscale.

FIX 7
observation: m15 and m17. The rings float around her with no surface. In m17 she is a backlit silhouette against the beam, with the tail visible and no contact shadow on the wood floor.
effect: she looks pasted in front of the light, not standing in it.
cause: missing contact shadow and bounce light (module 02).
change: add a soft contact shadow and a warm bounce from the wood floor on her legs. In m17 keep a cool rim on her outline so the silhouette separates from the glare.
priority: medium
level: local
retest: floor contact visible in m15 and m17, and her outline separates from the beam in greyscale.

FIX 8
observation: m18 and m19 use a flat crimson with white. m18 reads strong, m19 washes to pink and white with no clear point of interest.
effect: it is the one colour move that is not on the navy, gold and ink palette, and it ends on a blank frame.
cause: colour script (module 01).
change: keep m18's crimson as the one loud accent, but add a dark vignette and a deep crimson shadow. In m19 pull the exposure back, so the build rises to the last hit and does not start already blown out.
priority: low
level: local
retest: m19 has at least three value steps and the face is visible.

BLOCK: fault: m06 and m18, the face and skin clip to pure white and her skin leaves pale grey-blue. In m19 she is almost invisible, a blown-out frame with only hair at the bottom edge.
BLOCK: fault: m14, m16, m17 and m12, the main element (Raymi) is too small and not separated by value, so it is not readable at phone size.
BLOCK: fault: m10 and m11, black spikes cover her eyes and nose, and in m05 and m18 the black slash parks across her mouth.
BLOCK: fault: m12 reads as an unfinished placeholder (a flat purple and white rectangle with floating dash rings), not a built light pillar.

VERDICT: FAIL
WORST: Her face is blown to white or covered by effects, and she is a speck in the wide shots, so the main element is often missing or unreadable (m06, m12, m14, m18, m19).

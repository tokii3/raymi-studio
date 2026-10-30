MAIN ELEMENT: NOT readable in several shots. No heroes.json exists for this job, so I took the main element to be Raymi, face first, with the lighthouse as the story prop. I judged from first_glance.jpg and full_00, 01, 03, 05, 06 and 08. I did not open phone_*.jpg, gray_*.jpg or seq_*.jpg individually, and I did not read 0_BRIEF.md or toki.md. I could not check the Love is War brief.
- first_glance.jpg: Raymi is cut off at the top-left edge. Only her legs and skirt show, tiny and dark. The lighthouse is the only readable object. Raymi's head and face are out of frame.
- full_00: Raymi is seen from behind in a crouch, with her face hidden by hair. Her body is dark purple on a near-black floor, so it is hard to tell what she is doing.
- full_01: Raymi is a tiny, blown-out blur behind the lamp-room railing. The white glow and the rain streaks eat her.
- full_05: Raymi is in profile from behind, small, with a dark railing slicing diagonally across her body.
- full_03: The head is placed well and readable. The face is a blown-out white patch with almost no features.
- full_08: Face readable and lit, the best shot. Eye and nose read well.
- full_06: Raymi is not in the shot. It is an empty sea-floor with a floating white disc.

BLOCK: fault: first_glance and full_00 show Raymi with her face out of frame or hidden. The main element is unreadable at phone size.
BLOCK: fault: full_01 shows Raymi as an unreadable white smear behind the railing and the rain streaks.

DESCRIPTION
- The dominant colours are:
  - deep navy, near-black, low value and mid saturation;
  - periwinkle blue, as the wave edges;
  - a warm cream-white beam and lamp, high value and low saturation.
- Raymi's hair is violet-purple.
- The light comes from the lighthouse beam at the upper right (full_01, full_03). On Raymi the rim and fill come from the front or left. The side does not match the set: her face is lit from the front while the set is lit by a beam from the right.
- The eye goes to the red-white lighthouse stripes in first_glance and full_00, or to the glowing lamp in full_01, instead of to her.

COLOUR
- The whole film is the same navy. The only accents are the lamp beam and the red stripes.
- The saturation peak competes with her. The red-white tower and the white beam are louder than her.
- Her skin reads white and lavender, not pale grey-blue. It is blown out in full_03 and full_05.
- The shadows are just darkened navy, near-black. There are no coloured shadows, and the mass is muddy and crushed.
- full_06 has a beige beam in grey sand with no accent.

LIGHT
- The beam is a plausible source, but she doesn't receive it in a consistent way. In full_00 she has bright purple rim lighting with no visible source and no contact or cast shadow on the floor. She looks floating or pasted on.
- In full_05 she stands next to the railing without grounding. The beam fog flattens everything.
- full_08 is the only shot where the light on her, a cool rim on a dark background, feels intentional.

COMPOSITION AND DEPTH
- first_glance has an awkward crop through her at the top edge. A large dead black floor takes up the lower half.
- full_00 puts her in the lower right corner on a black void. The diagonal arms read as a pose, but the floor is empty.
- The railing and the poles in full_01 and full_05 cross her body and hide her.
- In grayscale she merges with the dark ground in full_00 and full_05, because the value contrast is poor.
- full_03 and full_08 are the best-composed shots.

ASSET QUALITY AND ARTEFACTS
- Raymi is rendered as a 3D model, with MMD-like hair. It has a stiff plastic sheen and a flat white face with a crushed-white highlight. The skin is texture-smeared.
- In full_00 the skirt and legs look chaotic: a hole or fold in the white skirt, and a body twist that is hard to read.
- The rain is a set of flat white straight bars. They look like clip-art and are mismatched in scale, and they float across the lens in full_01 and in front of the face.
- The wave layers are flat stacked cutouts with a jagged zigzag edge. They read as paper or wallpaper, not as sea.
- The lighthouse base in full_00 is a murky black blob where it meets the water, with no foam or reflection.
- In full_06 the seaweed stalks are thin, with pale pink-grey poles. The moon is a flat disc and the floor has a long thin black streak.
- Ground bubble rings are flat ellipses.

DETAIL AND LOVE
- The set is mostly an empty stage. The sea is layered strips and the floor is a black void.
- The lighthouse is the best-designed prop. It has stripes, a window and a gold railing. It reads as a lighthouse at phone size in first_glance.
- The lamp room in full_01 is detailed and has love in it.
- Nothing else is lived-in, and nothing makes the place feel specific.

ONE ARTWORK?
No. A toon 3D MMD-style girl, a flat paper-cutout sea, clip-art rain bars and a realistic volumetric beam come from four different hands. The beam in particular is a photoreal fog on a flat-shaded set.

FIX LIST
FIX 1
observation: first_glance and full_00: Raymi is cut at the top edge, or crouched with her back to camera, in the corner of a black void.
effect: The viewer can't see who or what the hero is. The face carries the emotion and it is missing.
cause: Composition and hero framing (module 05).
change: In every shot that carries the hero, keep the face fully in frame and at least 12 percent of frame height. Put her on thirds, not in a corner or cut off by the edge.
priority: high
level: structural:elements
retest: A phone-size frame shows face and eyes in every hero shot.

FIX 2
observation: full_01 and full_05: beam glow, railing bars and rain overlap Raymi. She turns into a white blur.
effect: She is lost. In full_01 the lamp gets all the attention.
cause: Figure-ground and value separation (modules 02 and 05).
change: Move the camera so no bar or rain streak crosses her face or body. Cut the glow near her. Keep her value at least 25 points above her surround in grayscale.
priority: high
level: local
retest: gray_*.jpg shows her silhouette clearly separated.

FIX 3
observation: Everywhere the floor and the sea are almost black. Her shadows are only darkened navy, with no cast shadow or contact on the floor in full_00.
effect: She looks pasted on. The film is muddy.
cause: Light and colour (modules 01 and 02).
change: Add a visible key and cast shadow from the lamp beam on her and under her feet. Make shadows coloured (teal or violet) and lift the floor to mid-navy so the shape reads.
priority: high
level: structural:studio
retest: Contact shadow visible in every wide shot.

FIX 4
observation: Rain is flat white bars. The waves are flat stacked strips. Together with the realistic beam they look like clip-art.
effect: The film looks assembled from four different sources and cheap, with no craft.
cause: One artwork and asset quality (modules 09 and 12).
change: Make rain thinner, in the set's blue, and use fewer, softer drops. Give the sea volume with foam and reflections. Make the beam toon-stylised (hard-edged cone) to match.
priority: medium
level: structural:assets
retest: The rain no longer reads as a bar overlay at phone size.

FIX 5
observation: Her skin is blown out to white in full_03, full_05 and full_08. The face has almost no features.
effect: The skin reads white, not pale grey-blue. The painted look is lost.
cause: Colour and light (module 01).
change: Cap skin value at about 80 percent and push it toward grey-blue. Keep the hard rim on the hair and a soft fill on the face.
priority: medium
level: local
retest: A face crop shows eyes and mouth with measured skin hue in the grey-blue range.

FIX 6
observation: full_06 has an empty seabed with a floating white disc and a long black streak. Raymi is absent. first_glance has dead floor in the lower half.
effect: This is a wallpaper stage with no story.
cause: Detail and love (module 05).
change: Add props with a reason, such as footprints, a rope, a lantern or a buoy. Fill the floor with texture and wear. Give the lighthouse base foam and reflection.
priority: medium
level: structural:elements
retest: Every wide shot shows at least three set pieces with a reason.

VERDICT: FAIL

Faults ranked:
1. Hero unreadable (face out of frame or hidden): first_glance and full_00.
2. Hero smeared behind the railing, beam and rain: full_01 and full_05.
3. Pasted-on lighting: no contact shadow, the light on her doesn't match the set.
4. Mixed styles: paper-flat sea and clip-art rain bars next to a photoreal beam.
5. Skin blown out to white and a crushed black floor.

WORST: The face of the main element is mostly off-frame, turned away or smeared by white glow, so the viewer can't see Raymi in the very shots that should introduce her.

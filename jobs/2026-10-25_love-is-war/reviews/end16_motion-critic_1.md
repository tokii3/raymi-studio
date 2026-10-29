MAIN ELEMENT: not readable. Raymi is the hero, and in the sequences I looked at (seq_00, 03, 06, 08, phone_05) she is tiny, dark violet on dark navy, or cropped out of frame. I did not open heroes.json or facts/hero.json. BLOCK: fault.

Scope: I viewed seq_00, 03, 06, 08, first_glance and phone_05. I did not view seq_01/02/04/05/07/09, so those stretches are unchecked. I read no heroes.json, shots.json or pairs/*.jpg and grepped no reference segments, so there is no reference comparison. The facts.json duration (67.2 s) does not match its shot list (up to 186 s), so I could not map timestamps. I name sequences instead of seconds.

1. Does Raymi move, and does the camera travel?
- seq_00: she drops in from the top edge, is cropped (head and body out of frame in the first frames), then sits in a crouch at the lower right. After the drop she barely changes pose. The camera is a slow push on a flat layered set (lighthouse, wave bands, ripple rings). There is a little parallax from the wave layers, but it reads as a zoom on a painted picture.
- seq_03: she sits still at the rail for 6+ frames. An orange slab then fills the frame (frames 7-11) and covers most of the picture. She is about 1/8 of the frame height in the later frames. This stretch is nearly dead, with only a small drift.
- seq_06: a seabed fly-through. Rocks and kelp pass at different speeds, so there is real parallax. Raymi is not in it at all, so this is an empty stretch. It is also very dark and low in contrast.
- seq_08: a long, static lighthouse establishing shot (~8 frames), then a white flash, then a smooth orbit round the lamp. Raymi is a tiny blob at the right edge, around 5% of frame height. The orbit travels well, but she is not the subject.

2. Fast moves: I saw no smear or stretch frames. Her drop is a clean interpolation with no overshoot or settle. The picture change on beats is only 2 of 29 hits (7%).

3. Icons and words: none seen in what I viewed.

4. Broken:
- The orange slab (seq_03) is a flat, saturated, unlit polygon that reads as a glitch.
- Black occluder shapes (rails, a black box in phone_05) cover her.
- The lamp in seq_08 is a flat white ellipse card.
- The sea-floor is dark navy mud.

5. Fixes follow below.

BLOCK: fault: seq_03 and phone_05, an opaque orange slab fills 60% of the frame for about 5 frames and black rails or boxes hide her. They read as geometry errors, and she is lost.
BLOCK: fault: seq_00 and seq_08, Raymi is cropped out of frame at the start, then tiny and dark violet on navy. She is not readable at phone size.

FIX 1
observation: seq_03, seq_06, seq_08. Raymi is about 5-12% of frame height, dark on dark, sometimes absent.
effect: the hero is lost, so there is no immersion or attack. The brief wants "reinziehen" and a median face height of at least 0.10.
cause: camera framing, value separation (modules 00 and 04).
change: put her face at 15-25% of frame height. Add a rim light so she is at least 30 L brighter than the background. Keep her in every shot, and never put a black or orange occluder between the lens and her.
priority: high
level: structural:concept
retest: phone_*.jpg shows her face clearly, and hero.json contrast is above the threshold.

FIX 2
observation: seq_06 and seq_08 (establishing). The empty seabed and the static lighthouse run for many frames.
effect: dead time. A slideshow of sets is not a Raymi video, and it is the opposite of "aggressiv, raw".
cause: shot content and holds (module 04).
change: cut the empty fly-through to 1 s or less, or fill it with Raymi swimming through it. Cut the static lighthouse hold to 6 frames.
priority: high
level: local
retest: no stretch over 1 s without Raymi in frame.

FIX 3
observation: seq_00. Her drop has no anticipation, no squash and no settle. Beat hits change the picture only 2 of 29 times.
effect: floaty, and not on the beat.
cause: timing and spacing, smear (module 04).
change: add a 2-3 frame squash on landing, a smear on the drop, and a held key pose. Add a camera shake or cut on each of the 29 hits.
priority: high
level: structural:studio
retest: picture_change_on_hits share of at least 0.5.

FIX 4
observation: seq_03. A full-frame orange wipe or flash.
effect: it looks like a shader bug, not a designed impact.
cause: effect design (fx).
change: if it is an impact, make it a 2-frame two-tone hit with Raymi in front. Otherwise remove it.
priority: medium
level: local
retest: no flat polygon fills the frame in any frame of the strips.

FIX 5
observation: seq_08, the lamp ellipse and the flat sky.
effect: it looks like a flat cutout, not a glowing lamp.
cause: look (module 06).
change: use a soft emissive glow with bloom, and put a rim on her.
priority: low
level: local
retest: the lamp has a gradient falloff.

VERDICT: FAIL
Faults, ranked: (1) Raymi unreadable, tiny or absent; (2) orange slab and black occluders; (3) dead empty stretches (seq_06, seq_08 opening); (4) no acting polish or beat sync.
WORST: Raymi herself is hard to see, dark on dark and tiny or missing, so it plays as a tour of sets, not a Raymi video.

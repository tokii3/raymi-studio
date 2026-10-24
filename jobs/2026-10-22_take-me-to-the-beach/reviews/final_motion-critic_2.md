MAIN ELEMENT: not readable in several places. The heroes are the postcard and the globe (prop). `facts/hero.json` marks 11 of 46 sampled frames unreadable, and I have not seen the postcard or globe frames myself, only the numbers.
- Postcard, shot 23 (frames 810-885, about 27-29.5 s): 20-30 px, value separation 0.00, detail near 0. It melts into the background.
- Postcard, shot 24 (frames 930-960, about 31-32 s): unreadable.
- Postcard, shot 75 (frames 4095-4110, about 136.5-137 s): 7-13 px, too small.
- Postcard, shot 28 (about 37 s): readable by the flag, but only about 18-21 px with separation 0.04, so it is marginal.
- Globe, shot 22 (frames 735-795, about 24.5-26.5 s): flagged readable at about 79 px, but separation is 0.007-0.009. It is nearly the same value as the background.

BLOCK: fault: 27-32 s (shots 23-24) and 136.5-137 s (shot 75). The postcard, a main element, is a tiny shape with no value separation, so it is unreadable at phone size.

Coverage: I viewed `seq_00`, `seq_03`, `seq_06` and `seq_09` plus `first_glance`. I did not open the other six `seq_*` sheets or any `phone_*` image. The statements below rest on those four short windows, and only the opening sheet was seen in full.

1. Per sequence
   - 0-2 s (`seq_00`): Strong. Raymi's pose changes at 0.083 s, then she holds her arms out on 2s. The camera whips with speed lines and blur, then dives down through the office into a top-down bedroom view with a smeared fall. The camera really travels in space.
   - `seq_03` (about 2 s from its start): Raymi is seen from behind and holds still. The camera, headphones and text barely move. This is a near-dead stretch of about 1.5 s. A hard cut to the plane follows.
   - `seq_06`: Raymi's face is held on a close-up for 0.58 s with only a blink-level change, then a cut to the underwater set. The lyric words "give / me / some / space" build in word by word. That works, but they grow smoothly rather than overshooting.
   - `seq_09`: Raymi stands tiny and static on the platform for the whole 2 s. The camera drifts and gives a little parallax from the stars and mushrooms, but Raymi does not move. This is a dead stretch.
   - `still_spans_s`: The only measured one is 156.6-158.6 s, and it is probably the end card.
2. Fast moves: The opening has smear and blur frames and is snappy. I can't judge the others from what I viewed.
3. Icons and words: The lyrics pop in word by word on the beat. I saw no overshoot.
4. Broken:
   - At about 1.333 s in `seq_00` the frame blurs heavily, which reads as a deliberate smear.
   - Raymi is very small at `seq_09`, and the scale jump from the 1.9 s close-up is large.
   - The Raymi sprite at the opening looks soft against the busy office.

FIX 1
observation: Postcard at 27-32 s and 136.5-137 s is 20 px or less with no value contrast. The globe at 24.5-26.5 s has 0.008 separation.
effect: The viewer can't find the main element.
cause: Contrast and scale of the hero (module 00).
change: Enlarge the postcard to at least 60 px in those shots. Add a rim light or a dark plate behind it so separation is 0.1 or more. Do the same for the globe in shot 22.
priority: high
level: local
retest: `hero.json` has no unreadable rows.

FIX 2
observation: `seq_09` and `seq_03` have static Raymi for 2 s.
effect: The picture reads as a diorama, not acting.
cause: Missing animation inside shots (module 04).
change: Add a hop, a turn, a sway or an entrance with squash and stretch, plus a hold beat.
priority: high
level: structural:elements
retest: Frame differences on Raymi are non-zero every 0.5 s.

FIX 3
observation: The lyric words appear without a bounce.
effect: They are less punchy than the beat needs.
cause: Overshoot and timing (module 04).
change: Scale each word 0 -> 1.2 -> 1 in 3 frames.
priority: medium
level: local
retest: Word-pop frames show an overshoot.

VERDICT: FAIL
WORST: The postcard, a main element, is a tiny, value-matched shape that is unreadable at phone size in shots 23, 24 and 75, and Raymi stands still in several shots.

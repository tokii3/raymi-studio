MAIN ELEMENT: Raymi herself is readable at phone size. She is large and lit in the opening office, in the subway and in the dream scenes. The two props named in heroes.json are not reliably readable. The hero check says UNREADABLE in 21 of 50 sampled frames. The postcard melts into its background in shots 23-25 and 34, with sep 0.000-0.026, and is only 17-33 px wide in shots 23, 24 and 28. The globe is fine (sep 0.05-0.21) except at frame 1320 of shot 31. Phone_08 (56-63 s) shows Raymi small and desaturated in a dark blue-grey office. The postcard is not findable there. This is BLOCK: fault only if the postcard is the hero of those beats. Otherwise it is FIX 1.

I read seq_00, 01, 02, 05 and 08, phone_08 and 15, and the facts and hero files. I did not view every sequence.

1. Raymi and camera per sequence
- seq_00 (0-2 s): the camera drifts and pushes in, with speed lines and a whip-zoom into a monochrome drop at 1.0-1.5 s. Raymi's pose stays almost identical across frames 0-0.9 s, with no anticipation or settle. After the whip, a B/W 12 fps puppet drops in with swing lines. This is the strongest motion in the kit.
- seq_01 (about 2-4 s): the first 0-0.17 s is a hard, flat zoom. At 0.25 s a battery icon appears with no pop. Raymi then holds from 0.33 s to 1.25 s with only a faint sway, which is a dead stretch of about 1 s. She is in front of a 3D set, but the camera barely moves.
- seq_02: the globe shot holds for about 2 s with nearly static framing. Only the lyric words and snow particles move. The camera does not travel. This is dead from the globe's point of view.
- seq_05: Raymi stays in the same stance and arm-up pose from 0 to 0.9 s, with no change. The side characters are static. The camera is a slight dolly with some parallax. The lyric words grow in.
- seq_08 (about 56-60 s): the 1.5 s card at the start holds with no motion, then hard-cuts to a wide scene. This reads as a slideshow.
- 56-63 s: dark blue-grey, with the camera sliding slowly back and Raymi nearly the same size. It is low contrast and dull.
- facts say 36% picture change on hits and one still span at 156.5-158.6 s, which is about 2 s of dead picture.

2. Fast moves
Smear frames, speed lines and the B/W whip exist at 0-2 s. Elsewhere, cuts are plain hard cuts and the camera changes are mostly slow interpolation, so the film is floaty rather than snappy. The shots are short, about 1.9 s on average, but the in-shot motion is slow.

3. Icons and words
Lyric words appear letter by letter or with a small scale-up (seq_02, seq_05), and they read OK. The battery icon just appears. The wide lyric text on the island card (seq_08) is tiny and crowded, and the overlapping lines in the 56-63 s office frames collide with the props and the hero.

4. Broken
- Frames 1.17-1.33 s in seq_00 show a monochrome flash with Raymi's legs, which looks intentional.
- Double lyric text overlaps in seq_08 at 0-1.4 s, where the 'favorite one (until the very end)' line is partly cut off by the colored blobs.
- Raymi's legs slide in the subway shot without a walk cycle.

5. Most important fixes

FIX 1
observation: the postcard in shots 23-25, 28 and 34 (about 32-52 s) is 17-33 px and has sep near 0, so it is invisible. The globe in shot 31 at frame 1320 is also low.
effect: the story prop is lost where it should be the focus, and viewers see only a dark room.
cause: value separation and size (module 03 and the hero rule).
change: make the postcard at least 80 px and give it a rim light or a bright card color so the sep is above 0.08.
priority: high
level: local
retest: heroFaults shows no UNREADABLE frames for the postcard

FIX 2
observation: Raymi holds the same pose for about 1 s at 0.3-1.25 s in seq_01 and 0-0.9 s in seq_05, and for 156.5-158.6 s.
effect: a slideshow feeling, which is what toki complained about.
cause: no anticipation or secondary action (module 04).
change: add a squash and a 2-3 frame overshoot on every hit, a 3-4 px bob on the beat, and a pose change at least every 0.5 s.
priority: high
level: structural:elements
retest: seq frames at 12 fps show pose change in each 0.5 s window

FIX 3
observation: the cuts at 56-63 s and in seq_08 are hard and the camera barely moves.
effect: this reads as a still picture with zooms.
cause: camera has no parallax travel (module 04, timing and spacing).
change: add a slow lateral dolly of at least 5 percent of the frame with near props passing faster than far ones, and use a smear on whip cuts.
priority: medium
level: local
retest: the near desks and far screen move at different speeds

FIX 4
observation: words and icons (the battery) appear without a pop.
effect: they fade in instead of hitting the beat.
change: scale 0 to 115 to 100 percent in 3 frames, on the syllable.
priority: medium
level: local
retest: 3-frame overshoot visible in seq frames

FIX 5
observation: the seq_08 lyric card has text overlapping the colored blobs.
effect: it is unreadable at phone size.
change: add a dark plate behind it and a larger font.
priority: low
level: local
retest: phone_ frames show the text clearly

BLOCK: fault: 32-52 s, the postcard is unreadable (sep 0.000-0.026, 17-33 px) in 21 of 50 hero samples, so the main prop is lost.

VERDICT: FAIL
WORST: Raymi sits in nearly the same pose for seconds in a dark, low-contrast room while the key postcard prop is invisible.

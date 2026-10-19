MAIN ELEMENT: mostly readable. The flame is readable in every sampled frame (sep 0.5-0.65, 43+ px) except s14 (about 18.1-20.2 s and later, sep 0.16-0.26, 31-38 px). That is the small flame by the crouching Raymi in the dim cave (s14 is the crouching shot). The face reads at phone size (sep 0.06-0.15, which is low but she is lit). The word "fire" (the s15 hero) is not on screen for the first 2 samples (frames 615 and 630) and reads small (26 px) when it appears. Sep 0.06-0.09 on the face in s1 and s11 is thin: she is violet on violet. This is not a BLOCK, but the s14 flame and the s15 word are weak.

1. Per sequence (12 fps strips seq_00-03, plus the phone/full contact sheets)
- 0-2 s: Raymi has a held lean-in. She pushes in slowly (scale up, about 1.0 to 1.3 by 1.9 s), and the title pops in at 0.08-0.25 s. The camera is a flat zoom with only slight parallax from the rocks. It is a hold, not a dead stretch. At 1.92 s speed lines start, but there is no real smear.
- 2-3 s: Raymi lies flat and glides. This is the best motion in the pilot: pose changes, a camera travel, and colour shifts toward blue. It reads as a floaty slide with no stretch or squash.
- 3-7 s: she crouches (3-4.5 s) and then runs in a lean (5-6.5 s). These are held key poses, but she is almost frozen in each. Dead stretch 3.5-4.5 s. The run slides across the cave without a bounce or a foot plant, so it looks like a floating slide. The background barely shifts, which reads as a flat picture.
- Sequence seq_01 (about 8.8-10.8 s): Raymi, then a hard cut to Salmon. The orange fish at 0.33 s is a one-frame flash, then a white fish glides across the rock. The "!" pops at 0.83 s. Salmon then holds from 0.92 to 1.92 s, which is a dead stretch of about 1 s. Only the bubble moves.
- Sequence seq_02 (about 16-18 s): a camera cut, with her on her knees. The lyric "Got me fire" builds up word by word. At 1.25 s there is a hard cut to a wide shot with her crouched next to the flame. From there to 1.92 s the picture is nearly static (about 0.7 s dead), and only the lyric changes.
- Sequence seq_03 (about 20-22 s): the camera travels over glowing floor lines, then cuts to Raymi seen from behind. Between 0.67 and 1.25 s only a flame flickers, so that stretch is dead. The lyric "Like" pops at 1.75 s with a fade-and-scale.
- 20-23.5 s: the line network grows and the camera pulls back. This is real camera travel and the strongest stretch.
- Overall: the camera moves in depth only in a few shots (2-3 s, 21-23.5 s). Elsewhere it is a zoom on flat layers.

2. Fast moves
- There are almost no smear or stretch frames. The 5-6.5 s run and the 2-3 s glide are drawn as the same pose moved along a path.
- The speed lines at 1.9 s are one-offs.
- Timing is mostly floaty and slow, with held poses in between. The result is neither snappy nor smeared.
- The 10.77-12.23 s cuts, at about 0.5 s each, are the only fast rhythm. They change the picture, but only 1 of 10 hits changes it (facts: picture_change_on_hits 0.1).

3. Icons and words
- The title "FIRE. UNDERWATER." and the lyrics grow in over about 3-6 frames with scale. They read as a fade-in with little overshoot, so they are soft rather than punchy.
- The "!" pops in without a visible overshoot or wobble.
- Lyric words are small and thin in places: "Imma burn it down" at about 18-20 s is tiny and nearly unreadable on the phone sheet.

4. Broken
- Salmon's first appearance at 0.33 s of seq_01 is a single orange silhouette frame that looks like a glitch. It reads as a popping sprite, not as a designed entrance.
- Raymi's glide at 2-3 s has no feet contact, so she floats. That fits a swim, but it does not read as an acted move.
- The mix of pose changes between 3 s and 7 s is abrupt: sprite swaps with no in-between.
- s14 (about 18-20 s) has a very small Raymi, so her face and the flame are tiny.

5. Fixes are listed below.

BLOCK: fault: 8.8-9.2 s (seq_01, 0.33 s) a single orange fish frame between two shots reads as a popping glitch rather than a designed entrance.

FIX 1
observation: 3-7 s, Raymi crouches and runs; 3.5-4.5 s is nearly still, and the run slides without bounce or smear.
effect: it reads as a puppet being dragged, not as acting.
cause: missing squash and stretch, anticipation and smear (module 04).
change: add 2-3 smear frames at the start and end of each dash, an anticipation crouch of 4 frames before the run, and a bounce of at least 6 px per step.
priority: high
level: structural:assets
retest: step through frames 3.5-7 s and find smear frames and a visible squash on each landing.

FIX 2
observation: Salmon at 8.8-10.8 s; one orange silhouette frame, then a 1 s hold where only the "!" moves.
effect: a glitch and then dead air.
cause: entrance with no designed pose or anticipation, and a hold with no secondary action.
change: let Salmon swim in over 6-8 frames with a stretch, overshoot and settle; give him a tail and eye wobble during the hold.
priority: high
level: local
retest: no single-frame silhouette in 8.8-9.2 s; motion in the whole hold.

FIX 3
observation: hold stretches at 3.5-4.5 s, 16.9-17.9 s (about 0.7 s) and 21.2-21.7 s, where only a lyric or a flame flickers.
effect: it feels like a slideshow with a zoom.
cause: a flat picture with no parallax or secondary motion (modules 03, 04).
change: add a slow camera dolly in depth of about 5-10 percent with different speeds for near and far layers in every shot longer than 1.5 s.
priority: medium
level: structural:elements
retest: compare frame 0 and the last frame of each shot; foreground rocks should move more than the background.

FIX 4
observation: lyrics and the "!" fade and scale softly; "Imma burn it down" at about 18-20 s is tiny.
effect: words do not hit on the beat and are hard to read on a phone.
cause: pop timing (module 04), weak scale overshoot.
change: scale 0, then 1.25, then 1.0 over 3 frames, with a size of at least 7 percent of frame height.
priority: medium
level: local
retest: step through 3 frames at each pop; check size on phone_*.jpg.

FIX 5
observation: s14 (about 18-20 s): the flame is small (31-38 px, sep 0.16-0.26) and Raymi is small in a dim cave; s15 shows the "fire" word late and small.
effect: the main element is weak where it should be the payoff.
cause: framing and value (heroes.json minimums 0.08 and 0.07).
change: bring the flame to at least 60 px and sep at least 0.4 with a light bloom; show "fire" from the first frame of s15 at at least 45 px.
priority: medium
level: local
retest: hero.json shows readable in all sampled frames.

VERDICT: FAIL
WORST: Raymi mostly glides in held poses with no smear or squash and the cave barely moves in depth, so it still reads as a slideshow with a zoom, plus the orange fish glitch frame at about 9 s.

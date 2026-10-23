1. **Retell (muted).**
- Frame 0: a jolt, and a sand mound close under the lens with two glaring purple eyes and a "!" icon.
- At 2.4 s the mound blows apart and she pops up standing, angry. The lens tilts up to her, holds, then dips toward the hole and pushes back up to her face. She goes cocky and proud.
- Next the lens is low at her feet and she crab-walks sideways across the sand. The lens tracks her, then rises to her smiling face.
- She nods, turns sideways and goes flat. She lies there for about 1.7 s, then slides right and dips under.
- Last, the framing from frame 0 returns. She sinks into the mound, her eyes dart left and right, and they lock on you with "!".
- Mostly readable. Two things I cannot see: the "hole she left" in shot 2, and what the glide in shot 4 ends in. There is still no foot or shadow of YOURS anywhere, so the POV is only a shake.

2. **Slop test.**
- Only Raymi: the eyes-only mound, the flatten-and-glide, the ray teaching the shuffle, and the eyes tracking your foot in the loop. That is four, so it is not slop.
- Generic: the angry gesture, the "cocky" clip and the nod are stock clips, and `walk-strafe-left` is a walk.

3. **Against the top three.**
- The idea is better than the wakeup one: it has a want (don't step on me), a lesson and a loop.
- Renai, LGW and POP IN 2 escalate to a peak. This one peaks at the burst (2.4 s), then the lesson, a glide and a stare. The last beat is a good gag but not a stronger image than the burst.
- The ray gliding into the water is the strongest Raymi-only picture, and it is the one that is cut.

4. **Dead stretches.**
- OPENING: hooks. Eyes are open at frame 0, there is a 0.9 shake, and the mound fills a 24-degree lens at about 0.5 m. That is a clear improvement. Still missing: your toe or shadow (nothing in the data), so the "stepped on" moment is felt only through the shake.
- Shot 2 is fixed in rhythm (burst, hold, dip, push-in). But at the dip (about 3.7-4.7 s) she still stands at x -1.5, z 0.5, exactly on the mound spot (z 0.55). The lens at 0.95 m high looks at y 0.0, so it frames HER legs, not "the hole she left". The gag fails, and the text and data disagree.
- Shot 4: round-1 FIX 1 was NOT applied.
  - She flattens at local 0.83 (9.0 s) and then lies still until local 2.55 (10.73 s), about 1.7 s on "swim away".
  - The glide (move 1.65 s) starts at 10.73 and the cut is at 11.43, so only about 0.7 s of it is seen.
  - A keyframe at local 2.8 (10.98 s) re-targets her to x 0.95, y -0.35 within 0.25 s. That is a rush or teleport, not a glide.
  - Camera: it holds still, then pans only from local 0.85 to 2.6.
  - The whoosh at 9.075 fires on the static flatten (off grid), not on the glide.
  - The "shallow water" is not in the set data.
  - The text promises "slips under the surface and only the water is left", and the cut makes that impossible.
- Shot 3: the "shuffle" is a strafe walk of 1 m, with no sand ripple, no kick-up and no YOUR feet. The lesson is carried by a clip I cannot confirm reads as a shuffle. The mound is gone, with no hole in the sand, so the continuity from shot 2 is broken.
- Shot 5: the sink takes 0.45-0.85 s. After that, about 11.9-13.2 s is the same near-static frame (push-in only) during "did you know the shuffle?". The dart at 13.24 and the lock at 13.77 are a good last third. After "no." (14.08) there are about 0.6 s of silence on a held stare, which is fine.

5. **Unreasoned elements.**
- `walk-strafe-left` standing in for the shuffle has no chain from meaning to picture.
- The off-grid step (-406 ms) and the off-grid whoosh still have no written reason.
- The "!" icon at frame 0 and at the end is fine as her language.

6. **Sense and love.**
- No footprints, no sand ripples from your shuffle, and no water or shore in shots 3 and 4. A ray "swims away" into nothing.
- Nothing links the hole to the later shots.

7. **Script-specific.**
- Shot 3 is the only shot where she "does" the lesson, and it is a walk.
- Shots 1 and 5 repeat the set-up on purpose, with a change (eyes, sink), which is OK.
- Shot 2's camera travels well. Shot 4 is near-static for the first 1.7 s.
- The timing table matches the dossier. Two off-grid sfx are unexplained.

**Extreme vs less.** Extreme: make the glide the climax. Flatten and go on "swim" at 9.0, with a whoosh, a pan along the sand, and a splash visible before the cut. Less: drop the nod and the second dance beat so the glide gets 2.5 s.

VERDICT: BLOCK: thin - the payoff glide (shot 4) is still static for 1.7 s and cut at 0.7 s with a teleport keyframe and no water in the data, and shot 2's "hole" shows her standing on it.

FIX 1
observation: In shot 4 she flattens at local 0.83 but only moves from local 2.55 (10.73 s). The cut is at 11.43. A keyframe at local 2.8 snaps her to x 0.95, y -0.35 in 0.25 s. There is no water in the set data.
effect: The best Raymi-only picture arrives late and half-seen, with a jerk where a glide should be, and the ray swims into empty sand.
cause: PRINCIPLES 5, 8, 13 and 15.
change: Move the glide keyframe to local 0.9 (9.07 s, on "swim"), `move` about 1.8 s, `ease` inOut, with the whoosh at 9.0 on the glide start. Delete the 2.8 snap, or make it a slow sink that ends before 11.1. Add a visible shoreline or wet sand at x about 0.9 in the shot-4 opts, and pan after her from local 0.9. Leave 0.3 s of empty water before the cut.
priority: high

FIX 2
observation: In shot 2 she stands at the mound's own x and z. The dip camera (local 1.4-1.95) looks at y 0.0 from 0.95 m and frames her legs, not a hole.
effect: The "hole she left" gag, and the beat for "sand." and "it's our whole thing", does not exist on screen.
cause: PRINCIPLES 12 and 15.
change: After the burst, move her aside (x -1.1) with a short `move`. Keep the mound's crater as a thing in shot 2, and shot 3 or the opening of shot 4 if it stays visible. Aim the dip at the crater so it shows empty sand with the ripple of her exit, then push back up to her face.
priority: high

FIX 3
observation: The shuffle in shot 3 is `walk-strafe-left`, a sidestep walk. It has no sand ripple or kick-up and no shot of YOUR feet. The mound and hole are missing.
effect: A viewer sees a crab-walk, not "shuffle your feet so rays feel you". The lesson is the one thing the picture does not teach.
cause: PRINCIPLES 2, 3 and 12.
change: Put a thing of ripple rings or sand puffs at her feet, timed on each slide. Or open the shot (5.6-6.3) on your own boots scuffing at the lens, then cut to her copying you on "like this". Add the crater as a thing. Check on stills that the strafe reads as a shuffle (small steps, feet dragging), otherwise pick another clip.
priority: high

FIX 4
observation: The opening has no foot, toe or shadow. The mound fills the lens, but nothing proves the viewer is the one stepping.
effect: The swipe reads as "a mound with eyes". The POV and the "almost stepped" tension are carried by the shake and the voice only.
cause: PRINCIPLES 6 and 8.
change: Add a toe of your shoe or a shadow entering from the top edge at 0.0-0.3 s, with the step sfx snapped to the contact frame. Write the reason for any off-grid sfx, or put it on the beat.
priority: medium

FIX 5
observation: Shot 5 holds a near-static frame from about 11.9 to 13.2 s, during "did you know the shuffle?". The dart and lock only start at 13.24.
effect: The last third opens with 1.3 s of nothing new, and the gag arrives late.
cause: PRINCIPLES 5 and 13 (Short rule: a change every 2-4 s).
change: Start a small eye action at about 12.3 s (a slow blink, then a squint toward your feet, or sand trickling off her head). Let the eye darts begin at 12.6 on "shuffle?", so the "yes / no" lock stays the peak. Add the pop at 13.41 only if it lands on the lock.
priority: medium

FIX 6
observation: In shot 4 the whoosh at 9.075 is off grid and fires on the flatten, not the glide. The step sfx is off grid by 406 ms. Neither has a reason.
effect: The sound promises motion that is not on screen, and the picture and sound drift apart.
cause: PRINCIPLES 13 and C.
change: Move the whoosh to the glide start (see FIX 1) and snap the step to the shake peak, or write the reason for each off-grid placement in the script.
priority: low

MAIN ELEMENT: readable in most shots, weak in the dark second half. Heroes are flame, face and the word "fire". Hero.json shows 31 of 34 sampled frames readable. The face is large in s1, s2, s9 and s11 (35-95 px) and separates well from the background. The flame is strong at 0-1.5 s, with separation around 0.35. In s14 (about 18-20 s) the flame is only 22-27 px, with separation 0.14-0.15 and detail 0.5-0.6. In phone_03 (18-20 s) Raymi is a tiny crouched figure in a dark blue pit, and the flame is a speck. The "fire" word is missing in s15 (frames 615 and 630) and is 21 px when it appears. This is weak but I do not call it a fault, so no BLOCK on it.

1. Per sequence
- 0-2 s: Raymi holds her pose and only creeps in with a slow push. The word FIRE pops in at 0.17 s, and UNDERWATER appears at 0.5 s. There is little squash or overshoot. At 1.9 s a speed-line burst starts the cut. This push-in is the only camera move in the clip.
- 2-8 s: she crawls, crouches, and a water drop appears. She moves left to right (5-7 s) and a streak mark appears (7.5 s). The set slides behind her as parallax, so this is the best-moving stretch. The glyphs in her motion are only suggested.
- seq_01 (a fish cut-in, around 11-13 s): a fish flies in, a "!" pops, then a hold. Dead from about 1.0 s of the sequence on, because the fish is parked.
- seq_02 (16.5-18.5 s): Raymi pops in large, the lyric "Got me fired" appears, and she drops to tiny in a hard cut at 1.25 s. She is nearly frozen after that. Dead stretch about 18.1-20.0 s, with only a flame twitch.
- seq_03 (22-24 s): this is the clearest move. Cracks grow outward, the camera flies low over the cracks, and a flame ignites on the tower at 1.33 s. Raymi is a back-view figure at the lower left and barely moves (about 22.5-24 s).
- Camera: real spatial travel in the 3D set (cracks at 21-24 s, the walk at 5-7 s). The 0-2 s and 16-20 s stretches are zooms on a flat sprite.

2. Fast moves
- Smears and speed lines exist: the speed lines at 1.9 s and the streak mark at 7.5 s. The fish gets a motion-blur arc, which is good.
- Raymi's dashes and cuts have no stretch frames. She does not squash in or out. The poses read as interpolated and floaty, not held on 2s. The picture changed on only 2 of 10 musical hits (facts.json).

3. Icons and words
- The "!" and the "FIRE" and "Got me fired" words pop in under 0.5 s. Their pop is only partly an overshoot (a ~0.4 s scale-up and then a fade), which is slower than the 2-3 frames the reference studies describe. "Like" at the end is a fade-slide.

4. Broken
- No popping or visible sprite edges. The 1.25 s cut from large to tiny in seq_02 is a jump in scale with no transition. In seq_03, 0.33 s is a hard cut (the red tower to a dark scene).
- The fish at 0.33 s of seq_01 first shows as a dark red silhouette, then turns white-pink within one frame. That reads as a pop.
- Her pose at 5-6.5 s (crawl, then walk) slides without any foot contact.

5. Fixes
FIX 1
observation: 16.5-20 s, Raymi is tiny and static in a dark pit, and the flame is 22-27 px at separation 0.14.
effect: the hero is lost on a phone just where the hook line lands.
cause: scale and value separation of the main element (module 00)
change: keep her at least 40% of frame height, give the flame a rim light so separation is above 0.3, and make "fire" appear in every s15 frame.
priority: high
level: local
retest: hero.json shows 0 unreadable and the flame is at least 40 px in s14.

FIX 2
observation: 0-2 s and 16-20 s, Raymi hardly moves, with no anticipation or settle.
effect: the pose reads as a pasted sprite.
cause: the puppet has no acting (modules 04 and rig_and_acting)
change: add a 3-frame squash and stretch on every entry and a 2-4 frame hold on key poses, an overshoot of about 10% on pop-ins, and one small action per shot.
priority: high
level: structural:assets
retest: seq frames show distinct held poses.

FIX 3
observation: the fast cuts at 1.9 s, 1.25 s (seq_02) and 0.33 s (seq_03) are hard jumps.
effect: no energy transfer and no smear.
cause: smear frames and transitions (module 04)
change: put a 2-3 frame stretch-streak on Raymi's exits and arrivals and a whip blur on the cuts.
priority: medium
level: local
retest: smear frames are visible in seq_00 to seq_03.

VERDICT: FAIL
WORST: Raymi herself barely acts, and in the dark second half she and her flame shrink to unreadable specks.

**Motion critic, KING MV (2:15), kit_mv2.** I read seq_00 to seq_09. The stamps are in-sequence times, since the kit does not give absolute time. I did not open the phone strips, so the vertical crop is unjudged.

**1. Does Raymi move, and does the camera travel?**
- **seq_00:** The camera frame punches in on her face over 1.0 to 1.9 s with a slight tilt. It is a flat zoom of a sprite. The second Raymi in the shot is frozen.
- **seq_01:** There are hard cuts at 0.25 s and 1.17 s. The 0.33 to 1.17 s high-angle stage shot shows a small Raymi walking, and the camera drifts with visible parallax. The following shell shot, 1.25 s onward, is almost a still.
- **seq_02, 0 to 1.9 s:** She sits fixed in the shell. Only the background slides a little and the lyrics step in. This stretch is dead.
- **seq_03:** Her lean and hair sway read well, and the sign swaps to pink at 1.42 s. From 0 to 1.33 s she is nearly held, with just a waving arm at the edge.
- **seq_04:** Both beats are held. 0 to 0.42 s is a sprite on a dim floor. 0.5 to 1.58 s is a close-up in which only the arm shifts slightly.
- **seq_05, 0 to 1.0 s:** Card shards fly at different depths and give good parallax. Raymi is frozen.
- **seq_06:** The tower shot (0 to 0.58 s) is dead except for lamps. The jam into the cards from 1.42 s has depth.
- **seq_07:** She holds still from 0 to 1.0 s. Then she tumbles with the cards from 1.08 s, which is a good beat.
- **seq_08:** She slides and rotates inside the frame, and there is a real camera swoop at 0.75 to 1.33 s.
- **seq_09, 0.17 to 1.92 s:** One pose is held for about 1.8 s with no change. The shot is dark and dead.

**2. Fast moves:** I see no smear or stretch frames. Moves are hard cuts or linear interpolation. The tumble and swoop are smooth but have no key-pose holds or anticipation.

**3. Icons and words:** The pink sign and the lyric words seem to appear, with only the large ワーニング word showing scale. I saw no 2 to 3 frame overshoot pops. They fade or step in.

**4. Broken:** Several held close-ups look like a painted sprite pasted on a 3D set. I saw no clear popping or visible cut edges.

**FIX 1**
observation: Raymi holds one pose for 1 to 2 s in many shots (seq_02, seq_04, seq_05 and seq_09, which is the worst).
effect: It reads as a slideshow on an animated background.
cause: Sprite puppet with no acting in the holds (module 04 holds and secondary action).
change: Every shot longer than 0.8 s gets a pose swap or a 3 to 6 px breath/sway cycle, with at most 0.5 s without change.
priority: high
level: structural:studio
retest: Frame diff over the Raymi region is above threshold at least every 0.5 s in all strips.

**FIX 2**
observation: Fast moves are cuts or linear moves (seq_01 at 0.25 s, seq_07 at 1.08 s, seq_08 at 0.75 s).
effect: They feel floaty, not snappy.
cause: No smear, anticipation or overshoot (module 04).
change: Add 1 to 2 smear or stretch frames on moves faster than 15 percent of the frame per frame, plus a 3-frame overshoot and settle.
priority: high
level: structural:studio
retest: Smear frames are visible in 12 fps strips.

**FIX 3**
observation: The lyric words and the sign swap (seq_02, seq_03) fade or step in.
effect: They give no hit on the beat.
cause: No scale overshoot (module 04).
change: Pop at 0 to 130 percent to 100 percent over 3 frames on the syllable.
priority: medium
level: local
retest: Strips show an oversize word on the first frames.

BLOCK: slop: seq_02, seq_04 and seq_09, 1 to 2 s each, a held sprite on a set with only a slow background drift.

VERDICT: FAIL
WORST: Raymi herself barely acts, as she freezes in long holds while only the set moves.

MAIN ELEMENT: readable in the close shots, not readable in the wide ones. Raymi's face and the flame read at phone size in s1 (face 58-86 px, flame 43 px), s2, s9 and s13 (flame 49-55 px, separation 0.35-0.41). In s11 the flame and face drop to 25-37 px. The s14 flame is 22-27 px with low separation (0.14-0.16, detail 0.5). The "fire" word in s15 is 21 px and is not on screen at 20.5-21.0, so the key lyric word is missing at its own downbeat. In the phone sheet, s14 (18-20 s) and s16 (22-24 s) show Raymi as a tiny figure in a dark blue-violet field. BLOCK: fault, see below.

DESCRIBE: Two-second shots, almost all of them Raymi alone in the same dark purple set. The chorus is a chain of wide shots with her small in the frame.

1. Cut accuracy
- From 12.8 s on, every cut sits within about 50 ms of a beat or sung onset: 14.77, 16.5, 18.13, 20.2, 22.03, 24.1 and 25.6. This is the strong part.
- Cuts in the middle of nothing: 4.9, 6.87, 8.8 and 10.77. They are 0.1-0.2 s off the beats (4.783 and 5.271, 6.687 and 7.152, 8.545 and 9.009). Intro cuts at 11.27, 11.73 and 12.23 do land on beats.
- Only 2 of 10 loud hits change the picture (facts.json).

2. Rhythm
- Shot lengths from 4.9 to 8.8 and from 12.8 to 27 are 1.5-2.07 s, a metronome (cv 0.39 overall, but flat inside the blocks).
- No alternation between wide action and close reaction. s14, s16, s17 and s18 are all tiny-Raymi wides, four times in a row.
- The 0.5 s burst at 10.77-12.8 is the only intentional rhythm change.

3. Transitions
- Almost everything is a hard cut. The two exceptions are the rewind at 2.0 and a streak at 1.9.
- Designed transition 1: at 20.24, the crack-line ignition could carry the cut from s14 into s15.
- Designed transition 2: at 22.03, a whip or flash through the fire could carry the cut into the map shot s16.

4. Energy
- The build from 10.77 to 12.8 works.
- After the voice enters, the cut rate falls back to 2 s, so the section gets flatter as the song gets louder (B at 20.24 runs at -11.7 dB).
- There is no stop in this window, so none is missed.

BLOCK: fault: 20.24-21.0 s, the "fire" word is not on screen at the section B downbeat. The flame and face are 22-37 px at 12.8-20.2 s.
BLOCK: slop: 12.8-27.3 s, a metronome of 2 s wide shots with no beat-level picture change.

FIX 1
observation: 12.8-27.3 s, one shot per lyric line (about 1.9 s), no change between cuts.
effect: Reads as a slideshow in the loud sections. Only 2 of 10 hits change the picture.
cause: Shots are planned per line instead of per beat (edit_beat_change study, craft 03).
change: Split each chorus line into 2-3 events on beats: word slam, light flare, camera push, close-up insert. Target at least 60% picture change on beats from 20.24 s.
priority: high
level: structural:script
retest: beat_change share at least 0.6 and hits changed at least 5 of 10.

FIX 2
observation: 14.77-20.2 s and 22-27 s, Raymi is tiny and the flame is 22-28 px.
effect: The main element is lost at phone size.
cause: Hero scale and value separation (craft 03).
change: Make the flame at least 40 px with separation 0.25 or more. Alternate wide shots with a close-up of her face or the flame in every second shot.
priority: high
level: structural:script
retest: hero.json shows no unreadable rows, and no two wide shots in a row.

FIX 3
observation: 4.9, 6.87 and 8.8 s, cuts sit between beats.
effect: The cuts feel unplanned.
cause: Fixed 1.97 s shot spacing instead of the beat grid (PRINCIPLES B 13).
change: Move the cuts to 4.783, 6.687 and 8.545, with lengths in multiples of 0.464 s, and vary them (for example 0.93 then 2.8).
priority: medium
level: local
retest: each cut is within 40 ms of a beat.

FIX 4
observation: 20.24 s crack ignition and 22.03 s map shot.
effect: Hard cuts waste the two biggest moments.
cause: No designed transitions (craft 03).
change: Add a crack flash through the lens at 20.24 and a fire whip at 22.03. Show the "fire" word at 20.24 s, at least 0.4 s long and at least 60 px.
priority: medium
level: local
retest: a transition is visible in the frames at both times.

FIX 5
observation: 25.6-27.27 s, the "like" hang.
effect: The sentence stays unfinished but the picture does not get quieter or louder.
cause: Contrast of energy (craft 07).
change: Cut to a close-up on the final beat of the pilot and hold the last word.
priority: low
level: local
retest: the last shot is a close-up.

VERDICT: FAIL
WORST: the chorus is a 2 s metronome of wide, small-Raymi shots, so the flame and the "fire" word are unreadable at the beat where they matter.

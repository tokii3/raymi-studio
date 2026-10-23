1. **Retell (muted):** On her beach, Raymi is caught at the top of a jump, her face big and her fist next to it, with the stamp "rock paper scissors. you lose." The shot cuts lower and closer as she pumps her fist three times, and a word pops beside it on each pump. The picture freezes and turns grey: "PAUSE. pick now." Her flat hand thrusts at you like a ray wing, you flinch, and the stamp reads STINGRAY. She grabs your hand, drags you to the water and glides belly-flat over a rock at your feet. You look down: she lies next to a sheet of paper and squashes flatter than it, and the paper blows over her. A crab snaps at your fingers and she swats it with her tail barb. She flexes, the crab pinches her tail, and she jumps and pouts. Her fist comes back up, the same picture as frame 0. **Readable, and it now has a turn.**

2. **Slop test:** These moments only work because it is Raymi:
   - the stingray hand sign
   - the glide over the rock
   - flatter than paper (the LGW lore)
   - the barb swats the crab, and the crab pinches it
   - her tsundere loss

   That is five. Not slop.

3. **Against the top three:** v1 was a list of proofs. v2 has LGW's missing ingredient: her cockiness gets punished. The proofs are done to you, so the direct address holds.

4. **Dead stretches:**
   - **OPENING: hooks.** Her face is at 45 % at the apex, with the fist beside it.
   - **0-5.94 s is still the same phrase twice** ("rock paper scissors. you lose." then "rock. paper. scissors!"). v1 FIX 7 is only half solved: the framing changes now, but the game starts late and the pumps end at 5.94, not about 5.
   - **The freeze, 6.26-7.93:** the script promises "a low tick on each beat", but shots.json has no tick events (only a scratch at 6.261). That leaves 1.67 s of silence, the stall v1 warned about.
   - **Last third:** the strongest beat now (the pinch at 16.29, the jump, the line). But it is crowded: pinch, jump, pout, two lines and the fist all land in 2.96 s.

5. **Unreasoned elements:** The sparkle is cut, the orbit is replaced by your flinch, and the wind is gone. The freeze still has no link to her world. That is acceptable as the convention of the format.

6. **Sense:** The crab's snap is written at 13.78 (the hit), but the SFX "grab" sits at 14.202. The sound and the picture disagree. The swat at 15.0 has no sound.

7. **Script checks (v1 fixes):**
   - Cuts: all one frame before a beat (solved).
   - Takes: no overlaps (solved). "count!" ends 17.48 and the CTA starts 17.55, a 70 ms gap.
   - Camera = you in shots 5-7 (solved).
   - The flatten effect is in the build list (solved).
   - Hook stamp 2.9 s (solved), and "honestly" is dropped (solved).
   - **The CTA stamp is on screen from 16.26**, right on the pinch and under "that didn't count!". The spoken question only comes at 17.55-18.37, 0.43 s before the end. The rule (2.54 s) passes on paper, but the stamp competes with the best gag.
   - The loop: shot 8 is a "LOW hero MCU" and frame 0 is an eye-height MCU, so the matching pose does not match the angle.

VERDICT: PASS

FIX 1
observation: "rock paper scissors" is said twice in the first 5.94 s; the CTA stamp has to start on the pinch, and the spoken CTA ends 0.43 s before the end.
effect: The start drags, and the end is so packed that the comment question gets stepped on by the gag.
cause: PRINCIPLES 13, series CTA rule, v1 FIX 7 (only half solved)
change: Make the hook line "you lose." (about 0.8 s) over the pop-up, with the stamp kept. Pump the three words from about 1.0 s and freeze at about 4.6. Use the roughly 1.5 s gained to move the pinch and "that didn't count!" earlier, so the CTA stamp starts after the pout. Stay at 18.8 s or less.
priority: high

FIX 2
observation: The freeze promises a low tick on each beat, but shots.json has no tick SFX.
effect: 1.67 s of dead silence reads as a stall or a broken video.
cause: script = data; v1 FIX 8
change: Add tick SFX on 6.679, 7.097 (hit) and 7.515 inside the mute window.
priority: medium

FIX 3
observation: The crab snaps at 13.78 in the row, but the "grab" SFX is at 14.202, and the tail swat at 15.0 has no sound.
effect: Muted it works; with sound, the snap and the swat feel unsynced.
cause: PRINCIPLES 13
change: Put the snap SFX on the hit 13.784 and a swat whoosh on 14.62 (hit), and move the swat to 14.62.
priority: medium

FIX 4
observation: The last shot is a low-angle hero MCU; frame 0 is an eye-height MCU.
effect: The loop jumps in angle.
cause: the loop
change: After the pout, YOU stand back up into eye height, or shoot shot 8 at eye height with the bump on her jump.
priority: low

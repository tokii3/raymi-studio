1. **Retell, muted.** Raymi fills the frame with both hands clamped over her tako ears and glares into the lens, with the stamp "don't touch my ears. i mean it." She turns her back and the frame jumps forward once. She whips round with a "!" and the frame freezes and shudders. She turns away again, this time to text on her phone, and the frame jumps twice. Her ear knobs get bigger. She spins round and her face is suddenly half a metre away, furious, and the frame flinches back. She turns a third time, the frame lunges at her ears, and her hand slams over the lens into black. Then we see a wide shot from the doorway: she sits on the bed holding her ears and waves, smug, under "how close did you get?". The text supports a muted retelling up to the black. After that, "you were thrown out" is never shown, so the cut to the doorway reads as a new camera, not as your body.

2. **Slop test.** The only moments that need Raymi are the tako ears (her design and her canon fear) and the salmon plush on the shelf. The "competitive streak" in the slap is a claim. Any cat-ear or fox-ear VTuber could play this exact red light / green light game with the name changed, and the dossier admits such clips exist. Her body never joins the game: the ears could twitch or curl as an octopus tell when you move, her glowing dots could flare when she senses you, and the barb tail could twitch or block. That is fewer than three Raymi-only moments, so this is slop risk. It is not yet a block, because the ears are the main element and canon.

3. **Against the top three.** Renai, LGW and POP IN 2 each have one world that changes and an ending that pays off the start. Here the creep escalates well (1, 2, then lunge), but the payoff picture is a calm wide shot that does not answer the opening picture. There is also no reinvention of the game's convention in her world. The "!" icon is generic, where an air bubble or ink puff could carry it.

4. **Dead stretches.**
   - OPENING: hooks. Her face is big at frame 0, the fear and the stamp read in under 1 s, and the threat holds attention.
   - Shot 1 is 3.0 s of a held pose with "handheld breath", which is borderline dead. The bed's only measured hit before 19 s (1.45) falls exactly on the end of "ears." (0.15 + 1.30), and the script does not use it.
   - The last third: the strongest beat is the slap at 11.55. Shot 7 is 3.6 s of a slow push-in on a sitting wave, so the ending is weaker than the climax.
   - The loop claim "last picture echoes frame 0" is false: a wide of her sitting does not echo an MCU of her standing.

5. **Unreasoned elements.**
   - Shot 2 says she "fiddles with the shelf", but the clip is look-around. Her hobby is written in and then not shown.
   - Shot 4 uses texting-while-standing. A phone is not in her world or her lore; this is asset-first (principle 12).
   - The black 11.70-12.40 lasts 0.7 s with "nope" spoken into it, an empty frame for the punchline word.

6. **Sense.**
   - The distance maths breaks. You start at 2.2 m and one 0.45 m step leaves 1.75 m, yet shot 4 opens at 1.2 m with no step seen.
   - After two more steps her face is 0.5 m away, and the "lunge" is 0.6 m from there, which passes through her.
   - The door wide puts you outside the room with no move that shows it.

7. **Script-specific checks.**
   - **Timing does not match the measured map.** `assets/music/investigations.map.json` (raymi/bed.py) measures 95.7 bpm, beats every 0.627 s from 0.196. The dossier states 94 bpm, 0.639 s from 0.492, and the script's "beat 3.05" follows the dossier's figure; no measured beat exists there.
   - Cuts against the measured beats: 3.00 (nearest beats 2.704 / 3.331), 8.60 (8.346 / 8.973), 10.60 (10.854) and 12.40 (12.108 / 12.735) are all off-beat.
   - Steps against the measured beats: 6.90 (beat 7.092) and 7.55 (beat 7.719) are off by about 0.17 s. They were meant to land on beats.
   - Hook stamp: the table says 0-2.6, the text says "until ~2.4 s", and "it." actually ends at 2.80.
   - Shot 1 lists "i mean it." at 1.95, but it is part of one take that is placed at 0.15, so it lands at 2.18.
   - Shots 2, 4 and 6 are the same set-up three times (her back, you step). The change comes from the camera distance alone, and the set-up never changes. That is acceptable for the game form, but the steps themselves need to vary.

VERDICT: BLOCK: fault - the cuts and steps are timed from a beat grid (94 bpm from 0.492) that contradicts the measured bed map (95.7 bpm, 0.627 s from 0.196), and the ending wide breaks both the POV contract and the claimed loop.

FIX 1
observation: The rows use the dossier's grid ("beat 3.05", 0.639 s); the measured map has beats at 2.704, 3.331, 4.584, 6.465, 7.092, 7.719, 8.973, 10.854, 12.108, 12.735, with a hit at 1.45.
effect: The steps and the whips fall between the pizzicato plucks, so the creep stops feeling like a game played to the music.
cause: Measure, never guess (rule 10); a real fault.
change: Fix the dossier's §1 to the measured map. Retime every cut to one frame before a measured beat, and put the steps on 3.958, 7.092 and 7.719 (or move the lines to fit). Put the shot 1 ear-clamp accent on the hit at 1.45.
priority: high

FIX 2
observation: Shot 7 is a wide from the door with a slow push-in, sitting and waving, and it is claimed to loop to frame 0.
effect: The climax (the slap) is followed by a calm denouement, the loop jumps visibly, and the cut breaks the "camera = you" contract.
cause: The ending must be the strongest (A5); the loop and POV contract (series dossier).
change: Lift the hand off the lens. She is in MCU, both hands back over her ears, leaning into the lens, smug. She says "how close did you get?" (stamp 12.5-16.0), then holds on a narrowed-eye stare that matches frame 0 exactly, so the loop is seamless and the game restarts.
priority: high

FIX 3
observation: The only Raymi-only beats are the ears and the plush; her body never takes part in the game.
effect: It reads as the generic "don't touch my ears" VTuber bit with a reskin.
cause: Raymi is the reason (A3); anti-slop.
change: Give her octopus-ear tells. The tako ears curl or twitch on each of your steps, which is the cue for her to whip round; her glowing dots flare on "i saw that!". Her barb tail flicks up between you and her in shot 5. Replace the "!" icon with a burst of air bubbles.
priority: high

FIX 4
observation: Shot 2 has "fiddles with the shelf" on the look-around clip, and shot 4 has texting-while-standing.
effect: Her hobby is written down but not seen, and the phone is a prop chosen because the clip exists.
cause: Line -> picture -> asset, never reversed (B12); props need a role (B15).
change: In shot 2 she arranges the knick-knacks, holding up the salmon plush. In shot 4 she polishes or rearranges a second figurine. Use a reach / pick-up clip on the shelf, not look-around or texting.
priority: medium

FIX 5
observation: Distances go 2.2 m -> 1.2 m with only one step of 0.45 m, then 0.5 m, then a 0.6 m lunge.
effect: Either the build cheats unseen jumps or the lens passes through her, and the creep's logic dies.
cause: Places make sense (B15); rows the build can execute.
change: Write the distance chain: 2.2 m, one step to 1.75 m, two steps to 1.05 m, her lean-in to 0.55 m. In shot 6 she turns away and moves 0.3 m off, then the lunge is 0.5 m to her ear height. Name the eye height.
priority: medium

FIX 6
observation: The black runs 11.70-12.40 while "nope." plays at 11.69-12.08.
effect: The punchline word is spoken over an empty frame, and 0.7 s of nothing to see sits inside the climax.
cause: An event every 2-3 s, no dead picture at the payoff.
change: Keep the hand on the lens but not fully black. Let the light bleed through her fingers with her eye visible in a gap as she says "nope.". Cut on the beat at 12.108 to the reveal from FIX 2.
priority: medium

FIX 7
observation: The hook stamp's times conflict: 0-2.6 in the table, ~2.4 s in the text, while the take puts "it." at 2.18-2.80.
effect: The stamp drops before the spoken line ends, or the build guesses.
cause: Timing data must be consistent and measured.
change: Set the stamp to 0.0-2.9 s, and place "i mean it." as part of the single take at 0.15 (it lands at 2.18), not at 1.95.
priority: low
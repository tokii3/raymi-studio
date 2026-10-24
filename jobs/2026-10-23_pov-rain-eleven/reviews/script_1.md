1. **Retell (muted):** Frame 0 is a big close-up of her leaning into a studio camera, with the stamp "rain tomorrow. 100%". A whip pulls back to a weather studio. She points at a ticker that reads 3 RIGHT / 10, and a sweat icon pops up. In a medium shot she flips her hair and a sparkle appears. She slaps a map of Japan, a rain cloud marked 100% stamps onto Tokyo and drops fall, then the camera cranes up to her face. She leans in close and her hand covers the lens, and the screen goes black. She ends up sitting at the desk under a CTA stamp while the ticker scrolls "RESULT IN THE PINNED COMMENT". It reads muted. The weak spot is that the end is just her sitting down.

2. **Slop test:** Moments that only work because it is Raymi: (a) the public 3/10 counter from her rain-record lore. That one is real and checkable. (b) "basically a streak" is borderline: confidence is part of her canon, but any weather-girl character could say it. (c) Covering the lens is not hers. Any presenter's hand does it. Her body is missing for the whole 18 s: no tail, no tako ears, no flat-ray shape, no burying in sand, and nothing from the ocean even though the set's map is an ocean map. That is fewer than three. Swap in another name and you get a generic "weather girl bets on rain" Short with a counter.

3. **Against the top three:** LGW took its idea from her name and Renai fused the medium with her sea. Here the TV weather convention is used as it is and never reinvented in her world. There is no turn with a payoff inside the video. The bet stays open by design, which is fine for comments, but then the lens cover has to be the punchline, and it lands at 2/3 and is followed by a calm sit.

4. **Dead stretches:**
OPENING: hooks. Her face is big, the spoken hook starts at 0.24 s, and the stamp reads instantly. It is a strong personal_fact claim.
- Shot 1 runs 3.6 s with only a "tiny push-in" and a nod. The stamp could land in two hits (on "rain" at 0.24 and "one hundred" at 1.90) to break it up.
- Last third (12-18 s): the lens cover is the strongest beat, then 3 s of medium-shot sitting with a "slow push". That end is weaker than the middle.
- The loop is claimed but false: the last frame is a seated medium shot and frame 0 is a leaning extreme close-up.

5. **Unreasoned elements:**
- The camera contract says every move is "you", but the whip_out (shot 2) and the crane (shot 4) are cinematic broadcast moves. Is the lens your body or the TV studio camera? The script uses both and decides neither.
- The sparkle icon is decoration.
- The ticker text "RESULT IN THE PINNED COMMENT" competes with the CTA stamp in the same 3 s. Two texts at once, and the ticker band likely sits in the bottom UI band in a medium shot.

6. **Sense:**
- Shot 6 says "arms crossed, nods" but names the clip sitting-thumbs-up. These contradict each other.
- Shot 5's "clip reaching" does not exist in the clip catalog. Only cover_lens is on the build list.

7. **Script-specific faults (times vs. the measured map):**
- The dossier says cuts land one frame before a beat. The script's cut times do not:
  - 3.60: the script claims "one frame before 3.79", but one frame early is about 3.75 (0.15 s off).
  - 6.40: beat at 6.514.
  - 8.40: beats at 8.151 / 8.697.
  - 12.60: beat at 12.516, so this cut is after the beat.
  - 15.00: beats at 14.699 / 15.245.
- Voice placement is listed as separate takes, but each row is one take:
  - "one hundred percent" starts at 1.90, not 1.60.
  - "rain." starts at 10.57, not 10.30.
  - "trust me" starts at 11.71.
- The slap at 9.0 lands mid-"tokyo" instead of on "rain.".
- The hook stamp is "0-2.9 s" in the table but "until ~2.4 s" in the hook section. "percent." ends at 3.11, so either value cuts it before the word is finished.
- The black at 14.60 swallows "this." (14.53-14.90). That may be intended as muffled, but the script does not say so.

Would less be stronger? Shot 3's hair flip plus sparkle is a beat that could merge into shot 2. Would the extreme version be stronger? Yes: her hiding move should be HER body, not a hand.

VERDICT: BLOCK: slop - apart from the rain counter, nothing needs Raymi (no tail, ears, ray shape or ocean anywhere), and the closing beat is a generic presenter covering the lens followed by a calm sit.

FIX 1
observation: The hiding gag is a hand covering the lens, which any presenter could do. Her body and ocean never appear.
effect: It reads as a generic weather-girl skit, and the viewer meets nothing that makes them want to see her again.
cause: PRINCIPLES A3/A4 (Raymi is the reason, fuse the medium with her ocean); slop test.
change: Replace the hand with her body. Either her tail barb swings across the lens like a wiper and blacks it out, or she flattens and drops behind the desk like a ray burying in sand ("you never saw this"). Then she pops back up into an extreme close-up at the lens. Build it as a reusable pose plus fx.
priority: high

FIX 2
observation: Shot 6 is a 3 s seated medium shot with a slow push, after the strongest beat. The loop is claimed but frame 18 does not match frame 0.
effect: The Short sags at the end, and the loop visibly jumps from a medium shot to an extreme close-up.
cause: A5 (the ending is never weaker than the start); loop rule of the series.
change: End with the pop-up from FIX 1 into the same lean extreme close-up as frame 0, with the CTA stamp from 15.0 s. Drop the sit and the thumbs-up/arms-crossed contradiction. Her last nod matches frame 0's hard-head-nod.
priority: high

FIX 3
observation: The cuts at 3.60, 6.40, 8.40, 12.60 and 15.00 are not one frame before a beat. The "beat 3.79 - one frame before" claim is wrong by 0.15 s.
effect: The cuts drift against the elevator music's pulse and feel off without the viewer knowing why.
cause: C fault: the rows do not match the measured map (local-forecast-elevator.map.json); B13.
change: Re-time the cuts to beat minus one frame: 3.75, 6.48, 8.66, 12.48, 15.21. Shift the voice placements to match, and keep the CTA stamp at least 2.5 s before the end.
priority: high

FIX 4
observation: Voice times are listed as separate starts (1.60, 10.30), but they are word times inside single takes (1.90, 10.57). The slap at 9.0 hits mid-"tokyo".
effect: The stamp and slap fire before the word, so the picture and the line do not land together.
cause: Rule 10 (measure, never guess); B12 (the picture does the line).
change: Write the word times measured from each take's json. Put the slap and cloud stamp one frame before "rain." (8.45+2.115). Make the hook stamp hold until at least 3.2 s, with "100%" appearing at 1.90.
priority: medium

FIX 5
observation: The whip_out and crane are broadcast-camera moves. The contract says the camera is "you".
effect: The POV promise breaks, and it feels like watching TV instead of being addressed.
cause: Series format: camera = you; B9 (frames as objects with a reason).
change: Decide on one. Either the lens is the studio camera all the way (cut to the second pedestal camera, tally light switches 1->2, and she turns to find it) or it is your body (step back, lean in). Write each move as that action.
priority: medium

FIX 6
observation: The ticker "RESULT IN THE PINNED COMMENT" runs under the CTA stamp. Shot 5's "clip reaching" is not in the catalog.
effect: There are two texts to read in the last 3 s, and the ticker may sit in the UI band. The build stalls on a missing clip.
cause: C (text outside the UI bands, one CTA); rule 4 (catalog only).
change: The ticker keeps "RAIN RECORD: 3 / 10" (or "#11 PENDING"), and the pinned-comment line goes in the upload text. Name a real catalog clip for the reach (for example action-adventure-stand-to-cover-2) or put the clip on the build list.
priority: medium

FIX 7
observation: Shot 3 (hair flip plus sparkle) is a 2 s beat whose only reason is "confidence is cute".
effect: It reads as filler between the counter and the bet.
cause: B12/B13 (each beat earns its place).
change: Fold "basically a streak" into shot 2 as a cut-in reaction close-up at the lens with her tako ears perking up proudly. Give the freed time to the pop-up ending.
priority: low
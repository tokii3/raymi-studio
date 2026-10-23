1. **Retell (muted):** Your knuckle hits the aquarium glass. A ripple spreads and Raymi glares at you from behind it, hands on hips. She points at a DO NOT TAP THE GLASS sign. You tap again, so she taps back from the inside and the ripple comes from her side. She fogs the glass and writes a mirrored NO in it. You tap twice. She shakes her head and raises one finger as a warning. You tap once more, she dives into the sand in a burst, and only her eyes and tako ears show. A heart appears in the fog while a question stamp asks how many taps you counted. **The muted story reads.** It is a clean escalation with a payoff.

2. **Slop test:** Moments that only work because it is Raymi:
   - she buries herself in the sand like a ray
   - her tako ears are the last thing above the sand
   - the tank is her own world from the KING MV, where visitors already tapped her glass
   - her competitiveness turns into the counting question

   That is four, so it is not slop. The fog writing is generic, though. Breath fog is a land thing, and underwater it makes no sense (see 6).

3. **Against the top three:** For a Short the bit is strong: one claim, a turn (she fights back) and a body payoff. What LGW has and this lacks:
   - **The ending.** The strongest beat (the bury, 12.6-14.3) is followed by a 3.2 s close-up of a sand mound under two voice lines. The payoff is short and the tail is soft.
   - **The loop.** The script claims "the last picture echoes frame 0". It does not: the last picture is a sand mound with eyes, and frame 0 is her standing at the glass glaring. Nothing carries the loop.
   - **What the taps do to her.** Canon gives her a fear of "loud sudden noises", but the taps change nothing in her body. Every reaction is spoken. If each tap made her flinch harder (ears jump, a fin twitch), the escalation would read muted and get funnier.

4. **Dead stretches:**
   - **OPENING: hooks.** Tap + ripple + her glare + stamp at frame 0 is a real hook. But "MCU, hands on hips" cannot also give "face fills at least 40 % of the frame height". Hands on hips means a waist-up shot with the face at about 15-20 %. Decide which one.
   - **No span over 3 s is dead.** Shot 7 (3.2 s) holds only blinks, ear twitches and a heart. It is borderline and, as the final third, it is weaker than shot 6.

5. **Unreasoned elements:**
   - **Fog.** "The fog lyric material" exists in the studio, and that is the whole reason given. The reason is the asset (principle 12 reversed). Her world offers algae film on aquarium glass, or her own bubbles.
   - **The heart in shot 7.** No chain at all (see 6).

6. **Sense:**
   - **Breath fog on the inside of a water-filled tank is impossible.**
   - **The heart in shot 7 cannot happen.** It is "drawn from inside" while she is buried with only her eyes showing. Nobody can draw it.
   - **Your taps are not visible.** Only a ripple and a 2-frame shake show them. With sound off, a swiper may not know that YOU tapped. The tap is the main element and needs your fingertip or knuckle in the picture.

7. **Script-specific checks:**
   - **Overlapping voice (real fault).** "fine. i'm a rock now." is one take (`554836f6fa`). Placed at 13.10, its "i'm a rock now" runs 14.37-15.29. The CTA take placed at 14.40 runs 14.49-15.91. Two lines play on top of each other exactly where the comment question must be clear.
   - **"gone." runs into the final tap.** The warning take `e3f043d34b`, placed at 10.30, ends "gone." at 12.91. The final tap (12.70) and the cut (12.60) land inside the word, and that is not written as intended.
   - **Times do not match the measured map.**
     - The dossier gives the beat as "0.743 s from 0.464". `fluffing-a-duck.map.json` has its first beat at 0.201.
     - Cuts 2.60, 9.60 and 12.60 are on no beat. Cuts 4.50 and 6.90 are not one frame before a beat.
     - Line starts 2.70, 5.60, 8.60, 10.30 and 13.10 are not "on or just before a beat".
     - Taps 4.60, 9.70, 10.05 and 12.70 ignore the measured hits (5.403, 9.118, 12.09 …). The taps are percussion and should play the bed.
   - **Shot 2 camera.** The spline pan from her to the placard and back is fine as "you looking". Shot 6's crane-down should be written as YOU crouching, with a handheld feel, not a crane.
   - **Placard type.** Must be in the brand font, and readable at phone size.

VERDICT: BLOCK: fault - two voice takes overlap at 14.37-15.29 under the CTA, and the cuts, line starts and taps do not follow the measured bed map, which the dossier also states with the wrong beat offset.

FIX 1
observation: "i'm a rock now" (14.37-15.29, part of take 554836f6fa) overlaps the CTA take placed at 14.40 (spoken 14.49-15.91).
effect: two Raymi lines at once, the comment question is muddy and the rock gag is lost.
cause: real fault (voice placement), CTA readability rule.
change: start the CTA at 15.06 (beat), ending at 16.58. Run the stamp 15.06-18.03 and extend the film to 18.03 (still within 15-19 s; 2.97 s of stamp before the end).
priority: high

FIX 2
observation: the rows are not timed to fluffing-a-duck.map.json (beats 0.201 + n*0.743), the dossier's beat offset (0.464) is wrong, and "gone." (ends 12.91) collides with the final tap at 12.70.
effect: taps and cuts float against the bed, the gag rhythm is mushy and the last warning gets stepped on.
cause: measured map / cut one frame before the beat.
change: fix the dossier offset. Retime against the map, for example:
- double tap on hit 9.118 and on 9.49
- cut into shot 5 at 9.08
- warning take at 9.86 ("gone." ends 12.47)
- final tap on 12.833, cut at 12.80
- burst on 13.576
- "no." on hit 8.375
- her tap-back on hit 5.403
- the other cuts at beat minus one frame
priority: high

FIX 3
observation: the shot 7 heart is "drawn from inside" while she is buried, and nothing loops back to frame 0 even though the script says it does.
effect: the end goes soft and illogical, and the loop jumps visibly.
cause: A5 (ending strongest), B15 (sense), the loop rule.
change: cut the heart. At about 17.3 your knuckle rises toward the glass again and her eyes go wide; that cuts straight into frame 0 (TAP). Optional: the sand mound twitches once on each beat as she counts too.
priority: high

FIX 4
observation: breath fog on the inside of a water-filled tank; the reason given is the existing fog material.
effect: the physics breaks and the asset was picked first.
cause: A4 / B12 (the line decides the picture; reinvent it in her ocean).
change: she wipes NO, mirrored, into the algae film on the inside of the glass (a real aquarium thing). Alternatively she blows bubbles that line up as NO. Keep the stroke reveal.
priority: medium

FIX 5
observation: your taps show only as a ripple plus a 2-frame shake, with no hand in the picture.
effect: muted, the viewer does not get that THEY are the tapper, and the count CTA loses its basis.
cause: B16 main element, camera = you.
change: a knuckle or fingertip enters from the lower frame edge on every tap (a reusable POV hand part), ripple and shake on contact. Her tap-back hits the same spot from the other side.
priority: medium

FIX 6
observation: the taps do not affect her body; her reactions are only spoken lines.
effect: the escalation reads by voice, not by picture, and a canon trait goes unused.
cause: A2 story of actions, A3 (canon: "loud sudden noises").
change: on every tap she flinches, and harder each time: ears jump, a fin twitches, on the double tap she is shoved half a step back. The bury becomes her only way out.
priority: medium

FIX 7
observation: frame 0 says "MCU, hands on hips" and also "face at least 40 % of the frame height".
effect: either the hook face is too small or the hands-on-hips pose is cropped away.
cause: B6 (first second: her face big).
change: frame 0 is a close-up with her face at about 45 %. Arms crossed against the glass can still show the anger at the bottom edge. Hands on hips moves to shot 2 (medium) together with the pointing.
priority: low
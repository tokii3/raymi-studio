Judged from 4_SCRIPT.md v2 and shots.json. I have not seen a still, so every pose and act claim below is unverified.

1. RETELL. A warm, dim bedroom from above: Raymi lies on her pillow, one eye open, glaring at you ("you woke me up. at six."). Cut at 2.97 to a closer lying view, deadpan: "why are you awake." Cut at 4.92 to a three-quarter view where she sits on the bed edge ("why am i awake."). At 6.26 the alarm beeps twice, she turns her head to the clock, and an "!" appears. At 7.53 the clock is shown, the frame jolts on the smack, and she says "no." At 9.48 she is seen from above on the mattress, and on "rules" (11.68) she goes flat. At 12.73 the same top-down, flat, with snore bubbles: "what time is too early?" Muted, I follow it only from 6.3 s. Before that it is lying faces. The smack itself is not drawn: the hand is not in frame in shot 4 and may not be at all.

2. SLOP TEST. Only Raymi: (a) the flatten into the mattress like a ray into sand, (b) "ray rules", (c) the sleepy baseline from canon. The alarm blame ("who woke me up") is a generic POV trend that any streamer can do. Count: 2.5. Borderline slop. The strongest picture is the flat ray from above, but it lands at 11.68, and the sleepy canon is shown with no hook.

3. TOP THREE. The change in the world is the best part: the lying girl turns into the flat ray. But the room does not change, nothing pays off the alarm after the smack (it does not stop on screen and nothing changes), and the Short does not end on the peak.

4. DEAD STRETCHES. OPENING: does not hook. 0-4.92 is two calm lying shots at clip speeds 0.6 and 0.4, dark 0.35, with only slight pushes. Nothing new happens to the eye in 5 s. The first sound event is the beep at 6.26. A searcher sees a dim face that glares, with a stamp, and has no reason to stay for 3 s. This was v1 fix 4 (alarm at 0.0 or a brighter open) and it was not taken. Shot 5 (9.48-11.68) is 2.2 s of a crouching idle from a static top-down. The "flops back" action is not in the data, only a cut. The sfx pop at 11.459 lands 0.22 s before the flatten (11.68, "rules" 11.68) and a thud or chime is missing at the flatten itself. Last third (10.2-15.36): the flatten is the peak at 11.68, then 3.7 s on a flat ray, a static camera in shot 6 (2.6 s, one key), and silence after the question ends at 14.04. The Short ends weaker than its peak, which is the v1 fix 3 fault, solved only for timing. The thumbnail promise is not defined.

5. UNREASONED. v1 fixes done: beeps added at 6.26 and 6.91, a `grab` smack at 7.56, the flatten on "rules", and the "hair a mess" text removed. Not solved: (a) the smack is `sit_offer` + `act: "shake"` at rotY -120, and the camera at (1.0, 1.0, -0.1) looks at the clock from 0.45 m away. The hand's reach is not guaranteed to show, and the clock does not stop. (b) She "sits up" by a cut. (c) The 4_SCRIPT.md Loop line says the last shot returns to frame 0's framing, but shot 6 is a top-down on a flat ray, not the pillow face, so the table lies. (d) The hook says "you woke me up", yet the alarm, not the viewer, wakes her at 6.26, and the blame is logically weak. (e) The `!` icon at 6.42 comes after the beep at 6.26.

6. SENSE. She sits at (0.55, 0, -0.2) on the bed edge: seat height 0.45 against a mattress at about 0.48, so legs may clip into the bed. Shot 5 puts the crouch at (0.5, 0.48, -0.2), consistent in position. The flatten from above must read as a ray, not as a person lying down, and `crouch` with `rotY -90` is unverified for that. Do not render before a pose or stills check.

7. SCRIPT. The camera travels more than before (shot 3 push, top-down, close on the clock). But shots 1 and 2 are the same set-up with a small push; shots 5 and 6 are static top-downs. Cuts land on beats and the measured table is clean. The CTA is on screen 2.63 s, only 0.13 s above the 2.5 s limit.

Extreme version: start with the alarm blaring and her eye snapping open. Less: cut shot 2 and give 2 s to the smack and the flop.

VERDICT: BLOCK: thin - the first 5 s are two calm lying shots with no event, the smack and the flop are not drawn, and the flatten at 11.68 is followed by 3.7 s of static hold.

FIX 1
observation: 0-4.92 is two lying close-ups on slow clips, the first beep is at 6.26, and the first second is a dim, calm face.
effect: a swiper or searcher leaves at 3 s with no promise paid; the Short opens slower than the lore Shorts that work.
cause: B6, B13
change: Move the first beep to 0.0-0.3 (clock ringing in the corner of frame 0 or the alarm already going) and let her eye snap open on "you woke me up."; merge shots 1 and 2 into one with a push, and give the freed 2 s to the alarm building (beeps at 0.6, 1.3, 2.0 ...) so the smack is the first-third payoff. Raise `dark`/`lamp` so the face reads.
priority: high

FIX 2
observation: The smack is `sit_offer` + `act: "shake"` and the camera is on the clock; the hand may not enter the frame, and the clock does not react after.
effect: the key gag has a sound and a jolt but no visible hit.
cause: B8, B12
change: Frame shot 4 so her forearm enters from the left, or use the clock's own reaction (hop, bell stops, ring stops on 7.56). Verify the arm pose on a stills run before the render.
priority: high

FIX 3
observation: Shot 5 shows her crouching in place for 2.2 s, then flattens. The "flop back" is not in the data, the pop sfx (11.459) is 0.22 s before the flatten and nothing marks the flatten itself.
effect: the best moment (flat ray) arrives without build and without a sound.
cause: A5, B13
change: Start shot 5 with her dropping onto the mattress (a squash/pop act at 0.0, whoosh 9.509), put a chime or soft thump exactly on the flatten (11.68), and move the pop to the flatten start.
priority: high

FIX 4
observation: After the flatten (11.68) the Short stays on a static top-down, and the question ends at 14.04, leaving 1.3 s of silence.
effect: the last third is the weakest part.
cause: A5, B13
change: Keep moving in shot 6: a slow orbit or descent into the sheet, a tail twitch, snore bubbles rising one by one, the clock giving a final tiny tick; or move the question onto the flat frame at 11.7 and end on a last gag (the alarm rings again, her flat tail swats it).
priority: high

FIX 5
observation: The Loop line says "returns to frame 0's framing", but shot 6 does not. The hook ("you woke me up") also contradicts the alarm as the cause.
effect: a text that lies about the picture, and a loop that does not loop.
cause: B12, A2
change: Either end on the pillow face (one eye opens again, the clock rings softly) or delete the loop claim from the script. Choose one blame: the viewer woke her (then you act: a lens tap or a lamp click) or the alarm did.
priority: medium

FIX 6
observation: The ray-bit "ray rules" is only a spoken line, and the thumbnail promise is undefined.
effect: the Raymi-only count stays at 2.5; the search click is not paid at the start.
cause: A3, B6
change: Define the thumbnail as the flat ray on the bed from above; show 0.3 s of it in the first seconds (or a "ray rules" stamp on it) and tie "rules" to the canon rain/rank bit if you want it to be lore.
priority: medium

FIX 7
observation: Seat height 0.45 on a bed edge, and `crouch` for the flatten, are unverified.
effect: legs through the mattress or a flat "person" instead of a ray.
cause: B15, handoff 4
change: One stills run of shots 3 and 5-6 plus `raymi exposure`, and look before the final.
priority: medium

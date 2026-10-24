1. RETELL. Dark warm bedroom, seen from above: Raymi lies on a pillow, one eye open, glaring up at you: "it's six in the morning." Closer, both eyes, deadpan: "why are you awake." She sits up on the bed edge, half-closed eyes: "why am i awake." Then, 2.8 s later: the clock on the nightstand rings and she smacks it, the frame jolts, "no. five more minutes. ray rules." From above she flops flat into the mattress like a ray into sand. Back to frame 0 on the pillow, one eye open: "what time is too early?" Readable muted, except the smack, which is not in the data.

2. SLOP TEST. "Grumpy girl woken at 6am" is a standard POV trend. Raymi-only: the flatten into the mattress (strong), "ray rules", sleepy baseline. Three at best, and the flatten is the only visual one. Borderline.

3. TOP THREE. Renai/LGW/POP IN 2 build one world with a change. Here the bedroom does not change and the Short ends where it started. The flatten is the idea; it comes at 11.3 s with 1.4 s left of silence, and the question after it is flat.

4. DEAD STRETCHES. OPENING: moody and different from the chat shorts, and "one eye open" is a nice first picture, but dark 0.45 + a calm lying face + a voice that states the time is a slow start; no action in 0-2.3 s except a clip at speed 0.6. Shot 3: after "why am i awake" ends (5.38) there are 2.7 s (to 8.2) of a seated idle with sorrow and blink: nothing happens. Shot 5 is only 1.95 s and the flatten starts at 0.5 into it. Last third: the CTA hold (12.7-16.0, 3.3 s) is a lying face on a slow clip at speed 0.3; the ending is the weakest part. The Short does not end on its peak.

5. UNREASONED. The clock has `ring_at: 8.2` but the sfx list has no ring: the alarm is silent until the smack, so there is no setup and the punchline arrives with its cause. "She smacks it without looking" has only `sit_offer` + rotY -120 + `act: "shake"`: no smack. "Hair a mess" has no data. The hook stamp ("you woke me up. at six.") says something different from the first voice line, so voice and stamp do not double each other. A mirror of "why are you awake / why am i awake" is the best line and is buried.

6. SENSE. Shot 5 places her crouch at y 0.48 on the mattress with rotY -90 where she sat at (0.55, 0, -0.2) in shot 3: the bed spot changes. From above the flatten must read as a ray, not a person lying down. Unverified.

7. SCRIPT. Camera travels little: shots 1/2 are small pushes, shot 3/4 same position. Repeated set-up (1 and 6 identical, intended). The jolt on 8.2 is good.

VERDICT: BLOCK: thin - the alarm gag has no setup or smack action, shot 3 has a 2.7 s dead hold, and the Short ends on a 3.3 s calm hold after its only Raymi-only moment.

FIX 1
observation: The clock rings silently at 8.2 and the smack is not animated.
effect: gag has no build and no hit.
cause: B12, B13
change: Add a ring sfx (beeping) from about 6.6 s through shot 3, increasing, ending with `grab` at 8.208; shot 4 gets a real reach-and-smack (arm swing pose or a clip, a clock hop, a shaking icon).
priority: high

FIX 2
observation: Shot 3 holds 2.7 s after the line.
effect: viewer waits.
cause: B6, B13
change: Fill 5.4-8.1 with the beeping alarm entering, her hair/tail flopping, a push to ECU on the half-closed eye, and a slow head turn to the clock. Or cut the shot short and start shot 4 earlier at 6.6 with the ring.
priority: high

FIX 3
observation: The flatten happens at 11.28, after the line, and the Short ends on a calm lying hold.
effect: peak at 11-12, last 4 s limp.
cause: A5
change: Time flatten to "rules" (11.03), hold it a beat, then keep the final CTA shot moving: her tail twitch, a snore bubble (icon `bubbles`), the clock still ringing small. Consider moving the question to the flat frame itself.
priority: high

FIX 4
observation: Frame 0 is dark and calm, with the hook only a stamp.
effect: slow opening.
cause: B6
change: Open with the clock hand slamming or the alarm ring at 0.0 and her eye snapping open at the lens; raise `dark` to 0.35 so the face reads brighter; drop the spoken time line in favour of "you woke me up. at six." matching the stamp.
priority: medium

FIX 5
observation: "hair a mess" and "sits up" have no data.
effect: text promises more than the picture.
cause: B12
change: Add a bedhead (hair spring offset or a prop) or remove it from the table; ensure the same bed position in shots 3 and 5.
priority: medium

FIX 6
observation: Voice and stamp say different things in the hook.
effect: weaker 1-second read.
cause: strategy hook rule
change: Make the first spoken line "you woke me up. at six." as the stamp, keep the time joke as the second line.
priority: low

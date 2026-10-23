**1. Retell (muted)**
In a dark bedroom with a jack-o-lantern, Raymi jumps into the frame wearing a salmon hood, with her face in the salmon's open mouth and pink fins on her arms, and strikes a ta-da pose. She walks like a model on a catwalk and twists so the costume's tail swings. She flaps the fins proudly. There is a knock. A salmon floats through the door wearing tako ears and a purple bow. The two stare each other down in a tilted profile shot. She shrugs, steps beside him, makes a peace sign, and a flash goes off. Both wave into the lens. The muted story works. The weak point is the ending: the flash is the payoff, and then the video drops into a wave.

**2. Slop test**
This passes. Three moments only work because it is Raymi:
- Her best friend is a salmon, and she dresses as him.
- The salmon arrives wearing her tako ears.
- "The fins are real. kind of." only works because she is a ray and really has fins.

One catch: the purple bow is not in her canon design (`canon/01_character.md`: tako ears, a stingray tail, fin shoulder pieces, ultraviolet ruffles). The script invents the bow, and her real signature parts are what would make the copy read.

**3. Against the top three**
The idea is close to Renai in kind: one object or person with a twist. The twin reveal is a real payoff. What it lacks:
- **The hook is never paid off.** "rate my halloween costume" sets up a judgement, and then the viewer is never asked to give one. The CTA switches to a generic Halloween question.
- **The question every viewer will have is left unasked.** The video ends on two Raymis side by side, so the obvious, low-effort, arguable question is "who wore it better?" The series dossier asks for "pick one", and "what are you going as" is not that.

**4. Dead stretches**
- **OPENING: hooks, if frame 0 already shows her face big.** "Jumps into frame from the side" risks an empty or blurred first frame. The clip must start on its landing key with her face filling 40 % or more of the frame. That is written as intent but contradicted by "from the side".
- **Shot 3 (4.60-7.60):** 3.0 s of fin flapping with the same set-up and no event apart from the flaps. This is borderline dead.
- **Shot 7 (14.20-17.50):** 3.3 s of waving. This is the last third, and it is weaker than both the stare-down and the flash. The ending is weaker than the twist.
- **Loop claim:** "the last picture echoes frame 0" is false. Frame 0 is her alone and big; the last frame is a two-shot. Nothing is designed to make the loop seamless.
- **Short wanting the MV:** not applicable, this is a standalone lore Short.

**5. Unreasoned elements**
- **Shot 2 "orbit 40 deg around her":** the contract says every camera move is something YOU do, and a viewer does not orbit. It is a cinematic move filed under "the trend form".
- **Shot 5 "slow push between them (vertigo-like)", "dutch 10 deg", "a western stare-down":** this is a film camera, not your body. The reason, "a western stare-down", is decoration and has no link to Halloween or to Raymi.
- **Shot 3 push-in:** whose move is it? Nothing gives it a reason.
- **Shot 6 flash "camera pop":** the flash has no owner. If YOU take the photo, the lens becomes the camera. That would be the strongest viewer-as-camera moment in the series, and it is left vague.
- **Pink fins:** salmon fins are not pink. The pink salmon colour belongs to the hood. Say why the fins are pink or make them match the salmon.

**6. Sense and love**
- **A salmon floating into a bedroom only works if the room is underwater.** The world line mentions "the round window with the sea" but never states that the room is underwater.
- **Who knocks?** A salmon has no hands. That can be a joke (a tail-slap knock), but it is not written.
- **The jack-o-lantern has no role.** It sits on the nightstand "all" video. It could light the stare-down from below, or the salmon could carry it in.

**7. Script-specific checks**
**Cut times contradict the measured beat map** (`assets/music/danse-macabre.map.json`: beats 2.295, 4.838, 7.381, 9.923, 11.618, 14.161):

| Cut | Written in script | Measured beat | Difference |
|---|---|---|---|
| 1 | 2.40 "(waltz downbeat)" | 2.295 | 0.10 s late |
| 2 | 4.60 | 4.838 | 0.24 s early |
| 3 | 7.60 | 7.381 | 0.22 s late |
| 4 | 9.80 | 9.923 | 0.12 s early |

- **Only two of the six cuts sit on the map:** 11.60 and 14.20. The dossier requires cuts on beats, one frame early.
- **The knocks at 7.60 and 7.80 fall on no beat or hit.** The hit cluster ends at 9.076.
- **Voice placement:** "wait. is that." is one take, so "is" lands at 9.21, not 9.10. Its last word ends at 9.78, two frames before the 9.80 cut. "is that." with a full stop will come out of TTS flat, not as a question.
- **Shot 5:** "look: salmon, not lens" is allowed by the series contract. The camera move in that shot is not.

**VERDICT: BLOCK: fault** - four of the six cuts (including the one labelled "waltz downbeat") miss the measured beat map by 0.1-0.24 s, and three shots break the series' camera-is-you contract with cinematic moves.

FIX 1
observation: Cuts at 2.40, 4.60, 7.60 and 9.80 and the knocks at 7.60 and 7.80 do not match the beats in danse-macabre.map.json, and 2.40 is falsely labelled a downbeat.
effect: Cuts drift against the waltz, so the edit feels sloppy instead of danced.
cause: the measured map (dossier 5), PRINCIPLES 13 (cut one frame before the beat)
change: Move the cuts to 2.26, 4.80, 7.35, 9.89, 11.58 and 14.13 (one frame before each beat). Put the knocks on 7.381 and 8.228. Shift the voice starts so each line starts on or just before a beat, and check that "is that" still ends before its cut.
priority: high

FIX 2
observation: Shot 2 orbits, shot 3 pushes in without reason, and shot 5 is a dutch-angle vertigo push between them.
effect: The viewer watches a film instead of standing in her room, which loses the "she is right in front of you" feel toki asked for.
cause: series contract "camera = you"
change: Shot 2: YOU step back to see the full costume while she walks toward you and twists. Shot 3: she steps INTO the lens and flaps the fins in your face, and you recoil. Shot 5: YOU look from her to him and back with whip pans, as a viewer caught between them.
priority: high

FIX 3
observation: The hook "rate my halloween costume" is never paid off, and the CTA "what are YOU going as?" is an open question.
effect: The promise is broken. Comments stay low-effort but not competitive.
cause: series CTA rule (pick one / arguable), PRINCIPLES 5 (the payoff at the end)
change: Change the CTA to "who wore it better?", spoken and stamped from about 14.2 s. Both pose toward the lens with "me" and "him" marked by a pointing fin.
priority: high

FIX 4
observation: The last shot is a 3.3 s wave and the loop does not echo frame 0.
effect: The video ends on its weakest picture and the loop jumps.
cause: PRINCIPLES 5 (the end is the strongest), the loop claim
change: Make YOU the photographer. The flash at 13.5 freezes into a polaroid of the two of them that holds as the CTA background. Then she jumps back into the same MCU framing as frame 0, so the loop matches.
priority: medium

FIX 5
observation: The salmon's costume is "tako-ear headband + purple bow", and the bow is not in canon.
effect: At phone size the copy does not read as Raymi; it reads as a fish wearing a ribbon.
cause: canon/01 design pillars, PRINCIPLES 16 (the main element reads)
change: Dress the salmon in oversized tako ears, a little stingray-barb tail and an ultraviolet ruffle. Scale them up so they read at phone size.
priority: medium

FIX 6
observation: Frame 0 is "jumps into frame from the side".
effect: The first frame may be empty or blurred, so the swipe happens before she lands.
cause: PRINCIPLES 6, series "frame 0 = her face"
change: Start the clip on its landing key with her face already at 40 % or more of the frame height. Add the bump on frame 0.
priority: medium

FIX 7
observation: A salmon floats in, an unseen someone knocks, and the jack-o-lantern has no role.
effect: Small logic gaps, and a prop that just sits there.
cause: PRINCIPLES 15
change: State that the bedroom is underwater. The salmon knocks with two tail-slaps. The jack-o-lantern lights the stare-down from below, or the salmon carries it in.
priority: low
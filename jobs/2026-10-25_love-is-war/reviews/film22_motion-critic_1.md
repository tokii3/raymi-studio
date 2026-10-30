MAIN ELEMENT: partly readable. Raymi is readable in the close-ups and mid shots (seq_03, phone_05). In the opening shot (0-3 s, seq_00) she is a tiny dark-blue figure at the frame edge on near-black. She is lost again in the wide rocks and seabed shots (seq_01, seq_06 lower half, phone_12). The lighthouse and its beam are the brightest thing in the sea scenes. The big lighthouse in seq_07 and the dark wide shots (phone_12) take over from her.

Note: the kit has no time stamps on the strips, so times below are approximate, taken from facts.json shot starts. The facts say still_spans_s is empty. The film is 187.6 s with 187 shots (mean 1.0 s, cv 0.88). 22 of 29 hits (76%) change the picture.

1. Does Raymi move?
- seq_00/01 (0-8 s): The opening is the weakest. She enters from the right edge, almost nothing is seen for about 1.5 s, then she glides or dives low in the frame. The body drifts with no anticipation or squash. She slides rather than swims. The camera is a nearly flat pan. The beam streak is a flat overlay.
- seq_02 (~12-20 s): Lighthouse shot, head bobbing up behind the waves. Only slight movement. The sea reads as flat layered cards, so any camera shift shows little parallax. The head and shoulders on the final strip repeat the same sway for 8+ frames, which is close to dead.
- seq_03: Real acting here. The eye close-up, the heart gesture, and the orange impact flashes on the cut. This is the best stretch.
- seq_04 (~55-60 s): About 24 frames of nearly identical image. She is a tiny, nearly frozen figure on empty navy, with only a slow drift. DEAD STRETCH, roughly 2 s, and it is also an unreadable main element.
- seq_05: Static front pose for about 8 frames, then a head turn with a heart gesture. Okay, but the move is smooth interpolation with no held key poses.
- seq_06: Ladder climb at the lighthouse, with a real camera orbit and parallax. Good. Raymi is small against the big tower.
- seq_07: The held shot at the lamp. Slow shots on a seated Raymi with little motion. The drift is slight and reads as the camera moving against a poser.
- seq_08: Head dips and turns. The head and face are partly cropped, and she goes out of frame at the bottom. It then moves to an empty seabed with no Raymi for about 12 frames. DEAD.
- seq_09: Back view, hair turns. Fine and elegant. About 30 frames at the end are black, so the strip is padded. This looks like an outro fade or kit padding.

2. Fast moves: no smear or stretch frames anywhere. Moves are smooth and slightly floaty. Impacts are carried only by the orange two-tone flash cuts, and there is no squash or overshoot on her body. Cuts are on beat in bursts (0.1 s shots at 8.7-9 s, 27.8-29.8 s, 59-62 s, 174-177 s).

3. Icons and words: no lyrics, as the brief asks. The only pops are the lamp and flash cards. Nothing checked in this kit pops with scale overshoot.

4. Broken or wrong:
- Wide shots at phone size (phone_12, seq_01 and seq_06) show Raymi as a 1-3 px figure. The orange rocks tumbling around her in phone_12 read as noise.
- The hands and arms in the swim pose (seq_01) look stiff and mannequin-like.
- Rain streaks are flat overlay lines. The sea is flat cardboard layers, and there is no spray, so the sea feels dead.
- Plastic 3D and flat 2D are mixed. The lighthouse is more detailed than Raymi, and the cardboard sea looks cheap beside her.

BLOCK: fault: opening 0-5.5 s and about 55-60 s. Raymi is a tiny, dark, nearly lost figure on near-black, and the stretch is almost static for 2 s or more.

Fixes, ranked:
FIX 1
observation: First 5.5 s and about 55-60 s: Raymi is tiny, dark, at the edge, with no face visible.
effect: The viewer is not pulled in from second 0. The brief asks for a hit from second 0 and C1.
cause: Hero scale and lighting, module 04 staging.
change: A close lens or face on 0-3 s. Rim light plus a value separation of at least 30% against the background.
priority: high
level: local
retest: phone_01 and first_glance show a face larger than 10% of frame height.

FIX 2
observation: seq_04 and the empty seabed in seq_08. Raymi does not move, or is absent, for ~2 s or longer.
effect: A dead slideshow. It breaks the 3 s static limit, and the drive stalls in the middle of a drop.
cause: Holds with no secondary action, module 04.
change: Cut these stretches to under 1 s, or give them a hit such as a pose snap, camera push or spray.
priority: high
level: local
retest: facts still_spans_s is empty, and frame differences in the strip are visible.

FIX 3
observation: No smear, anticipation or overshoot on fast moves. Floaty dive in seq_01.
effect: Weightless motion instead of hitting, against "aggressiv, raw".
cause: Interpolated clip playback, module 04 (smears, held poses).
change: Add 2-3 frame smears and stepped key poses on twos at the hits. Add stretch on the dive and squash on landings.
priority: high
level: structural:assets
retest: Strips show stretch frames at each impact.

FIX 4
observation: The sea is flat layers with no parallax (seq_02, seq_05), and the rain is overlay lines.
effect: The camera zooms a flat picture instead of travelling through space.
cause: Set depth, module 03.
change: Separate foreground and background layers moving at different speeds. Add spray and splash particles on the hits.
priority: medium
level: structural:elements
retest: A near-to-far speed ratio is visible in the strip.

FIX 5
observation: Melody and pop-ins: nothing visible follows the melody, and nothing pops with overshoot.
effect: The brief's C4 and C5 peak moments are weak.
cause: Missing designed effects, module 04.
change: Scale-pop flashes and a melody-driven element (the lighthouse beam angle on the pitch).
priority: medium
level: structural:script
retest: A muted viewer can see the melody.

VERDICT: FAIL
Faults ranked: 1) Raymi unreadable in the opening and wide shots (block). 2) Dead or near-static stretches (seq_04, empty seabed). 3) No smear or overshoot, floaty motion. 4) Flat sea with no parallax. 5) No melody pop moments.
WORST: In the opening 5 seconds, and again at ~55-60 s, the star of the film is a dark speck on black that barely moves.

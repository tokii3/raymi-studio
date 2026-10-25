# Handoff 2026-10-25 - Love is War: brief, dossier, ideas written; idea boards FAIL (not sent to toki)

Job: jobs/2026-10-25_love-is-war (MV + Short + thumbs + upload). Read 0_BRIEF.md (her words, X1-X4 answered, no
lyrics on screen), 1_DOSSIER.md, 2_IDEAS.md, clips_seen.md, reviews/ideas_brief-keeper_1.md, reviews/ideas_look-critic_1.md.

## Done
- Brief + dossier (measured song map, 129 BPM, stops 62.2 / 119.9, B5 belt 79.35). Gemini listening pass still open
  (free quota 429 all day) - prompt: listen structure / vocal vs chops / lead / 8 biggest hits / quiet passages.
- Studio parts: song_map.melody (vocal reliable, lead = estimate, BACKLOG), VrmBoard plays clips, lighthouse + beam +
  lightning (nightsea opts `lighthouse`, `lightning`), paper set (`ink`, `ink_slash`, `wash`, `black`, `heart`),
  sea cables (deep opt `cables`, `cable_pulse`, `cable_glow`).
- 36 Mixamo clips (raymi-private-assets, clips.json) - seen on raymi7: clips_seen.md (strong: roar, kicks, hook,
  casting-spell, superhero landing, floating poses, kneel/agony; weak at sampled times: reaching-out, points, yells).
- IDEAS: matrix (16 rows, T01-T17) + A Lighthouse / B Ink War / C Signal War; my pick A.

## Why the boards failed (both critics, my own look agrees)
1. Every key frame is a calm WIDE establishing shot; Raymi small, from behind or dark on dark. The brief asks for
   close, hard, mid-hit frames (references edgerunners@74/85, ado@98, hsr@108). -> template 2_IDEAS key-frame field
   now demands the C-line + one hardest close mid-hit frame per idea.
2. Skin / body saturated blue-violet under the night grades even with lock 0.75 (rule 9) - shared part to fix
   (VrmPuppet lockColours / grade on her), not per shot.
3. Clip yaw: `roar` turns her away from the lens (BACKLOG) - attack frames show her back.
4. New props read flat (bolt, beams, heart clip-art, pipes plastic, dashed cables) - one toon / ink-contour pass.
5. Ink slash plane failed twice (BACKLOG): make slashes a screen-space 2D hit layer.

## Next
Ask toki first (sent this turn): round 3 now (camera-director + fx-designer design the 3 hardest frames per idea,
fix classes 2-5 in the parts), or pick a direction from the text + reference pairs. Nothing visual goes to her
without `raymi gate` PASS (deliveries/... GATE_FAIL.json now).

## Round 3 (toki 2026-10-25 "mach runde 3 der boards: nahe, harte bilder mitten im treffer, mit kamera- und effekt-agenten, die fehlerklassen in den bauteilen fixen") - STOPPED at the usage limit
Done: makers wrote jobs/2026-10-25_love-is-war/6_CAMERA_boards3.md + 10_FX_boards3.md (9 close mid-hit frames).
Parts fixed / built (untested in the cloud, typecheck only there): grades war_night / war_ink (skin as modelled),
actor `face_lens` (clip hip yaw cancelled - roar), Fx2D `slash` (2D brush hit), `melody` (timeline fills notes from
song_map.melody via fx `src` [t0, t1]; octave slips folded), `ring` (ping at the lens), fat forked bolt, cable_r.
NEXT: translate the two drafts into jobs/2026-10-25_love-is-war-boards/shots.json (nightsea frames: she is chest-deep
at y -0.85, so subtract ~0.85 from the camera-director's standing heights; A3 she stands on the lighthouse gallery;
B2 adds a second still at 63.5 s for the melody line), push stills (round 3), look, refs pair, brief-keeper +
look-critic, gate, then toki.

## State at the end of the session (2026-10-25 late)
- toki: ideas approved (A + C + B merged into ONE world), "eher richtung 2" = graphic 2D world around the 3D Raymi,
  treatment v3 allowed after 2 BLOCKs -> v3 PASS (script-critic + brief-keeper, reviews/treatment_*_3.md / treatment_3.md).
- Built: TwoTone.tsx (background-only two-tone, tested on boards/tests - works), Fx2D slash / melody / ring, SetLight
  neutral, her rim, toonPaint + inkHull, face_lens (local hip space), war_night / war_ink grades, lighthouse / cables /
  paper parts. 14 + 36 + 9 + 5 Mixamo clips; clip sheets 1-3 seen (clips_seen.md).
- Maker drafts: 6_CAMERA_draft (104 rows), 7_CHOREO_draft, 8_EDIT_draft (91 cuts, corrections to the treatment from
  the audio: hidden stop 121.94-122.62, B5 at 79.467, no voice after 169.7).
- 4_SCRIPT v1 = a mechanical merge -> script-critic BLOCK (reviews/script_1.md, FIX 1-8), brief-keeper PASS with 3
  conditions (reviews/script_brief-keeper_1.md). NEXT: author 4_SCRIPT v2 BY HAND as one shot list on the edit's cuts
  (fix 1-8 + the 3 conditions), then shots.json, storyboard (>= 8 key moments, reference | previz) -> toki.
- Open questions to toki: text on the Short (hook "the lighthouse never looks at me." + CTA "would you look back?").
- Tool notes: agents' `python` on PATH is 3.7 - use C:/Users/Anne-/AppData/Local/Programs/Python/Python312/python.exe;
  song_map.stops missed the stop 121.94-122.62 (fix stops() in raymi/song.py); the white blob under low poses is
  still an open fault class; M1 (hand into the lens) needs a key pose in vrmPoses.ts.

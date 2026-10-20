# BUILD NOTES - FIRESTARTER (where shots.json differs from 4_SCRIPT.md, and why)

Written 2026-10-19 at the build stage. `shots.json` holds all 117 shots of `4_SCRIPT.md` v2 (PASS). Every change below
keeps what the viewer understands; none changes the story, a wow or a hero moment.

## Sprites (hard rule 9: no cut edge on screen)
The guard (`node guard.mjs`) proved that a bust whose head fills most of the image width can never hide its cut sides in
a 16:9 frame (the frame is ~1.8x wider than tall; at any head size the left / right cuts show) - and a cut top (SLEEP_129)
cannot be framed close. So the busts in the script became clean full-figure sprites with the same act:
| shot | script | built | why this one |
|---|---|---|---|
| 1 | SMUG_PLAY_045 (bust) | FOCUS_PUSH_UV_171 | the approved board A1 frame: her face beside the flame in her palm (also in the Short) |
| 12, 51 | THINK_CALM_036 / HAPPY_PLAY_046 (busts) | CALM_REST_UV_166 | eyes shut, bored - "that was easy"; 51 is the same sprite = the callback to 12 |
| 18 | SURPRISE_DRAMA_028 (bust) | WS_BK_NA_WADE_UV_182 (back view) | she watches the vent light up from behind - and the devil guard: the vent beside her, never behind her head |
| 32 | SHY_DRAMA_039 (bust) | SMUG_WINK_UV_169 | "I can be sweet": a sweet wink into the dark |
| 33 | ANGRY_KICK_198 | FOCUS_PUSH_UV_173 | the venom strike = strike 3's sprite done right (the setup -> payoff) |
| 34 | NEUTRAL_CALM_021 (bust) | CALM_REST_UV_166 | calm among the creatures |
| 35 | THINK_CALM_036 | HAPPY_SURF_UV_179 + '?' icon | the raised eyebrow at Salmon's "tea" |
| 39 | SMUG_PLAY_045 | HAPPY_SURF_UV_180 | open smile, dots fire-coloured |
| 64, 65 | WORRIED_DRAMA_024 / SURPRISE_DRAMA_028 | PAIN_CLUTCH_UV_163 / HAPPY_JUMP_UV_160 | worry at the creaking floor / the ballooning flame |
| 69 | FLY_059 (cut sides) | FLY_UV_081 (limited: face hidden - seen from below as she rides away, exactly its use) | |
| 77, 79 | SHY_DRAMA_039 | FOCUS_CROUCH_UV_192 (curled, rotated) | curled round the spark |
| 81 | FLY_059 | SHOUT_WET_UV_177 | fist up toward the surface |
| 82 | SWIM_116 | FOCUS_PULL_UV_187 | both arms up, breaking the surface |
| 84, 87, 95 | MS_HAPPY_005 (cut on all four sides) | HAPPY_SURF_UV_180 / HAPPY_JUMP_UV_161 / HAPPY_SURF_UV_179 | waist-up in the water: grin, laugh, "told you" glance |
| 88, 93 | HAPPY_SALMON_117 / THINK_CALM_036 | SMUG_WINK_UV_169 (+ bulb icon in 93) | toast / the confident rain forecast |
| 91, 97 | SWIM_116 | FLY_UV_054 | swimming / diving |
| 92 | THINK_CALM_036 | WS_BK_NA_WADE_UV_183 (back view) | watching the cloud cross the moon |
| 102, 105, 106 | SURF_125 / SURF_126 | SURF_UV_125 / SURF_UV_126 / HAPPY_SURF_UV_179 | the cut sides out of frame or under the water |
| 110 | MS_HAPPY_006 (pointing, cut on all sides) | FOCUS_PUSH_UV_171 | palms toward the lens = "you" |
| 115, 116 | SMUG_PLAY_045 | CALM_REST_UV_166 / HAPPY_SURF_UV_180 | calm, eyes closed / a smile under the last firework |
| 117 | SLEEP_129 (cut top) | SLEEP_UV_130 | eyes close on the last note |
| 47 | SURF_125 | SURF_UV_126 (its cut bottom under the floor) | |
| 56-58 | ANGRY_KICK_199 / 198 | as scripted (framed so the cut side is out) | |

## Frames
- 116: an ECU on one eye slices her face (the guard: the face fully in or fully out) - built as a close shot with the
  late firework blooming in the sky behind her.
- 36: the macro on her arm slices her face - built as a close shot on her face + arm while the glow colour runs.
- 74: she is not in the macro on the snow (passing through the frame edge sliced her face) - her flame passes instead.
- 111: the camera sinks under the surface without her in frame (the script: "her legs above").
- Lyrics on the floor that could not be read from the lens (23, 41, 55, 88, 93) lean up a little (`tilt` -15 / -20 / -60)
  instead of lying flat; 69 and 81 lean toward the lens below them.

## Hero exceptions (`why_small` written into shots.json)
2 (only her eyes in the black), 15 (the word on the floor in a low shot), 23 (she is far back: the creatures), 26 / 40 /
63 (the field / the cold / the light is the picture), 28 (the flame shielded by her body), 42 / 43 / 52 / 55 (surfing /
tossing - always moving), 62 (0 to 100: the flame outgrows the frame on purpose), 77 (a spark, shielded), 81 (seen from
far below), 82 (the split frame), 90 (small in her pool), 112 (floating, the fish light her).

## The Short
Frame 0 = the MV's cold open (FOCUS_PUSH_171, the flame in her palm) framed lower so the hook sits above her face
(stills run 1 was refused by the guard: hook / CTA on her face). Shot 14's Short twist (the crack runs at your thumb) is
`opts.short` + a top-down camera override.

## Final fix 2026-10-20 (toki: half the lyrics missing, cut off / behind assets, use the empty space)
- Cause 1: the shot list cut lines down to their key words (`lines` / `words`): 182 of 436 sung words never showed.
  Studio: lyrics v2 now write EVERY sung word; `words` become the big keys; only `"acted": [line]` leaves a line out;
  a shot without a lyric block gets one automatically (timeline.py). Now 0 words missing.
- Cause 2: v2 words were depth-tested and fogged, so vents, rocks, fish, Salmon and her hid or swallowed them.
  Words3D: v2 words draw on top (depthTest off, renderOrder 40, fog off).
- Cause 3: blocks sat where the script put them, small. guard.mjs `--fill` (check.ts fillLyrics) puts each block in
  the frame's empty space (away from her figure, the hero and the Short bands), facing the lens, as big as every lyric
  guard allows (cap 12 % of the frame height down to 5.6 %). Stored per shot as `lyrics_fit` {mv, short}.
- s65 shows its line without subs (s64 shows the same line's romaji + English).


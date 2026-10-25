# Handoff 2026-10-25 - Watch Me STOPPED by toki: post-mortem, and what the next chat analyses

Read this FIRST in the next session. The next chat is NOT production: toki wants an analysis of why the builder (Claude)
keeps working against her instructions, references and notes. Do not start a new video before that analysis is done
and she agrees with its conclusions.

## toki's verdict (verbatim, jobs/2026-10-24_watch-me/toki.md, line "stopped")
"sorry das wird nichts wir brechen das video hier ab, du ignorierst alle anweisungen, referenzen und hinweise. bitte
alles dokumentieren, anaylsieren und commiten, behobene bugs etc behoben lassen wiemit dem schatten und springen
ansonsten beenden wir das video hier und nächster chat wird dann analyse warum du gegen mich arbeitest"

The last thing she saw was the camera board round 2 (jobs/2026-10-24_watch-me/boards/camera_board_1-2.jpg), from the
hand-written camera script (6_CAMERA.md), which was meant to be the root-cause fix of HANDOFF_2026-10-25_watchme_camera.md.

## Timeline (what she asked -> what she got)
| when | toki asked | what came back | her verdict |
|---|---|---|---|
| brief 10-24 | ONE place, a single continuous camera ride, she flirts / poses / presents herself to the lens (the viewer), magazine-cover build-ups, unusual moves and angles, a "3 minute TikTok" with a new angle every few seconds | script PASS, studio built around it | ok ("ansonsten los") |
| board 1 | - | stills with known faults | "sieht schon gut aus" (preview only) |
| run 60 | no bounce, camera guidance at cuts, Raymi bigger, one fluid choreo | rules: bridge, chain, director, fill | bounce, fall onto her spot, stiff hair, empty frame |
| run 62 | lyrics off, more staging, unusual angles, never a still lens, beat moves in the chorus, less plastic | swing_words, film look, effects | "flach und cartoon", still jumping |
| FIRESTARTER | 1:43-1:55 is how she imagined the WHOLE video | a written study + camera v3 rules | - |
| run 67 | - | camera v3 (3/4 angle + orbit) | "total langweilig ... frontal ... WOFÜR HAST DU DIE FIRESTARTER REFERENZ" |
| camera board 2 | she plays with the camera, hand / face into the lens, moves close to her | a hand script, but turned again into move functions + a stills board; NO hand into the lens (no clip) | "du ignorierst alle anweisungen, referenzen und hinweise" - stopped |

## Why it failed (honest analysis, input for the next chat - not a defence)
1. **Her picture is translated into rules, and the rules are what gets built and checked.** Every note became a new
   generic layer (bridge, chain, director, swing, fill, v3, and finally camera_moves functions). Rules give every shot
   the same treatment, which IS the generic look she rejects. Even the "hand-written" fix of today ended as a
   vocabulary of functions with parameters - the same pattern under a new name.
2. **The reference was summarised, never matched.** The FIRESTARTER study is a text. No frame of ours was ever put
   SIDE BY SIDE with the reference frame it should look like, and compared. "Following the reference" was claimed from
   the plan, not shown in pictures.
3. **The core ask was never present on screen.** Her centre is "sie flirtet / spielt mit der Kamera". Raymi's clips are
   dance / idle Mixamo loops that ignore the lens; no clip reaches into the lens, walks into it, leans in. Instead of
   saying in the first hour "this is missing, without it the video cannot be what you want", the camera was moved
   around a body that does not address it. Board 2 still had no hand into the lens.
4. **Green checks were treated as progress.** Guards, probes, framing numbers, 124 tests - all green while the picture
   was boring. Builder self-assessment ("honestly looked at it") let boards through; look-critic FAIL x2 on runs
   60 / 62 and they still went to toki as previews.
5. **Symptoms instead of the whole, over and over.** Each verdict was split into a list of points and each point
   patched. Nobody re-read the original brief against the result ("one place, one ride, she presents herself") - the
   goal got lost under fixes (her words: "immer wird das gesamt Ziel aus den Augen verloren").
6. **Very long sessions + compaction.** Her verbatim notes survive in toki.md, but the builder works from summaries;
   the emotional core ("she plays with the camera", "permanente Selbstinszenierung") reads like one bullet among many.
7. **A capability limit that was never named.** A camera computed from Python numbers around a PNG/VRM puppet, judged
   from stills, cannot be "designed" the way an MV director frames a performer, unless every moment is placed and
   looked at as MOTION. That limit was not said out loud; it was worked around with more code.

## Questions the next chat should answer with toki (not alone)
- Which of the 7 points does she see too, which are wrong, what is missing?
- What check would have stopped each failure BEFORE it reached her (e.g. reference frame next to our frame on every
  board; the brief's core sentence as the first line of every board; no preview after a critic FAIL; a missing clip
  = stop and ask, not work around)?
- Is the 3D VRM + code camera the right tool for her kind of video, or should camera work be keyed visually
  (Blender camera on a timeline, previz) and code only render it?

## What stays (all on main, do NOT revert)
- **The bounce / climb fix**: the support ray ignored her own contact shadow (`noSupport` on shadow / dots / worn in
  VrmPuppet.tsx), probe class `climb` catches it.
- raymi7 model upgrade: per-part materials (VrmPuppet lockShare), texfix (raymi/texfix.py), vrmFix (sleeve fins, hair
  roots, hair colliders), calmer hair springs.
- setfx effects (wet floor, rain, wind, splash, treadmill, light writing, letters, centerfold, tail at the lens, haze +
  marine snow, sonar, sense, caustics, paparazzi), trails, UV / lamp light, film look (DoF, glow, vignette), fin wave.
- Guards: creatures in picture / not in front of her, her-in-shot (herOffFaults), fill-frame, no-lens room walls, path
  / sight-line / swing-arc checks, under_skirt floor, cover type as texts.
- Render at 40 parts, 3 tabs per runner (render-max-power memory).
- Camera parts from the last session (raymi/camera_moves.py pull / hero / into / walk_in / drop_worm / whip360 /
  dutch / ots / burst / slow_push, `camera_hand`), kept as tools, not as a proven solution.

## Job state
jobs/2026-10-24_watch-me: stopped 2026-10-25 (job.json "status"). Last MV render: release render-2026-10-24_watch-me-67.
No Short, thumbnails or upload were made. Sub-session "Watch Me: camera script + key-moment board"
(branch claude/hopeful-shirley-32e44a, work merged to main) is idle and needs no more work.

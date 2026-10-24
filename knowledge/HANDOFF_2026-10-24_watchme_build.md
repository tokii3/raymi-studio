# Handoff 2026-10-24 (late night) - Watch Me build done, stills board 1 below the bar (not shown to toki)

Read before the next Watch Me session. Everything is on `main`. Job: `jobs/2026-10-24_watch-me`.

## 1. State
- Script v2.1 = script-critic PASS round 2 (reviews/script_2.md) + its FIXes.
- Build: the must list as reusable parts (4_SCRIPT.md "Build status"): `three/setfx.tsx`, bulb / lamp_flick / crossed,
  Salmon the guard (creatures.tsx), `cover` transition, grades wm_*, lyrics `cross` + `lens` (fitter last tier).
- Guards green MV + Short; 121 py + 13 studio tests.
- Stills board 1: `boards/still_01..21.jpg` (stills run 40129527020). My own look at the contact sheet: BELOW THE BAR,
  so no look-critic was spent and toki did not get it.
- Tooling: `python` on toki's PC is 3.7 - use `py -3.12 -m raymi ...`. The host sync tool fails on "committer
  identity unknown" - rebase onto origin/main yourself.

## 2. Fault classes on board 1 (fix the shared part, then re-render the same 21 frames)
| class | seen on | likely cause (verify first) |
|---|---|---|
| close shots cut her face at the frame edge / show only hair | 01 (thumbnail frame!), 05, 21 | the face guard measures the static rig key, not the pose of the playing clip (dance clips move the head); the crash moves end too close (dist 0.35-0.7) |
| Salmon the guard is invisible | 12, 13, 14 | body 0.42 m in a 11 m hall, no light of his own, placed off-frame; scale + a rim / his beam lighting him + frame him |
| a shot is pure black | 13 (shot 55) | the `through` move puts the lens inside the painting / wall; no "lens inside a solid" guard for `through` |
| the centerfold reads as a white slab | 07 | flat untextured page, too bright, she lies flattened under it; needs her cover print, grade, a hinge read |
| new effects too subtle to read | wet floor, rain 08, splash 09, bulb 02/03, tail at the lens 20, letters 14/17 | sizes / opacities set blind; bulb hangs outside the close frames; tail tube 1.2 cm thick |
| lyric over staging text | 15 (stacked cover) | the cover's own lines are not registered as `texts` for the text-on-text guard |
| palm cover-cut shows hair | 05 | shot 17's own transition obj; the lens lyric there is blurred by the cover blur |

## 3. Next
1. Fix the classes above in the shared parts (guards first where a guard can catch it), re-run `stills.json` (round 2).
2. Look at the sheet myself; only then look-critic (one call), its answer verbatim in reviews/stills_look-critic_1.md.
3. Board to toki -> full MV + Short (render.json), then qc.json (ONE run) -> toki fixes herself.

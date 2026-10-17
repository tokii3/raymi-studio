> Copied 2026-10-18 from the old engine (brain/research/rig_and_acting.md) as evidence. Paths and tool names in it refer to the old engine (tokii3/raymi-vtuber) and do not exist here; the findings are what counts.

# Raymi in motion: skeletal rig + acting (2026-10-12)

Question: Raymi "never moves" (every critic round, toki 6x "slideshow"). How do we get Live2D-like motion from
single PNGs, sustainably, without asking toki for video?

## Findings
- puppet.py (since 10-03) warps the WHOLE PNG around guessed points with tiny amounts (bend 4 px, tilt 0.8 deg,
  a gaussian blob at the tail tip) - correct idea, too small and not articulated: she still reads as a still.
- What Live2D / Spine do: parts on BONES, every pixel skinned to bones, motion = bone angles with easing,
  secondary motion (hair, tail) lags the body.
- Without cutting layers by hand: skin by GEODESIC distance inside the silhouette (a tail pixel is far from the
  leg bone if you must travel along the drawing). Measured anatomy (sprite_anatomy.json: head box, hands, feet,
  tail tips) gives the bones automatically; the tail chain follows the drawing's own thin shape.

## Limits found in the tests (and the rule each became)
| test | what broke | rule in code |
|---|---|---|
| jolt, tail -35 deg | heart tip tore off | chain bend normalised; soft-edge connectivity for skinning |
| jolt | a bump was dragged out of her calf | static leg bones own the legs |
| wave on a peace-sign arm | face + hair dragged | hands at the face are never animated |
| wave on a hanging arm | skirt + hair dragged | only RAISED arms are free |
| raise upper arm | arm tore off the shoulder | only the forearm moves (+-20 deg) |
| CU sprites | head = most of the image | face ellipse protected: only head / spine move it |

So: tail, head, spine, breathing, squash/stretch, hops, hair sway and forearms are animated well. Big body
actions (run, throw, reach to camera, other angles) cannot be warped from a standing drawing - they need a
DRAWN pose -> library gaps (tools/library.py) -> PixAI with her LoRA on toki's go.

## Became code
- `comp/skel.py`: build (auto rig from anatomy), save/load (assets/rigs/<name>.npz = library), pose_sprite
  (inverse linear-blend skinning, warped at screen size), draw (sets core.FIG so type can go behind her),
  sheet (check image for the eye review).
- `comp/acting.py`: idle + sway, bounce, nod, tilt, shake, wag, swish, lean, jolt, deflate, wave, pump; tail
  follow-through a few frames late per joint; koma=2 (anime on twos).
- moves `act_*` (gallery demos), tests tests/test_craft_2026_10_12.py, craft gate (no skel/acting -> no build).
- Speed: ~0.06 s per figure per frame at 720p (3 figures + bg + type: 0.19 s/frame on the cloud box).

## Next
- eye-review every rig sheet once (`python tools/library.py rigs`, then look at assets/rigs/*_rig.jpg)
- blink + mouth: needs closed-eye / open-mouth drawings per expression (generate as pairs) - not warpable
- contact shadow under WS feet (unify has one: wire it into skel.draw)

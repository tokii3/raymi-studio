> Copied 2026-10-18 from the old engine (brain/research/framing.md) as evidence. Paths and tool names in it refer to the old engine (tokii3/raymi-vtuber) and do not exist here; the findings are what counts.

# Framing: why Raymi looked "falsch vermessen" and the shot grammar (2026-10-12)

Question (toki): "Raymi oft aus komischen Winkeln bzw. komische Groesse, es wirkt so falsch vermessen".

## Findings (measured with tools/library.py over all 129 drawings)
- Every job typed x / y / scale by hand -> one shot size had a different head size in every shot.
- 120 of 129 drawings are FRONT views (3 three-quarter, 3 side, 4 back, 2 high angle, 0 low angle). A real
  camera moves around a character; ours never could -> the "komische Winkel" feeling is a library gap, not a bug.
- The CU / MS drawings are cut on all four sides and portrait-shaped: in 16:9 they can only fill the frame as an
  extreme close-up; used as a "CU" they showed their cut edges = a pasted rectangle (seen in Know My Name).
- Close-ups made from full-body drawings were upscaled 1.5x+ -> soft lines ("komischer Filter, AI generated").
- Clean coverage today: 16:9 EWS 29 / WS 29 / MWS 42 / MS 44 / MCU 45 / CU 22 / ECU 1; 9:16 similar, ECU 3.

## Shot grammar (how a camera operator frames, by head height on the short frame side)
ECU 1.05 (eyes/mouth) - CU 0.46 - MCU 0.31 - MS 0.21 - MWS 0.155 - WS body 80 % of the height - EWS body 34 %.
Eye line on the upper third (0.30-0.45 by size), look room in front of her face (side from her gaze),
never cut at neck / knees / ankles, no upscale > 1.1x, cut edges must run past the frame (or sit in a panel),
no tilt > 4 deg unless the shot asks for a dutch angle, one head size per shot size in a video (+-12 %).

## Became code
- `comp/frame.py`: place_for(name, size, side), check(name, placement, panel), pick(size), consistency(shots).
- `tools/library.py`: INVENTORY.md (what every drawing can play in 16:9 / 9:16), gaps.json (angles, landscape
  close-ups, drawn actions to generate), `need <view> <size>`.
- gates: job.py elements needs size:<..> per shot; craft gate refuses jobs that place Raymi without comp.frame.

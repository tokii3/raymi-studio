# Camera - measured rules from the motion-design skill packs (2026-10-27)

Adopted from free packs (`knowledge/skillpacks/README.md`), in our words. The numbers were measured frame by frame
on professional motion films (~4,300 moves). Defaults only: a professional MV reference for the moment wins.
At 30 fps: 6 f = 0.2 s, 12 f = 0.4 s, 18 f = 0.6 s.

## Moves
- **One move per beat.** Push + pan + roll at once reads as chaos. Pick the one that serves the moment.
- **Snap + tail instead of one long ease** for a reveal or reframe: jump most of the way in ONE frame (size
  ratio 0.56-0.77), then settle over a 0.3-0.6 s decelerating tail. The snap punches like a cut, and the tail
  gives time to read. One global ease-out zoom is the AI default.
- **Size the move by its length** (measured median zoom factors): 6-frame punch ~1.25x, 12-18 f ~1.4x,
  20-45 f ~1.5x, slow drift over seconds ~2.4x. A reveal pull-back ~1.8x with an ease-IN. The hero move of a moment
  is ~4x.
- **Pans are two pushes, not one ease**: a fast first push, a slow drift, a second accelerating push, settle. One
  ease reads as a keyframe. Two pushes read as an operator.
- **Parallax**: layers at 2-2.4x speed ratios (background 0.1-0.3x, mid 0.5-0.7x, foreground 1.0-1.5x). Depth
  comes from speed difference. Foreground props blur as they cross.
- **Whips**: about 8 frames, the peak speed early (t ~ 0.25), the cut at peak speed, the new shot already moving
  the same way. In a smear film add directional blur on the last 3 frames. In a crisp film change the content
  during the whip instead.
- **Dives** (into an eye, a jewel, a screen): constant rate per octave. Interpolate log(scale) (x1.5-2 every
  2 frames), accelerate ~0.4 s, then decelerate. Aim at a detail off-centre so it leaves through the frame edge.
- **A held camera still moves**: at least ~1 px a frame of drift. Where the lens must be dead still, something
  else moves (hair, light, particles). `motion.ts` drift does this. Keep it.
- **End a moment still moving** (accelerating out), not settled, when it cuts to the next.
- **Prove a zoom with a fixed texture** (floor tiles, a grid, sand grain growing) so a 2x reads as 2x.

## Seams (the camera through a cut)
The vector law is in `raymi-editing/pro_rules.md` section 2. For the camera it means: design the LAST 3 frames of a
shot and the FIRST 3 of the next together. Same axis and direction, similar speed, both moving.
`python -m raymi seams <job>` measures it from the real keys after `timeline`.

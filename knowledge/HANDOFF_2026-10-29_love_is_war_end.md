# Handoff 2026-10-29 - Love is War: the lighthouse end, vector graphics, seabed (branch claude/love-is-war-cleanup-c7b382)

Base: this branch = origin/claude/love-is-war-build-13968f (take 14) + this session. Neither is on main yet.
State: take 16 = excerpt 120.4-187.6 (render run 89, release render-2026-10-25_love-is-war-89), gate FAIL, sent to toki
FAIL-marked with a before / after (deliveries/2026-10-25_love-is-war/end16). Waiting for her verdict.

"The end" = from the landing + ladder at 122.6 s to 187.6 s (rows 54-87), not "the last 30 s" - always find a passage
in 4_SCRIPT.md by its action, never by her time guess.

Done (shared parts): hair springs per shot with the camera of every frame (VrmPuppet poseVrm memo); VECTOR_FX check in
raymi/timeline.py; seabed.tsx; soft beam shader (lighthouse.tsx); lamp = glass body + glow (painted.tsx LanternRoom,
ring_gap / mullion_phase / glass); actor key "tether" (a rope from her hands, VrmPuppet tetherRope); QC v2 hair_wall.
Scratch scripts that rebuilt rows 54-82 are not in the repo (the result is in shots.json; the why is in each row).

Open (critics end16_* + my own look):
1. Lamp room still reads as a gazebo (amber wood disc, red cone cap, posts): a real lantern build - brass + glass
   lantern, dark painted cap, lens body - is a set job (look-designer first).
2. Her size / value: 1/6 of the frame, behind rails, violet on navy. Next: lenses inside the rail ring or above it,
   nothing between lens and torso (a guard: rail / post across her torso, like the face guard), a warm key from the lamp.
3. Orange colour flip (flip_at 142.62 / 150.12 / 153.85) shows as a flat orange slab + 0.43 s near-black: drop or redo.
4. Seabed better but plain and dark under war_night; the pulse ride (rows 75-76) shows no cable clearly - lens closer.
5. Melody class (C4) still has no element in this passage (melody_on_her chest lights not in these rows).
6. Climb: the ladder clip rises ~0.75 m a cycle (rootAt) - measure climbing-ladder in root_travel.json.
7. The landing (122.6) still has concentric water rings around her (NightSea waterline / pulses) - remove.

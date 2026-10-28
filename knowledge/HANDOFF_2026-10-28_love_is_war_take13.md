# Handoff 2026-10-28 - Love is War, whole film take 13 (branch claude/love-is-war-build-13968f)

State: take 13 rendered (release render-2026-10-25_love-is-war-86), sent to toki FAIL-marked. Waiting for her verdict.
Reviews (verbatim): jobs/2026-10-25_love-is-war/reviews/final_{brief-keeper,look-critic,motion-critic}_1.md.
QC v2 of the same data: boards/qc_mv.txt, probe_mv.txt (run 40610148107); merged probe out/probe_mv_take13.json.

Open (critics + gate, not yet fixed):
1. Opening 0-8 s: the pass reads as a speck at the frame edge beside a black block (the cable end). Wanted by toki:
   empty water in the silence, she swims in - keep that, but closer (she should own the frame once in) and lit.
2. Climb / rocks (around 94-100 s, phone_12): tiny, dark on dark - a rim from the lighthouse side, closer shots.
3. Lamp room 147-177 s: now in front of the lamp, but over-exposed (cream on cream) - cap the beam / lamp glow on her,
   dark backdrop behind her. Check against toki's own eyes first: she named this passage.
4. Melody class (C4) missing on screen; red slash reads as pixel noise (ink filter grain) - solid brush.
5. Motion gate: 124-170 s 0.58 m/s (min 0.6), pose snaps at 38.9 / 44.8 / 94.7 / 97.5 s, lens in her at 35a.
6. QC v2 still: face_cut (rows 20, 72a, 40 ...), her_pop in 57 / 61a / 43, hair through torso (spring bones) everywhere.

Learned (in code now): raymi/travel.py (drift, track, pass, thirds), faces by section, one backdrop-filter grade,
mouth "silent" lint, still lamp-room mullions. The clip root travel of three-vrm's Mixamo retarget is mirrored for a
VRM0 model - do not use it without a test on the real clip.

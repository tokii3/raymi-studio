# Handoff 2026-10-24 (evening) - Watch Me started, QC v2 built, two structural bugs found

Read before the next Watch Me session and before any 3D render. Everything below is on `main`.
Jobs: `jobs/2026-10-24_watch-me` (the package), `jobs/2026-10-24_watchme-boards` (idea boards in the film path).

## 1. toki's words (verbatim in jobs/2026-10-24_watch-me/toki.md)
- Brief: K/DA Watch Me (original, not the mashup), 3D package; ONE place, Raymi at its centre; a 3-minute "TikTok": new
  angle / staging every few seconds, things fly in and away (her example: the magazine cover with 2-3 poses on the
  beat); permanent self-staging to the camera = the viewer; unusual moves; not one long dance (catwalk for wides, poses).
- Poses = held frames from the animations; poses and angles inspired by voguing / JoJo posing.
- Stills must be checked on more frames and on several levels - "das Endergebnis zählt, egal wie der Code aussieht".
- "wenn der QC besser ist, reicht auch 1 QC run, dann würde ich gerne selber nachbessern" (memory qc-one-run-then-toki).
- Beach verdict (run 58): still clipping, not fluid, falls from the sky, "zusammengeklatscht", no colour harmony, no
  materials -> parked, the lesson for Watch Me.

## 2. Two structural bugs found today (both shared parts, both fixed)
| what | cause | fixed in |
|---|---|---|
| Every Mixamo POSE clip and every held frame (speed 0) showed nothing - she stood in the key pose (boards round 1: all 12 the same stand) | three's PropertyMixer writes a bone only when the clip value CHANGED since its last update; we pose from the key before every clip update, so an unchanged value lost. Same mechanism: the FIRST frame of every shot (the window replays its first state twice) snapped to the key pose = a one-frame pop at cuts (rig simulation; check it in the next real render) | `VrmPuppet.tsx forceApply` + `studio/test/clips.test.mjs` (real rig) |
| A worm's eye close to her looked up her skirt (boards B1 / C1; Beach has 4 such shots) | no rule | guard `raymi/timeline.py under_skirt` (lens < 0.45 x her height, < 2.6 m, looking up = error; `"low_ok": "<why>"`), `camera_moves crane_up` starts >= 2.7 m away |

## 3. QC v2 - three levels (PRODUCTION.md "QC v2")
- `jobs/<job>/qc.json` -> `.github/workflows/qc.yml`: prepare (timeline, ranges) -> 20 parallel workers (probe v2 +
  mask pass, `--range`) -> judge (join, classes, eye stills + crops + dense sheets) -> boards/ on main + artifact.
  `workflow_dispatch reuse_run=<run id>` re-judges a run's measured pieces without measuring again.
- Geometry (film/Probe.tsx, raymi/probe.py): her skinned surface vs oriented solids + mesh parity; self_in, hair_in,
  leg_cross, text_in, lens_in, near_cut, head_cut, drop, jerk, slide + v1 classes; every 2nd frame.
- Picture (film/QcMask.tsx, studio/qcmask.mjs, raymi/qcv2.py): pierced, text_face, text_hid (per word), face_cut, her_pop.
- Eye: stills of every flag cropped onto the fault + dense 1 fps sheets (boards/qc_<fmt>_eye/).
- Calibration on Beach run 58 (run 40115220860): it FINDS what toki saw - limb_in 64 shots (her chair seat 4 cm,
  hair through the chair back, the dream cushions up to 0.32 m), drop (shot 26 "falls", 50 / 64 "starts in the air"),
  jerk 30 shots, slide 37 shots, pop 31 shots, pierced 38 shots, text_hid 37 shots. Thresholds not tuned yet: the
  chair-seat contact (0.04) and slide on dance clips may be partly noise - judge them on the eye crops.
- Cost: measure ~25 min on 20 workers, judge ~55 min (the eye stills render one by one - next: render them in the
  workers too). Run 1-3 failed on the workflow (4 tabs / config / publish) - fixed.

## 4. Watch Me state
- 1_DOSSIER done (official audio from the mashup job; toki's lyrics in lyrics.txt; analysis run 2: 273 / 428 words
  measured, 100 of the 155 interpolated are background ad-libs; main lines open around 65-72 s and 148-168 s).
- 2_IDEAS: A The Shoot / B The Corner / C The Exhibit on one spine from her name (camera on -> she conquers every
  medium -> 117.6 s camera off, only her lights -> she switches the lights on herself -> she switches us off).
  Recommendation B. toki has NOT picked yet.
- Boards: 5 rounds; look-critic round 4 FAIL (verbatim reviews/boards_look-critic_1.md), its classes fixed in round 5
  (skin lock, cover plates beside her, blackout keeps 16 % of the place, no stray boom, reframes). Still open: the dark
  frames are thin, C4's foreground visitor, A3 grey, props flat (paintings, visitors, bollard) - a detail pass after
  the pick.
- Studio parts made today (reusable): three/staging.tsx (cover, frame, forecast, radar, mosaic, pins, post, news),
  sets shoot / corner / exhibit, set option "flash", blackout (`dark` / `dark_at`) for set + her key + her colour lock,
  `runTo` in look.tsx; 42 Mixamo clips catalogued (private assets).
- NEXT: toki picks the idea -> 3_TREATMENT (script-critic) -> 4_SCRIPT + shots.json -> build -> qc.json (ONE run) ->
  toki fixes herself / final.

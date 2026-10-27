# HANDOFF 2026-10-27 - Love is War: the BUILD (B0-B5), stills round 1

Branch: claude/love-is-war-build-13968f (pushed; holds the whole Love is War writers' room + build, main merged in at
ac33679). Job: jobs/2026-10-25_love-is-war. Previous plan: knowledge/HANDOFF_2026-10-26_love_is_war_build.md.

## What was built (all reusable studio parts, no per-video code)
- B0 shared faults: `raymi/song.py` stops() - a true silence between loud parts is found (121.9-122.6), the intro and
  the outro fade are not (tests/test_song.py); the job's song_map stops rewritten from its stored loudness.
  VrmPuppet: her BODY rests on the floor in low poses (bone radii, not the feet only) and her lights never sit closer
  than 0.6 m above her floor (the "white blob" = body sunk under the floor + her chest light burning the floor).
  TwoTone: the backdrop dome is paper (the night set went all ink), painted cards name their value, and Film turns
  grade / bloom / vignette off in a two-tone frame (they lifted ink to navy).
- B1 timeline (`raymi/timeline.py`): `expand_rows` - a row keeps ONE action of hers and is cut from several set-ups
  (`cams`), a `stutter` on measured onsets (two held set-ups, same light), a `riser` (one axis, steps, grade ramp to
  `war_white`); her clip runs on across the cuts (`_actor_from`), she keeps the main camera's facing. `aim` cameras in
  the script's own words (h, d, az, y, shift). `set_opts` per set. `carry_keys`: snap + tail on every multicam picture
  (raymi-camera pro_rules) - `raymi seams` went from 0 to 76 carried of 207 cuts (60 static are the stops, holds and
  same-light stutters on purpose). Film: `flip_at` (1 beat gold-orange on ink), `flood` (world white-gold, SHE a black
  silhouette - rows 0b / 83), `dip` + `pupil_lamp` (the A+ last hit).
- shots.json: 94 rows from 4_SCRIPT v3c, authored row by row (drop grids, rolls, risers, final build) -> 229 pictures.
  The Short window 62.167-80.467 with the hook / CTA toki approved.
- B2 the painted world: `studio/src/three/painted.tsx` from the look-designer's spec (11_WORLD_build.md): storm sky,
  cloud walls (one rolls in), wave rings in 5 depths, the foam collar, painted tower / rock / ladder, the lantern room
  at HER scale (lighthouse opts lantern 'her') with the brass frame and the Fresnel lens as painted rings, the deep's
  surface ceiling carrying the beam. NightSea / Deep: opts.painted.
- B3 `studio/src/film/FxWar.tsx`: crown (ink detonation with a hole at her face), dots by pitch, ribbon on held notes,
  pillar, embers on the hats, rain halo, shards, starburst, two-value inserts.
- B4 pose `lens_attack` (M1) in vrmPoses.ts, used in row 33.

## Not built yet (data in shots.json, silently ignored) -> BACKLOG.md "Love is War build"

## B5 stills round 1
- stills.json round build1: 21 frames (the 19 storyboard moments + the gold hit flash + M1), run 40428821556.
- RESULT / fixes: see PROGRESS.md top entry.

## toki 2026-10-27 (render policy, verbatim in toki.md)
"falls viele stills einer scene gerendert werden müssen für qc > lieber als kurze video sequenz rendern oder falls
nötig das ganze video ... aber keine render leistung / zeit verschwenden". -> one stills round for framing questions;
once the framing holds, an interim VIDEO (render.yml) instead of many stills per burst scene, gated before she sees it.

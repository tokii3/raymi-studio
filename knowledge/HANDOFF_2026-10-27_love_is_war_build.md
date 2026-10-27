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

## B5 stills - 7 rounds (boards/build1 .. build7, local only; stills on branch renders reports/2026-10-25_love-is-war/stills)
Each round found fault CLASSES, fixed in the shared parts (see PROGRESS top entry). Probe of round 2 lives in
boards/probe_mv.json (+ flags). Pairs + card measures: boards/pairs/build_*.jpg, boards/build6/_pairs_measure.txt.
look-critic stills 1: FAIL (reviews/stills_look-critic_1.md). Whole-film draft: release render-2026-10-25_love-is-war-71.

## NEXT (in this order, then stills of the touched moments + look-critic + brief-keeper + gate -> toki)
1. Rock climb rows 41-43 (88.6-96.2 black in the draft): the lens sits inside the lighthouse rock mound. Structural:
   register the rock lumps (lighthouse.tsx) as solids / no_lens so the guard refuses it; move ROCK_CLIMB onto the
   ledge side (the landing ledge is now at [-6.07, 2.0, -22.75]).
2. Deep row 6 (9.8-12.7): casting-spell is upright - aim at her chest (DEEP + 1.0), not low.
3. Lantern room multicam pictures (146-177): she faces the lamp (pulling), the beam-axis cameras see her BACK. The
   script wants her face (82: "her face strained, eyes on us"; final build "her face", "her eyes on us"): face_lens /
   a look over the shoulder on those pictures, or cameras on the lamp side. Then the final build has a face.
4. White-out in the lantern (beam + war_white + lamp): keep the riser ramp on the world, not on her skin (look-critic
   FIX 1) - e.g. her_key down while grade_to war_white runs, or the ramp as a 2D overlay behind her.
5. m18 scream: the slash still crosses her mouth (the head estimate misses that close-up) - move row 70's slash y.
6. Inserts that read as noise (15.4 white dots on black), wave strips repeat (look-critic FIX 6), contact shadows
   (FIX 7), the deep two-tone hit has no paper (card two_tone_hit: light share 0.02).
7. The draft's black / frozen spans in qc.json beyond the intended blacks (119.87, 186.47).

## toki 2026-10-27 (render policy, verbatim in toki.md)
"falls viele stills einer scene gerendert werden müssen für qc > lieber als kurze video sequenz rendern oder falls
nötig das ganze video ... aber keine render leistung / zeit verschwenden". -> one stills round for framing questions;
once the framing holds, an interim VIDEO (render.yml) instead of many stills per burst scene, gated before she sees it.

## State after the fix list (toki 2026-10-27 "erst die Fix-Liste ...") - stills 9 + draft 2
- Done: rock mound no-lens (+ test), climb outside it; she pulls the lamp from its far side (lantern pictures show her
  face); the white ramp no longer lights her; slash off the scream; deep row 6 on her chest; dots insert = her five
  lights; lamp + Fresnel vanish in a flood; THE silhouette in front of the lamp again (rows 0b / 83).
- look-critic stills 2: FAIL (reviews/stills_look-critic_2.md) -> gate FAIL -> parked (BACKLOG, anti-loop). Draft 2
  = release render-2026-10-25_love-is-war-74: black spans down to 11.6 (0.9 s, deep row 6's 2nd main picture) and
  93.8 (2.4 s, row 43 wave smash on the rock) besides the intended blacks.
- NEXT session (studio parts first, then ONE stills round, then the critics): skin-protect cap for her under the lamp /
  beam (VrmPuppet + PostFX), a closer + cleaner silhouette camera for 0b / 83, the deep's painted layers (m03 void),
  brush edge + paper grain on FxWar shapes, contact shadows + water reflections, the lamp roof off red, rows 6 / 43.

## Motion fix (toki 2026-10-27 "Ja, setz den Plan so um ...") - done, waiting for her verdict on the excerpt
- Tools: studio/catalog/clip_energy.json (push studio/catalog/clip_energy.request to measure again), `raymi motion`,
  timeline lints (energy in loud sections, loop seams), hold cap + exact holds, gate reads out/motion.json.
- Excerpt 58.6-80.5 sent FAIL-marked (deliveries/2026-10-25_love-is-war/excerpt/, render run 77).
- Critics' next fixes (reviews/excerpt_*): her face >= 0.10 of the frame in hero pictures (wide / back views in the
  chorus grid), rim light so she separates from the navy, ink shapes with grain (not vector stickers), the pillar
  column without bands / see-through hair, more lens attacks with impact frames in the drops.

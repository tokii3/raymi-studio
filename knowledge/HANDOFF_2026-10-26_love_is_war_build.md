# HANDOFF 2026-10-26 - Love is War: storyboard approved, next = BUILD + stills

Branch: claude/love-is-war-raymi-mv-88ba74 (pushed, not merged to main). Job: jobs/2026-10-25_love-is-war.

## Where it stands
- Writers' room done: brief -> dossier -> ideas -> treatment v3 -> script v3c (script-critic + brief-keeper PASS,
  reviews/script_4.md, script_brief-keeper_4.md) -> storyboard round 4 (brief-keeper PASS, gate PASS).
- toki 2026-10-26: "storyboard runde 4 passt, letzter schlag A+ so, weiter zum build". Last hit = A+ (dip to black,
  2 frames of the lamp in her pupils, hard cut on the flash to the silhouette).
- `python -m raymi next 2026-10-25_love-is-war` -> NEXT: build (shots.json).
- Reference library now learns rules (raymi/principles.py, knowledge/references/LEARNED.md, principle_cards.json).
  Use `refs measure <still> --card <class>` on every still before the critics.

## Build plan (order matters - shared faults first; one stage, cloud renders only)
B0 shared faults (before any still): the white blob under low poses; raymi/song.py stops() misses 121.94-122.62;
   the two-tone frame measured soft (black p05 0.07 = navy, light 28 % < 37 %) -> ink black + more paper in TwoTone.
B1 timeline (raymi/timeline.py, studio/src/film): multicam sub-shots per beat (one row's clip runs on, camera
   changes), stutter cuts on given onset lists, riser push (one axis through several cuts) + grade ramp toward white,
   grade op `flip_at` (gold-orange on ink, 1 beat), hit flashes in gold-orange two-tone before 154 / white-gold after.
   Then shots.json from 4_SCRIPT.md v3c BY HAND from the tables (rows + "Drops v3b" grids + riser / roll / final
   build tables) - never a by-time merge (writers_room/templates/4_SCRIPT.md lesson).
B2 the painted 2D world (look-designer first, one world, graphic, nothing plastic - toki X5 "eher richtung 2"):
   storm-sea layers (sky, cloud walls, wave cards, rain x3, surf, moon 45 %), lighthouse + rock + ladder cards,
   lantern room, gallery rail, Fresnel rings layer, the deep (surface ceiling carrying the beam, barnacle crust).
B3 effects: rain halo, ping ring with brush edge + two-tone shards, ink slash / crown with a hole at her face,
   light ribbon + B5 pillar, dots by pitch (song_map melody), graphic inserts (two-value, 4 frames), embers per
   hi-hat onset in the storm eye.
B4 pose M1: both hands thrown INTO the lens (vrmPoses.ts).
B5 stills (stills.yml) for the 19 storyboard moments -> `refs pair` with each moment's reference + `refs measure
   --card` -> look-critic -> brief-keeper -> gate -> toki (STOPP before the final render).

## Open / parked
- Gemini why pass: 26 of 39 refs hit the free quota -> `python -m raymi refs why all`, `refs rules` (BACKLOG).
- Chord labels are a chroma estimate (times measured, names may be off by one chord).
- Budget: this job is far above the ~20 % weekly guide; toki knows. Makers small, bulk looking to Gemini.
- Agents' PATH python is 3.7: give them C:/Users/Anne-/AppData/Local/Programs/Python/Python312/python.exe.

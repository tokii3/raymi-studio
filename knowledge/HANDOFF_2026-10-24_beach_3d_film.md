# Handoff 2026-10-24 - Take Me to the Beach, the first 3D film: what went wrong, why, and what the studio is now

Read before the next 3D video (MV or Short). Everything below is on `main`. Job: `jobs/2026-10-22_take-me-to-the-beach`.
Latest renders: MV run 58, Short run 59 (QC green, no black frame). toki stopped here on 2026-10-24 to start fresh.

## 1. toki's verdicts in order (her words are the acceptance list)
1. Run 40 (first full film): "cuts wirken random, Raymi ist steif und bewegt sich nicht, Belichtung und Effekte
   komisch, man erkennt wenig, Kamerawinkel und Fahrten eher Standard - du hörst nicht zu und denkst nicht nach."
2. Mid-rebuild: "die Kamera soll den Viewer imitieren, leicht bewegen; Raymi verhält sich, als wäre die Kamera
   jemand, der sie sieht - von hinten / weit weg nur dieser Beobachter-Effekt."
3. Run 55 (rebuild): "Sets / Idee / Kameras / Effekte schon ganz gut, aber Umsetzung muss besser werden: Räume flach,
   keine Textur, hinten so hell wie vorne, Raymis Stuhl fehlt, sie clippt in Gegenstände, fällt aus dem Himmel, ist
   steif, keine Mundsynchro, das Handy clippt auch."
4. Then: "hör auf alles punktuell zu fixen, das sind meistens Strukturfehler und du weisst das."
5. Run 58 / 59 (structural pass): not judged yet - she stopped the session for a fresh start.

## 2. Root causes (each one hit MANY shots - none was a shot problem)
| what she saw | the real cause | fixed in (reusable part) |
|---|---|---|
| Raymi stiff, "bewegt sich nicht" | Mixamo clips NEVER played in a film: `useVrmReady` asked which clips were missing before any rig existed (= none); and a clip continued from the key before got weight 0 (`id === a` checked first). Poses hid it. | `VrmPuppet.tsx` (load after the model, weight fix, a key asking for an unloaded clip now FAILS the render); `studio/test/clips.test.mjs` on the real rig |
| one-shot actions mid-way / looping | clip time = song time % clip length | clip starts on its key: `clipFrom / speed / once / restart` |
| cuts random | one cut per lyric line, 51 % on the music, 12 / 88 hits answered | `python -m raymi cuts <job> [--apply]` (hits, guitar stabs, sung lines, syllables, sections; never onto a beat or a neighbour; `cut_lock`); stronger lens punch on hits in choruses (`kick`) |
| camera standard | hand keys only | `raymi/camera_moves.py`: crash, push_dutch, orbit_roll, crane_up, drop, through, track, follow, vertigo, whip_out, spiral, handheld (`{"move": ...}`) |
| (her wish) the observer | - | camera `observer` (breath, sway, gaze settling after a cut); actor `aware` (head + neck toward the lens, from behind a glance over the shoulder) |
| exposure / effects weird | posterize + halftone on half the film; loud grades | no duo / halftone by default; calm grades pov / pov_warm; red turn = grade `ember` |
| clips into furniture, "fällt aus dem Himmel", phone in the cushion | her feet and every thing stood on HAND-GUESSED heights (desk 0.79, bed 0.48, dream floor 0.24) | `support.ts`: one ray in the frame's real scene finds the surface; she (`groundOnSupport`) and every thing (`Resting`) stand on it; limbs inside a solid push her out sideways (`clearSolids`); airborne clips / seated poses / hanging things are excepted by rule |
| Raymi's chair missing | the office set never had it | her chair is part of the office; rolled back by the compiler when she stands at her place and never sits in the shot |
| no lip sync | the mouth was damped twice and fast sung syllables never reached their cap (20-40 % open) | the vocal stem's loudness per frame (`mouthEnv`, timeline) + `REACH` so a sung vowel meets its cap (never 100 %); lip sync test |
| rooms flat, back as bright as front | even hemisphere fill + one directional key everywhere, mid-grey fog | `SetLight depth` (less even light, dark far fog), her own key light, office light pools (`opts.depth`, film default `"depth"`) |
| no texture | fine noise the picture averages away | surface textures v2 (large-scale wear, carpet tiles, plank joints, plaster cracks, scuffs) + bump relief |
| black frames (shot 31) | one invalid pixel in the half-float post buffer, spread by bloom / DoF / AO into black blocks | `PostFX` 8-bit frame buffer; QC `no_black_picture_>0.25s` (a per-frame scan found 0 dark frames in run 58) |
| a cut inside a shot smeared | camera motion blur measured the lens JUMP of a hold key | a jump over 1/3 of the frame is a cut, never blurred |

## 3. The tools the next video starts with
- **Scene probe** - measures the whole film in the real scene graph: `stills.json` `"probe": 15` (frames / passes may
  be empty) -> `boards/probe_<fmt>.json`; `python -m raymi probe <job> [mv|short]` = fault classes per shot
  (limb_in, float, sink, pop, thing_in, thing_air). Beach: limb_in 1743 -> 119 frames, float 181 -> 0, pop 9 -> 0,
  thing_in 219 -> 1, thing_air 201 -> 0. PRODUCTION.md: "Scene probe before every 3D final".
- **Cuts** - `python -m raymi cuts <job>` (report) / `--apply` (snap numeric starts; keep `cut_lock` on hand-placed
  cuts on a measured sound). Beach: 51 % -> 94 % of cuts on the music.
- **Guards** (check.ts / timeline): desk things + set walls / roofs are solids; her 3D face checked behind solids
  (seated head ~1.05 m, standing ~1.40 m); `lens_near {"<solid>": "<why>"}` lifts one solid for a deliberate
  macro / foreground; clips must be in `studio/catalog/clips.json` (413 names; files only in the private repo).
- **QC** - frozen, black, loudness, true peak; plus the per-frame dark scan if in doubt.
- **Motion reel job** (`jobs/2026-10-23_motion-reel`) - her clips + every camera move in the Beach sets; a quick
  reference of what a clip looks like on her.
- **Debug pattern** (`jobs/2026-10-24_debug-31`) - when a shot renders wrong, copy it into a tiny job with variants
  (post off / AO off / DoF off ...) and stills them: one cloud run names the guilty part.

## 4. The process for the next 3D video (what saved rounds this time - and what cost them)
1. Writers' room as before (idea, treatment, script critic PASS). Her words from earlier verdicts are the
   acceptance list (memory: execution-over-checks, structural-faults, raymi-3d-on-screen).
2. Build with clips, not poses: seated = pose sit + a sitting clip at 0.2; a gesture pose = clip <= 0.12; everything
   else a clip at full mix. Camera moves from `camera_moves.py`; `observer` + `aware` as film defaults; `depth` ~0.8.
3. Pre-push every time: tsc, pytest, every timeline, `node guard.mjs <job>` (the real gate, not only --summary),
   HERO lines too.
4. Before the final: ONE stills run across the whole film + exposure + the scene probe. Fix a fault CLASS in the part
   that makes it; re-probe; then render. Never show toki something with a known class open.
5. After the render: QC (black / frozen), a contact sheet I look at myself, then the blind viewer + the one critic the
   video's risk needs (agent budget). Deliver the named files + upload.md in the chat (memory: deliver-in-chat).

What cost rounds: showing toki a film the motion / cut critics had already failed; fixing shot by shot (shot 11 three
times, shot 66 four times) instead of measuring the class; empty commits that hid a changed stills.json from the
workflow trigger; a render.json left unchanged (no render) - change its `_take`.

## 5. Open for the next session (BACKLOG has the detail)
- Remaining clipping (~119 probe frames, mostly < 0.15 m): in the dream she flies / falls / kicks INTO cushions and
  rocks from above - `clearSolids` pushes only sideways; airborne keys need a vertical push too.
- Rooms: light + texture are better, but the props / detail pass (more lived-in objects per set) was NOT built.
- Lyric type at phone size (the 3-language Ado block, the dream wides) needs a rule from toki.
- The probe is a process step, not yet an automatic gate in render.yml (it needs a browser render, ~30 min).
- Run 58 / 59 have not been screened by a critic or by toki.
- Thumbnails (M5 / S5 "BYE BOSS") were made before the rebuild - still valid designs, re-render them if the look of
  the film changed enough.

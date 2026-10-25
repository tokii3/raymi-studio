# Handoff 2026-10-25 - Watch Me: why the camera keeps failing, and how the next session solves it

Read this FIRST in the next Watch Me session. MV take 7 = release render-2026-10-24_watch-me-67 (camera v3).

## toki's verdict on take 7 (verbatim in jobs/2026-10-24_watch-me/toki.md, line "MV run 67")
"total langweilig ... die ganze Zeit frontal, mal von oben, wieso nicht mal ausgefallener Winkel oder Fahrt nah an sie
ran, sie spielt mit der Kamera - WOFÜR HAST DU DIE FIRESTARTER REFERENZ WENN DU ES NICHT MACHST ... ich sage dir seit
1 Monat das Gleiche ... anstatt das Problem wirklich zu lösen ... schauen woran liegt es, was ist gewollt, wie sieht es
aus und warum und wie kann man das beheben".

## Root cause (my analysis, honest)
1. **Rules instead of design.** Every camera since take 1 came from GENERIC rules (director, v3 grammar: "3/4 angle +
   orbit"). Rules give every shot the same move - that IS the generic look. The reference (knowledge/studies/
   kda_firestarter_1m43.md) is not a rule set, it is DESIGNED moments: a hand thrust into the lens, a low wide hero
   push, a burst of 6 different angles on 6 hits, a fly-in to her eyes. Each moment is chosen for that bar of music.
2. **She never plays with the camera.** "Sie spielt mit der Kamera" needs HER actions aimed at the lens: walking up to
   it until her face fills the frame, reaching into it, leaning in, looking over her shoulder at it, turning away and
   back. The film uses held clip frames and dance loops that ignore the lens; v3 even turned her AWAY from it.
3. **I judged numbers and stills, not motion.** Framing reports and stills pass while the video is boring; toki judges
   the moving picture.
4. **Patches on patches over one month** (bridge, chain, snaps, director, fill, v3) - each fixed a symptom; nobody
   designed the whole camera of the song once.

## How to solve it (next session, ONE stage: the camera choreography)
1. **Camera script, written by hand, bar by bar** (jobs/2026-10-24_watch-me/6_CAMERA.md): for every section of the
   song (song_map + lyrics_timed) the shot, the move and what SHE does to the camera, using ONLY the FIRESTARTER
   vocabulary: extreme close -> pull out; low wide hero push; hand / face into the lens; she walks into the lens;
   overhead -> drop to worm's eye on a hit; 360 whip round her; dutch close; over-the-shoulder look back; hit
   bursts (new angle every 0.33-0.67 s in the chorus); slow push on held notes. No two neighbouring shots alike.
2. **Her side of it:** pick / add clips where she addresses the lens (walk toward, reach, lean, look back, wink,
   point) - private assets have 42 clips (studio/catalog/clips.json); a missing action = toki downloads it from
   Mixamo (ask her for the exact names).
3. **Picture board first:** 12-16 key moments of the camera script as stills -> toki picks / corrects BEFORE any
   full render (she judges pictures; never a text plan for a look).
4. Then implement the camera script as data (shots.json camera keys per moment; keep the guards: under_skirt,
   lens_in, her-in-shot, sight line), render once, QC v2 once, toki.
5. Turn OFF the generic layers for this job when the hand-written script is in (camera_v3 / director false; keep
   bridge only where the script asks for a move between shots).

## State of the studio (all on main, reusable)
raymi7 + vrmFix (materials, texfix, sleeve fins, hair roots, hair colliders, climb fix), setfx (wet floor, rain, wind,
splash, treadmill, light writing, letters, centerfold, tail at the lens, haze + marine snow, sonar, electro-sense,
caustics, paparazzi), trails, her UV + lamp light, film look (DoF, glow, vignette), fin wave, guards (Salmon in
picture / not in front of her, Raymi in every shot, room walls no-lens, cover type as texts, cross + lens-riding
lyrics), render at 40 parts. Lyrics are OFF for Watch Me (toki).

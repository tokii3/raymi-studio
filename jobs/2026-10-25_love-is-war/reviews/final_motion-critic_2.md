# motion-critic on the whole film take 14 (render run 87, out/kit), 2026-10-28 - verbatim

MAIN ELEMENT: NOT readable in several places. Raymi is the hero, and the kit shows her small, dark-on-dark or off-frame at the start and in the rocks and cables passages. The opening (0-3 s, first_glance) is an empty night sea; a sliver of her hair enters at the right edge and she is tiny. The ~0-1 s tumble (seq_00) is a violet body on a near-black blue field. In seq_04 (about 20-30 s) she is a tiny violet figure inside rings. In phone_12 (the rocks) she is a dot at the top edge while huge dark rock polygons fill the frame, and the value contrast is low everywhere. Where she is large (seq_09 profile with stars; seq_02 lighthouse and wave shots) she is readable. This counts as BLOCK: fault for the opening and the rocks.

I judged from the stills in the kit (about 10 seq sheets and phone_12), not from the video itself. These frames are only a sample of the 188 s.

DESCRIBE / felt effect
- 0-3 s: static empty sea and a comet streak. Her hair slides in from the right edge and she tumbles small. The first seconds are not "inside the action" (brief C1).
- seq_04 (~20-30 s): a tiny figure in concentric rings, almost the same pose across 24 frames. This is a dead stretch of about 2 s or more, ring rotation only.
- seq_02: the lighthouse beam and rings read well as designed effects. After the cut, Raymi bobs in the water with only slight head movement. A shot of about 1 s or more has her barely acting.
- seq_06: red slash and yellow impact frame. This is the strongest moment: a two-tone impact frame, a held slash, and a smear-like shape change. It is good but short.
- seq_08: cable tunnel with a crash toward a polygon and speed lines. The camera does travel here, with a real approach and a swerve, but the shapes are flat teal polys. Raymi is absent from these frames.
- seq_09 / phone_12 (the end region, plus dark rocks): hair turn, then black. About 1 s of pure black with a tiny glyph near the end.

1. Raymi MOVES in the hair turn, the tumble and the rig sway. She shows almost no anticipation, overshoot or squash, so it reads as a puppet drifting. The camera does move in 3D (the push in the cables, the passes around the lighthouse and rocks) with real parallax in places. Many shots are a flat zoom or a held pose with FX on top. Dead stretches: 0-3 s, about 20-27 s (rings), about 31-55 s (shots of 2-4 s each, seq_02 style), and the black at the end.
2. Smears: the slash and the speed lines are present. Raymi's own fast moves have no smear or stretch frames; she is interpolated and floaty (the hair turn, the tumble). The cuts are snappy at 0.1-0.13 s bursts (0.8 mean, cv 1.0). The hits changed the picture 79 % of the time.
3. Pops: the rings scale and fade, so they read as ripples, not overshoot pops. I saw no icons or words.
4. Broken: the empty black frame run at the end; a clipped hair/arm edge at the frame border in the opening; the rocks shot, where she is lost behind huge dark geometry.

FIX 1
observation: 0-3 s opening, 20-30 s rings, rocks (phone_12); Raymi is tiny or off-frame and dark on dark.
effect: the hero is unreadable and there is no hit in the first seconds; the brief asks for "inside from second 0".
cause: framing and value separation (craft module 04, hero rule).
change: put her face large (face_h >= 0.25) in the first 2 s with a rim light and a bright backdrop behind her. Give the rocks and ring shots a lit value plate behind her.
priority: high
level: local
retest: phone_*.jpg and first_glance show her clearly separate from the background in every shot marked as hero.

FIX 2
observation: shots of 2-4 s with near-still Raymi (seq_02 bobbing, seq_04 rings).
effect: a slideshow feel between the hits.
cause: holds without acting; no anticipation, overshoot or settle (module 04).
change: key a pose change every ~0.5 s on twos, add anticipation, a 3-frame overshoot and smear frames on her fast moves.
priority: high
level: structural:assets
retest: no shot over 1.5 s without a visible pose change.

FIX 3
observation: end of the film, black frames after the hair turn.
effect: it reads as a render hole, not an ending; the final peak (C5) is missing.
cause: edit.
change: cut the black to 3 frames at most, and end on a designed impact frame with her face large.
priority: medium
level: local
retest: no all-black run over 0.2 s except a designed stop.

BLOCK: fault: 0-3 s, ~20-30 s and the rocks shot: the main element Raymi is tiny and nearly invisible against the dark field.
BLOCK: fault: end region: about 1 s of black with a stray glyph that reads as a broken render.

VERDICT: FAIL
WORST: Raymi, the main element, is tiny and dark-on-dark in the opening, the rings and the rocks, and the shots between the hits are still, floaty puppet holds.

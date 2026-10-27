# motion-critic on the chorus excerpt 58.6-80.5 (render run 83, out/kit), 2026-10-27 - verbatim

MAIN ELEMENT: Raymi is readable in the close-ups (about 2.4-4 s, the hair close-up, the lighthouse shots). She is NOT readable in the opening, where she is a tiny blue figure on a blue field (0-1.5 s). She is also not readable in the top-down finale (~19-22 s), where she is a purple speck in dark ripples. phone_01 confirms both. Judged from stills only; there is no heroes.json in the kit, so I took Raymi as the main element.

DESCRIBE and effect: The excerpt is a push-in from a tiny figure to a close-up. It then goes through a speed-line ring tunnel, a hair close-up, and a lighthouse and storm sea with a sweeping beam. A yellow impact frame follows, then a crouch and a top-down drop into ripples. The felt effect is hits and a varied shot rhythm (mean 0.55 s, 40 shots). The opening and the end go flat.

1. Motion: There is camera travel in the lighthouse shots (beam sweep, water layers). The opening is a push-in on a nearly static pose with arms out, held about 1.5 s (0.4-1.97 s) before it pops to a close-up. In the ring tunnel Raymi is a dot, so she does not act there. The top-down ending (~19-22 s) is a dead stretch of about 2 s, with only ripples and rain moving. The hair close-up (~7-9 s) is a held key pose with almost no movement.
2. Fast moves: I see a beam smear and speed lines. I see no smear on her body. The cuts are hard and snappy, which is good.
3. Icons and words: there are none.
4. Broken: Shot 0 is 0.1 s long and shot 1 is 0.3 s, so the opening reads as a glitch. The last shot is 0.03 s long, which is a stray frame. In the ripple sequence, the water-surface sprite pops in from the side.

BLOCK: fault: 0-1.5 s and 19-22 s, the main element is tiny and low contrast (blue on blue, purple on dark navy).

FIX 1
observation: 0-1.5 s, Raymi is tiny and blue on blue.
effect: there is no hook in the first seconds, against the brief's "inside the action from 0-3 s".
cause: contrast and scale (module 00).
change: open on a close-up or rim-lit hit, face height at least 0.25, with a bright rim or light behind her.
priority: high
level: local
retest: phone_01 frame 1.

FIX 2
observation: ~19-22 s, the top-down shot with her as a speck.
effect: the finale is weak; the brief wants the strongest peak at the end.
cause: a hold with no acting.
change: end on a hit (an impact frame, or a lens strike toward the camera), or push in 2x.
priority: high
level: local
retest: no hold longer than 1 s at face height under 0.1.

FIX 3
observation: the 0.1 s and 0.03 s shots, and the held arms-out pose.
effect: reads as glitch and slideshow.
cause: timing (module 04).
change: remove the sub-5-frame shots and add anticipation and overshoot (squash, lean) on the pose.
priority: medium
level: local
retest: no shot under 5 frames, and visible pose change every 0.5 s.

VERDICT: FAIL
WORST: The main element, Raymi, is a tiny blue-on-blue speck in the opening and the finale.

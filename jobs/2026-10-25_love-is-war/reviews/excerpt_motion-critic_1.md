# motion-critic on the chorus excerpt 58.6-80.5 (render run 76, out/kit), 2026-10-27 - verbatim

MAIN ELEMENT: not readable in the first 4 s, in the back-view shots (about 14-18 s) and in the last 3 s. In 0-1.7 s she is a speck. For 1.7-3.9 s she is small, dark violet on dark blue, with no rim light and no value separation. In 6.7-9.5 s she is seen from behind as a dark hair blob. At 18.8-21.9 s she is a tiny figure under a light column. The close-up (about 7.6-8.5 s) and the full_12 frame read well. Heroes.json was not opened; I took Raymi as the main element. BLOCK: fault.

DESCRIBE: 0-4 s she floats in from a tiny speck, back to camera, then turns to face front in a T-pose-like stance with arms out. She holds nearly still while she and the camera slowly scale up, and ends in a close-up. At about 4-6.5 s a ring target with speed lines holds for 1.7 s. Then come a close-up (hair/face), a kick with a smear streak, a red graph insert, and back-view shots from behind. Last come a pull-out and a light column that drops her to a tiny figure.

Felt effect: nice mood, but weak for "aggressive, raw, pulled in". It feels like a posed slideshow with zooms.

1. Raymi moves:
- 0-3.9 s: she turns from the back to the front, then does a T-pose-like wobble. There is no anticipation, no overshoot and no settle, and the movement is only a slow scale-up.
- 4-5.7 s: the ring target is a still graphic. She is a speck inside it.
- 7.6-8.5 s: she makes a small close-up face turn. Nearly dead.
- 8.5-9.5 s: the kick is the only real action. It has smear and lens streaks, and it works.
- 10-15 s: back-view hold, essentially dead except for rain.
- 18-21 s: light column and ripples only.

Camera: it zooms a flat picture in 0-4 s. There is slight parallax on the sea with the lighthouse at 8-9 s and 15 s. In the back-view stretches it barely travels.

Dead stretches: 0-3.9, 4-5.7, 10.9-12.3 and 18.8-21.9 s (the shot_starts 18.8 and 20.7 are static holds of 1.9 s and 1.2 s).

2. Fast moves: the kick has a smear. The rest is slow, floaty interpolation, with no held key poses.

3. Pops: the cuts are on the beat, but I see no scale-overshoot pops on icons. The red graph insert is a flat card. There is no icon or word pop.

4. Broken:
- The black diagonal slash stays across several shots as a hard band.
- The light column has a hard-edged blurred rectangle that looks like a cut-out sprite edge.
- The T-pose arms at 1.9-3.6 s read wrong.
- The 0.1 s shot at the start and the 0.03 s at the end are glitches.
- In frame 2 she hovers with no feet or ground contact.

Reference not compared (segments.json not grepped). The rulebooks were not read either.

FIX 1
observation: 0-3.9 s she is a speck or small and dark, posed in a T-pose, with a slow zoom.
effect: no hit, no immersion, and the main element is unreadable.
cause: staging, value separation, anticipation (modules 04, 00)
change: start on a close, lit Raymi with a rim light of at least 40 % value contrast to the background. Add a 3-frame anticipation, an overshoot and held key poses on twos. Replace the T-pose.
priority: high
level: structural:assets
retest: phone frame at 0-4 s shows the face at 10 % of frame height or more, with a visible rim.

FIX 2
observation: 4-5.7 s ring hold; 10-15 s back-view shots with little motion; 18.8-21.9 s light column.
effect: dead stretches in the chorus.
cause: holds without an event (module 04 timing)
change: add an event every 0.5 s or less in each shot, such as a camera push through, a pose change, a beat-driven ring pulse, or a shake. Make her at least 3 times larger in the column shot.
priority: high
level: local
retest: no span longer than 1 s without a visible change in the facts still_spans.

FIX 3
observation: kick at about 8.5 s is the only strong action.
effect: aggression appears once.
cause: lack of lens attack (module 04 smear, impact)
change: add 3-4 more strikes toward the lens, each with smear frames, a 2-frame hold on contact, an impact frame and a shake on the beat. Add an overshoot pop on the graph card.
priority: high
level: structural:assets

FIX 4
observation: hard slash band, rectangle light column, 0.1 s and 0.03 s shots.
effect: reads as an error.
cause: render and edge cleanup
change: soften the column mask into a shaped beam, trim the shots under 0.1 s, and make the slash a deliberate hit on a beat.
priority: medium
level: local

VERDICT: FAIL
WORST: Raymi is a tiny, dark, barely moving figure in the first 4 s and in the back-view and end stretches, so the chorus has no readable hero and almost no real acting.

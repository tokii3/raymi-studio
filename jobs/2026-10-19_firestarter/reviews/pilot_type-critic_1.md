MAIN ELEMENT: readable only in s1 (0-2 s), where the face and flame are big and lit. From s11 on it is NOT readable at phone size. The flame is 25-37 px (s11-s12), 22-27 px (s14) and about 21 px for the fire_word (s15). Face-vs-background separation is only 0.07-0.15. The word "fire" at 20.2-22 s is "not on screen" in 2 of 4 sampled frames (3 of 34 sampled frames unreadable in total). Raymi is tiny and dark-on-dark in s14, s16 and s17. This is BLOCK: fault.

WEIGHT + SIZE: NOT ok. The song is English, so no romaji is needed.
- Beyond s1, nearly every line is small and thin. "I'm a fire starter" at 13-14.5 s is a dotted, glowing hairline. "Imma burn it down" at 18-19.5 s sits under her as a small grey line. "Work a lil harder" at 15-16.5 s is almost invisible. "Crazy out of order" at 22-24 s is tiny and sits on the root map.
- Only the "FIRE. UNDERWATER." card (s1), "Got me fired up" (17.5 s) and "like" (19.5 s and 27 s) have real size.
- The key word "fire" is not the biggest thing in "I'm a fire starter". The hook payoff has no big type.

Per moment:
- 0-2 s: the type is a pasted-looking layer, lit in plain violet, but large and word by word. It is the best moment.
- 13-16 s: the type floats above her as dotted particles. It is not on a surface, and it has no shadow or perspective.
- 18-19.5 s: the line lies on the floor in perspective, which is good, but it is small and grey.
- 22-24 s: the words sit between the roots and have no weight.
- Word-by-word timing against shots.json looks plausible. The fire_word in s15 is missing for the first half of the shot.

Variety: there is some (card, particles, floor line, curved "like"), but all of it is the same thin pale violet and the same stroke.

BLOCK: fault: 12.8-27 s, the flame, face and "fire" word (the main elements) fall below readable size and contrast; s15 "fire" is not on screen at 20.2-21 s.
BLOCK: fault: 13-16.5 s and 22-24 s, the lyrics are too thin and too small to read on a phone.

FIX 1
observation: s11 at 13-14.5 s, "I'm a fire starter" is a dotted hairline above the pillar, and the flame is 25-37 px.
effect: the hook payoff is not seen or read.
cause: size and weight, hierarchy (module 06).
change: use Raymi-Heavy with a solid fill. Make "fire" at least 18% of frame height and "I'm a" and "starter" about half that. Put them on the pillar or the floor with a hot rim light. Raise the flame to at least 60 px with a bloom.
priority: high
level: local
retest: hero.json readable on s11, and the word reads in phone_*.jpg.

FIX 2
observation: s12 to s18, the lines are small and grey ("Work a lil harder", "Imma burn it down", "Crazy out of order").
effect: they read as an afterthought.
cause: weight and size, same treatment throughout (module 06).
change: set a minimum cap height of 7% of frame height, Heavy weight, with a dark outline or shadow. Make the key word of each line 2 to 3 times bigger. Take the colour from the nearest light: the flame warmth for fire words and the cool cyan for the rest.
priority: high
level: local
retest: gray_*.jpg shows the lyrics clearly.

FIX 3
observation: s15, the "fire" word is not on screen at 20.2-21 s, and its measured size is 21 px.
effect: the hero word is missing when the sung "fire" lands.
cause: timing and size.
change: start it on the sung syllable, at least 25% of frame width, carved or burning into the cracking floor.
priority: high
level: local
retest: hero.json fire_word readable in all 4 frames.

FIX 4
observation: the face and the flame are small in s14 and s16-s18.
effect: Raymi becomes a dot, so the hero fails the contrast check.
cause: framing and value separation (module 01).
change: either keep her at least 14% of frame height or add a rim light. Do not keep her small in shots marked hero.
priority: medium
level: local
retest: hero.json face sep above 0.12.

VERDICT: FAIL
WORST: Beyond the opening card, the lyrics are tiny, thin and ghostly, and the flame and "fire" word, the main elements, are unreadable at phone size.

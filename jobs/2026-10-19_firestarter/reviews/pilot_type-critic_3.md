MAIN ELEMENT: partly readable. Flame and face read in s1 and s11 (flame separation 0.5-0.65, face 53-95 px). They fail in these places:
- s14 (18-20 s): the flame is 31-38 px and sits low-contrast (sep 0.16-0.26). At phone size it is a small pink dot beside a small, crouching Raymi.
- s15 (20.2-22 s): the hero is the word "fire". hero.json finds it in only 2 of 4 samples (26-27 px, sep 0.18). In my frames at 20.0-21.5 s there is no lyric on screen at all. At 21-22 s only tiny floor writing is visible. The hook's key word is absent when the floor takes over.
BLOCK: fault: 20.2-22.0 s (s15) "I'm a fire starter" is missing or unreadable. The script wants it, and the hero word "fire" is not on screen in 2 of 4 samples, then 26 px at about 0.18 separation.
BLOCK: fault: 18.1-20.2 s (s14) "Imma burn it down like" is tiny lettering on the floor, about 15-20 px. It cannot be read at phone size.
BLOCK: fault: 22-24 s (s16) "Crazy out of order" is a few px of writing on the crack map. The script says "small on purpose", but the line cannot be read at all.

WEIGHT + SIZE: NOT OK. s11 to s13 (12.8-18 s) are heavy and large, so they work. "Work a lil harder" is big. "I'm a fire start" has the right hierarchy, with a huge "fire" and small fillers. But s14, s16, s17 (16.7 s "Got me" and "fire" partly) and the 18-24 s lines are thin and tiny. The two bars 12.2 s and 13.0 s show type crossing the face only briefly, which is fine. The kit contains no JP lines, so romaji and English do not apply here. "FIRE. UNDERWATER." at 0-2 s is good: big, glowing, and it lies in the dark space beside her. "UNDERWATER." is small and clipped at 1.5 s ("NDERWATER" cut at the left edge).

1. Moment by moment.
- s1: the title is a layer on top, not an object of the set. It is lit pink, but there is no shadow and no perspective.
- s11 and s13: the words arrive word by word with the voice, with a glow, and read like marker type. In s13 "fire" sits over her hair at 17.5 s.
- s14, s16, s17: the type is lying on the floor in perspective, which is a good idea. But it is far too small.
- s18: "like" at 27 s is big, hangs beside the vent and matches the hang. Good.
2. Hierarchy: good in the hook, collapsed from 18 to 25 s. The camera pulls back to wide shots exactly where the words should stay big.
3. Variety: there is real variety (title, glow words, floor writing, the word hung on the vent), and all of it is in one family. The problem is size, not sameness.

FIX 1
observation: 18.1-24 s: floor and map lyrics are tiny in wide shots (s14, s16, s17).
effect: the viewer loses the hook's second half and the song line "Crazy out of order".
cause: craft 06 hierarchy and size; the key word is not scaled to the camera distance.
change: write the floor words at least 3x larger, with at least 8% frame height, on a surface near the camera. Fix a minimum of 60 px cap height at 1080p. Set the minimum lyric size in the studio so wide shots cannot shrink it.
priority: high
level: structural:studio
retest: phone frames at 19, 22.5, 24.5 s read the line without zooming.

FIX 2
observation: 20.2-22 s: "fire" is absent in the first half of s15, and then only 26 px.
effect: the hook payoff (fire takes the floor) has no word.
cause: craft 06 timing and the hero fire_word at min 0.07.
change: the word "fire" at 0.20 frame height, written in glowing marker at the first sung syllable (20.2 s). Make it burn into the floor.
priority: high
level: local
retest: hero.json fire_word readable in all samples, with px of at least 80.

FIX 3
observation: 18-20 s: Raymi and flame are tiny in a wide shot.
effect: the flame, the hero, is a speck.
cause: craft 01 value separation and size.
change: move the camera in or make the flame at least 0.18x0.32 of the frame, with sep at least 0.4.
priority: medium
level: local
retest: hero.json s14 flame px of at least 60.

FIX 4
observation: 1.5 s title clip "NDERWATER".
effect: the promise word looks cut.
cause: layout.
change: keep "UNDERWATER." fully inside the frame, and 1.3x larger.
priority: medium
level: local
retest: the frame at 1.5 s shows the full word.

VERDICT: FAIL
WORST: From 18 to 25 s the hook's lyrics shrink to tiny floor writing, and "fire" at 20.2 s is missing, so the song's key moment has no readable word.

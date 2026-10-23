MAIN ELEMENT: not readable. The postcard fails in shots 23, 24, 25, 28 and 34. `facts/hero.json` marks 21 of 50 sampled frames unreadable, and almost all of those are the postcard. Its value separation is 0.00-0.03 and it is 17-33 px at phone size in shots 23, 24 and 28. In shot 25 (97 px) and shot 34 (117 px) it is big enough, but sep is only 0.02. The globe is fine in shots 22, 28, 66 and 74, with sep 0.17-0.21. The one exception is shot 31, frame 1320 (sep 0.065). The postcard is the pay-off object, and in frames 810-960 it melts into the desk.
BLOCK: fault: 26.6-32.0 s and 36.7-39.4 s (shots 23, 24, 28), 51.1-52.9 s (shot 34). The postcard is a main element, and it sits at 0.00-0.03 value contrast and 17-33 px.

WEIGHT + SIZE: not ok.
- Too small or thin:
  - "oh-oh-oh" at 0:32-0:33 is tiny and thin on the black monitor.
  - The dream wide shots at 2:32-2:38 carry the lyric block at about 1/20 of frame height. It reads as a speck, not a line.
  - The red scene at 0:00-1:25 (the "your hands off" section) shows the follow-up lines as tiny dots.
  - The JP + romaji + English block at 0:56-1:03 is present, but the romaji and English lines are thin and small, pale on dark blue.
- Works: "your hands off!", "me to the beach", "push comes to shove", "off my phone", "SALESMAN calling" and "you take the snow" are big and heavy.
- JP romaji + English: present in the frames I viewed (0:56-1:03). I did not check every JP line.

1. Part of the picture or on top:
   - Most of the type is in the set. It sits on the phone, the pink blob, the desk, the wall and the floor, and the yellow accent words take the scene's warm light. That works.
   - The 0:56-1:03 block and the dream-wide lines are a flat layer pasted over the picture.
   - Word-by-word timing looks right (me / to / the / beach, you / can / have / the / mountains).
2. Hierarchy: key words ("cold", "Snow", "beach") are big and yellow, which is good. The fillers in the wides are too small, so they stop being a hierarchy and become a specks line.
3. Variety: good. Each moment has its own treatment: on the phone, floating, on the wall, stamped, in red.

FIX 1
observation: Shots 23/24/28, about 26-32 s and 37-39 s. The postcard is 17-33 px with sep under 0.01.
effect: The pay-off object disappears.
cause: Value and size of the hero (module 01, and hero contrast).
change: Give the card a white or warm rim, light and glow. Make it at least 60 px with sep of 0.15 or more.
priority: high
level: structural:assets
retest: `facts/hero.json` shows 0 unreadable postcard frames.

FIX 2
observation: Dream wides at 2:32-2:38 and "oh-oh-oh" at 0:32. The type is tiny and thin.
effect: It is not readable at phone size.
cause: Size and weight (module 06).
change: Give every lyric line at least 6% of frame height. Use Raymi-Heavy with a darker backing stroke or a lit surface.
priority: high
level: local
retest: Phone frames read at a glance.

FIX 3
observation: JP + romaji + English block at 0:56-1:03.
effect: It is hard to read.
cause: Contrast and size (module 06).
change: Make the romaji and English at least 70% of the JP size. Make them brighter and heavier.
priority: medium
level: local
retest: Romaji and English readable in phone frames.

VERDICT: FAIL
WORST: The postcard, a main element, melts into the desk in 21 of 50 frames, and the wide-shot lyrics are tiny.

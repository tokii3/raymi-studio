# SHOOTING SCRIPT v2 - Rock paper scissors against a stingray

v2 (2026-10-23) after `reviews/script_1.md` (BLOCK): every time is now COMPUTED from the measured bed map
(`assets/music/monkeys-spinning-monkeys.map.json`) and the measured voice takes (`voice/*.json`) - cuts one frame before a beat or
hit, takes placed so their words land where the row says, no overlaps - and checked by `python -m raymi pov` (the
table at the end is its output). Every camera move is something YOU do or something done TO you; the end returns to
frame 0 (loop); the moments only Raymi can do are listed below. The data part is `shots.json` (same times; the build
adds camera / actor / set numbers).

Knowledge opened: `knowledge/PRINCIPLES.md`, `knowledge/CASEBOOK.md`, `canon/01_character.md`, `canon/03_script_guide.md`,
`knowledge/studies/pov_shorts_series_2026-10.md`. Place: her beach (set `beach`). Music bed: `assets/music/monkeys-spinning-monkeys.mp3`.

**The contract:** the lens is the viewer. Frame 0 = her face, big, mid-action. A new picture event at least every
2-3 s. Stamps: the hook in the top safe band (7.5-21.5 % of the frame height), the CTA in the band below it
(9-21 %), both inside the Shorts UI-safe area and checked by the studio guard.

## Shots (times in seconds of the film; voice = word times measured in the takes)
| # | from-to | set: what we see | camera = you | Raymi DOES + her line (measured word times) | type in the picture | why |
|---|---|---|---|---|---|---|
| 1 | 0.00-2.88 | beach: MCU, frame 0 at the TOP of her pop-up: her face 45 % of the frame, fist raised BESIDE her face, sand and sea behind. | you stand; a bump on her arrival | clip jump (once, from its apex key) -> pose fist; smug; 'rock paper scissors. you lose.' (0.14-2.78) | hook stamp 'rock paper scissors. you lose.' top band 0-2.9 s | a challenge straight at you |
| 2 | 2.88-6.23 | beach: CU, lower and closer: her fist pumps down on 'rock' (2.92), 'paper' (4.06), 'scissors' (5.26). | a camera kick on each word | pose keys fist_up / fist_down on the three words; 'rock. paper. scissors!' (2.92-5.94) | each word pops as a stamp beside her fist | the ritual everyone knows |
| 3 | 6.23-7.90 | beach: FREEZE: the picture holds on her hand mid-reveal (motion-blurred), desaturated 70 %, a slow 2 % push, stamp 'PAUSE. pick now.'; the music stops, a low tick on each beat. | frozen, slow push | - (scratch on 6.26) | stamp 'PAUSE. pick now.' centre (between the bands) | the interactive beat: you pick |
| 4 | 7.90-9.15 | beach: ECU: her flat RAY HAND thrusts at the lens and fills half the frame, undulating like a ray wing; stamp STINGRAY big and angled with the hand. | you FLINCH back 0.2 m | pose ray_hand + wave keys; 'stingray.' (7.93-8.57) | stamp 'STINGRAY' (key word, angled) | her sign: she is the answer |
| 5 | 9.15-11.66 | beach: She grabs YOUR hand (your POV hand in frame) and drags you to the water's edge; a rock lies at your feet - she glides over it, belly-flat, inches above the sand. | a lurch forward 0.8 m (you are dragged), then you look down 35 deg at the rock | clip goofy-running (drag) -> pose glide over the rock; 'rock? i glide over it.' (9.19-11.34) | - | proof one, done to you |
| 6 | 11.66-13.75 | beach: You look DOWN: she lies on the sand next to a sheet of paper and goes FLAT (squash to paper thickness); the wind lifts the paper and blows it away over her. | your top-down look (you are standing over her) | pose lie + act flatten; 'paper? i'm flatter.' (11.69-13.60) | - | proof two: rays are flat |
| 7 | 13.75-15.84 | beach: A small crab snaps its claws at YOUR fingers (13.78); she swats it away with her tail barb (15.0). | your hand jerks back (shake), then still | clip standing-dodge-backward -> swat; 'scissors? too slow.' (13.78-15.82) | - | proof three: the scissors are a creature of her world |
| 8 | 15.84-18.80 | beach: LOW hero MCU: she flexes - and the crab pinches her tail on the hit 16.29: she jumps (squash and stretch), tsundere pout, then raises her fist again toward the lens. | you stand; a bump on her jump | clip being-cocky -> joyful-jump (pinch) -> pose fist; 'that didn't count!' (16.49-17.48); 'what did you pick?' (17.55-18.37) | CTA stamp 'what did you pick?' 16.26-18.80 (2.54 s) | everyone comments their pick (and that the crab won) |

## Only Raymi (the slop test)
- 'stingray' as a hand sign: only a ray can play it
- she glides over the rock belly-flat (her body)
- she goes flatter than paper (rays are flat polygons - Let's Get Weird lore)
- her tail barb swats the crab, and the crab pinches it
- competitive about nothing, tsundere when she loses ('that didn't count!')

## Loop
the last frame is her fist raised beside her face in MCU - frame 0's pose.

## Main element
Her face at the lens in every line she says to you; the prop / creature of the bit when it carries the moment.

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| poses fist (up / down), ray_hand, glide, lie; act flatten | pose / acting | 1-8 | to build |
| fx 'freeze': hold a frame, desaturate, slow push | 2D fx | 3 | to build |
| bed mute window (exists: bed.mute) | pipeline | 3 | to build |
| fx 'pov_hand' (your hand, dragged / snapped at) | 2D fx | 5, 7 | to build |
| beach things: rock, paper sheet (blows away), crab (snapping claws) | prop | 5-8 | to build |

## Measured timing (`python -m raymi pov 2026-10-23_pov-rps`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 2.884 | beat 2.917 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 6.228 | beat 6.261 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 7.900 | beat 7.933 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 9.153 | beat 9.186 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 11.661 | beat 11.694 - 1 frame (+0 ms) | yes |
| cut into shot 7 | 13.751 | beat 13.784 - 1 frame (+0 ms) | yes |
| cut into shot 8 | 15.841 | beat 15.874 - 1 frame (+0 ms) | yes |
| voice 'rock paper scissors. you lose.' | 0.050 | words 0.14-2.78: 'rock' 0.14, 'paper' 0.46, 'scissors.' 0.83, 'you' 2.13, 'lose.' 2.36 | yes |
| voice 'rock. paper. scissors!' | 2.824 | words 2.92-5.94: 'rock.' 2.92, 'paper.' 4.05, 'scissors!' 5.25 | yes |
| voice 'stingray.' | 7.840 | words 7.93-8.57: 'stingray.' 7.93 | yes |
| voice 'rock? i glide over it.' | 9.093 | words 9.19-11.34: 'rock?' 9.19, 'i' 10.31, 'glide' 10.47, 'over' 10.87, 'it.' 11.14 | yes |
| voice 'paper? i'm flatter.' | 11.601 | words 11.69-13.60: 'paper?' 11.69, 'i'm' 12.86, 'flatter.' 13.08 | yes |
| voice 'scissors? too slow.' | 13.691 | words 13.78-15.82: 'scissors?' 13.78, 'too' 15.13, 'slow.' 15.39 | yes |
| voice 'that didn't count!' | 16.400 | words 16.49-17.48: 'that' 16.49, 'didn't' 16.76, 'count!' 17.05 | yes |
| voice 'what did you pick?' | 17.453 | words 17.55-18.37: 'what' 17.55, 'did' 17.77, 'you' 17.92, 'pick?' 18.03 | yes |
| sfx scratch | 6.261 | beat 6.261 (+0 ms) | yes |
| sfx pop | 7.933 | beat 7.933 (+0 ms) | yes |
| sfx whoosh | 9.186 | beat 9.186 (+0 ms) | yes |
| sfx grab | 14.202 | beat 14.202 (+0 ms) | yes |
| sfx boing | 16.290 | beat 16.292 (-2 ms) | yes |
| hook stamp 'rock paper scissors. you lose.' | 0.00-2.90 | first line ends 2.78 | yes |
| CTA stamp 'what did you pick?' | 16.26-18.80 | 2.54 s on screen | yes |
| end | 18.799 | length 18.80 s | yes |

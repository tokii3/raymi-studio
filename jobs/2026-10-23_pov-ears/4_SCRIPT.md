# SHOOTING SCRIPT v2 - POV: you try to touch her tako ears

v2 (2026-10-23) after `reviews/script_1.md` (BLOCK): every time is now COMPUTED from the measured bed map
(`assets/music/investigations.map.json`) and the measured voice takes (`voice/*.json`) - cuts one frame before a beat or
hit, takes placed so their words land where the row says, no overlaps - and checked by `python -m raymi pov` (the
table at the end is its output). Every camera move is something YOU do or something done TO you; the end returns to
frame 0 (loop); the moments only Raymi can do are listed below. The data part is `shots.json` (same times; the build
adds camera / actor / set numbers).

Knowledge opened: `knowledge/PRINCIPLES.md`, `knowledge/CASEBOOK.md`, `canon/01_character.md`, `canon/03_script_guide.md`,
`knowledge/studies/pov_shorts_series_2026-10.md`. Place: her bedroom (set `bedroom`). Music bed: `assets/music/investigations.mp3`.

**The contract:** the lens is the viewer. Frame 0 = her face, big, mid-action. A new picture event at least every
2-3 s. Stamps: the hook in the top safe band (7.5-21.5 % of the frame height), the CTA in the band below it
(9-21 %), both inside the Shorts UI-safe area and checked by the studio guard.

## Shots (times in seconds of the film; voice = word times measured in the takes)
| # | from-to | set: what we see | camera = you | Raymi DOES + her line (measured word times) | type in the picture | why |
|---|---|---|---|---|---|---|
| 1 | 0.00-3.30 | bedroom: MCU at 2.2 m, eye height 1.45 m: she faces you, both hands clamped over her tako ears (pose ears_cover), shelf with the salmon plush + the round sea window behind her. On the hit 1.45 she squeezes the ears tighter. | you stand still, handheld breath | pose ears_cover over clip unarmed-idle-01 (mix 0.4), expression angry 0.5; 'don't touch my ears. i mean it.' (0.19-2.75) | hook stamp 'don't touch my ears. i mean it.' top band 0-3.0 s | her design + her canon fear in one picture |
| 2 | 3.30-5.18 | bedroom: She turns her back to you and arranges her knick-knacks on the shelf: she lifts the salmon plush and sets it straight. | GREEN LIGHT: one STEP on 4.58 - the lens jumps 2.2 -> 1.75 m in 4 frames (snap), step sfx | clip farming-pick-fruit (a reach to the shelf); 'i'm watching you.' (3.33-4.18) - she is not | - | your move: the creep game |
| 3 | 5.18-6.43 | bedroom: She WHIPS round to face you, her chest dots flare, a burst of air bubbles pops off her head (the '!' of a sea creature). | RED LIGHT: the lens freezes dead, a 3-frame shake (you got caught) | clip look-over-shoulder from its turn key, expression surprised -> angry; dots flare 5.21; 'i saw that!' (5.21-6.00) | - | caught: you feel it as the camera |
| 4 | 6.43-8.31 | bedroom: She turns back to the shelf and polishes a second figurine (a little glass ray). | TWO STEPS on 7.09 and 7.72 - 1.75 -> 1.40 -> 1.05 m; her ears now big in frame | clip farming-pick-fruit-2 (reach + handle) | - | you get greedy |
| 5 | 8.31-10.82 | bedroom: ECU: she spins round AND leans in - her face 0.55 m from the lens, eyes huge, anger icon. | you recoil 0.1 m, shake 0.3 | clip standing-react-large-from-left -> angry, lean 0.5 m toward the lens; 'closer? really?' (8.35-10.05) | - | the scare: she is suddenly right there |
| 6 | 10.82-12.07 | bedroom: She turns away and steps 0.3 m off; you LUNGE at her ears (11.48) - her hand slaps over the lens (11.60): the frame goes dark except light through her fingers and one eye in a gap, glaring. | the lunge 0.5 m to ear height in 6 frames, whoosh; then her hand's cover with a finger gap (fx cover, gap) | clip look-over-shoulder -> pose cover_lens; 'nope.' (11.48-11.87) spoken through her fingers | - | the game's payoff: she wins |
| 7 | 12.07-15.24 | bedroom: Her hand lifts off the lens: MCU, she leans toward you, both hands back over her ears, smug, eyes narrowed - the frame 0 picture again. | she shoves you back: the lens slides from 0.55 m back to 2.2 m over 10 frames (ease out), then still - the frame 0 distance | pose ears_cover, smug -> narrowed eyes; 'how close did you get?' (12.11-13.20) | CTA stamp 'how close did you get?' 12.08-15.24 (3.16 s) | the question is about the viewer's own play |

## Only Raymi (the slop test)
- her tako ears are the prize (her design) and her canon fear
- her chest dots flare and air bubbles burst off her head each time she senses you (a sea creature's alarm)
- her knick-knack collection (the salmon plush, a glass ray) is what she is busy with - her hobby
- she ends the game on her terms and asks how close you got (her competitive streak)

## Loop
the last shot is the frame 0 picture (ears covered, MCU at 2.2 m, narrowed eyes): the game restarts.

## Main element
Her face at the lens in every line she says to you; the prop / creature of the bit when it carries the moment.

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| poses ears_cover, cover_lens | pose | 1, 6, 7 | to build |
| fx 'cover': her hand's shadow over the frame with a finger gap (light + her eye through it) | 2D fx | 6 | to build |
| icon 'bubbles' (a burst of air bubbles) | icon | 3 | to build |
| bedroom shelf props: glass ray figurine (thing) | prop | 4 | to build |
| glow_flare | film option | 3 | to build |

## Measured timing (`python -m raymi pov 2026-10-23_pov-ears`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 3.298 | beat 3.331 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 5.178 | beat 5.211 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 6.432 | beat 6.465 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 8.313 | beat 8.346 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 10.821 | beat 10.854 - 1 frame (+0 ms) | yes |
| cut into shot 7 | 12.075 | beat 12.108 - 1 frame (+0 ms) | yes |
| voice 'don't touch my ears. i mean it.' | 0.100 | words 0.19-2.75: 'don't' 0.19, 'touch' 0.48, 'my' 0.77, 'ears.' 0.96, 'i' 2.13, 'mean' 2.27, 'it.' 2.53 | yes |
| voice 'i'm watching you.' | 3.238 | words 3.33-4.18: 'i'm' 3.33, 'watching' 3.53, 'you.' 3.93 | yes |
| voice 'i saw that!' | 5.118 | words 5.21-6.00: 'i' 5.21, 'saw' 5.37, 'that!' 5.65 | yes |
| voice 'closer? really?' | 8.253 | words 8.35-10.05: 'closer?' 8.35, 'really?' 9.60 | yes |
| voice 'nope.' | 11.388 | words 11.48-11.87: 'nope.' 11.48 | yes |
| voice 'how close did you get?' | 12.015 | words 12.11-13.20: 'how' 12.11, 'close' 12.32, 'did' 12.65, 'you' 12.80, 'get?' 12.91 | yes |
| sfx step | 4.584 | beat 4.584 (+0 ms) | yes |
| sfx pop | 5.211 | beat 5.211 (+0 ms) | yes |
| sfx step | 7.092 | beat 7.092 (+0 ms) | yes |
| sfx step | 7.719 | beat 7.719 (+0 ms) | yes |
| sfx whoosh | 10.854 | beat 10.854 (+0 ms) | yes |
| sfx grab | 11.481 | beat 11.481 (+0 ms) | yes |
| hook stamp 'don't touch my ears. i mean it.' | 0.00-3.00 | first line ends 2.75 | yes |
| CTA stamp 'how close did you get?' | 12.07-15.24 | 3.17 s on screen | yes |
| end | 15.242 | length 15.24 s | yes |

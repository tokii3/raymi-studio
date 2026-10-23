# SHOOTING SCRIPT v2 - POV: you caught her eating salmon sashimi

v2 (2026-10-23) after `reviews/script_1.md` (BLOCK): every time is now COMPUTED from the measured bed map
(`assets/music/scheming-weasel-faster.map.json`) and the measured voice takes (`voice/*.json`) - cuts one frame before a beat or
hit, takes placed so their words land where the row says, no overlaps - and checked by `python -m raymi pov` (the
table at the end is its output). Every camera move is something YOU do or something done TO you; the end returns to
frame 0 (loop); the moments only Raymi can do are listed below. The data part is `shots.json` (same times; the build
adds camera / actor / set numbers).

Knowledge opened: `knowledge/PRINCIPLES.md`, `knowledge/CASEBOOK.md`, `canon/01_character.md`, `canon/03_script_guide.md`,
`knowledge/studies/pov_shorts_series_2026-10.md`. Place: her bedroom at night (set `bedroom`). Music bed: `assets/music/scheming-weasel-faster.mp3`.

**The contract:** the lens is the viewer. Frame 0 = her face, big, mid-action. A new picture event at least every
2-3 s. Stamps: the hook in the top safe band (7.5-21.5 % of the frame height), the CTA in the band below it
(9-21 %), both inside the Shorts UI-safe area and checked by the studio guard.

## Shots (times in seconds of the film; voice = word times measured in the takes)
| # | from-to | set: what we see | camera = you | Raymi DOES + her line (measured word times) | type in the picture | why |
|---|---|---|---|---|---|---|
| 1 | 0.00-2.28 | bedroom: MCU from the door, eye height 1.5 m - YOU switched the light on (click, a 4-frame flare): she sits on the edge of her shell bed, chopsticks with an ORANGE salmon slice at her open mouth, frozen, eyes wide at you. Beside her face on the shelf: the salmon plush and a framed drawing of her and the salmon with a heart (BFF). | you stand in the door; still | pose eat_freeze (chopsticks + slice in her right hand) held to 0.6 s, then her ears droop and the slice wobbles on the chopsticks; 'this is not what it looks like.' (0.24-1.79) | hook stamp 'this is not what it looks like.' top band 0-2.2 s | caught in the act + who the victim is, in one frame |
| 2 | 2.28-4.44 | bedroom: CU: she holds the slice UP into the lens, big, saturated orange against her purple light. | you lean in 0.2 m to look | pose offer (arm toward the lens with the chopsticks), nervous smile; 'it's purple sweet potato.' (2.32-3.77) | - | the evidence, big, while she lies about it |
| 3 | 4.44-7.32 | bedroom: ECU: she pushes it even closer, sweat icon, grin cracking. | you lean back 0.1 m (it is too close) | pose offer, closer; sweat icon; 'very orange purple sweet potato.' (4.48-6.46) | - | the lie gets worse |
| 4 | 7.32-9.48 | bedroom: From YOUR door view: behind her, the SALMON swims up to the round window and presses his face to the glass on the beat 7.72; she turns, sees him, her chest dots flash. | your view, still; the salmon in the back left | clip look-over-shoulder; 'oh no. my best friend.' (7.89-9.46) | - | the victim arrives |
| 5 | 9.48-12.00 | bedroom: MS: she slides the plate onto the bed and FLATTENS herself over it like a ray on the sand (her body squashes flat, covering it), grinning at the window, waving one hand. | you flinch back 0.15 m as she moves | clip joyful-jump (short) -> act flatten over the plate + waving; 'nothing here! just rice!' (9.52-11.79) | - | a hiding move only a ray can do |
| 6 | 12.00-13.44 | bedroom: She grabs YOUR collar (her hand comes at the lens) and pulls you close: CU, finger on her lips. | the lens is YANKED 0.4 m toward her on the hit 12.03 (grab sfx), shake 0.4 | pose shh after a reach; 'you saw nothing.' (12.06-13.03) | - | you are her accomplice now |
| 7 | 13.44-16.71 | bedroom: MCU: the salmon at the window squints; while she asks you, her hand sneaks the slice back up toward her mouth - and on the last beat she is frozen again exactly as in frame 0 (chopsticks at the open mouth, eyes wide at you). | still | pose eat_freeze returning over 1.2 s; 'should i tell him?' (13.47-14.30) | CTA stamp 'should i tell him? yes / no' 13.44-16.71 (3.27 s) | yes / no is the lowest-effort comment; the sneak keeps the joke going |

## Only Raymi (the slop test)
- her best friend is a salmon - eating salmon is a betrayal only in her lore (the BFF drawing makes it readable for new viewers)
- purple sweet potato is her real favourite food: her lie uses her own canon
- she hides the plate by flattening over it like a ray on the sand
- her chest dots flash when the salmon appears

## Loop
the last beat returns to the frame 0 freeze (chopsticks at the open mouth): the Short restarts on 'this is not what it looks like'.

## Main element
Her face at the lens in every line she says to you; the prop / creature of the bit when it carries the moment.

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| held props on her hand bone: chopsticks + salmon slice (`props` on actor keys, reusable) | prop | 1-7 | to build |
| things: shell plate with salmon sashimi, framed BFF drawing | prop | 1-5 | to build |
| bedroom: salmon at the round window (salmon path + press_at) | set option | 4-7 | to build |
| bedroom option `lamp_at` (dark -> lit with a flare) | set option | 1 | to build |
| poses eat_freeze, offer, shh; act flatten | pose / acting | 1-7 | to build |

## Measured timing (`python -m raymi pov 2026-10-23_pov-sashimi`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 2.284 | beat 2.317 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 4.443 | beat 4.476 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 7.323 | beat 7.356 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 9.482 | beat 9.515 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 12.001 | beat 12.034 - 1 frame (+0 ms) | yes |
| cut into shot 7 | 13.441 | beat 13.474 - 1 frame (+0 ms) | yes |
| voice 'this is not what it looks like.' | 0.150 | words 0.24-1.79: 'this' 0.24, 'is' 0.50, 'not' 0.64, 'what' 0.93, 'it' 1.06, 'looks' 1.19, 'like.' 1.44 | yes |
| voice 'it's purple sweet potato.' | 2.224 | words 2.32-3.77: 'it's' 2.32, 'purple' 2.53, 'sweet' 2.92, 'potato.' 3.25 | yes |
| voice 'very orange purple sweet potato.' | 4.383 | words 4.48-6.46: 'very' 4.48, 'orange' 4.87, 'purple' 5.25, 'sweet' 5.61, 'potato.' 5.93 | yes |
| voice 'oh no. my best friend.' | 7.800 | words 7.89-9.46: 'oh' 7.89, 'no.' 8.08, 'my' 8.55, 'best' 8.71, 'friend.' 9.05 | yes |
| voice 'nothing here! just rice!' | 9.422 | words 9.52-11.79: 'nothing' 9.52, 'here!' 9.93, 'just' 11.01, 'rice!' 11.35 | yes |
| voice 'you saw nothing.' | 11.967 | words 12.06-13.03: 'you' 12.06, 'saw' 12.26, 'nothing.' 12.52 | yes |
| voice 'should i tell him?' | 13.381 | words 13.47-14.30: 'should' 13.47, 'i' 13.70, 'tell' 13.79, 'him?' 14.04 | yes |
| sfx click | 0.000 | beat 0.157 (-157 ms) | off grid |
| sfx boing | 7.716 | beat 7.716 (+0 ms) | yes |
| sfx grab | 12.030 | beat 12.034 (-4 ms) | yes |
| sfx pop | 15.993 | beat 15.993 (+0 ms) | yes |
| hook stamp 'this is not what it looks like.' | 0.00-2.20 | first line ends 1.79 | yes |
| CTA stamp 'should i tell him? yes / no' | 13.44-16.71 | 3.27 s on screen | yes |
| end | 16.713 | length 16.71 s | yes |

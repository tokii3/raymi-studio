# SHOOTING SCRIPT v2 - POV: you sat in her seat

v2 (2026-10-23) after `reviews/script_1.md` (BLOCK): every time is now COMPUTED from the measured bed map
(`assets/music/sneaky-snitch.map.json`) and the measured voice takes (`voice/*.json`) - cuts one frame before a beat or
hit, takes placed so their words land where the row says, no overlaps - and checked by `python -m raymi pov` (the
table at the end is its output). Every camera move is something YOU do or something done TO you; the end returns to
frame 0 (loop); the moments only Raymi can do are listed below. The data part is `shots.json` (same times; the build
adds camera / actor / set numbers).

Knowledge opened: `knowledge/PRINCIPLES.md`, `knowledge/CASEBOOK.md`, `canon/01_character.md`, `canon/03_script_guide.md`,
`knowledge/studies/pov_shorts_series_2026-10.md`. Place: train (set `train`) + the seat pair by the window (new option `pair`). Music bed: `assets/music/sneaky-snitch.mp3`.

**The contract:** the lens is the viewer. Frame 0 = her face, big, mid-action. A new picture event at least every
2-3 s. Stamps: the hook in the top safe band (7.5-21.5 % of the frame height), the CTA in the band below it
(9-21 %), both inside the Shorts UI-safe area and checked by the studio guard.

## Shots (times in seconds of the film; voice = word times measured in the takes)
| # | from-to | set: what we see | camera = you | Raymi DOES + her line (measured word times) | type in the picture | why |
|---|---|---|---|---|---|---|
| 1 | 0.00-2.91 | train: MCU, seated eye height 1.15 m. YOU sit in the window seat (the window is behind the lens, unseen yet); she sits in the aisle seat beside you, body turned to you, her face 45 % of the frame height on the right third, the car's straps and poles behind her. | you sit; a light handheld breath; a slow 0.15 m lean toward her over the shot (you look at her) | clip sitting-disapproval from its glare key, expression angry 0.4, eyes narrowed; 'you sat in my seat.' (0.19-1.37) | hook stamp 'you sat in MY seat.' in the top band 0-2.9 s | her face + a claim at frame 0 |
| 2 | 2.91-4.96 | train: CU, the same axis: she leans 0.2 m toward you on 'window', her tako ears forward. | you RECOIL: the lens pulls back 0.25 m and tilts 6 deg away in 8 frames, shake 0.3 for 6 frames | clip sitting-talking, actor move 0.2 m toward the lens over 8 frames, smug; 'this is the window seat.' (2.94-4.20) | - | your body reacts: the camera is you |
| 3 | 4.96-8.39 | train: YOU turn your head: the lens pans 70 deg from her pointing hand to the window beside you - the dark sea streams past, a salmon swims alongside - holds 0.4 s, and whips back to her face on 'mine'. | your head turn: pan right 70 deg (1.1 s), hold, whip back 0.25 s landing on 'mine' 7.57 (one frame before) | clip sitting-and-pointing (she points past you at the sea); 'i saw the sea first. so it's mine.' (5.00-7.95, 'mine' 7.57) | - | her reason, in her world: she is FROM the sea outside |
| 4 | 8.39-10.44 | train: MS from your seat: she crosses her arms and turns her nose up; her chest dots flare once on 'rules'. | handheld, you lean back 0.1 m | clip sitting-angry, expression angry 0.5, dots flare (glow_flare) on 'rules' 9.00; 'rays have rules, okay?' (8.42-10.03) | - | she wins arguments by declaring rules |
| 5 | 10.44-12.50 | train: TUNNEL: the car goes black at 10.44. Only the window streaks and HER glowing chest dots show: the dots rise, glide toward the lens and STOP 0.3 m in front of it for one beat (a face's worth of glow inches from you, 11.16-11.85), then slide past you to the left. | you get climbed over: a bump at 11.85 (shake 0.4) and the lens slides 0.6 m to the right, into the aisle seat, in the dark | actor move from the aisle seat to the window seat behind the lens over 1.4 s in the black (dots only, material dark); 'oh. a tunnel.' (10.48-12.06) - an innocent cover line in the dark | - | the twist told by her body alone: only a bioluminescent ray can do this gag |
| 6 | 12.50-15.24 | train: LIGHTS ON (click on the cut): now YOU sit in the aisle seat; she sits at the window, legs crossed, the sea behind her. On 13.90 the salmon swims up and presses his face to the window next to her - her best friend backs her up. | a small push-in 0.1 m (you stare) | clip gestures-pack-basic-being-cocky (seated mix 0.5) -> she pats HER window-seat cushion (sitting-talking); 'hehe. thanks for warming it up.' (12.53-14.90) | - | payoff: the seat changed owner, her friend agrees |
| 7 | 15.24-18.69 | train: MCU: she points at the lens; the salmon behind her nods along. | slow push-in 0.1 m; at 17.32 you WHIP your head back toward the window (whip pan 0.4 s) - the whip lands in frame 0's glare, round two of the loop | clip pointing-forward, smug; 'window or aisle? choose wisely.' (15.27-17.94) | CTA stamp 'window or aisle? choose wisely.' 15.24-18.69 (3.45 s) | a pick-one question: everybody has an answer |

## Only Raymi (the slop test)
- the tunnel swap told only by her bioluminescent chest dots in the black (they stop in front of your face)
- 'i saw the sea first' - she points out of a train window at the deep sea she comes from, with her salmon friend swimming outside
- the salmon presses his face to the glass beside her at the payoff: her best friend backs her claim
- ray rules + her dots flaring on 'rules'

## Loop
the last 0.4 s whip toward the window cuts into frame 0's glare: you take the window seat back and round two starts.

## Main element
Her face at the lens in every line she says to you; the prop / creature of the bit when it carries the moment.

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| train option `pair`: a forward-facing two-seat row by the window, marks seat_window / seat_aisle / cam_window / cam_aisle | set option | 1-7 | to build |
| train option `lights_off` keyed (car dark, window streaks + her dots stay) | set option | 5 | to build |
| glow_flare: her chest dots flare at listed frames | film option | 4 | to build |
| salmon outside the train window (creature `salmon` path + `press_at`) | set option | 3, 6, 7 | to build |

## Measured timing (`python -m raymi pov 2026-10-23_pov-seat`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 2.907 | beat 2.940 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 4.962 | beat 4.995 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 8.387 | beat 8.420 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 10.442 | beat 10.475 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 12.497 | beat 12.530 - 1 frame (+0 ms) | yes |
| cut into shot 7 | 15.237 | beat 15.270 - 1 frame (+0 ms) | yes |
| voice 'you sat in my seat.' | 0.100 | words 0.19-1.37: 'you' 0.19, 'sat' 0.40, 'in' 0.69, 'my' 0.80, 'seat.' 0.97 | yes |
| voice 'this is the window seat.' | 2.847 | words 2.94-4.20: 'this' 2.94, 'is' 3.20, 'the' 3.35, 'window' 3.46, 'seat.' 3.83 | yes |
| voice 'i saw the sea first. so it's mine.' | 4.902 | words 5.00-7.95: 'i' 5.00, 'saw' 5.17, 'the' 5.43, 'sea' 5.57, 'first.' 5.83, 'so' 7.07, 'it's' 7.36, 'mine.' 7.56 | yes |
| voice 'rays have rules, okay?' | 8.327 | words 8.42-10.03: 'rays' 8.42, 'have' 8.76, 'rules,' 9.01, 'okay?' 9.63 | yes |
| voice 'oh. a tunnel.' | 10.382 | words 10.48-12.06: 'oh.' 10.48, 'a' 11.47, 'tunnel.' 11.61 | yes |
| voice 'hehe. thanks for warming it up.' | 12.437 | words 12.53-14.90: 'hehe.' 12.53, 'thanks' 13.71, 'for' 14.04, 'warming' 14.20, 'it' 14.56, 'up.' 14.66 | yes |
| voice 'window or aisle? choose wisely.' | 15.177 | words 15.27-17.94: 'window' 15.27, 'or' 15.76, 'aisle?' 15.96, 'choose' 17.02, 'wisely.' 17.38 | yes |
| sfx whoosh | 10.475 | beat 10.475 (+0 ms) | yes |
| sfx click | 12.497 | beat 12.530 (-33 ms) | yes |
| sfx boing | 13.900 | beat 13.900 (+0 ms) | yes |
| sfx whoosh | 18.009 | beat 18.009 (+0 ms) | yes |
| hook stamp 'you sat in MY seat.' | 0.00-2.90 | first line ends 1.37 | yes |
| CTA stamp 'window or aisle? choose wisely.' | 15.24-18.69 | 3.46 s on screen | yes |
| end | 18.694 | length 18.69 s | yes |

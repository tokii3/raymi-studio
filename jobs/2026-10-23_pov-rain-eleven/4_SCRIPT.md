# SHOOTING SCRIPT v2 - Rain Prediction Record #11: rain in Tokyo tomorrow

v2 (2026-10-23) after `reviews/script_1.md` (BLOCK): every time is now COMPUTED from the measured bed map
(`assets/music/local-forecast-elevator.map.json`) and the measured voice takes (`voice/*.json`) - cuts one frame before a beat or
hit, takes placed so their words land where the row says, no overlaps - and checked by `python -m raymi pov` (the
table at the end is its output). Every camera move is something YOU do or something done TO you; the end returns to
frame 0 (loop); the moments only Raymi can do are listed below. The data part is `shots.json` (same times; the build
adds camera / actor / set numbers).

Knowledge opened: `knowledge/PRINCIPLES.md`, `knowledge/CASEBOOK.md`, `canon/01_character.md`, `canon/03_script_guide.md`,
`knowledge/studies/pov_shorts_series_2026-10.md`. Place: weather studio (set `weather`). Music bed: `assets/music/local-forecast-elevator.mp3`.

**The contract:** the lens is the viewer. Frame 0 = her face, big, mid-action. A new picture event at least every
2-3 s. Stamps: the hook in the top safe band (7.5-21.5 % of the frame height), the CTA in the band below it
(9-21 %), both inside the Shorts UI-safe area and checked by the studio guard.

## Shots (times in seconds of the film; voice = word times measured in the takes)
| # | from-to | set: what we see | camera = you | Raymi DOES + her line (measured word times) | type in the picture | why |
|---|---|---|---|---|---|---|
| 1 | 0.00-3.75 | weather: ECU through studio CAMERA 1 (the lens = your TV): she leans into the lens, face 50 % of the frame, the red tally light of camera 1 glowing at the frame's top edge, the map soft behind her. On 'percent' her tako ears perk and her chest dots flare. | camera 1, locked off (a studio camera, a faint breath) | clip gestures-pack-basic-hard-head-nod over pose lean, confident; 'rain tomorrow. one hundred percent.' (0.14-3.01) | hook stamp 'rain tomorrow. 100%.' top band 0-3.1 s (digits on screen only, never in the voice) | a bold call in your face: personal_fact hook |
| 2 | 3.75-5.93 | weather: CAMERA 2 (wide) goes live: its tally light flips on, 1 goes dark; she whips her head to find the new live camera and points at the ticker: 'RAIN RECORD: 3 RIGHT / 10'. | camera 2, locked wide (studio_wide) | clip pointing toward the ticker, sweat on 'three'; 'my record is three out of ten.' (3.79-5.59) | the ticker (the set's own type): 'RAIN RECORD: 3 RIGHT / 10' | the counter = the series' stakes |
| 3 | 5.93-8.12 | weather: CAMERA 1 again (cut-in reaction): CU, she flips her hair, tako ears up, proud. | camera 1 CU | clip gestures-pack-basic-being-cocky; 'that's basically a streak.' (5.97-7.37) | - | confidence is cute: 30 % called a streak |
| 4 | 8.12-12.48 | weather: CAMERA 3 on the map: the islands of Japan with TOKYO marked; she SLAPS the map one frame before 'rain.' - a fat rain cloud stamps onto Tokyo with '100%' and drops start falling on the map; on 'trust me' she leans to camera 3. | camera 3 (map_close), locked; a 3-frame knock on the slap | clip pro-magic-standing-1h-cast-spell-01 (the slap) -> hard-head-nod; 'tomorrow in tokyo. rain. trust me.' ('rain.' 10.33 on the beat, ends 12.13) | the map: 'TOKYO' label + '100%' on the cloud | the bet becomes concrete and checkable |
| 5 | 12.48-14.67 | weather: CAMERA 1 ECU: she whispers into the lens - and on 'this' she goes FLAT like a ray (her body squashes thin) and drops behind the desk out of frame, the way a ray vanishes into sand. | camera 1, locked; the desk edge rises into the bottom of the frame as she drops | clip leaning -> act flatten (y-scale to 0.12 over 6 frames) + drop 0.9 m (14.3-14.6); 'and if i'm wrong, you never saw this.' (12.52-14.67) | - | she hides from YOU with her own body: a ray flattening out of sight |
| 6 | 14.67-18.52 | weather: CAMERA 1: the empty desk for 0.5 s - then she POPS back up into the same lean ECU as frame 0 (pop on 15.24), ears perked, and nods hard. | camera 1 locked (the same framing as frame 0) | act pop from below; clip hard-head-nod; 'right or wrong? bet in the comments.' (15.24-18.02) | CTA stamp 'right or wrong? bet in the comments.' 15.21-18.52 (3.31 s); ticker stays 'RAIN RECORD: 3 RIGHT / 10' | the bet is the easiest comment, and a reason to come back tomorrow (result in the pinned comment) |

## Only Raymi (the slop test)
- her public rain-prediction counter (series lore): 3 right of 10, bet number eleven
- she hides by flattening like a ray and sinking out of sight behind the desk, then pops back up
- her tako ears perk and her chest dots flare when she is proud of the call
- the lens is the live studio camera: she hunts the camera with the red light like a presenter, so she always talks to YOU

## Loop
the last shot is the same camera 1 lean ECU and the same hard nod as frame 0: the bet restarts seamlessly.

## Main element
Her face at the lens in every line she says to you; the prop / creature of the bit when it carries the moment.

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| weather option map 'japan' (islands + TOKYO) + `rain_at`: a rain cloud with '100%' stamps on and drops fall | set option | 4 | to build |
| weather option `live`: which studio camera's tally light is on (1 / 2 / 3), keyed | set option | 1-6 | to build |
| act `flatten` (a ray squash, y 0.12, reusable) + a drop move | acting | 5 | to build |
| glow_flare: her chest dots flare at listed frames | film option | 1 | to build |

## Measured timing (`python -m raymi pov 2026-10-23_pov-rain-eleven`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 3.753 | beat 3.786 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 5.935 | beat 5.968 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 8.118 | beat 8.151 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 12.483 | beat 12.516 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 14.666 | beat 14.699 - 1 frame (+0 ms) | yes |
| voice 'rain tomorrow. one hundred percent.' | 0.050 | words 0.14-3.01: 'rain' 0.14, 'tomorrow.' 0.51, 'one' 1.80, 'hundred' 2.05, 'percent.' 2.49 | yes |
| voice 'my record is three out of ten.' | 3.693 | words 3.79-5.59: 'my' 3.79, 'record' 3.99, 'is' 4.41, 'three' 4.61, 'out' 4.92, 'of' 5.09, 'ten.' 5.21 | yes |
| voice 'that's basically a streak.' | 5.875 | words 5.97-7.37: 'that's' 5.97, 'basically' 6.27, 'a' 6.82, 'streak.' 6.90 | yes |
| voice 'tomorrow in tokyo. rain. trust me.' | 8.126 | words 8.22-12.05: 'tomorrow' 8.22, 'in' 8.76, 'tokyo.' 8.95, 'rain.' 10.24, 'trust' 11.38, 'me.' 11.79 | yes |
| voice 'and if i'm wrong, you never saw this.' | 12.423 | words 12.52-14.67: 'and' 12.52, 'if' 12.70, 'i'm' 12.86, 'wrong,' 13.06, 'you' 13.61, 'never' 13.71, 'saw' 14.04, 'this.' 14.30 | yes |
| voice 'right or wrong? bet in the comments.' | 15.152 | words 15.24-18.02: 'right' 15.24, 'or' 15.59, 'wrong?' 15.76, 'bet' 16.85, 'in' 17.10, 'the' 17.23, 'comments.' 17.33 | yes |
| sfx chime | 3.786 | beat 3.786 (+0 ms) | yes |
| sfx pop | 10.334 | beat 10.334 (+0 ms) | yes |
| sfx whoosh | 14.699 | beat 14.699 (+0 ms) | yes |
| sfx boing | 15.245 | beat 15.245 (+0 ms) | yes |
| hook stamp 'rain tomorrow. 100%.' | 0.00-3.10 | first line ends 3.01 | yes |
| CTA stamp 'right or wrong? bet in the comments.' | 15.21-18.52 | 3.31 s on screen | yes |
| end | 18.519 | length 18.52 s | yes |

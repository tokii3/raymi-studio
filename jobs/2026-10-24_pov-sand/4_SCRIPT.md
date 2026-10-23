# SHOOTING SCRIPT - POV: You Almost Stepped On A Stingray

Built in one pass (toki 2026-10-24) from the parts proven in the first seven POV Shorts; the data is `shots.json`
(camera = you, actor keys, set options, fx). Rules applied: lens a few cm below her measured face height, poses from
the pose sheet, clips under a pose at mix <= 0.2, sitting = pose sit, grade pov, DoF on close-ups.

## Shots
| # | from-to | set | what we see (camera = you) |
|---|---|---|---|
| 1 | 0.00-2.32 | beach | you, standing, look down at your next step: a mound of sand right under your foot - two purple eyes snap open in it and glare up at you (a step sound, your view jolts) |
| 2 | 2.32-5.58 | beach | she BURSTS up out of the sand (the mound blows apart, sand flies), the lens tilts up with her to a low medium shot: hands-on-hips annoyed |
| 3 | 5.58-8.18 | beach | a wider shot at hip height circling her a little: on 'like this' she does the shuffle - a goofy twisting foot dance in the sand |
| 4 | 8.18-11.43 | beach | on 'swim away' she goes FLAT like a ray and glides off over the sand into the shallow water, the lens panning after her |
| 5 | 11.43-14.71 | beach | back to frame 0: you look down at the same spot - she sinks back into the sand (it heaps up over her again), only her eyes peek out, waiting for your answer |

## Only Raymi
- she hides in the sand like a real ray - only her eyes peek out (her body, canon/01: a stingray)
- the stingray shuffle is a real beach-safety fact, told by the ray herself - and she does it as a dance ('like this')
- on 'swim away' she goes flat and glides off over the sand into the water like a ray (her body)
- bossy-helpful about ocean things (canon/01 2), never mean: 'no drama'

## Loop
The last shot returns to frame 0's framing.

## Measured timing (`python -m raymi pov 2026-10-24_pov-sand`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 2.324 | beat 2.357 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 5.575 | beat 5.608 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 8.175 | beat 8.208 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 11.426 | beat 11.459 - 1 frame (+0 ms) | yes |
| voice 'you almost stepped on me.' | 0.050 | words 0.14-1.55: 'you' 0.14, 'almost' 0.33, 'stepped' 0.76, 'on' 1.13, 'me.' 1.30 | yes |
| voice 'rays hide in the sand. it's our whole thing.' | 2.264 | words 2.36-5.48: 'rays' 2.36, 'hide' 2.70, 'in' 3.05, 'the' 3.16, 'sand.' 3.24, 'it's' 4.45, 'our' 4.66, 'whole' 4.86, 'thing.' 5.13 | yes |
| voice 'shuffle your feet. like this.' | 5.515 | words 5.61-7.98: 'shuffle' 5.61, 'your' 6.05, 'feet.' 6.23, 'like' 7.32, 'this.' 7.61 | yes |
| voice 'we feel it and swim away. no drama.' | 8.115 | words 8.21-11.21: 'we' 8.21, 'feel' 8.40, 'it' 8.70, 'and' 8.86, 'swim' 9.01, 'away.' 9.33, 'no' 10.43, 'drama.' 10.72 | yes |
| voice 'did you know the shuffle? yes or no.' | 11.366 | words 11.46-14.08: 'did' 11.46, 'you' 11.64, 'know' 11.77, 'the' 11.95, 'shuffle?' 12.05, 'yes' 13.24, 'or' 13.61, 'no.' 13.77 | yes |
| sfx step | 0.000 | beat 0.406 (-406 ms) | off grid |
| sfx whoosh | 2.357 | beat 2.357 (+0 ms) | yes |
| sfx whoosh | 8.858 | beat 8.858 (+0 ms) | yes |
| sfx pop | 11.459 | beat 11.459 (+0 ms) | yes |
| hook stamp 'you almost stepped on me.' | 0.00-1.90 | first line ends 1.55 | yes |
| CTA stamp 'did you know the shuffle? yes or no.' | 11.43-14.71 | 3.28 s on screen | yes |
| end | 14.710 | length 14.71 s | yes |

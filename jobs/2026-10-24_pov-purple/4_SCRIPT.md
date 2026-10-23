# SHOOTING SCRIPT - Name A Better Color. You Can't.

Built in one pass (toki 2026-10-24) from the parts proven in the first seven POV Shorts; the data is `shots.json`
(camera = you, actor keys, set options, fx). Rules applied: lens a few cm below her measured face height, poses from
the pose sheet, clips under a pose at mix <= 0.2, sitting = pose sit, grade pov, DoF on close-ups.

## Shots
| # | from-to | set | what we see (camera = you) |
|---|---|---|---|
| 1 | 0.00-3.24 | beach | MCU on the sand: she points at herself (all purple), smug, the sea and a warm low sun behind |
| 2 | 3.24-5.84 | beach | CU: your suggestion BLUE? pops up beside her; she rolls her eyes |
| 3 | 5.84-8.44 | beach | CU, the other side: PINK? pops up; she waves it off |
| 4 | 8.44-10.67 | beach | ECU: GREEN? pops up; she just stares at you, flat, and says no |
| 5 | 10.67-14.76 | beach | WIDE: she points up; the lens tilts up from her to the sky going ultraviolet over the sea (dusk deepens) |
| 6 | 14.76-17.39 | beach | MCU back on her, the sky purple behind, smug grin - frame 0's framing |

## Only Raymi
- purple / ultraviolet is her favourite colour and her whole design (canon/01 1)
- competitive about nothing: every suggestion is shot down with a one-liner
- her sea and sky at dusk turn ultraviolet - her world agrees with her

## Loop
The last shot returns to frame 0's framing.

## Measured timing (`python -m raymi pov 2026-10-24_pov-purple`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 3.241 | beat 3.274 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 5.842 | beat 5.875 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 8.442 | beat 8.475 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 10.671 | beat 10.704 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 14.758 | beat 14.791 - 1 frame (+0 ms) | yes |
| voice 'name a better color. you can't.' | 0.050 | words 0.14-2.60: 'name' 0.14, 'a' 0.45, 'better' 0.54, 'color.' 0.85, 'you' 1.97, 'can't.' 2.15 | yes |
| voice 'blue? sad purple.' | 3.181 | words 3.27-5.20: 'blue?' 3.27, 'sad' 4.36, 'purple.' 4.74 | yes |
| voice 'pink? baby purple.' | 5.782 | words 5.88-7.81: 'pink?' 5.88, 'baby' 7.00, 'purple.' 7.33 | yes |
| voice 'green? no.' | 8.382 | words 8.47-10.01: 'green?' 8.47, 'no.' 9.61 | yes |
| voice 'look. even the sky agrees.' | 10.611 | words 10.70-13.08: 'look.' 10.70, 'even' 11.80, 'the' 12.09, 'sky' 12.18, 'agrees.' 12.53 | yes |
| voice 'wrong answers only. go.' | 14.698 | words 14.79-17.12: 'wrong' 14.79, 'answers' 15.13, 'only.' 15.64, 'go.' 16.78 | yes |
| sfx pop | 3.274 | beat 3.274 (+0 ms) | yes |
| sfx pop | 5.875 | beat 5.875 (+0 ms) | yes |
| sfx pop | 8.475 | beat 8.475 (+0 ms) | yes |
| sfx whoosh | 10.704 | beat 10.704 (+0 ms) | yes |
| sfx chime | 14.791 | beat 14.791 (+0 ms) | yes |
| hook stamp 'name a better color. you can't.' | 0.00-2.70 | first line ends 2.60 | yes |
| CTA stamp 'wrong answers only. go.' | 14.76-17.39 | 2.63 s on screen | yes |
| end | 17.392 | length 17.39 s | yes |

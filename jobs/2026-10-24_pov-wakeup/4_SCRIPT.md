# SHOOTING SCRIPT - POV: You Woke Up A Stingray At 6am

Built in one pass (toki 2026-10-24) from the parts proven in the first seven POV Shorts; the data is `shots.json`
(camera = you, actor keys, set options, fx). Rules applied: lens a few cm below her measured face height, poses from
the pose sheet, clips under a pose at mix <= 0.2, sitting = pose sit, grade pov_warm, DoF on close-ups.

## Shots
| # | from-to | set | what we see (camera = you) |
|---|---|---|---|
| 1 | 0.00-2.97 | bedroom | CU from above: she lies on her pillow, one eye open, glaring up at you |
| 2 | 2.97-4.92 | bedroom | MCU: still lying, both eyes on you now, deadpan |
| 3 | 4.92-7.53 | bedroom | she sits up on the bed edge; the alarm starts beeping (6.3 s) - the lens pushes in to her half-closed eye as she slowly turns her head to the clock |
| 4 | 7.53-9.48 | bedroom | the ringing clock on the nightstand: her hand swings in and smacks it on the beat (the frame jolts), 'no.' |
| 5 | 9.48-12.73 | bedroom | from above: she flops back onto the bed at the same spot, and on 'rules' goes FLAT into the mattress like a ray into sand |
| 6 | 12.73-15.36 | bedroom | still flat on the bed from above, snore bubbles rising - she asks you from there |

## Only Raymi
- her sleepy baseline (canon/01 2: relaxed / sleepy demeanour)
- she goes flat into the mattress like a ray burying in the sand, on 'rules' (her body)
- 'ray rules' - her running rule bit; the alarm's loud beeps are her canon fear of sudden noise

## Loop
The last shot returns to frame 0's framing.

## Measured timing (`python -m raymi pov 2026-10-24_pov-wakeup`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 2.974 | beat 3.007 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 4.924 | beat 4.957 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 7.525 | beat 7.558 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 9.476 | beat 9.509 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 12.726 | beat 12.759 - 1 frame (+0 ms) | yes |
| voice 'you woke me up. at six.' | 0.050 | words 0.14-2.49: 'you' 0.14, 'woke' 0.35, 'me' 0.59, 'up.' 0.78, 'at' 1.76, 'six.' 1.96 | yes |
| voice 'why are you awake.' | 2.914 | words 3.01-4.00: 'why' 3.01, 'are' 3.29, 'you' 3.42, 'awake.' 3.55 | yes |
| voice 'why am i awake.' | 4.864 | words 4.96-6.03: 'why' 4.96, 'am' 5.25, 'i' 5.41, 'awake.' 5.57 | yes |
| voice 'no.' | 7.815 | words 7.91-8.30: 'no.' 7.91 | yes |
| voice 'five more minutes. ray rules.' | 9.416 | words 9.51-12.20: 'five' 9.51, 'more' 9.89, 'minutes.' 10.13, 'ray' 11.40, 'rules.' 11.68 | yes |
| voice 'what time is too early?' | 12.666 | words 12.76-14.04: 'what' 12.76, 'time' 12.99, 'is' 13.27, 'too' 13.42, 'early?' 13.66 | yes |
| sfx beep | 6.258 | beat 6.258 (+0 ms) | yes |
| sfx beep | 6.908 | beat 6.908 (+0 ms) | yes |
| sfx grab | 7.558 | beat 7.558 (+0 ms) | yes |
| sfx whoosh | 9.509 | beat 9.509 (+0 ms) | yes |
| sfx pop | 11.459 | beat 11.459 (+0 ms) | yes |
| hook stamp 'you woke me up. at six.' | 0.00-2.60 | first line ends 2.49 | yes |
| CTA stamp 'what time is too early?' | 12.73-15.36 | 2.63 s on screen | yes |
| end | 15.360 | length 15.36 s | yes |

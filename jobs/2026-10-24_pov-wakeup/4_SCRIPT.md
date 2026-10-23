# SHOOTING SCRIPT - POV: You Woke Up A Stingray At 6am

Built in one pass (toki 2026-10-24) from the parts proven in the first seven POV Shorts; the data is `shots.json`
(camera = you, actor keys, set options, fx). Rules applied: lens a few cm below her measured face height, poses from
the pose sheet, clips under a pose at mix <= 0.2, sitting = pose sit, grade pov_warm, DoF on close-ups.

## Shots
| # | from-to | set | what we see (camera = you) |
|---|---|---|---|
| 1 | 0.00-2.32 | bedroom | CU from above: she lies on her pillow, one eye open, glaring up at you |
| 2 | 2.32-4.27 | bedroom | MCU: still lying, both eyes on you now, deadpan |
| 3 | 4.27-8.18 | bedroom | MCU: she sits up on the bed edge, hair a mess, half-closed eyes |
| 4 | 8.18-10.78 | bedroom | the clock rings on the nightstand - she smacks it without looking (the frame jolts) |
| 5 | 10.78-12.73 | bedroom | from above: she flops back and goes FLAT into the mattress like a ray into sand |
| 6 | 12.73-16.01 | bedroom | CU from above: back on her pillow, one eye open at you again - frame 0 |

## Only Raymi
- her sleepy baseline (canon/01 2: relaxed / sleepy demeanour)
- she flattens into the bed like a ray burying in the sand (her body)
- 'ray rules' - her running rule bit

## Loop
The last shot returns to frame 0's framing.

## Measured timing (`python -m raymi pov 2026-10-24_pov-wakeup`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 2.324 | beat 2.357 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 4.274 | beat 4.307 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 8.175 | beat 8.208 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 10.776 | beat 10.809 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 12.726 | beat 12.759 - 1 frame (+0 ms) | yes |
| voice 'it's six in the morning.' | 0.050 | words 0.14-1.40: 'it's' 0.14, 'six' 0.39, 'in' 0.71, 'the' 0.84, 'morning.' 0.91 | yes |
| voice 'why are you awake.' | 2.264 | words 2.36-3.35: 'why' 2.36, 'are' 2.64, 'you' 2.77, 'awake.' 2.90 | yes |
| voice 'why am i awake.' | 4.214 | words 4.31-5.38: 'why' 4.31, 'am' 4.60, 'i' 4.76, 'awake.' 4.92 | yes |
| voice 'no.' | 8.115 | words 8.21-8.61: 'no.' 8.21 | yes |
| voice 'five more minutes. ray rules.' | 8.765 | words 8.86-11.55: 'five' 8.86, 'more' 9.24, 'minutes.' 9.48, 'ray' 10.75, 'rules.' 11.03 | yes |
| voice 'what time is too early?' | 12.666 | words 12.76-14.04: 'what' 12.76, 'time' 12.99, 'is' 13.27, 'too' 13.42, 'early?' 13.66 | yes |
| sfx grab | 8.208 | beat 8.208 (+0 ms) | yes |
| sfx whoosh | 10.809 | beat 10.809 (+0 ms) | yes |
| hook stamp 'you woke me up. at six.' | 0.00-1.50 | first line ends 1.40 | yes |
| CTA stamp 'what time is too early?' | 12.73-16.01 | 3.28 s on screen | yes |
| end | 16.010 | length 16.01 s | yes |

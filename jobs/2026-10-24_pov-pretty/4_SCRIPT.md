# SHOOTING SCRIPT - You Said You're Not Cute?

Built in one pass (toki 2026-10-24) from the parts proven in the first seven POV Shorts; the data is `shots.json`
(camera = you, actor keys, set options, fx). Rules applied: lens a few cm below her measured face height, poses from
the pose sheet, clips under a pose at mix <= 0.2, sitting = pose sit, grade pov, DoF on close-ups.

## Shots
| # | from-to | set | what we see (camera = you) |
|---|---|---|---|
| 1 | 0.00-1.86 | office | CU, low in the monitor's glow: she leans in, squinting at you; your chat line 'i'm not cute lol' is on screen as a chat overlay from frame 0 |
| 2 | 1.86-4.65 | office | over her shoulder onto the monitor: your chat line big on the screen, her hand reaching at it |
| 3 | 4.65-7.90 | office | push to an ECU with a tilt: she turns back to you, offended for you, a '?' on 'who' |
| 4 | 7.90-12.08 | office | the webcam, then the lens rises to a top-down over the desk: on 'flat' she goes FLAT in her chair like a ray on the sand (chime), on 'adorable' she pops back up with a sparkle and the lens snaps back |
| 5 | 12.08-15.33 | office | a handheld lens-side angle: she reaches out and taps YOUR lens on 'rule' (the frame bumps) |
| 6 | 15.33-18.61 | office | frame 0's low close-up again: she waits for your answer, and on 'go.' she leans in with a heart |

## Only Raymi
- confidence is cute: she hypes chat up, never falsely modest (canon/01 2)
- her proof is her ray body: on 'flat' she goes flat like a ray on the sand, on 'adorable' she pops back up
- she makes a rule ('that's the rule') - her running 'rays have rules' bit

## Loop
The last shot returns to frame 0's framing.

## Measured timing (`python -m raymi pov 2026-10-24_pov-pretty`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 1.863 | beat 1.896 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 4.650 | beat 4.683 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 7.900 | beat 7.933 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 12.080 | beat 12.113 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 15.331 | beat 15.364 - 1 frame (+0 ms) | yes |
| voice 'you said you're not cute?' | 0.050 | words 0.14-1.32: 'you' 0.14, 'said' 0.32, 'you're' 0.57, 'not' 0.69, 'cute?' 0.96 | yes |
| voice 'i read it. right there.' | 1.803 | words 1.90-3.89: 'i' 1.90, 'read' 2.07, 'it.' 2.32, 'right' 3.27, 'there.' 3.58 | yes |
| voice 'excuse me. who told you that?' | 4.590 | words 4.68-7.10: 'excuse' 4.68, 'me.' 5.23, 'who' 6.21, 'told' 6.40, 'you' 6.68, 'that?' 6.80 | yes |
| voice 'i'm a stingray. i'm flat. i'm adorable.' | 7.840 | words 7.93-11.86: 'i'm' 7.93, 'a' 8.15, 'stingray.' 8.22, 'i'm' 9.55, 'flat.' 9.78, 'i'm' 10.97, 'adorable.' 11.18 | yes |
| voice 'so you're cute too. that's the rule.' | 12.020 | words 12.11-14.84: 'so' 12.11, 'you're' 12.37, 'cute' 12.59, 'too.' 12.93, 'that's' 13.99, 'the' 14.33, 'rule.' 14.46 | yes |
| voice 'one thing you like about yourself. go.' | 15.271 | words 15.36-18.14: 'one' 15.36, 'thing' 15.66, 'you' 15.87, 'like' 16.02, 'about' 16.23, 'yourself.' 16.50, 'go.' 17.80 | yes |
| sfx pop | 1.896 | beat 1.896 (+0 ms) | yes |
| sfx chime | 9.791 | beat 9.791 (+0 ms) | yes |
| sfx pop | 11.184 | beat 11.184 (+0 ms) | yes |
| sfx tap | 14.435 | beat 14.435 (+0 ms) | yes |
| sfx pop | 17.686 | beat 17.686 (+0 ms) | yes |
| hook stamp 'you said you're not cute?' | 0.00-1.60 | first line ends 1.32 | yes |
| CTA stamp 'one thing you like about yourself. go.' | 15.33-18.61 | 3.28 s on screen | yes |
| end | 18.615 | length 18.61 s | yes |

# SHOOTING SCRIPT v2 - POV: you keep tapping her aquarium glass

v2 (2026-10-23) after `reviews/script_1.md` (BLOCK): every time is now COMPUTED from the measured bed map
(`assets/music/fluffing-a-duck.map.json`) and the measured voice takes (`voice/*.json`) - cuts one frame before a beat or
hit, takes placed so their words land where the row says, no overlaps - and checked by `python -m raymi pov` (the
table at the end is its output). Every camera move is something YOU do or something done TO you; the end returns to
frame 0 (loop); the moments only Raymi can do are listed below. The data part is `shots.json` (same times; the build
adds camera / actor / set numbers).

Knowledge opened: `knowledge/PRINCIPLES.md`, `knowledge/CASEBOOK.md`, `canon/01_character.md`, `canon/03_script_guide.md`,
`knowledge/studies/pov_shorts_series_2026-10.md`. Place: the aquarium (set `aquarium`), no crowd. Music bed: `assets/music/fluffing-a-duck.mp3`.

**The contract:** the lens is the viewer. Frame 0 = her face, big, mid-action. A new picture event at least every
2-3 s. Stamps: the hook in the top safe band (7.5-21.5 % of the frame height), the CTA in the band below it
(9-21 %), both inside the Shorts UI-safe area and checked by the studio guard.

## Shots (times in seconds of the film; voice = word times measured in the takes)
| # | from-to | set: what we see | camera = you | Raymi DOES + her line (measured word times) | type in the picture | why |
|---|---|---|---|---|---|---|
| 1 | 0.00-3.14 | aquarium: CU at the glass: YOUR knuckle enters from the bottom edge and TAPS (frame 0) - a ring ripple on the glass; she is right behind it, flinches (ears jump), then glares, arms crossed against the glass, face 45 % of the frame. | your knuckle in frame (POV hand), a 2-frame knock shake | clip angry -> arms crossed; 'stop tapping the glass.' (0.39-1.80) | hook stamp 'stop tapping the glass.' top band 0-2.4 s | her face + your crime at frame 0 |
| 2 | 3.14-4.63 | aquarium: MS: hands on hips, she points at the placard DO NOT TAP THE GLASS in her tank. | your head turns to the placard (pan 25 deg) and back | clip pointing; 'it says it right there.' (3.17-4.36) | the placard is the type | the rule in her world's own sign |
| 3 | 4.63-6.86 | aquarium: CU: you TAP again (4.66, she flinches, a fin twitches) - she TAPS BACK from inside on the hit 5.40: her knuckle meets the glass at the lens, a bigger ripple from her side. | your knuckle; her knock shakes the lens harder (0.5) | clip pointing-forward (the poke) from its action key; 'how do you like it?' (6.15-6.98) | - | she fights back |
| 4 | 6.86-9.09 | aquarium: CU: she wipes N-O into the green ALGAE FILM on the inside of the glass with her finger, MIRRORED so you can read it (6.9-8.2). | slow push-in 0.15 m to the letters | pose write_glass with stroke keys; 'no.' on the hit 8.38 | 'NO' wiped into the algae film (fx algae_write, stroke reveal) | her answer, written by her finger on her world |
| 5 | 9.09-12.80 | aquarium: MS: TAP TAP (9.12, 9.49): she is shoved half a step back by each knock, sighs, holds up one finger. | two knocks, your knuckle twice | clip gestures-pack-basic-annoyed-head-shake; 'okay. one more and i'm gone.' (9.86-12.38) | - | the last warning |
| 6 | 12.80-15.03 | aquarium: TAP (12.83): she DIVES and BURIES herself in the sand like a ray - a sand burst on 13.58, the mound settles, only her eyes and tako ears show. | you look down with her (tilt 25 deg) | clip jumping-down -> buried (set bury + burst); 'fine. i'm a rock now.' (12.94-15.02) muffled | - | the payoff only a ray can do |
| 7 | 15.03-18.03 | aquarium: CU on the sand mound: her eyes blink, her ears twitch on each beat (she is counting too). At 17.3 your knuckle rises toward the glass again - her eyes go wide - and the Short loops into the frame 0 TAP. | still, then your knuckle rises into frame | buried, look lens; 'how many taps did you count?' (15.06-16.48) | CTA stamp 'how many taps did you count?' 15.03-18.03 (3.0 s) | a number comment; 5 or 6 (does her tap count?) starts a debate |

## Only Raymi (the slop test)
- she buries herself in the sand like a ray when it gets too much
- the aquarium is her own KING world (the star exhibit behind glass)
- she writes NO into the algae film from inside her tank, mirrored for you
- every tap shoves her: ears jump, fins twitch (her canon fear of sudden loud noises)

## Loop
your knuckle rises to the glass at 17.3 with her eyes going wide; frame 0 is that knuckle's TAP.

## Main element
Her face at the lens in every line she says to you; the prop / creature of the bit when it carries the moment.

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| fx 'pov_hand': your knuckle entering from the frame edge, keyed taps (reusable POV hand) | 2D fx | 1, 3, 5, 6, 7 | to build |
| fx 'ripple': a ring on the glass at a frame point | 2D fx | 1, 3, 5, 6 | to build |
| fx 'algae_write': a green film on the glass with a word wiped in stroke by stroke | 2D fx | 4 | to build |
| pose write_glass | pose | 4 | to build |
| aquarium crowd 0, bury + burst (exist) | set option | 6, 7 | to build |

## Measured timing (`python -m raymi pov 2026-10-23_pov-glass`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 3.140 | beat 3.173 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 4.626 | beat 4.659 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 6.856 | beat 6.889 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 9.085 | beat 9.118 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 12.800 | beat 12.833 - 1 frame (+0 ms) | yes |
| cut into shot 7 | 15.029 | beat 15.062 - 1 frame (+0 ms) | yes |
| voice 'stop tapping the glass.' | 0.300 | words 0.39-1.80: 'stop' 0.39, 'tapping' 0.83, 'the' 1.23, 'glass.' 1.32 | yes |
| voice 'it says it right there.' | 3.080 | words 3.17-4.36: 'it' 3.17, 'says' 3.34, 'it' 3.65, 'right' 3.80, 'there.' 4.06 | yes |
| voice 'how do you like it?' | 6.053 | words 6.15-6.98: 'how' 6.15, 'do' 6.33, 'you' 6.42, 'like' 6.54, 'it?' 6.76 | yes |
| voice 'no.' | 8.287 | words 8.38-8.78: 'no.' 8.38 | yes |
| voice 'okay. one more and i'm gone.' | 9.768 | words 9.86-12.38: 'okay.' 9.86, 'one' 11.02, 'more' 11.31, 'and' 11.66, 'i'm' 11.83, 'gone.' 12.00 | yes |
| voice 'fine. i'm a rock now.' | 12.840 | words 12.94-15.02: 'fine.' 12.94, 'i'm' 14.11, 'a' 14.31, 'rock' 14.38, 'now.' 14.71 | yes |
| voice 'how many taps did you count?' | 14.969 | words 15.06-16.48: 'how' 15.06, 'many' 15.24, 'taps' 15.48, 'did' 15.82, 'you' 15.98, 'count?' 16.10 | yes |
| sfx tap | 0.000 | beat 0.201 (-201 ms) | off grid |
| sfx tap | 4.659 | beat 4.659 (+0 ms) | yes |
| sfx tap | 5.400 | beat 5.403 (-3 ms) | yes |
| sfx tap | 9.120 | beat 9.118 (+2 ms) | yes |
| sfx tap | 9.490 | beat 9.861 (-371 ms) | off grid |
| sfx tap | 12.833 | beat 12.833 (+0 ms) | yes |
| sfx whoosh | 13.576 | beat 13.576 (+0 ms) | yes |
| hook stamp 'stop tapping the glass.' | 0.00-2.40 | first line ends 1.80 | yes |
| CTA stamp 'how many taps did you count?' | 15.03-18.03 | 3.00 s on screen | yes |
| end | 18.034 | length 18.03 s | yes |

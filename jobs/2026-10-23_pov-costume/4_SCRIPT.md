# SHOOTING SCRIPT v2 - Rate my Halloween costume (I went as my best friend)

v2 (2026-10-23) after `reviews/script_1.md` (BLOCK): every time is now COMPUTED from the measured bed map
(`assets/music/danse-macabre.map.json`) and the measured voice takes (`voice/*.json`) - cuts one frame before a beat or
hit, takes placed so their words land where the row says, no overlaps - and checked by `python -m raymi pov` (the
table at the end is its output). Every camera move is something YOU do or something done TO you; the end returns to
frame 0 (loop); the moments only Raymi can do are listed below. The data part is `shots.json` (same times; the build
adds camera / actor / set numbers).

Knowledge opened: `knowledge/PRINCIPLES.md`, `knowledge/CASEBOOK.md`, `canon/01_character.md`, `canon/03_script_guide.md`,
`knowledge/studies/pov_shorts_series_2026-10.md`. Place: the deep sea floor at night (set `deep`), Halloween. Music bed: `assets/music/danse-macabre.mp3`.

**The contract:** the lens is the viewer. Frame 0 = her face, big, mid-action. A new picture event at least every
2-3 s. Stamps: the hook in the top safe band (7.5-21.5 % of the frame height), the CTA in the band below it
(9-21 %), both inside the Shorts UI-safe area and checked by the studio guard.

## Shots (times in seconds of the film; voice = word times measured in the takes)
| # | from-to | set: what we see | camera = you | Raymi DOES + her line (measured word times) | type in the picture | why |
|---|---|---|---|---|---|---|
| 1 | 0.00-3.11 | deep: MCU on her landing: she wears the salmon costume - a big salmon head hood with her face in its open mouth, salmon fins on her forearms - in a ta-da pose; a carved jack-o-lantern glows orange on a rock beside her; her sea floor at night. | you float in front of her; a bump as she lands | clip joyful-jump from its landing key -> pose ta_da; 'rate my halloween costume.' (0.19-1.79) | hook stamp 'rate my halloween costume.' top band 0-2.4 s | costume reveal at frame 0 |
| 2 | 3.11-4.80 | deep: MS full figure: YOU drift back to see the whole costume while she swims toward you and twists (the costume's tail fin swings). | you drift back 0.8 m | clip catwalk-walk-stop-twist-r; 'i'm going as my best friend.' (3.14-4.73) | - | the costume walk |
| 3 | 4.80-7.35 | deep: CU: she swims INTO the lens and flaps the costume fins in your face; you recoil. | you recoil 0.2 m on each flap (two) | pose keys fins_up / fins_down on 5.69 and 6.53; proud; 'the fins are real. kind of.' (4.84-7.26) | - | confidence is cute |
| 4 | 7.35-9.89 | deep: Two knocks (7.38, 8.23 - a tail slapping a rock): out of the dark swims the SALMON, carrying a little jack-o-lantern, dressed as HER: oversized tako ears, a stingray-barb tail, an ultraviolet ruffle. Sting on 9.08. | your head turns to the dark (pan 40 deg) as he arrives | she turns (look-over-shoulder); 'wait. is that me?' (8.04-9.79) | - | the twist: her friend as HER |
| 5 | 9.89-11.59 | deep: You look from her to him and back: two whip pans between the two costumes facing off, lit from below by the pumpkins. | whip pan to him (9.92), whip back to her (10.77) | she glares at him (look at the salmon); 'he copied me.' (9.92-10.79) | - | a stare-down |
| 6 | 11.59-14.13 | deep: MS: she shrugs, swims beside him, both pose (peace + a fin); YOU take the photo: a flash on 13.31 freezes into a POLAROID of the two of them that holds as the frame. | your camera: the flash + polaroid frame (fx polaroid) | clip shrugging -> gestures-pack-basic-happy-hand-gesture; 'fine. couples costume.' (11.62-13.84) | the polaroid's white border is the frame (a real object) | best friends; you made the photo |
| 7 | 14.13-16.70 | deep: The polaroid holds: she points at herself, the salmon points a fin at himself - then she jumps back into frame 0's MCU, hood on, ta-da. | still, then her jump in | pose point-to-self; 'who wore it better?' (14.16-15.07); clip joyful-jump at 15.86 -> ta_da | CTA stamp 'who wore it better?' 14.13-16.70 (2.57 s) | a pick-one between two costumes: everyone votes |

## Only Raymi (the slop test)
- her best friend is a salmon - she dresses as him (her strongest lore)
- he dresses as HER: tako ears, the stingray barb, her ultraviolet
- her sea floor at night, lit by jack-o-lanterns - Halloween in her world
- she rates her own costume first: never falsely modest

## Loop
the last beat is her jump back into frame 0's MCU ta-da with the hood: the Short restarts.

## Main element
Her face at the lens in every line she says to you; the prop / creature of the bit when it carries the moment.

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| worn props on her bones: salmon_hood (head), salmon fins (forearms) - `props` on actor keys | prop | 1-7 | to build |
| salmon costume: oversized tako ears, barb tail, UV ruffle (salmon spec `costume`) | prop | 4-7 | to build |
| jack-o-lantern (thing, glowing; the salmon carries a small one) | prop | all | to build |
| fx 'polaroid': a flash that freezes into a polaroid frame | 2D fx | 6-7 | to build |
| poses ta_da, fins_up / fins_down, point_self | pose | 1, 3, 7 | to build |

## Measured timing (`python -m raymi pov 2026-10-23_pov-costume`)
| event | time (s) | measured anchor | ok |
|---|---|---|---|
| shot 1 start | 0.000 | window start 0.000 | yes |
| cut into shot 2 | 3.110 | beat 3.143 - 1 frame (+0 ms) | yes |
| cut into shot 3 | 4.805 | beat 4.838 - 1 frame (+0 ms) | yes |
| cut into shot 4 | 7.348 | beat 7.381 - 1 frame (+0 ms) | yes |
| cut into shot 5 | 9.890 | beat 9.923 - 1 frame (+0 ms) | yes |
| cut into shot 6 | 11.585 | beat 11.618 - 1 frame (+0 ms) | yes |
| cut into shot 7 | 14.128 | beat 14.161 - 1 frame (+0 ms) | yes |
| voice 'rate my halloween costume.' | 0.100 | words 0.19-1.79: 'rate' 0.19, 'my' 0.48, 'halloween' 0.64, 'costume.' 1.19 | yes |
| voice 'i'm going as my best friend.' | 3.050 | words 3.14-4.73: 'i'm' 3.14, 'going' 3.35, 'as' 3.70, 'my' 3.84, 'best' 3.99, 'friend.' 4.32 | yes |
| voice 'the fins are real. kind of.' | 4.745 | words 4.84-7.26: 'the' 4.84, 'fins' 5.00, 'are' 5.36, 'real.' 5.58, 'kind' 6.66, 'of.' 6.99 | yes |
| voice 'wait. is that me?' | 7.950 | words 8.04-9.79: 'wait.' 8.04, 'is' 9.16, 'that' 9.33, 'me?' 9.54 | yes |
| voice 'he copied me.' | 9.830 | words 9.92-10.79: 'he' 9.92, 'copied' 10.12, 'me.' 10.54 | yes |
| voice 'fine. couples costume.' | 11.525 | words 11.62-13.84: 'fine.' 11.62, 'couples' 12.80, 'costume.' 13.21 | yes |
| voice 'who wore it better?' | 14.068 | words 14.16-15.07: 'who' 14.16, 'wore' 14.34, 'it' 14.58, 'better?' 14.72 | yes |
| sfx tap | 7.381 | beat 7.381 (+0 ms) | yes |
| sfx tap | 8.228 | beat 8.228 (+0 ms) | yes |
| sfx sting | 9.076 | beat 9.076 (+0 ms) | yes |
| sfx chime | 13.313 | beat 13.313 (+0 ms) | yes |
| hook stamp 'rate my halloween costume.' | 0.00-2.40 | first line ends 1.79 | yes |
| CTA stamp 'who wore it better?' | 14.13-16.70 | 2.57 s on screen | yes |
| end | 16.703 | length 16.70 s | yes |

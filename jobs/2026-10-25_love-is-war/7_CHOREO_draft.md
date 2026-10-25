# CHOREO draft - Love is War (Mwk Remix) - Raymi's body in every moment of TREATMENT v3

Sources: 0_BRIEF.md (C2 attacks toward the lens, C4 melody, C5 five peak holds), 3_TREATMENT.md v3 "Song map -> picture"
(times measured, 129.2 BPM, bar 1.86 s), clips_seen.md (ONLY clips listed there as seen on raymi7 are used), SKILL
raymi-posing-acting. Not done: refs find (no Python on PATH in this session); ref ids below are the treatment's own
(edgerunners-this-fffire, ado-usseewa, hsr-hope-feathers, kda-firestarter), to pair with stills. I did not open
vrmPoses.ts internals or clip durations; every clip named below exists by name in clips.json. Pose-library poses (glide,
float, sing, lunge ...) are not seen in this film path, so they are only labelled fallbacks.

Conventions
- face_lens yes = clip root yaw so the sternum points at the lens (+-10 deg). Single-frame Mixamo poses (floating-*) are
  authored backwards: "rotY away" turns them to the lens (clips_seen); face_lens does not apply to them.
- Held key = the clip frame at clip_from frozen 4-8 frames, then the in-between runs on twos (Arc System Works).
  Anticipation 2-6 frames before every hit. 30 fps assumed.
- Expression: sing = lip sync by the vocal stem; aa = mouth wide open (war cry / effort); angry = brows down, mouth closed
  or teeth; calm = closed, only where she does not sing (instrumental, storm eye, stops).
- Place: WATER = chest-deep; DEEP = under the surface (ground false); ROCK / TOWER / GALLERY / LAMP = on a surface with a
  contact shadow; AIR = out of the water inside the rain halo.
- Two-tone hits flip the set, she keeps her values: every held pose has an open diagonal outline that reads in black.

## MISSING motion - first

| # | what is missing | rows | source / fallback |
|---|---|---|---|
| M1 | A hand/arm reaching INTO the lens (foreshortened claw past the lens plane). reaching-out / angry-point / pointing-forward-1 showed nothing at 0.35/1.0/1.9 s; roar 1.9 is the closest. | 28, 35, 82 | (a) re-sample reaching-out / angry-point at 10 moments each BEFORE the script; (b) roar 1.9 with a lens at CHEST height (an eye-height lens sees only the top of her head); (c) key a pose in vrmPoses.ts (arm along +z, open hand, scaled to the lens) held on twos; (d) Mixamo "Reaching Forward" / camera punch via toki's login. |
| M2 | Thrown back by a wave / hit reaction | 44 | Mixamo "Hit Reaction", "Falling Back" (free, toki's login). Fallback: agony 0.35 -> 1.9 with a smear - weak. |
| M3 | Fist hits the water / ground punch from her knees | 46 | Mixamo "Punching Ground" / "Ground Slam". Fallback: kneeling key held, hook-punch 1.0 rotX down - unproven. |
| M4 | Slow turn to look back at us over the shoulder | 83 | Mixamo "Look Back" / "Turn Around". Fallback: floating-legs-bent-and-arms-spread with rotY easing away -> lens over 2 s: a held silhouette, not a gesture. |
| M5 | Slip and catch the frame | 68 | Mixamo "Hanging Idle" / "Ledge Grab". Fallback: pulling-up-to-a-ledge 0.35 + a stutter jolt - reads as strain, not a slip. |
| M6 | Wall jump / leap across the tower face | 54 | Mixamo "Wall Jump". Fallback: jumping-over-obstacle-one-hand 0.35-1.0 with side track + speed lines (tower is a painted card, no contact needed). |
| M7 | Tail-barb flick (tail tip across the lens in 4 frames) | 30, 35 | A tail bone key in the rig - not proven, tell the engineer. Fallback: barb drawn in 2D (Fx2D) while the tail whips with spinning-back-kick. |
| M8 | Gliding up the cable under water: swimming-underwater is horizontal and "on the floor" (clips_seen); needs ground false + a 35 deg pitch up. | Act A | One real-rig still at 3.0 s before the script. Alternate: floating-legs-raised-arms-extended-upwards (rotY away) as the held key. |
| M9 | Clips NOT seen on her (do not use): standing-taunt-battlecry, jab-cross, mma-kick, hurricane-kick, pro-magic, offensive-idle, angry, and the "weak" list (reaching-out, angry-point, punch-combo ...). | - | Sample at 10 moments each if more attack variety is wanted. |
| M10 | Blocker, not a motion hole: white hot blob on the floor under low poses (kneeling-down 1.9, spin-flip 1.9, swing-backflip) + airborne clips lose the body (backflip, kip-up, swing-backflip 1.0). | 45, 52, 56, 58, 80 | Fix light/grounding in the shared part before low poses are filmed; swing-backflip ONLY at 1.9 s. |

## A. Act 1 - the call (0.0-31.7), DEEP

| # | time | music | her action (verb + target) | clip / pose (clip_from, face_lens, held) | expression | where | silhouette | flows | ref | why |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.0-0.4 | cold open (flash of 62.6) | SCREAMS her war cry at the lens | roar 1.0, face_lens yes; whole shot = held key, 6 frames | aa | AIR | forward lunge, one arm back, claws at us, head low | into 2 | ado-usseewa@98.25 | the promise; same clip as 28 |
| 2 | 0.4-0.8 | cold open (flash of 177.2) | hangs in the glare as a black shape | swing-backflip-to-superhero-pose 1.9, face_lens yes, held 6 frames | calm | LAMP | low crouch, one fist down, back arched, solid black | black | hsr-hope-feathers@112.75 | payoff shown first; a crouch survives two-tone |
| 3 | 0.8-0.9 | first frame | her eye snaps open, dots flare | close on the face; swimming-underwater 0.35 (ground false, face_lens yes), head still | calm | DEEP | an eye and dots in the dark | into 4 | edgerunners-this-fffire@91.25 | the eye is the picture (C1) |
| 4 | 0.9-1.6 | silence | glides up the cable behind a racing pulse | swimming-underwater 1.0 (ground false, pitch 35 deg), side view; held 8 frames at 1.2 | calm | DEEP | one diagonal line tail to nose, arms back | into 5 | - | direction toward the goal (M8) |
| 5 | 1.6-3.0 | intro vocal | sings, rides up beside the cable | swimming-underwater 1.9, pitch 35 deg, dutch 8 deg; plays, no hold | sing | DEEP | stretched diagonal, tail trailing | 4 -> 6 | - | a hold would stop the glide |
| 6 | 3.0-5.0 | beam crosses above | reaches UP at the beam | floating-legs-raised-arms-extended-upwards, rotY away -> lens over 12 frames, held 12 frames at 3.4 | sing | DEEP | arms straight up, legs together: a vertical arrow at the light | 5 -> 7 | - | motif 1 (rising arrow) starts here |
| 7 | 5.0-8.7 | intro vocal | sings toward the light, close; each note lights a dot | swimming-underwater 1.9, face_lens yes, 3/4 view; no hold | sing | DEEP | head, shoulders, hair streaming back | 6 -> 8 | - | C4: dots carry the beat, body quiet so the face reads |
| 8 | 8.7-9.36 | fast run | coils into the lunge (anticipation) | casting-spell 0.35 (lean-in wind-up), picture on twos, 4-frame compress | angry | DEEP | coiled: knees up, arms to the chest | into 9 | edgerunners-this-fffire@74.25 | anticipation |
| 9 | 9.36 | first hit | lunges up the cable as the pulse blows | casting-spell 1.0, face_lens yes; HELD 5 frames with the two-tone frame, then 6-frame smear | aa (burst) | DEEP | deep forward lean, both arms thrown up like a sling | 8 -> 10 | edgerunners-this-fffire@74.25 | wow 1; power release = pulse release |
| 10 | 9.85-12.75 | held notes | holds one hand out, the ribbon leaves it | casting-spell 1.9 held as long as each note, loose arm | sing | DEEP | one long diagonal arm; the ribbon continues the line | 9 -> 11 | hsr-hope-feathers@85.25 | ribbon length = note |
| 11 | 12.8-16.4 | drop 1 | surges along the cable, POV rushes at the lens | swimming-underwater 1.0 / 1.9 alternating on each cut (the cut hides the clip_from jump), side | calm | DEEP | arrow toward the lens, tail whip | 10 -> 12 | - | each cut a new key |
| 12 | 16.4-23.9 | instrumental drop, 4 bars | rides at full speed: top-down, low front, through bubbles, side track | swimming-underwater at clip_from 0.35 / 1.0 / 1.9 / 1.0 per bar; face_lens yes only on bar 3; smear on turns | calm | DEEP | a flying ray, wings back, different foreshortening per bar | 11 -> 13 | - | one key per bar |
| 13 | 24.4 | build ping 1 (30 %) | sends a ping upward from an open palm | casting-spell 1.0, face_lens yes, held 4 frames | sing | DEEP | one arm up, ring leaves the palm | 12 -> 14 | - | the hand is the voice's source |
| 14 | 27.3 | ping 2 (55 %) | bigger: both arms | casting-spell 1.9, held 4 frames | aa (breath) | DEEP | both arms forward, chest open | 13 -> 15 | - | escalation in pose size |
| 15 | 29.9 | ping 3 (90 %) | whole-body ping | roar 1.0, face_lens yes, held 5 frames | aa | DEEP | forward lunge, claw to the lens, ring bursting | 14 -> 16 | ado-usseewa@98.25 | must beat 14 |
| 16 | 31.7 | breakthrough | crashes up out of the water | floating-legs-raised-arms-extended-upwards, rotY away -> lens, ground false, held 4 frames at the waterline | aa | DEEP -> WATER | vertical arrow breaking the surface | 15 -> 17 | - | same arrow as 6 |

## B. Act 2 - the beam (31.7-62.2), WATER

| # | time | music | her action | clip / pose | expression | where | silhouette | flows | ref | why |
|---|---|---|---|---|---|---|---|---|---|---|
| 17 | 31.7-35 | verse 1 a | treads water, looks across at the lighthouse | treading-water 1.0, face_lens yes, loop, no hold | sing | WATER | head and shoulders, arms out under the line | 16 -> 18 | - | quiet after the break; she is small |
| 18 | 35-40.2 | verse 1 b, sweep 1 | CLAWS at the light as it passes, sings | roar 1.0 (lunge; hold 5 frames at the flash); 1.9 only with a chest-height lens; face_lens yes; ink slash on frame 2 | sing, aa on the claw | WATER | claws up, body leaning at the beam | 17 -> 19 | edgerunners-this-fffire@91.25 | the beam passes anyway - the failure is the hold |
| 19 | 40.2-42.3 | cluster | pings toward the rock | casting-spell 1.0, face_lens yes, held 4 frames per cluster hit | sing | WATER | one arm out as a pointer | 18 -> 20 | - | voice toward the rock |
| 20 | 42.3-46.2 | verse 1 c | swims hard toward the rock | treading-water 1.9, 3/4, no hold | sing | WATER | shoulders and one arm ahead | 19 -> 21 | - | motion |
| 21 | 46.2-48.1 | verse 1 d | POV, no body | none | - | WATER | none | -> 22 | - | camera |
| 22 | 48.13-48.39 | wave cluster | rides the wave and strikes the beam on the crest | hook-punch 1.0, face_lens yes, held 6 frames at 48.13, low dutch; slash | aa | AIR over the crest | fist up at the beam, back leg trailing | 21 -> 23 | edgerunners-this-fffire@91.25 | the clean single strike |
| 23 | 51.8-52.1 | fast run | rain stutters, she rights herself | treading-water 1.0 on twos, push in | angry | WATER | head and fist | 22 -> 24 | - | hi-hat made visible |
| 24 | 52.6-56.8 | pre-chorus 1 | sinks below the surface | floating-legs-bent-and-arms-spread, rotY away -> lens, ground false, slow sink, on twos | calm | WATER -> DEEP | arms spread, legs bent: a star sinking | 23 -> 25 | - | letting go |
| 25 | 55.6 | fast run | bubbles burst past the lens | pose 24 held, bubbles FX | calm | DEEP | star | 24 -> 26 | - | the world moves, not her |
| 26 | 56.8-62.2 | pre-chorus 1 end | watches the beam above; push into her eye | floating-legs-raised-arms-extended-upwards, rotY away, static | sing | DEEP | small arrow against the beam | 25 -> 27 | - | the look before the declaration |

## C. Act 3 - the declaration (62.2-86.7), AIR

| # | time | music | her action | clip / pose | expression | where | silhouette | flows | ref | why |
|---|---|---|---|---|---|---|---|---|---|---|
| 27 | 62.2-62.6 | STOP | freezes, eyes open | frame of 26 frozen, one drop hangs, NOTHING moves | calm, eyes wide | DEEP / surface | small vertical figure | 26 -> 28 | - | a stop is a stop (C3) |
| 28 | 62.6 | chorus 1 downbeat | SHOUTS the war cry into the lens, claws at us | roar 1.0, face_lens yes, held 6 frames on the downbeat (two-tone, chroma, shake); then on twos; M1 for a true reach | aa | AIR | lunge, back claw, arm to us, head low | 27 -> 29 | ado-usseewa@98.25 | wow 2; best attack at the viewer in the library |
| 29 | 62.75-64.45 | climbing notes | sings the rising line from the ink crater | yelling 1.0, face_lens yes, arms wide; plays | sing | AIR | arms wide, chest open, chin up | 28 -> 30 | hsr-hope-feathers@108.25 | a rising cry = open arms |
| 30 | 63.8 | barb | flicks the tail across the lens | spinning-back-kick-advancing 1.9, held 4 frames; barb 2D (M7) | angry | AIR | twisted spine, high kick, tail crossing | 29 -> 31 | kda-firestarter@26.25 | the sting |
| 31 | 64.32 | bar 2 | lunges, worm's eye | roar 1.0, held 5 frames; slash | aa | AIR | lunge growing out of the water | 30 -> 32 | - | ink on the hit |
| 32 | 66.2 | bar 3 | sings through the ink crown | yelling 1.9, face_lens yes, close; plays | sing | AIR | face, hair whipped | 31 -> 33 | - | face after the lunge |
| 33 | 68.08 | bar 4 | punches at the lens, top-down | hook-punch 1.0, face_lens yes, held 6 frames; rain radial; slash | aa | AIR | one arm to the lens, diagonal body | 32 -> 34 | edgerunners-this-fffire@91.25 | clean punch at us |
| 34 | 69.96 | bar 5 | back-kicks the air, dutch flip | spinning-back-kick-advancing 1.9, held 5 frames at the top; dutch -15 -> +15 | aa | AIR | high leg behind, torso twisted | 33 -> 35 | kda-firestarter@26.25 | JoJo twist: hips one way, head the other |
| 35 | 71.82 | bar 6 | the claw comes at the lens (macro), barb | roar 1.9, chest-height lens (M1), held 5 frames, face_lens yes | aa | AIR | a big claw filling the frame, face behind it | 34 -> 36 | ado-usseewa@98.25 | foreshortening |
| 36 | 73.7 | bar 7 | stands her ground as the beam passes both of us | casting-spell 1.9 held 8 frames, from behind (face_lens no, rotY toward the lighthouse) | calm | AIR | back view, arms thrown, against the beam | 35 -> 37 | - | we see what she sees |
| 37 | 75.58 | bar 8 | sings the line into the lens | yelling 1.0, face_lens yes, close low; plays | sing | AIR | face and shoulders, hair whipped | 36 -> 38 | - | face before the hush |
| 38 | 77.44-79.34 | bar 9 silence | everything holds, only her mouth moves | yelling 1.9 FROZEN for the whole bar (speed 0) | sing | AIR | arms wide, perfectly still | 37 -> 39 | - | the held pose is the effect |
| 39 | 79.35-80.5 | held B5 | opens and rises, her light a pillar | floating-legs-raised-arms-extended-upwards, rotY away -> lens, held the whole note, lifted by the crane | sing (held) | AIR | vertical cross of light, arms up | 38 -> 40 | hsr-hope-feathers@112.75 | wow 3; motif 1 pays off |
| 40 | 80.5-86.7 | storm eye | floats on her back and breathes | floating-back-arched, rotY away, static; only hair/tail drift | calm | WATER (back) | long arched curve on the water | 39 -> 41 | - | the one beautiful breath (C6) |

## D. Act 4 - the broken megaphone (86.7-120.4), ROCK / WATER

| # | time | music | her action | clip / pose | expression | where | silhouette | flows | ref | why |
|---|---|---|---|---|---|---|---|---|---|---|
| 41 | 86.7-88.6 (87.05) | verse 2 hit | pings; the ping shatters; she flinches | casting-spell 1.0 held 4 frames, then agony 0.35 for 4 frames; shards fly, shake | aa then angry | WATER | arms forward, then shoulders collapse | 40 -> 42 | edgerunners-this-fffire@75.25 | megaphone breaks, body with it |
| 42 | 88.6-91.7 | verse 2 | grabs the rock | climbing-up-wall 1.0, face_lens yes, a wall behind her (else it lifts off the shadow) | sing | ROCK | one arm up, knee raised, flat on the wall | 41 -> 43 | - | reach |
| 43 | 91.7-94.0 | verse 2 | climbs, seen from above | climbing-to-top 1.0, face_lens yes | sing | ROCK | figure on a wall from above | 42 -> 44 | - | action |
| 44 | 94.04-94.78 | wave cluster | thrown back by the wave | MISSING M2: fallback agony 0.35 -> 1.9, held 6 frames at the hit, smear | aa | ROCK / AIR | body thrown back, arms flung, head back | 43 -> 45 | - | held impact pose |
| 45 | 96.2-98.7 | verse 2 | collapses to her knees | falling-to-knees-in-prayer 1.9, hold 8 frames on the knees (M10 blob first) | sing | WATER | kneeling, head bent, hands loose | 44 -> 46 | - | Weltschmerz fall |
| 46 | 98.71 | hit | fist hits the water | MISSING M3: kneeling key 45 held, then hook-punch 1.0 rotX down; splash + ink at the lens; held 4 frames | aa | WATER | kneeling, one arm down hard, spray | 45 -> 47 | - | the loss ends in a blow, not a sob |
| 47 | 101.8-106.2 | verse 2 end | stands up, rain running off | standing-up-from-a-kneeling-position 0.35 -> end, face_lens yes, close | sing | WATER | rising from a crouch, shoulders back | 46 -> 48 | - | the rise is her answer |
| 48 | 106.2-110 | pre-chorus 2, moon | glares up at the moon | end frame of 47 held, chin up, rotY 3/4 toward the moon | angry, no voice | WATER | small upright figure under a huge moon | 47 -> 49 | edgerunners-this-fffire@91.25 | T12 gag |
| 49 | 110-116.8 | pre-chorus 2 | the beam passes over her; eyes narrow at 113.4 | same standing key, eyes only (or treading-water 0.35, face_lens yes) | angry, then sing | WATER | still figure, beam over | 48 -> 50 | - | still on purpose |
| 50 | 116.8-119.9 | not crying | wipes the rain with the back of her hand, glares into the lens | wiping-sweat 1.0, face_lens yes, held 8 frames, then the hand drops | angry | WATER | hand at forehead, elbow out, eyes over it | 49 -> 51 | - | T15 denial |
| 51 | 119.9-120.4 | STOP | black, one heartbeat of the dots | none | - | - | none | -> 52 | - | a stop is a stop |

## E. Act 5 - war (120.4-169.8), ROCK / TOWER / GALLERY / LAMP

| # | time | music | her action | clip / pose | expression | where | silhouette | flows | ref | why |
|---|---|---|---|---|---|---|---|---|---|---|
| 52 | 120.4 | final chorus downbeat | lands on the rock | swing-backflip-to-superhero-pose 1.9 only, face_lens yes, held 8 frames (two-tone, shake); M10 blob | angry | ROCK | crouch, fist on the rock, one arm back, head up at us | 51 -> 53 | hsr-hope-feathers@108.25 | strongest held silhouette in the library |
| 53 | 122.7 | bar 1 | climbs the tower ladder, worm's eye | climbing-up-wall 1.9, wall behind (painted tower), face_lens no; slash per rung | sing | TOWER | figure on a wall, one arm high | 52 -> 54 | - | one step per bar |
| 54 | 124.6 | bar 2 | leaps across the tower face | MISSING M6: fallback jumping-over-obstacle-one-hand 0.35-1.0, held 4 frames at the apex | aa | AIR by the tower | diagonal leap, arm ahead | 53 -> 55 | - | travel |
| 55 | 126.4 | bar 3 | grabs the gallery rail | pulling-up-to-a-ledge 1.0, face_lens no, close on the hand | sing | TOWER | arm up, body hanging | 54 -> 56 | - | macro hand |
| 56 | 128.3 | bar 4 | ducks as the beam passes inches over her | kneeling-down 1.0 (1.9 has the blob), held 4 frames on the flash | angry | GALLERY | low crouch, head down | 55 -> 57 | - | his blow |
| 57 | 130.2 | bar 5 | vaults the rail | jumping-over-obstacle-one-hand 0.35 -> 1.0, ground false at the apex, held 4 frames | aa | GALLERY rail | diagonal vault, one hand on the rail | 56 -> 58 | - | clip made for it |
| 58 | 131.1 | hit | lands on the gallery, top-down | swing-backflip-to-superhero-pose 1.9, held 6 frames; slash | aa | GALLERY | crouch from above | 57 -> 59 | - | callback to 52 |
| 59 | 133.7 | lamp room bar 1 | grabs the brass frame | pull-heavy-object 0.35, face_lens no, macro | sing | LAMP | a hand on brass | 58 -> 60 | - | macro |
| 60 | 135.56 | bar 2 | face through the turning glass rings | pull-heavy-object 1.0, face_lens yes; no hold | sing | LAMP | face behind rings | 59 -> 61 | - | camera does the work |
| 61 | 137.46 | bar 3 | heaves, top-down | pull-heavy-object 1.9, face_lens no, held 4 frames | aa | LAMP | leaning back, arms forward | 60 -> 62 | - | effort |
| 62 | 139.25 | bar 4 hit | throws her weight, beam sweeps outside | pull-heavy-object 1.9, held 6 frames, shake | aa | LAMP | full backward lean | 61 -> 63 | - | the lamp turns because of her |
| 63 | 141.2 | bar 5 | effort through her teeth, close | pull-heavy-object 1.0, face_lens yes | sing (teeth) | LAMP | face | 62 -> 64 | - | face |
| 64 | 143.08-146.3 | bars 6-7 | hangs on the frame, low angle | pull-heavy-object 1.9 held, slow sway | sing | LAMP | body hanging back | 63 -> 65 | - | tension |

| 65 | 146.33 | false win 1 | the lamp turns, she throws both arms up | casting-spell 1.9, face_lens yes, held 6 frames; flash, shake | aa | LAMP | both arms up and out | 64 -> 66 | - | joy of the false win |
| 66 | 146.82 | pull again | pulls again | pull-heavy-object 1.9, held 4 frames, shake | aa | LAMP | lean | 65 -> 67 | - | no rest |
| 67 | 148.7 | false win 2 | the beam passes closer, she holds | pull-heavy-object 1.0, held 6 frames, flash | sing | LAMP | strain | 66 -> 68 | - | closer = bigger |
| 68 | 150.58 | slip | slips, catches the frame | MISSING M5: fallback pulling-up-to-a-ledge 0.35 held 4 frames + stutter jolt | aa | LAMP | hanging off the frame by one arm | 67 -> 69 | - | scare |
| 69 | 152.44 | dutch | climbs back onto the base | climbing-to-top 1.0, face_lens yes, dutch | sing | LAMP | knee up on the base | 68 -> 70 | - | recovery |
| 70 | 154.32 | effort scream | screams with the effort | yelling 1.0, face_lens yes, held 5 frames; slash | aa | LAMP | head back, mouth wide, arms down | 69 -> 71 | ado-usseewa@98.25 | the override |
| 71 | 156.2 | half orbit | hangs on, face to the lens as the camera circles | pull-heavy-object 1.9, no hold | sing | LAMP | lean, depth by the orbit | 70 -> 72 | - | orbit |
| 72 | 158.08 | dots flare violet | the light climbs her | casting-spell 1.0 held 8 frames | sing | LAMP | arms out, glow | 71 -> 73 | hsr-hope-feathers@113.25 | colour, not motion |
| 73 | 159.94 | violet down her arms | the violet runs into the brass | pull-heavy-object 1.9, held 6 frames, arms toward the brass | sing | LAMP | arms to the brass | 72 -> 74 | - | T14 |
| 74 | 161.33 | the dive | camera dives through the surface | none (or the star pose of 24 tiny in the glow) | calm | DEEP | none / star | 73 -> 75 | hsr-hope-feathers@113.25 | camera |
| 75 | 161.82-169.32 | final chorus end | the pulse is the actor; glimpse at 167.44 | none, then pull-heavy-object 1.9 at the lamp | sing | LAMP | - | 74 -> 76 | - | pulse acts |

## F. Act 6 - the stop (169.8-187.6), LAMP / AIR

| # | time | music | her action | clip / pose | expression | where | silhouette | flows | ref | why |
|---|---|---|---|---|---|---|---|---|---|---|
| 76 | 169.78 | pull 1 | pulls the lamp round | pull-heavy-object 1.0, held 5 frames, flash | sing | LAMP | lean | 75 -> 77 | - | each pull a larger pose |
| 77 | 172.5 | pull 2 | pulls again | pull-heavy-object 1.9, held 5 frames, flash | sing | LAMP | bigger lean | 76 -> 78 | - | build |
| 78 | 174.4 | pull 3 | whole body | pull-heavy-object 1.9 + pitch back 10 deg, held 6 frames | aa | LAMP | full lean | 77 -> 79 | - | build |
| 79 | 176.3 | pull 4 | the last pull, anticipation | pull-heavy-object 1.9 + pitch 15 deg, held 8 frames (the longest) | aa | LAMP | maximal lean | 78 -> 80 | - | quiet before 177.2 |
| 80 | 177.2 | LAST HIT | the beam stops on the lens, she holds it | swing-backflip-to-superhero-pose 1.9 as the silhouette in the glare (= row 2), 3 frames 100 % white then held; chroma, shake | aa | LAMP | black crouch in white | 79 -> 81 | hsr-hope-feathers@112.75 | C5 strongest; same shape as the cold open |
| 81 | 177.28 | overshoot | the beam overshoots and settles; her weight holds it | pull-heavy-object 1.9, tiny sway | sing | LAMP | held lean | 80 -> 82 | - | she holds it |
| 82 | 179.14 | pull-out through the glass | holds; stars streak | same pose; optional M1: roar 1.9 chest-lens reach as the last reaching gesture | calm | LAMP | silhouette in glass | 81 -> 83 | - | optional |
| 83 | 181.02 | slow turn, sings the last line | turns to look at us | MISSING M4: fallback floating-legs-bent-and-arms-spread, rotY away -> lens over 60 frames, face_lens yes at the end, held to the last note | sing | AIR | open star | 82 -> 84 | hsr-hope-feathers@112.75 | the look is the last image |
| 84 | 182.9 | dots rise as stars | holds, ZERO body motion | same held pose | calm | AIR | small light figure in ink | 83 -> 85 | - | the body stills so the stars move |
| 85 | 187.6 | last note | black | none | - | - | - | - | - | - |

## Notes for the script

- Held key poses (on twos, 4-8 frames) land on: 9.36, 24.4, 27.3, 29.9, 48.13, 62.6, 63.8, 64.32, 68.08, 69.96, 71.82,
  77.44 (a bar-long hold), 79.35, 94.04, 98.71, 120.4, 128.3, 131.1, 139.25, 146.33, 177.2. Between hits she PLAYS (no
  hold), so the picture is alive; the readable stills are taken on the hold frames.
- Recurring silhouette motifs: (1) vertical arrow, arms up (6, 16, 26, 39) - rising; (2) forward lunge with a claw (1,
  15, 28, 31, 35) - attack; (3) the crouched landing (2, 52, 58, 80) - the cold open and the last hit are the same shape.
- Before the script: one real-rig still each for M1, M8, M10; Mixamo downloads M2-M6 (toki's login, missing ok).
- What she does TO the lens: war cry + claw (28, 35), punch (33), barb (30), ping rings (13-15, 19), glare (50), the
  look back (83). A hand truly on the glass is M1 - do not promise it before the still.

## The 3 strongest moments

1. 62.6 - the war cry (row 28): roar 1.0 held on the downbeat, claws at us, ring + ink + chroma, right after the stop.
2. 79.35 - the top note (rows 38-39): yelling frozen for a bar, then the vertical arrow rising with the crane.
3. 177.2 - the last hit (row 80): the crouched silhouette in white glare, the same shape as the cold open.

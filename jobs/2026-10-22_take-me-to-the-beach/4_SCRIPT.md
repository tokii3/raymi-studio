# SHOOTING SCRIPT - Take Me to the Beach (feat. Ado) - v2

v2 (2026-10-22) after `reviews/script_1.md` (PASS): its FIXes 1-8 are written in - the last chorus is full-body and
travelling (69 dropped, 70-73 rewritten), the payoff's beach wide lands on "beach" 137.10 and holds, verse 1 moves
through three places with frame-wide bubbles, every lyric surface is big (wall screens, the globe's shadow, a paper
strip, desk tops, the departure board), the battery lives on her chest dots framed big, shot 19 and the four "down"s
are split into readable beats, the T-A-K-E cracks light with the vocal and the shards spell TAKE, the row times are
continuous, the 2D states are all defined, the beach gets more screen time.

Knowledge opened: `knowledge/craft/03_Videoschnitt.md`, `knowledge/craft/05_Komposition_und_Form.md`,
`knowledge/craft/06_Text_und_Motion_Graphics.md`, `knowledge/studies/star_guardian_acting.md`,
`knowledge/studies/edit_beat_change.md`, `knowledge/studies/typography.md`, `jobs/2026-10-19_firestarter/4_SCRIPT.md`.
The contract: screening checks the rendered video against every row. Times are measured song times
(`lyrics_timed.json`: 341 words, 229 snapped + 8 measured; `song_map.json`: beat 0.572 s, 88 hits, stops 1.0-1.4 /
7.8-8.2 / 9.0-9.4, fast figures `fast_runs`). Interpolated and checked by ear on the stills board: the "Ah-ah-ah"
openers, the T-A-K-E spell-out 118.73-119.08, bracketed backing lines. Based on `3_TREATMENT.md` v3 (PASS,
`reviews/treatment_2.md` + its fixes). The data part (`shots.json`) is generated from these rows at the build stage.
Written 2026-10-22. No pilot (toki 2026-10-22): after the build, a stills board of >= 12 frames across the whole MV.

## What this script settles
1. **The first 3 s**: shot 1 IS the thumbnail picture (she dances on her desk, colour bursting into the grey office);
   4 cuts and a camera move before 3.0 s (shots 1-4); no black frame anywhere.
2. **One rule, one count**: strings = 5 minus dots. Every row that adds or removes a string names the new count in
   the hero column (`dots n`). The count is carried by HER: the five dots on her dress at chest height, framed
   >= 20 % of the frame height whenever a dot changes (19b, 27, 30, 38, 45, 51, 54, 56, 62a-d, 63, 68), each change
   on its own beat with a 6-frame flare / fade; the 2D battery sign beside her head repeats it in the other reality
   shots.
3. **3D Raymi**: raymi5.vrm. "Raymi DOES" names the pose (`studio/src/three/vrmPoses.ts` or NEW), the motion clip
   (Mixamo / NEW), the expression and the mouth: `sings` = phonetic lip sync v2 (gain 0.6 in the routine, 1.0 in the
   dream / the dance / the finale), `silent` = mouth closed. In the nightmare (9.08-17.5) she sleeps - the HANDS'
   bubbles carry the words. "on twos" (step 2) in the routine, 30 fps in the dream / dance / finale.
4. **Strings are physical**: a hand above the frame, a white string to her wrist bone; when it pulls, the arm moves
   first and the body follows 3-4 frames late (forced motion, no anticipation). Her own moves have anticipation.
5. **The 2D layer = the state**, named per row in "set + shot size":
   - `grey` = the loop: duo #2a2e3e / #d6dbe8, 4 levels, halftone, over grade `closing`;
   - `colour` = the beach and wherever she dances: no duo, grade `warm` on the beach, `clean` indoors;
   - `blue` / `red` = Ado's verse: duo #0c1650 / #b4c8ff, then #1a0206 / #ff4a3a;
   - `own` = the lights out (63): grade `own`, only her violet dots light the room;
   - `clean` = the office the moment the globe breaks (68-74): no duo, grade `clean`, warm light rising;
   - `warm` = the finale beach and the dusk crane (75-84): grade `warm`.
6. **Camera moves are the transitions**: `whip` (the move carries the cut), `zoom` (punch through an object), `spin`
   (the globe's shards), `match` (same pose / framing across two places, a plain cut), `pass` (an object across the
   lens). Every out-transition is named; `cut` means a hard cut on a beat or hit.
7. **Japanese lines** (Ado's verse, outro echoes) show romaji + English under them (`lyrics_en.json`, own translation).
8. **Not forced**: 14 shots without her (alarm, hands, calendar, boss, globe, postcard, clock) - each shows what is
   done TO her or what she caused.

## Shots
| # | from-to | lyric / music | set + shot size | camera (start -> end) | Raymi DOES (pose / motion / expr / mouth) | lyric in the picture (where, surface, material, key word) | hero (main element readable?) | out (transition) | why (feeling / principle) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.00-1.00 | riff starts 0.28 | office, her desk, MS low - `colour` bursting into `grey` (duo mix as a radius from her feet) | worm's-eye at desk height, a fast 40 deg orbit | arms_up -> NEW dance clip (desk dance) mid-move, joy 0.9; silent; three fish coworkers frozen with coffee | none (the picture is the promise) | face (CU-ish, ~16 %) + colour burst: THE THUMBNAIL | cut on 1.0 (stop) | P6: the strongest picture in frame 0; the thumbnail is paid at once |
| 2 | 1.00-1.40 | stop | same, MS | locked, then a fall away | freeze; the colour drains back into her (radius shrinks to 0); she topples backward out of frame (fall pose) | none | - | whip down (the fall carries the cut) | the stop = the dream breaking |
| 3 | 1.40-2.00 | riff, hit 1.65 | bedroom, CU on the bed, `grey` | top-down, tilts up with her | sleepwalk: eyes closed (blink 1), strings on both wrists pull her UP from the bed - arms first, body late (forced motion); silent | none | strings (2, white on grey) | cut on 2.0 | the marionette rule is shown before any word |
| 4 | 2.00-2.20 | hit 1.95 / 2.0 | beach, ECU face, `colour` | macro, locked | eyes closed, face in the sun, a small smile (joy 0.4) | none | face | cut | colour flash 1 inside the first 3 s (review treatment_2 FIX 2) |
| 5 | 2.20-3.09 | riff, hit 2.79 | train, MS, `grey` | whip right with her drag | sleepwalk: the strings drag her through the closing doors - the doors close on her jacket; she does not wake | none | strings | whip (the drag carries the cut) | the routine as a ride - she is moved, not moving |
| 6 | 3.09-3.92 | hit 3.09 / 3.92 | office aisle, WS, `grey` | tracking backwards ahead of her | sleepwalk down the aisle of identical desks, arms lifted by the strings | none | strings | whip | identical desks to the horizon = the loop in space |
| 7 | 3.92-4.57 | hit 3.92 | office, her desk, MS | top-down | the strings sit her down: she lands in the chair (squash), head lolls | none | - | cut on 4.57 | the stabs are next - one beat of stillness before them |
| 8 | 4.57-4.71 | stab 1 | office desk, ECU feet, `colour` | low, locked | (sleep-dance flash) her feet in a dance step on the desk | none | - | cut | toki: "on timing" - the three future flashes on the three stabs |
| 9 | 4.71-4.85 | stab 2 | office, ECU a big hand with swirling snow, `colour` | locked | (no Raymi) the boss's hand holding the snow globe, snow swirling | none | globe (flash) | cut | teases the payoff without spoiling it (only a hand and snow) |
| 10 | 4.85-5.25 | stab 3 | beach, CU face laughing, `colour` | slight push | eyes closed, laughing in the sun (joy 0.9); silent | none | face | cut | the third flash holds 12 frames so it reads |
| 11 | 5.25-7.80 | riff, hit 5.39 | office desk, top-down MS, `grey` | crane up from her to the desk | asleep at the desk; the file stack grows around her into a mountain (4 stacks, one per beat) | none | - | cut on 7.8 | the "mountains" are already files |
| 12 | 7.80-8.20 | stop | office desk, macro face, `grey` | locked | freeze: a string pulls the corner of her mouth into a polite smile (the smile is not hers) | none | face | cut | the forced smile = people-pleasing in one image |
| 13 | 8.20-9.08 | riff + stop 9.0 | office -> bedroom, MS | the camera falls backward with her | the desk tips away into dark - she falls back onto her own bed (it was a dream); on the stop the hands appear around the bed in the dark | none | hands | cut on 9.08 | no black frame (FIX 1): the stop is the hands appearing |
| 14 | 9.08-10.76 | "People-pleasin' planet" | bedroom -> door, WS, `grey` | top-down, then tracking as the bed moves | asleep (recline), frowns (sorrow 0.3); silent - strings from the dark grab the bed's corners and drag the bed (with her in it) out of the room | a frame-wide speech bubble from the first hand: a smiling globe icon + "PEOPLE-PLEASIN' PLANET" (print, key: planet, ~12 % cap height) | hands | whip (the bed's drag carries the cut) | the nightmare keeps moving: the day comes for her even in bed (review script_1 FIX 3) |
| 15 | 10.76-13.38 | "Got a million people sayin' how to plan it" | train car, MS, `grey` | tracking alongside the bed | the bed slides through the train car; on the hits 11.10 and 12.24 a new commuter's hand leans in with a bubble; she rolls away (turn) | frame-wide bubbles: a planner icon, a clock icon; "HOW TO PLAN IT" on the biggest (key: plan) | hands | whip | a million voices = a new hand on every hit |
| 16 | 13.38-15.29 | "I can no longer stand it" | office aisle, MS, `grey` | low tracking ahead of the bed | the bed rolls down the office aisle between identical desks; she pulls the blanket over her head (clutch under the blanket) | "NO LONGER STAND IT" on a frame-wide bubble that the blanket crumples | - | whip | the first thing she does by herself - in her sleep |
| 17 | 15.29-17.23 | "Gonna spend my days tellin' them to can it" | bedroom, CU face out of the blanket, `grey` | the bed slams back into her room, push-in to ECU | she swats one hand away without waking (a tail flick from under the blanket) | "TELLIN' THEM TO CAN IT" on the swatted bubble as it flies across the frame | face | cut on 17.23 | she already refuses - asleep; sets up her tail as her tool |
| 18 | 17.23-17.65 | "can it" -> the can sound 17.65 | bedroom, macro a can at her ear | locked | (hand) a gloved hand pops a can open right at her ear - pssht | "CAN IT" on the can (print, big in the macro) | - | zoom (into the can's opening, out of her eye) | the measured can sound is the snap (toki's brief) |
| 19a | 17.65-18.60 | "Each and to" | bedroom, MS, `grey` | the alarm macro set-up: ECU clock -> whip to her | wakes with a start (surprised 0.8) and in the same move her tail slaps the twin-bell alarm silent | - | face | whip | the wake and the slap are one action - one read |
| 19b | 18.60-19.69 | "their own" | bedroom, CU chest + hand, `grey` | locked close | tears the calendar page (DAY 1); a gloved hand from above hooks string 1 to her wrist - on the hook ONE of her five chest dots fades (6-frame fade, the sign beside her repeats it) | the calendar page: "DAY 1" (big, ~20 %) | dots 5 -> 4, chest dots ~22 % | cut | the rule, shown once, alone and readable (review script_1 FIX 5) |
| 20 | 19.69-21.97 | "Got a salesman ringin' my phone" | train, MS squeezed, `grey` | the train-door set-up: doors close in the foreground | squeezed between fish commuters, sings quietly (gain 0.6); her shell phone rings - a hand comes OUT of the phone and hooks string 2 | the phone screen: "SALESMAN calling" + the line (screen) | battery 4 -> 3 | cut on the beat | set-up #2; the phone literally reaches out to her |
| 21 | 21.97-24.23 | "Tell me where to go" | platform, top-down WS | top-down | a pointing hand hooks string 3; her feet walk where it points (forced walk) | floor arrows on the platform carry "TELL ME WHERE TO GO" (floor paint, tilt -90) | battery 3 -> 2 | cut | told where to go = arrows on the floor |
| 22 | 24.23-26.62 | "No, I don't wanna hear the down low" | office, her desk, MS, `grey` | the desk-from-above set-up | sits; sticks a yellow note "SUN" on the boss's snow globe labelled "FORECAST: SNOW" (her rain-forecast lore); a hand peels it off; she rolls her eyes (fun 0.3); sings 0.6 | the office's big wall screen behind her runs the line full width (screen, key: down low, ~9 %) | globe (~15 %) + battery 2 | cut | her lore placed; the globe is planted |
| 23 | 26.62-29.35 | "I owe, oh-oh-oh" | office desk, MS -> the office stretches away, `grey` heavier + halftone | dolly zoom (frameH constant, lens backs off): the desk stays, the room recedes | stare (stand pose seated), eyes on the postcard; the strings tug her hands to type; sings 0.5 | "oh-oh-oh" written in the steam of her coffee (fog) | postcard (warm, ~15 %) + battery 2 | cut | the dissociation the brief asks for: darker, further away |
| 24 | 29.35-32.04 | "Nothin', not a penny, never wanna hear you preach" | office desk, CU over her shoulder | slow arc toward the monitor | types without looking (forced), looks only at the postcard; sings 0.5 | the wall screen fills with "NEVER WANNA HEAR YOU PREACH" (screen, key: preach) | postcard | cut | the postcard is the only warm thing |
| 25 | 32.04-33.46 | "No, oh-oh-oh" | office, macro postcard | push-in to the card | (her finger enters, touches the card) | - | postcard (fills 60 %) | zoom (through the card) | the fall starts on the last "oh"; cut one frame before "Take" 33.49 |
| 26 | 33.46-35.39 | "(Take-take-take-take)" | the postcard -> beach, falling, `colour` | the camera falls through the card; on each "take" the grey breaks (4 hits) | falls through warm air toward the water, arms out (glide), sings 1.0 | "TAKE" stamped four times in the sky, one per "take" (light, key) | face + colour | cut on 35.39 | wow 3: grey -> colour in one move |
| 27 | 35.39-36.66 | "Take me to the beach" | beach, CU face in the water, `colour` | crane down with her, settles on her face | lands in shallow water (float), sings to the lens (joy 0.8); dots light 2 -> 5, the strings hang slack out of the frame | "take me to the beach" written by a wave in the wet sand (key: beach) | face (~18 %) + battery 5 | cut | the hook line sung to us |
| 28 | 36.66-39.44 | "Ah-ah-ah, you can have the mountains" | beach / office split, WS, `colour` / `grey` | pull back across the postcard's edge: inside the card the sunny beach with her, outside it her grey desk with the globe's mountains | points out of the card at the globe (point) | "MOUNTAINS" on the globe's base; "BEACH" in the sand (key: mountains) | postcard + globe in one frame | cut | review FIX 4: the song's split as ONE picture |
| 29 | 39.44-41.68 | "Ah-ah-ah, you take the snow" | beach, over her shoulder at the card's edge | over-the-shoulder | turns her back on the snow and kicks sand at it - sand flies out of the card onto the grey desk (kick); then lies down and buries herself (bury pose), only her eyes out; Salmon waves from a tiny deck chair | written in the kicked sand (key: snow) | face (eyes) | cut on 41.68 | her ray nature: bury to rest; Salmon planted |
| 30 | 41.68-44.01 | "Ah-ah-ah, it's way too cold" | beach -> office, `colour` -> `grey` | the camera is yanked up with her (fast whip up), lands on the desk | the three strings snap tight from the sky and yank her out of the sand, up and out of the postcard (forced, surprised 0.7) - she drops into her chair, wet hair | "way too cold" in frost on the office window behind her | battery 5 -> 2 | whip | the dream cannot hold her - the strings reach in (treatment v2) |
| 31 | 44.01-45.69 | "My heart is cold enough" | office window -> globe -> her, `grey` | match cut: marine snow outside the window -> the globe's snow on the desk; at 45.1 a cut to her | (45.1-45.69) she sits back in her chair, wet hair, staring at the postcard | the globe, lit from behind, casts "MY HEART IS COLD ENOUGH" as a huge shadow on the office wall (shadow, key: cold) | globe + face | cut | the same snow outside and in the globe (her sea); she is back where she started |
| 32 | 45.69-48.57 | "Ah-ah-ah, push comes to shove" | train, MS crowd, `grey` | train-door set-up, handheld 0.4 | pushed by the evening crowd (forced lean), sings 0.6 | the train's long LED band across the whole car: "PUSH COMES TO SHOVE" (screen, key: shove) | battery 2 | cut | the routine repeats - evening |
| 33 | 48.57-51.09 | "Ah-ah-ah, you can have the mountains" | office desk, top-down | desk-from-above | slumps, the file mountain grows beside her | the file labels: "MOUNTAINS", "MORE", "URGENT" (print, key: mountains) | battery 2 | cut | the mountains are her workload |
| 34 | 51.09-52.85 | "Ah-ah-ah, I'll take the beach" | office, macro finger on the postcard | macro, locked | her fingertip touches the card, she whispers the line (sings 0.4) | "I'll take the beach" handwritten on the card (key: beach) | postcard | cut on 52.85 | the wish, small and private - it pays off at 136 |
| 35 | 52.85-54.41 | gap (calm) | bedroom, ECU alarm, `grey` | the alarm macro set-up | (her tail slaps the clock); the page: DAY 2 | the calendar page: DAY 2 | - | cut on 54.41 | the loop restarts - the viewer reads "again" |
| 36 | 54.41-56.73 | 聞く耳断つ | office desk, CU profile, `blue` | locked profile, slow push | puts on headphones; the hands keep talking but their bubbles go empty (stand seated, fun 0.4); sings (Ado's line, gain 0.8) | red stamp on a file: 聞く耳断つ + kiku mimi tatsu / I stopped listening | face + battery 2 | cut | Ado's verse = she stops obeying |
| 37 | 56.73-58.80 | 奴が大層な胸を張る | office, worm's-eye up at the boss, `blue` | from her desk up at him | (boss) a huge chest in a suit puffs up, giant hands on her desk; she looks up, unimpressed | stamped across his tie: 奴が大層な胸を張る + romaji / EN | - | cut | the puffed-up one, never a face |
| 38 | 58.80-61.08 | また構わずやる | office desk, CU, `blue` | push-in | bites an onigiri at the desk anyway (smug 0.5); a 4th string from the boss's hand hooks her wrist - she keeps chewing and holds up the onigiri's paper wrapper strip to the lens | on the held-up wrapper strip, frame-wide: また構わずやる + mata kamawazu yaru / And I just do it anyway, again (print) | dots 2 -> 1 (chest ~20 %) | cut | her lore (onigiri) as defiance |
| 39 | 61.08-63.29 | 「望まない」から舌を打つ | office, inside the calendar blizzard, `blue` | the camera flies through the pages | DAY 3 ... DAY 30 tear past her; she clicks her tongue (angry 0.3) | on the flying pages: 「望まない」から舌を打つ + romaji / EN | - | cut on 63.29 | the days blur (rule a) |
| 40 | 63.29-63.90 | え？ (the face holds 0.5 s into the next line's breath "あぁ") | office, CU face at the lens, `blue` | locked - a dead-still camera in the middle of a moving verse | deadpan "huh?" (neutral, eyes half closed); sings え | "え？" huge beside her + e? / Huh? | face (~25 %) | cut | a held beat = the joke lands (canon face) |
| 41 | 63.90-67.55 | あぁ、神か仏か？ヒト気取りか？ | office, MS ring of hands, `blue` | slow orbit 90 deg | the hands multiply around her; she looks from one to the next, unimpressed (smug 0.3); sings | on the gloves, one word per glove: 神か / 仏か / ヒト気取りか + romaji / EN under the block | hands + battery 1 | cut | mocking the judges - hands, never religious imagery (dossier risk note) |
| 42 | 67.55-68.82 | 頭の中 | office, CU, Dutch tilt, `blue` | close, roll 12 | clutches her head (clutch) - the strings run into her hair | 頭の中 + atama no naka / All inside my head (on the strings) | face | cut | the pressure is inside her head |
| 43 | 68.82-70.01 | Leave me alone | office, MS | whip with her shove | shoves a hand away (push) | "LEAVE ME ALONE" on the shoved glove | - | whip | first push - the build to the cut |
| 44 | 70.01-71.86 | 誰になればいいの？ | office, over the shoulder into the black monitor | OTS | looks at her reflection in the dark monitor, tilts her head (sorrow 0.2) | on the monitor: 誰になればいいの？ + romaji / EN | face (reflection) | cut on 71.86 | who should she be - she sees herself |
| 45 | 71.86-73.72 | Take your hands off! | office, MS -> WS, `blue` -> `red` | whip pan with her tail swing, impact frame (3 f) | NEW tail swing: the barb cuts string 4 (anticipation 6 f, smear, overshoot); angry 0.7; sings full | "TAKE YOUR HANDS OFF" across the frame on the cut's arc (key: hands) | battery 1 -> 2 (the cut string gives one back) | cut | her body does the plot; the colour state flips (Usseewa) |
| 46 | 73.72-75.05 | I owe, oh-oh-oh | office, low MS, `red` | slow crane up with her | stands up on her chair | - | battery 2 | cut | standing up = the turn |
| 47 | 75.05-77.52 | 吐き出す前に口をとじろ | office, close two-shot from below, `red` | low, locked | puts a finger on the boss's lips (point); the room goes quiet (-9.4 dB) | on his lips' shadow: 吐き出す前に口をとじろ + romaji / EN | - | cut | Ado's "can it" - she shuts HIM up |
| 48 | 77.52-77.96 | No, oh-oh-oh | office, fast pan across faces, `grey` | whip pan across 6 staring fish | (no Raymi) every fish turns to look | - | - | whip | everyone stares: the public is set |
| 49 | 77.96-79.11 | (Take-take-take-take) | office desk, low angle, `grey` -> `colour` from her feet | at desk level | steps up on the desk: four stomps on the four "take"s - each stomp bursts colour out (duo mix radius grows) | the printer spits "TAKE" pages, one per stomp | face + colour burst | cut | chorus 2 begins = the cold-open picture comes true |
| 50 | 79.11-82.82 | Take me to the beach | office desk, MS -> 360 orbit | 360 orbit around her | NEW desk dance clip, joy 0.9; sings 1.0 | the printout pages fly with "TAKE ME TO THE BEACH" (print, key: beach) | face + colour | cut | wow 4 starts: dancing in public |
| 51 | 82.82-85.33 | you can have the mountains | office, MS, files flying | the camera behind the flying files | kicks the file mountain off the desk - files fly as confetti (kick); string 3 snaps | file labels "MOUNTAINS" fluttering (key) | battery 2 -> 3 | cut | the mountains (= files) kicked away |
| 52 | 85.33-87.42 | you take the snow | office, top-down | top-down spin 90 deg | the boss's hands grab for her strings - she spins out of reach (spin) | "you take the snow" on the paper snow from the files | - | cut | obstacle 1: the hands |
| 53 | 87.42-89.73 | it's way too cold | office row, tracking | tracking along the row | slides down the row of desks (NEW slide), coworkers lean out of the way | the words spill across the desk tops, one big word per desk (print, tilt -90, key: cold) | colour spreading | cut | the colour follows her through the grey |
| 54 | 89.73-91.39 | My heart is cold enough | office, hands foreground | the tangled hands in front, her behind | dances on; the hands tangle in their own strings and fall; string 2 snaps | "my heart is cold enough" on a falling glove | battery 3 -> 4 | cut | the puppeteers trip over their own strings |
| 55 | 91.39-94.25 | push comes to shove | platform crowd, handheld | handheld 0.8 in the crowd | dances THROUGH the crowd (dodge moves) | the platform's departure board flips to "PUSH COMES TO SHOVE" (board, key: shove) | - | cut | obstacle 2: the crowd |
| 56 | 94.25-96.85 | you can have the mountains | train doors, the door set-up | the train-door set-up again | NEW door slide: she slides through as the doors close - she WINS the race (canon: competitive); the last string snaps on the door | door sticker "MIND THE GAP" -> the line | battery 4 -> 5 | cut | the set-up she lost every morning - now she wins |
| 57 | 96.85-99.23 | I'll take the beach | train aisle, dolly, `colour` | dolly down the aisle | dances in the aisle; the fish commuters stare - one fish starts to tap along; through the windows the beach flashes past for a moment (sun on her face) | the whole side panel of ads becomes the line (print, key: beach) | face + dots 5 | match (her pose) | public, staring, one convert - and the beach is near (review FIX 8) |
| 58 | 99.23-101.37 | I'm better off alone | beach, top-down -> low WS, `colour` | top-down, then a fast drop to a low wide across the bay | alone on the sand, arms spread (same pose as 57's last frame); the whole bay, sun, water to the horizon | in the sand around her (key: alone) | face (small, why_small: alone in space) | match | the bridge flips by line - beach; a rich wide so we WANT it |
| 59 | 101.37-103.96 | Like a rollin' stone | office, MS, `grey` | match: same framing, the chair spins her | her chair spins her back to the desk; a new file stack lands (no string yet - they come on the four "down"s, shot 62) | "like a rollin' stone" on the file stack | battery 5 | match | office - the loop strikes back |
| 60 | 103.96-105.53 | Turnin' off my phone | beach, macro | macro | buries the phone in the sand | the phone screen going black: "OFF" | - | match | beach - she switches off |
| 61 | 105.53-107.30 | No one bringin' me | office, MS, `grey` | locked on her, the light rows behind | sits; the phone is back on her desk, ringing | - | battery 5 | cut | office again |
| 62a | 107.30-107.70 | "down" 1 (107.32) | office, MS, `grey` | locked on her, the light rows behind | a string hooks her wrist and yanks her into the chair; one row of lights goes off; one chest dot fades | "DOWN" on the falling light row (light) | dots 5 -> 4 | cut | each "down" its own held beat |
| 62b | 107.70-108.09 | "down" 2 | office, MS, darker | locked | string 2 - yanked; row 2 off; dot fades | "DOWN" | dots 4 -> 3 | cut | (the first two "down" times are interpolated 0.07 s apart: set them by ear on the stills board) |
| 62c | 108.09-108.55 | "down" 3 | office, MS, darker | locked | string 3 - yanked; row 3 off; dot fades | "DOWN" | dots 3 -> 2 | cut | |
| 62d | 108.55-109.00 | "down" 4 | office, MS, nearly black | locked | string 4 - yanked; the last row off; dot fades | "DOWN" | dots 2 -> 1 | cut | the tightening: four beats, four strings, four rows dark |
| 63 | 109.00-110.62 | (the line's tail + breath) | office, CU, black room, `own` | locked | only her last dot glows - the only light in the room (灯闇) (sorrow 0.4) | - | battery 1 = the last lamp | cut | the darkest point - her name |
| 64 | 110.62-112.76 | Just give me some space | beach, crane up, `colour` | crane up and out over the bay | stretches out on the sand, sky all around, Salmon floating nearby | written in the clouds (key: space) | - | match | beach: space - the second rich wide |
| 65 | 112.76-114.85 | That sun in my face | office, CU, a lamp | the boss's desk lamp swings into her face / the lens | squints into the fake sun (sorrow 0.3) | "that sun in my face" on the lamp's shade | face | cut | the office's sun is an interrogation lamp |
| 66 | 114.85-118.50 | And the days go on, and on, and on, and on | office -> the globe, `grey` | pull back a step on each "on" (115.95 / 116.67 / 117.37 / 117.94) | on each "on" a calendar page flies past and she gets a step smaller (shrink tween) - the last page reads DAY 365; on the last "on" she is tiny, standing INSIDE the snow globe on her own desk; the boss's hand lifts it and shakes it | the pages: DAY 100 / 200 / 300 / 365 | globe (~25 %) + her tiny inside | cut | the loop makes her small - literally (rule a: 365 shown) |
| 67 | 118.50-119.38 | (T-A-K-E, T-A-K-E) | inside the globe, MS, cold white | inside the glass, the glass toward the lens | plants her feet (118.5); two big tail blows on the glass (118.6 / 118.9) - a star of cracks spreads; the crack lines light letter by letter with the vocal, T 118.73 / A 118.80 / K 118.93 / E 119.08 | the lit letters T-A-K-E in the crack pattern, frame-wide (glass, light) | globe + face | spin (through the shards) | wow 5 begins: the highlight; the letters light with the singer so they read (review FIX 6) |
| 68 | 119.38-121.23 | T-A-K-E, take me to the beach | office desk, MS -> WS, `clean` | spin transition carried by the shards, settles low | the glass bursts - the shards fly past and hang for a beat spelling TAKE; she slides out flat like a ray and grows back to full size on the desk (grow tween); the strings fall off her like confetti; all five chest dots flare on | the shards spell "TAKE", then "ME TO THE BEACH" on the falling strings | face + dots 5 (chest ~20 %) | cut | free on the first word of the last chorus |
| 70 | 121.23-126.14 | you can have the mountains (Have the mountains) / you take the snow | office, full body, tracking fast | a fast tracking move alongside her sprint, then a crane over her | SPRINTS through the office (NEW run): the paper snow swirls around her and turns to sand where it touches her - a trail of sand behind her across the grey floor | the snow-to-sand flakes form "YOU CAN HAVE THE MOUNTAINS" then "YOU TAKE THE SNOW" big in the air (key: mountains / snow) | colour spreading | whip | the peak of the music at full body (review FIX 1) |
| 71 | 126.14-129.10 | it's way too cold (It's way too cold) | office windows, full body, from inside -> outside | one whip out through the window | jumps onto the window sill and kicks the frosted window - it breaks OUTWARD, warm light and sea floods in | the frost shards carry "WAY TOO COLD" as they fly out (glass) | - | whip | warmth broken in, not breathed in |
| 72 | 129.10-130.85 | My heart is cold enough (Oh) | office, WS | a 180 orbit around her | spins in the warm light, arms out; her chest dots flare big, the warm light spreads from them across the floor | the line written in the light on the floor from her dots (light, tilt -90, key: heart) | dots 5 (~20 %) | cut | her heart is not cold any more - shown wide |
| 73 | 130.85-133.12 | push comes to shove | office, worm's-eye, full body | worm's-eye crane up | the boss's giant hand reaches - she shoves it away with her whole body (push), it slides off the frame | her handprint leaves "PUSH COMES TO SHOVE" across his giant glove (print, key: shove) | - | cut | the hands lose |
| 74 | 133.12-135.51 | you can have the mountains | office, two-shot, the globe big in the foreground | locked two-shot | sets the cracked, empty snow globe into the boss's hands (NEW give) | the globe's label "FORECAST: SNOW" + the line on its base | globe (~25 %) | cut | the payoff: the mountains handed back |
| 75 | 135.51-137.25 | I'll take the beach (I'll take the) | office -> beach | 135.51 MS on her hand on the postcard; 136.0 the pull starts; 136.2-136.6 face CU; then one move up and out as the office unfolds (walls fall outward like a paper box) - the FULL beach wide lands exactly on "beach" 137.10 and holds | grabs the postcard (NEW pull), pulls it off the monitor at 136.0 - the office unfolds into the beach | the postcard's back: "SUN" in her handwriting (her forecast was right) | postcard + face, then the beach | hold (no cut: the wide continues into 76) | wow 5's peak: the title's promise gets the screen (review FIX 2) |
| 76 | 137.25-139.37 | Take me to the (I'll take the) | beach, the wide holds -> under the surface | the held wide drifts down to her, then a slow-motion fall under the water | lets herself fall backwards into the warm water | written on the water surface as she breaks it | face | cut | release |
| 77 | 139.37-140.80 | I don't have no friends | beach, three angles | cuts on the 8ths (0.29 s) | bursts out of the water into a beach dance (NEW beach dance) | - | face | cut | the outro is a peak - so is she (review FIX 3) |
| 78 | 140.80-142.64 | ask anyone (そう何も) | beach, water-level | water-level | Salmon pops up next to her, offended at the line | そう何も written by a wave + sou nanimo / (yeah, nothing at all) | - | cut | her lore gag: Salmon IS her friend |
| 79 | 142.64-145.50 | Got me 'til the end, my favorite one | beach, handheld circling | handheld circle | grins, pulls Salmon in - they dance together | - | face | cut | "my favourite one" |
| 80 | 145.50-148.33 | (最後まで) | beach, top-down travel | top-down along the tail | her tail writes 最後まで huge in the sand on the beat, stroke by stroke; the sea fills the strokes and they shine | the tail's writing + saigo made / (until the very end) | - | cut | a wow in the outro: type made by her body |
| 81 | 148.33-151.78 | I don't have no friends, ask anyone (そう誰も) | beach, low wide | low wide, fast cuts on the beats | the dance gets bigger: fish from the train join at the waterline | そう誰も in the foam + sou daremo / (yeah, no one) | - | cut | the staring commuters from chorus 2 now dance with her |
| 82 | 151.78-158.60 | Got me 'til the end, my favorite one (最後まで) | beach -> sky, `warm` dusk | one long crane up and away | dancing, then arms up; from high above: the whole bay in the evening sun and, far out, deep in the blue, the tiny grey office dome she left; all her dots glow as the sun goes down | the sky (light) | the tiny office (why_small: distance is the point) | cut | the last wow: the size of her freedom |
| 83 | 158.60-163.50 | end | beach, macro the clock | macro | the twin-bell clock, half buried in sand, rings ONE last time - without looking, her foot kicks sand over it | - | - | cut | the last gag (FIX 3) |
| 84 | 163.50-167.13 | end | beach, top-down | top-down, locked (rhymes with shot 19's clock) | (no Raymi) a wave washes the last calendar page - blank - out to sea | - | - | end | the first and last images rhyme |

## Density per section (picture events per beat - loud parts aim ~80 %, story 45 %, calm 10-30 %)
| section | time | beats | shots | events (shots + scripted hit changes) | events / beat |
|---|---|---|---|---|---|
| cold open + nightmare | 0.00-9.40 | 16 | 13 | 18 | 112 % |
| verse 1 (sleeping) | 9.08-17.65 | 15 | 5 | 9 | 60 % |
| DAY 1 + pre-chorus | 17.65-33.39 | 28 | 7 | 15 | 54 % |
| chorus 1 | 33.39-52.85 | 34 | 9 | 22 | 65 % |
| gap + Ado verse | 52.85-73.72 | 37 | 11 | 24 | 65 % |
| pre-chorus 2 | 73.72-77.96 | 7 | 3 | 5 | 70 % |
| chorus 2 | 77.96-99.23 | 37 | 9 | 30 | 81 % |
| bridge | 99.23-119.38 | 35 | 10 | 24 | 69 % |
| last chorus | 119.38-139.37 | 35 | 9 | 26 | 74 % |
| outro + end | 139.37-167.13 | 49 | 8 | 30 | 61 % |
- Cut rate: first third ~32 shots / min, last third ~26 shots / min - but the last third carries the moves that are
  themselves the events (the spin out of the globe, the unfolding office, the crane), the biggest wow and the
  outro's 8th-note cuts (77) - it is not weaker. Scripted hit events: in chorus 1, chorus 2, the last chorus and the
  outro every measured hit inside a shot is a picture change (a colour burst from her step, a string snapping, a
  file flying, a wave writing).
- Honest count: under 80 % on purpose in verse 1 (she sleeps; the push-in is the tension), DAY 1 (the routine must be
  read: rule + set-ups) and the outro's crane (82: the held view is the wow).

## The Short (cut from the MV shots)
Window **29.35-45.69 (16.3 s)** = shots 24-31 (+ a 0.5 s insert of 27), composition `MVShort` 1080x1920, framing per shot via `camera[].short`.
| # | from-to (song) | shots used | frame 0 / hook | CTA |
|---|---|---|---|---|
| S1 | 29.35-29.85 | a 0.5 s insert of shot 27 (her face in the sun, colour) | frame 0: her face in the sun, bright - readable in 0.5 s; hook text 0-2.5 s (top third, off her face): "battery: almost empty" | - |
| S2 | 29.85-31.60 | 24 (shortened) | the grey desk, chest dots at 2, strings tugging her hands | - |
| S2b | 31.60-33.46 | 25 | push into the postcard (a visual change at 1.75 s) | - |
| S3 | 33.46-41.68 | 26-29 | the fall, the sung hook, the split mountains / beach, the kick | - |
| S4 | 41.68-45.69 | 30-31 | the yank back; the globe's shadow line; she sits back in the grey chair with wet hair, staring at the postcard (31's last 0.6 s) - the cliffhanger | "what's YOUR battery at?" from 43.0 to the end (>= 2.5 s, top band, off her face) |
The Short's own twist (not in the MV): it opens on the beach flash and ends on the yank, so the swiper sees what she
loses - "will she get out?" is answered only in the MV.

## Reuse first (studio/catalog/status.json: toki-liked / approved parts before anything new)
- **Transitions** (toki-liked): `whip` (the drags, the yank, the shove), `zoom` (the can, the postcard), NEW `spin`
  (the globe's shards, built 2026-10-22), `match` cuts in the bridge.
- **Camera v2** (2026-10-22): spline paths (orbits 1, 41, 50), dolly zoom `frameH` (23), handheld `shake` (32, 55, 79).
- **2D layer Fx2D** (2026-10-22): duo poster grey / blue / red, halftone, impact frame (45), speed lines in the dance.
- **VRM Raymi** (raymi5, lip sync v2, clip cross-fade + motionMix, on twos, ink outline) - all from the 3D core work.
- **Lyrics v2** (studio default): heavy weight, lit, on surfaces; Japanese with romaji + English.
- **Salmon** (creatures): reused at the beach.
- Not reused: the weather / aquarium / deep / cardtable / night sea sets (a new world; PRINCIPLES D).

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| bedroom (dry dome, shell bed, coral nightstand, tide calendar, window with marine snow, knick-knack shelf) | set | 3, 13-19, 35 | to build |
| train car + platform (straps, ads as lyric surfaces, closing doors, floor arrows) | set | 5, 20-21, 32, 55-57 | to build |
| open office (identical desk rows, ceiling light rows that switch off row by row, frosted windows with marine snow) + her desk (monitor, postcard, globe, files, phone, printer, lamp) | set | 1-2, 6-13, 22-25, 30-34, 36-54, 59-63, 65-75 | to build |
| inside of the snow globe (glass dome, paper mountains, paper snow) + crack letters | set | 66-67 | to build |
| beach (shallow turquoise water, sand ripples, sun, caustics, dusk, Salmon's deck chair, the bay seen from high) | set | 4, 10, 26-29, 58, 60, 64, 75-84 | to build |
| props: twin-bell alarm clock, tide calendar + page blizzard + DAY numbers, shell phone (+ a hand coming out), snow globe (small, label, crack + empty state), postcard (front + back "SUN"), files / file mountain, onigiri, headphones, "SUN" sticky note, printer spitting pages, boss's desk lamp, can | props | many | to build |
| hands + strings: white glove on an anchor above the frame, a string to her wrist bone; pull = forced motion on her arm; tangle; snap; fall; drag a bed | component | 3, 5-7, 12-21, 30, 36-47, 51-56, 62a-d, 66-68 | to build |
| the boss: chest + tie + giant hands (no face) | figure | 9, 37, 47, 52, 66, 73-74 | to build |
| fish commuters / coworkers (varied silhouettes, coffee, stare, one taps along, dance at the waterline) | figures | 1, 20, 32, 48, 53, 55, 57, 81 | to build (crowd look pass) |
| battery: her five chest dots as controllable lights (flare / fade 6 f) + the 2D sign (5 violet dots) following the same count | VRM material + 2D | every reality shot; framed big in 19b, 27, 30, 38, 45, 51, 54, 56, 62a-d, 63, 68, 72 | to build |
| colour spread: duo mix as a radius from her position (screen space) | 2D layer | 1-2, 49-57 | to build (Fx2D duo exists) |
| shrink / grow tween for the VRM | move | 66, 68 | to build |
| film path: VRM keys per shot (pose / motion / motionMix / expr / mouth gain / step), Fx2D + camera v2 in shots.json | studio feature | all | to build (VrmClip has them, the MV composition not yet) |
| motions: sleepwalk (dragged walk), wake with a start, sit + type, slump, desk dance, beach dance, slide, door slide, run, tail swing, give, pull, fall backwards, bury | moves | see rows | Mixamo (toki's download) or own poses |
| non-lyric texts (speech-bubble icons, "CAN IT" on the can, DAY numbers, labels) as readable set text | type | 14-18, 19b, 22, 35, 39, 66, 74 | to build (texts guard exists) |
| big lyric carriers: frame-wide speech bubbles, the office wall screen, the globe's shadow on the wall, the train's LED band, the departure board, the onigiri wrapper strip, desk-top words, snow-to-sand letters, crack letters lit with the vocal, shards spelling TAKE | type | 14-17, 22, 24, 31, 32, 38, 53, 55, 57, 67-68, 70-73 | to build |

## Must be finished vs allowed fallback
- **Must be finished as written**: 1 (thumbnail), 8-10 (the three stab flashes), 18-19 (the can + the wake + the rule),
  25-30 (the fall, the split, the yank), 45 (the barb cut), 49-50 + 56 (the dance + the door race), 62a-63 (four
  downs, the last lamp), 66-68 (into the globe, T-A-K-E, out), 74-75 (the globe handed back, the postcard), 82-84.
- **May fall back** without changing what the viewer understands: the office unfolding like a paper box (75) -> a
  white flash wipe from the postcard; the calendar blizzard (39, 66) -> 4 pages passing the lens; Salmon's deck chair
  -> Salmon floating; the frost writing (71) -> words on the glass; the fish joining the dance (81) -> two fish.

## Data part and checks
- `shots.json` will hold the same 87 shots (84 numbers, 19 and 62 split, 69 dropped), MV window 0-167.13, Short window 29.35-45.69 with hook + CTA, `heroes`
  (postcard, battery, globe: prop; face: face) and per shot `hero` and `why`.
- Before the first cloud render: `python -m raymi timeline` + `node guard.mjs --summary` (lyrics in frame, faces,
  props in the lens, the hero sizes); then the stills board (>= 12 frames: shots 1, 10, 15, 19b, 23, 28, 30, 40, 45, 50,
  56, 63, 67, 68, 70, 74, 75, 82) - nothing is rendered on toki's PC.

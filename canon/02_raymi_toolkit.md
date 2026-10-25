# 02 - Raymi's toolkit: her body, her lore and her world as a picture language

Why (toki 2026-10-25): in Watch Me the radar / sonar / wave / caustics / ink ideas were good, but they appeared only in
take 6 at 3 a.m. as a reaction to "flach und plastik" and were then laid over the film as RULES - "gute Ideen, schlecht
umgesetzt, trotzdem hätten diese Ideen von Anfang an auftauchen müssen". This file is where they come from: the IDEAS
step crosses every song line with every entry here (`writers_room/templates/2_IDEAS.md`, idea matrix), and
`python -m raymi next` refuses IDEAS until every T-id is used or skipped with a reason.

Each entry: what it is (BIO = real stingray biology, DESIGN = her character design, LORE = canon/01, WORLD = her
ocean) -> what it can MEAN in a picture -> picture versions (an open list - add more) -> what exists in the studio
(status from `studio/catalog/status.json`; "new" = toki has not judged it). An entry is a class, never one fixed effect.

| id | entry | kind | it can mean | picture versions (open) | exists in the studio |
|---|---|---|---|---|---|
| T01 | her glowing dots (ultraviolet) | DESIGN | 灯闇 = a lamp in the dark: she is her own light, she needs no stage | dots flare on a beat, they light her face from below in the dark, they pulse with the bass, they write in the air, the only light left when everything goes off | glow / glow_pulse (VrmPuppet), lightwriting (setfx) - new |
| T02 | electro-sense (ampullae of Lorenzini: rays feel the electric fields of living things) | BIO | she feels you / senses who is watching, attraction, a hunch, a hidden thing found | field lines between her and someone, a flicker when someone comes near, the screen's electricity bends toward her, a heartbeat she can "see" | sense (setfx) - new |
| T03 | "sonar" ping | artistic licence (rays do NOT use sonar - read it as her electro-sense made visible) | being found, radar, attention spreading | rings over a floor / water from her steps, rings through the lens | sonar (setfx) - new |
| T04 | the barb at the tail tip | DESIGN + BIO | a sting, danger under cuteness, a punchline, a tsundere jab | barb flick into the lens, twitch when someone comes close, a cut made by the tail sweeping the lens, a "sting" on the beat | tail_lens, barb_lens, tail_twitch (setfx) - new |
| T05 | flat body, gliding, fins that wave | BIO + DESIGN (fin shoulder pieces) | ease, flight, elegance, a ripple of emotion | glide through air like water, a fin-wave distortion on a turn, going flat like paper (LGW gag "rays are flat polygons"), sliding under a door | finwave (setfx) - new; LGW paper flat (2D, old engine) - toki-liked |
| T06 | burying in sand | BIO | hiding, shyness, "you can't see me", a surprise appearance | sand puffs as she drops, only her eyes showing, rising out of the floor of any world (sand, paper, pixels) | - |
| T07 | eyes on top, mouth underneath (ray anatomy) | BIO | looking up at the world, a hidden smile | a worm's eye of the world from the floor, the view from below the water | - |
| T08 | the water / under-sea light | WORLD | her home, calm, dream, "this place is secretly the sea" | caustics on a floor / a face, marine snow, haze layers, a room slowly filling with water, bubbles instead of speech | caustics, haze (setfx), water surface (KING aquarium) - new / approved |
| T09 | Sumi ink | LORE (Sumi, the black ray mascot) + WORLD | spreading mood, a reveal, a transition, darkness taking over | ink blooming into the frame, ink writing lyrics, ink swallowing the old set | transition_ink (Transitions) - toki-liked |
| T10 | Sumi the mascot | LORE | punchline, reaction cutaway | a tiny reaction insert, Sumi copying her pose badly | - (2D sprite only) |
| T11 | the salmon, her best friend | LORE | loyalty, the absurd, the side character who suffers | photographer, guard, fan in the crowd, the friend she eats sashimi in front of | Salmon creature (creatures.tsx) - open |
| T12 | rain predictions (wrong more often than right) | LORE | confidence vs reality, a gag, "100 % chance of" | she calls the weather and gets the opposite, a forecast board, a drop on her nose | forecast staging, rain (setfx) - new |
| T13 | tako ears | DESIGN | emotion signal (perk / droop), touchy subject (she hates them touched) | ears twitch on a sound, someone reaches for them and she dodges | VRM ears - never let them read as horns |
| T14 | ultraviolet / purple as HER colour | LORE | her claim on a place: the world turns purple when she owns it | the grade shifts to UV as she takes over, UV light reveals hidden things (LGW UV lamp) | grades, UV lamp light - toki-liked (LGW) |
| T15 | competitive about nothing, tsundere, sleepy baseline, confident when complimented | LORE | attitude, comedy beats, a turn of mood | a slow sleepy blink at the lens, mock offence, winning a pointless contest | acting (clips + poses) |
| T16 | knick-knacks, rhythm games, stargazing, karaoke (bad but confident) | LORE | her personal world, honesty, charm | her shelf of creatures, a rhythm-game UI, stars as an anchor, singing off-key proudly | - |
| T17 | food lore (onigiri, taiyaki, taro bubble tea, sashimi) | LORE | everyday comfort, gags | a taiyaki as a prop, tapioca pearls as bubbles | - |

Rules of use
- An entry used in a video becomes MOMENTS (time, line, why, reference, test still - the EFFECTS table of the
  treatment), never a rule over the whole film (the timeline refuses global `effects` for jobs from 2026-10-25 on).
- One or two entries carry a video (its "main element"); the rest are accents. Not every video uses every entry - a
  skipped one needs a reason in the matrix, never silence.
- New entries are welcome: anything true about rays or about her that can be pictured goes here with its id.

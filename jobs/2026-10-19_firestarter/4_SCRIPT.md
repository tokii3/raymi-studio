# SHOOTING SCRIPT - FIRESTARTER (K/DA)

Knowledge opened: `knowledge/craft/03_Videoschnitt.md`, `knowledge/craft/05_Komposition_und_Form.md`,
`knowledge/craft/06_Text_und_Motion_Graphics.md`, `knowledge/studies/star_guardian_acting.md`,
`knowledge/studies/edit_beat_change.md`, `knowledge/studies/typography.md`.
The contract: screening checks the rendered video against every row. Times are measured song times
(`lyrics_timed.json` word times - 333 / 436 measured, interpolated stretches 121-123 and 138-149 s are checked by ear in
the pilot; `song_map.json` hits / beats / stops, 129 BPM). Based on `3_TREATMENT.md` v2 (PASS, `reviews/treatment_2.md`,
its FIXes 1-6 written in). The data part (`shots.json`) is generated from the same row list at the build stage, so the
two never drift apart. Written 2026-10-19.

## What this script settles
1. **The first 3 s** (toki's brief, Know My Name): shot 1 IS the thumbnail picture at frame 0 (her face under her
   violet flame, the field burning behind, never behind her head); shot 2 rewinds into her eyes opening (no dead
   black); shots 3-10 are five failures with five cameras, each leaving a residual glow of 8-12 frames.
2. **Raymi is not forced into frames** (toki 2026-10-19): 31 shots run without her (the fire, Salmon, the creatures,
   the city below, the sauna, the sky letters) and 9 more keep her deliberately small (`why_small`: the field / the
   cold / the giant / the sky is the picture). Every one of them shows something SHE caused.
3. **Lyrics may cross her** (toki 2026-10-19): the big stamps (얼쑤, FIRE STARTER, DROP) may sweep over her; the guard
   only refuses text PARKED on her face. Words are never placed over a flame (BACKLOG: they clip) - always on black
   water or dark floor.
4. **Busts with cut edges** (SMUG_PLAY_045, THINK_CALM_036, SHY_DRAMA_039, NEUTRAL_CALM_021, WORRIED_DRAMA_024,
   SURPRISE_DRAMA_028, HAPPY_PLAY_046, MS_HAPPY_005 / 006, HAPPY_SALMON_117) are used only framed close or waist-deep in
   the sea, so their cut sides never reach the frame (hard rule 9; the guard refuses it before every render).
5. **Devil guard** (canon/01): in every shot with a burning vent near her, the vent sits beside or below her head,
   never behind it; her face's key light is her own violet flame; the red of act 6-7 lives in water and floor.
6. **The signature move** (review 2 FIX 7): her barb strike as a held hit pose - shots 56-58 (three stamps), 66 (the
   drop) - and its first, failing version in shots 3-7; at the end it becomes the pointing 'you' (shot 111).
7. **Korean lines** always show romanisation + English (`lyrics_en.json`, own translation); the one exception is the
   drop (shot 66): only the English words 'beat drop' are written (`sub: false`, why: the Korean 'ja' is a breath).

## Shots
| # | from-to | lyric / music | set + shot size | camera (start -> end) | Raymi DOES (sprite + act) | lyric in the picture (where, surface, material, key word) | hero (main element readable?) | out (transition) | why (feeling / principle) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.00-2.00 | intro: first sound, stop 0.3-0.7, hit 1.0 | deep (main vent zone), CU face - flash-forward (state of 145 s: field burning) | close low under her face (cold_open), locked; slow push from the 1.0 hit | SMUG_PLAY_045 (bust, framed close: its cut sides stay outside the frame), the violet flame (Fires 0.3 m) above her fist at the chin lights her from below; on the stop she lifts her eyes to the lens, on 1.0 her grin widens | none (music only) | flame + face: THE THUMBNAIL FRAME (face box ~30 %, flame ~18 %, brightest thing) | rewind | the first frame IS the promise (P6, the Know My Name lesson): fire underwater, her face, in 0.0 s; behind her the amber vents sit low in frame, never behind her head (devil guard) |
| 2 | 2.00-2.95 | beats 2.0 / 2.46 | deep, black -> her sleeping dip, CU | pulls back fast (rewind smear), settles on strike_close | the flame sucks back into her fist as a spark, the field's fires run back into the cracks (reverse); as the smear fades her two violet eyes open low in the frame - CALM_PRONE_194 lying in the black sand, only eyes and faint dots; on 2.46 she lifts her tail (anticipation) | none | face (eyes) - dim on purpose: the only lights are her eyes | cut | the video shows how it began - never dead black: the eyes open ON the rewind (treatment FIX 4) |
| 3 | 2.95-4.90 | strike 1 (beat 2.93) | deep, her sleeping dip, MS | strike_close | FOCUS_CROUCH_192 whips her barb across the vent's rock (smear on the tail, squash on impact): one sad spark, a bubble pops 'pff' in her face (sweat icon); the dying ember glows 10 frames | none | face lit 4 frames + ember | cut | failure 1 - a gag, not a black hole: every strike leaves a residual glow (FIX 4) |
| 4 | 4.90-6.86 | strike 2 | deep, floor level, WS | floor_low, pans left following the fish | PANIC_LUNGE_202 lunges after a passing deep-sea fish whose fin caught the spark - too late; the fish's glowing fin lights a slice of black chimneys as it swims off (her cut bottom edge hidden behind a pillow rock) | none | - | cut | failure 2 plants the creatures (they come back drawn to her light at 34.49) |
| 5 | 6.86-8.81 | strike 3 | deep, top-down MS | top_down, small descent | ANGRY_KICK_199 kicks the rock with her barb harder (side kick): a crack under her lights and runs one metre, then fades | none | - | cut | failure 3 shows the crack mechanic failing once - the floor will draw itself at 20.24 |
| 6 | 8.81-10.76 | strike 4 | deep, MS on Salmon (no Raymi) | low two metres from Salmon, locked | (off screen) - the sparks land on Salmon, who was watching nervously: it jumps, its fin tip smokes; it looks round - the bucket half-buried in the sand | none | - | cut | Salmon's arc begins (the bucket for 30.81); Raymi not forced: the reaction is the picture |
| 7 | 10.76-11.25 | strike 5 | deep, MS | strike_close, kick on the strike | FOCUS_PUSH_172 (gritted teeth) strikes twice: a real small flame flickers on the rock - and a cold puff of current (marine snow blown sideways) blows it out; anger icon, she glares left | none | the little flame (3 frames) then her glare | cut | the antagonist is planted (the current, act 4 / act 8) |
| 8 | 11.25-11.74 | beat 11.25 | deep, ECU barb | macro on the tail tip (barb_macro) | the barb (FOCUS_CROUCH_192 framed on the tail) whips through, sparks | none | - | cut | the last bars before the voice: a strike per beat, each lights more |
| 9 | 11.74-12.23 | beat 11.74 | deep, ECU eyes | strike_close tight on her eyes | FOCUS_PUSH_172: her eyes in the spark light, brighter than before | none | face | cut | rising light, rising cut rate (craft 03: acceleration) |
| 10 | 12.23-12.84 | beats 12.23 / 12.72 | deep, MS vent mouth + Salmon | vent mouth foreground, Salmon behind covering its eyes | (off screen) - two strikes light the vent mouth; the glow no longer falls back to black | none | - | cut | the build ends one frame before the voice: the catch belongs to the first sung word |
| 11 | 12.84-14.81 | "I'm a fire starter" (12.84), hit 12.91 | deep, main vent, CU -> MS | strike_close pulling back to MS | FOCUS_PUSH_171, palm open: the flame STAYS (Fires grow 0.2 s, overshoot) - violet, gold core; the light whooshes over the field and falls back to her circle | I'm a fire starter - written in violet light beside her palm (sign, light, key: fire) | flame (~15 %) + face lit from below | cut | IT CATCHES on the first sung word - the hook pays off |
| 12 | 14.81-16.54 | "Work a lil harder" | deep, main vent, MS | orbits 30 deg left | THINK_CALM_036 (bust, cut bottom behind the flame's glow / out of frame): a bored shrug like it was easy - then she blows on it and it doubles (15.6); her tail wags out of frame - the act 'bounce' carries it | work a lil harder - small, floating up off the flame (float, light) | flame | cut | light tsundere: 'that was easy' while the fire doubles |
| 13 | 16.54-18.19 | "Got me fired up", hit 16.32 before | deep, main vent, MS | half orbit around her (180 deg, 1.6 s) | HAPPY_SPIN_178 tosses the flame hand to hand - a smear arc of violet light | fired up - rising in the smear's bubbles (float, light, key: fired) | flame (moving) | cut | the camera really travels around her (P7); play, not pose |
| 14 | 18.19-20.24 | "Imma burn it down like" (hangs on 'like') | deep, her dip, MS high angle | high, push in on her grin | FOCUS_CROUCH_192 looks DOWN at the dead cracks under her feet, grin. SHORT: she presses her palm down early and the crack runs UP the 9:16 frame to the bottom edge, stopping on 'like' | Imma burn it down like - lying dark on the floor, unlit except 'like' glowing faintly (sign, tilt -90, light) | flame + face | cut (Short ends 19.9) | the sentence is not finished: the hook hangs (the Short's cliffhanger) |
| 15 | 20.24-22.08 | "I'm a fire starter" (louder half) | deep, floor level, WS | floor_low: the light races past the lens | FOCUS_CROUCH_192 presses her palm to the floor: the first crack lights under her hand and RUNS away from her | I'm a fire starter - burned into the floor by the running crack (sign, tilt -90, light, key: fire) | - | cut | the fire takes the floor - rule (b): the world grows as the light runs |
| 16 | 22.08-24.15 | "Crazy out of order" | deep, top-down WS | top_down, slow rotate 20 deg | tiny at the origin, crouched (FOCUS_CROUCH_192, why_small: the network is the picture); the crack branches wildly in every direction | crazy out of order - each word on a different branch (sign, tilt -90, light) | - | cut | chaos drawn as a map - Raymi not forced: small on purpose |
| 17 | 24.15-25.66 | "Got me fired up", hit 24.87 | deep, low along a crack (no Raymi) | tracking low along the racing crack to the main vent's foot | (off screen) | fired up - in the crack's light (sign, tilt -90) | - | cut | the fire travels on its own - she caused it |
| 18 | 25.66-27.31 | "Imma burn it down like", hit 26.68 | deep, main vent from below, WS | vent_up | SURPRISE_DRAMA_028 (bust, cut sides out of frame, lower corner) looks up as the vent's lava seams light ring by ring from the bottom (24.87, 26.68); the mouth glows, about to blow - 'like' hangs again | like - alone, big, in the bubbles at the vent mouth (float, light) | - | cut | second hang: the vent is the answer |
| 19 | 27.31-28.82 | "Imma start a fire", hit 28.47 | deep, crane her -> top_down | ONE crane move from MS beside her up to top_down | HAPPY_JUMP_161 arms up as the main vent ignites (28.47) and the fire runs over the WHOLE floor - the dark becomes a glowing map | FIRE - written by the cracks, huge, on dark floor between the lit lines (sign, tilt -90, light, keyScale 2.8) | fire_word (huge) + the map | cut | WOW 1: the world appears because her light reached it |
| 20 | 28.82-30.81 | "Oh I like a little drama", hit 29.42 | deep, main vent, MS | MS frontal, small push | SMUG_WINK_169 arms out, wink, placed LEFT of the vent so her head is against black water; two side vents pop alight behind on 29.42 | drama - stamped on 29.42 (stamp, light) | flame | cut | smug - she likes the chaos she made (devil guard: no flame behind her head) |
| 21 | 30.81-32.19 | "Call the fire fighter" | deep, floor_low (no Raymi) | low, Salmon races into frame | (off screen) - Salmon races in with the bucket, panicking (fast, smear) | call the fire fighter - in the bubbles of its wake (float, light) | - | cut | the gag starts: her best friend is the fire fighter |
| 22 | 32.19-34.49 | "Call me crazy, call it Karma", hit 33.09 | deep, MS on Salmon (no Raymi) | MS, kick on the throw | (off screen) - on 33.09 Salmon throws the water: water into water - nothing; it stares into the empty bucket (sweat icon) | karma - small on the bucket's side (sign) | - | cut | rule (c) proven by a joke only a sea creature can make |
| 23 | 34.49-36.24 | "got you burning so hot", hit 36.06 | deep, WS (no Raymi, she soft in the far back) | slow dolly through the field | (far back, soft) - creatures of the deep (built fish) drift toward the light, fins glowing at the edges | burning so hot - on the dark floor (sign, tilt -90) | - | cut | the creatures from strike 2 come back - drawn by her light |
| 24 | 36.24-38.14 | "you'll be begging for water", hit 37.43 | deep, MS | frontal, a beat push on 37.43 | SMUG_WINK_169 spreads her arms: the whole ocean - help yourself (on 'water') | water - huge, wavering like a reflection, lying on the dark water above her (sign, light, key) | flame | cut | the joke: she is IN water and still burning |
| 25 | 38.14-39.95 | "Imma start a fire" | deep, MS -> pull | MS on two dark vents, pulling back | (off screen) - the next two vents glow up from their seams | start a fire - in the vents' rising bubbles (float) | - | cut | the fire spreads to the field |
| 26 | 39.95-41.35 | "Imma fire starter", hits 40.4 / 41.31 | deep, abyss_wide | abyss_wide, slow pull | small in the centre, flame up (FOCUS_PUSH_171, why_small: the field is the picture); two vents ignite on 40.4 / 41.31 | fire starter - across the dark water above the field (sign, light) | - | cut | the scale of what she lit |
| 27 | 41.35-43.79 | "긴 어둠 끝 불을 밝혀" | deep, MS deep focus | low, flame big in the foreground (~15 % of the frame), her face behind, the dark field far behind | FOCUS_PUSH_171 holds the flame up toward the lens | the Korean line rising in the bubbles beside the flame (float, light, key: 불을), romanisation + English under it on the black water | flame (~15 %) + face | cut | her name in the song: at the end of the long dark, I light the fire - main element big at the line that matters most (FIX 5 of review 1) |
| 28 | 43.79-45.49 | "바람 불어도 (후후) I'm the lighter" | deep, WS | side, the streak crosses the frame | WS_BK_NA_WADE_181 turns her back to the cold cyan streak and shields the flame with her body; marine snow blown sideways, every flame in the field bends flat on '후후' | I'm the lighter - in light on the water behind her, the Korean half blown sideways with the snow (sign, light, key: lighter) + romanisation + English | flame (shielded, its light spills round her) | cut | the wind arrives - the only cold colour in the video |
| 29 | 45.49-47.45 | "꺾이지 않는 desire" | deep, CU | strike_close | FOCUS_PUSH_172 (gritted): her flame straightens up tall again, unbent | desire - tall and straight beside the flame (sign, light, key) + romanisation + English | flame + face | cut | a desire that never bends |
| 30 | 47.45-50.00 | "올라가 펑펑 터져 마치 축제 같지", hits 48.83 / 49.81 | deep, WS from low | low, tilt up with the shell | HAPPY_JUMP_160 cheers as the first bubble firework rises from the main vent and bursts on 48.83 / 49.81 (gold rings) | 축제 - in the burst's rings (float, light, key) + romanisation + English | - | cut | the festival promised - small, so the drop can be big |
| 31 | 50.00-50.40 | STOP | deep, abyss_wide | locked (hold) | (small, unlit) - the current returns: in ONE frame every flame in the field goes out; only drifting sparks die | none (silence) | - | cut | the turn: black again - the stakes |
| 32 | 50.40-50.81 | "I can be sweet" | deep, CU in the black | strike_close | SHY_DRAMA_039 (bust, framed close) smiles sweetly into the dark; a small gold glint low in frame - her barb | none (acted) | face (dim) | cut | sweet - then the venom |
| 33 | 50.81-52.63 | "but I got gold venom on my teeth", hit 52.34 | deep, MS | MS, kick on 52.34 | ANGRY_KICK_198 (cut left side out of frame) - her barb glows GOLD and she strikes it across the vent like a match: the intro move done right - the flame bursts back gold-violet, bigger | venom - in gold, the only gold word of the video (sign, light, key) | flame (biggest yet) + the gold barb | cut | WOW 2: she relights from her own body |
| 34 | 52.63-54.67 | "I'm only showing up for a fee" | deep, WS | slow dolly in | NEUTRAL_CALM_021 (bust, behind a pillow rock that hides the cut bottom): the creatures crowd back into her light, closer than before | for a fee - small, on the dark water (sign) | flame | cut | the audience returns - her light is the show |
| 35 | 54.67-56.28 | "You're only showing up for the tea" | deep, MS two-shot | two-shot her + Salmon | THINK_CALM_036 raises an eyebrow ('?'): Salmon edges in holding its bucket like a teacup | tea - on the bucket (sign) | - | cut | Salmon's 'tea' - the bucket again |
| 36 | 56.28-58.98 | "I'm insane / Yeah I know you like it that way" | deep, macro arm | macro, slow track up her arm | FOCUS_PUSH_171 framed on her arm: her glowing dots turn UV-blue -> fire-violet, the colour RUNS up her arm like veins (glow colour animated) | insane - small along her arm (sign, light) | - | cut | her body takes the fire in (three pictures, not one circle - FIX 6 of review 1) |
| 37 | 58.98-60.96 | "...like it that way", hits 58.98 / 60.14 | deep, worm's eye | from the floor up, kick on both hits | FOCUS_PULL_188 (both arms up, wide stance, clean sprite) - a silhouette with a VIOLET rim; the vent behind her BODY (not her head) flares on each hit | that way - stamped on 60.14 (stamp, light) | - | cut | the build in silhouette - devil guard: violet rim, red only below the shoulders |
| 38 | 60.96-62.50 | "Chaos running wild" | deep, WS (no Raymi) | dolly along the crowd of creatures | (off screen) - the creatures' fins flare in sequence around her light like a crowd waving lighters | chaos - on the dark water (sign) | - | cut | her audience answers |
| 39 | 62.50-64.29 | "in my veins" | deep, CU face | close, slow push | SMUG_PLAY_045 (framed close), her dots fully fire-coloured, lit from below | veins (sign, light) | face | cut | the fire is in her now |
| 40 | 64.29-67.35 | "느껴봐 차갑던 이 세상을", hit 64.48 / 65.71 | deep, abyss_wide (huge) | pull out to abyss_wide | small with her flame (FOCUS_PUSH_171, why_small: the cold is the picture) - her warm island in an enormous cold blue-black | the Korean line lying on the dark water above her (sign, light, key: 차갑던) + romanisation + English | - | cut | feel it: the world was cold |
| 41 | 67.35-70.76 | "붉게 물들일 이 순간", hit 67.45 | deep, high WS | high angle (rise), small descent | HAPPY_JUMP_161 act stomp on 67.45: a red-violet ring wave spreads through the WATER from her outward; the grade crosses own -> night on its front | 붉게 - riding the wave front (sign, light, key) + romanisation + English | - | cut | WOW 3: the colour turn happens on the line (the red is used here first - FIX 5 of review 2) |
| 42 | 70.76-72.71 | "Imma start a fire" | deep, chimney forest, WS | tracking beside her (forest_track) | HAPPY_SURF_179 surfs into frame on a heat shimmer between six burning chimneys | start a fire (sign, light, key: fire) | flame (in her hand while she surfs) | whip | a new zone: the chimney forest - she rides the heat (rays ride currents) |
| 43 | 72.71-74.78 | "Oh I like a little drama" | deep, chimney forest, MS | whip-follow right, then left | HAPPY_SURF_180 slaloms between the chimneys (smear on each turn) | drama (stamp) | flame | cut | speed in the burning world |
| 44 | 74.78-76.54 | "Call the fire fighter" | deep, MS on Salmon (no Raymi) | low, kick when it sprays | (off screen) - Salmon is back with an extinguisher (escalation): it sprays... bubbles | fire fighter - in the spray bubbles (float) | - | cut | the gag escalates |
| 45 | 76.54-78.46 | "Call me crazy, call it Karma" | deep, MS on Salmon (no Raymi) | MS | (off screen) - Salmon puts the extinguisher down and warms its fins at a vent (heart icon) | karma (sign) | - | cut | the fire fighter converts |
| 46 | 78.46-80.22 | "got you burning so hot" | deep, top-down WS | top_down tracking her dash | FLY_054 dashes along the line as it burns into the floor (smear) | burning so hot - burned into the floor, huge (sign, tilt -90, light) | - | cut | the lyric IS the floor |
| 47 | 80.22-82.11 | "you'll be begging for water" | deep, floor_low | floor_low, she slides past the lens | SURF_125 (cut left edge out of frame) slides along the word 'water' on the floor | water - huge on the floor (sign, tilt -90, light, key) | - | cut | the water joke, now as a surf |
| 48 | 82.11-83.74 | "Imma start a fire" | deep, WS whip | whip to the main vent | (off screen) - the main vent flares | start a fire (stamp) | - | cut | back to where it began |
| 49 | 83.74-86.37 | "Imma fire starter" | deep, main vent, low | low angle, kick on the landing | HAPPY_JUMP_160 lands in front of the main vent (squash, settle); the vent flares ABOVE her (her head against the dark basalt body - devil guard) | fire starter - across the vent's dark body (sign, light) | flame | cut | a held landing before the hook comes back |
| 50 | 86.37-88.30 | "I'm a fire starter" (hook returns) | deep, her dip (zone 1), MS | MS, whip in | SMUG_WINK_169 in her sleeping dip, now lit: the stone ring she arranged, her knick-knacks | I'm a fire starter - crack-written around her (sign, tilt -90) | flame | whip | the intro lines come back in a burning world (one zone per line) |
| 51 | 88.30-90.10 | "Work a lil harder" | deep, main vent (zone 2), MS | MS, whip in | HAPPY_PLAY_046 (bust, framed close) blows on the flame - it doubles (callback to 14.81) | harder (stamp) | flame | whip | the same gesture, now with confidence |
| 52 | 90.10-91.47 | "Got me fired up" | deep, chimney forest (zone 3), MS | MS, whip in | HAPPY_SPIN_189 tosses the flame between two chimneys (smear) | fired up (float) | flame | whip |  |
| 53 | 91.47-93.82 | "Imma burn it down like" | deep, the giant at the back (zone 4), WS | low, tilt up to the giant 7th vent | FOCUS_CROUCH_192 small at its foot (why_small: the giant is the reveal) - on 'like' (93.6) the dark giant rumbles, its seams glow: this time something answers | like - huge on the giant's dark body (sign, light) | - | cut | the hang is answered: a new place appears |
| 54 | 93.82-95.42 | "I'm a fire starter" | deep, WS (no Raymi) | camera races along the chain | (off screen) - vents flare in sequence across the field, a chain reaction | fire starter (sign) | - | cut |  |
| 55 | 95.42-97.43 | "Crazy out of order" | deep, tracking | tracking beside her | SURF_126 (cut bottom hidden by the heat shimmer) rides the chain reaction | out of order (sign, tilt -90) | flame | cut |  |
| 56 | 97.43-98.08 | "I'm a" (1) | deep, MS, snap | snap-zoom on the hit, hold 5 frames | SIGNATURE MOVE 1: ANGRY_KICK_199 barb strike held pose (cut right side out of frame) - a vent erupts behind her body | I'm a (stamp) | flame | cut | FIX 7 of review 2: her idol move - the barb strike as a held hit pose |
| 57 | 98.08-98.35 | "I'm a" (2) | deep, MS other angle | snap from the left | SIGNATURE MOVE 2: ANGRY_KICK_198 (cut left out of frame), mirrored - vent 2 erupts on 98.36 | I'm a (stamp) | flame | cut |  |
| 58 | 98.35-100.69 | "I'm a fire starter!", hits 100.19 / 100.66 | deep, WS low | low wide, kick | SIGNATURE MOVE 3: HAPPY_JUMP_161 arms up, the biggest vent erupts behind her (beside, not behind her head) | FIRE STARTER - stamped huge (stamp, light, key: fire) | fire_word | cut | three stamps, the last biggest |
| 59 | 100.69-101.49 | "멈추지 않아" | deep, the giant (zone 4), MS | MS, kick | HAPPY_JUMP_160 act stomp lands on the rise before the giant | 멈추지 않아 (ticker on the floor, light) + romanisation + English | flame | cut | the rap starts on her landing |
| 60 | 101.49-102.46 | "월화수목금토일" (Mon-Sun) | deep, WS (no Raymi) | wide over the field | (off screen) - SEVEN chimneys light, one per syllable, left to right (vents_at), the seventh = the giant | 월화수목금토일 - one syllable lighting under each chimney (sign, light) + romanisation + English | - | cut | seven days = seven fires (the rap counted in light) |
| 61 | 102.46-104.67 | "나를 jealous / 근데 영 고갈이 안돼 / Dreamers" | deep, MS | MS, slow push | FOCUS_PUSH_173 tips her flame like a jug and pours fire onto the floor - it never empties | 고갈이 안돼 (ticker on the floor) + romanisation + English; jealous small | flame | cut | never runs dry - the jug that never empties |
| 62 | 104.67-106.32 | "0부터 100까지 / 너의 무의식까지" | deep, MS -> CU flame | push in onto the flame | FOCUS_PUSH_171: her flame grows from a spark to a pillar (0.05 -> 2 m) | 0 -> 100 (sign, light) + romanisation + English | flame (growing to ~60 %) | pass (through the flame) | 0 to 100 - the light reaches the lens |
| 63 | 106.32-107.69 | "단숨에 다 퍼져 퍼져" | deep, WS | out of the flame into a wide | small in the pillar's light (why_small); the light spreads over the field in one breath | 퍼져 (float) + romanisation + English | - | cut | spreads in one breath |
| 64 | 107.69-109.58 | "Let's go 삐걱 삐-삐걱", hits 108.67 / 109.13 / 109.58 | deep, MS | MS, 3-frame shake on each creak | WORRIED_DRAMA_024 (bust, framed close): the floor creaks, the cracks widen under her | 삐걱 - cracking into the floor per creak (stamp) + romanisation + English | - | cut | anticipation before the drop: the world compresses |
| 65 | 109.58-111.28 | "어느새 lose control", hits 110.04 / 110.46 | deep, MS | MS, push | SURPRISE_DRAMA_028 (bust): the flame in her hands balloons, she wobbles (sweat icon) | lose control (sign) | flame (too big) | cut | she loses control - on purpose of the song |
| 66 | 111.28-113.57 | "자 beat drop beat-beat drop", hits 111.41 ... 113.24 | deep, WS low | low wide, kick on every hit | SIGNATURE MOVE: HAPPY_JUMP_160 barb up - every vent erupts at once, bubble bursts rising through the water | DROP - huge on the dark water ABOVE the eruptions, never over a flame (sign, light, English words only, sub: false - the Korean 'ja' is a breath) | fire_word style key 'drop' | cut | WOW 4: the floor explodes upward |
| 67 | 113.57-115.57 | "놀아보자 얼쑤 (얼쑤!)", hits 113.71 / 115.08 | deep, MS | MS circling | HAPPY_SPIN_178 dances in the rain of sparks | 얼쑤! stamped huge on 113.71 / 115.08 - may cover her for a beat (allowed) + romanisation + English | - | cut | the festival cheer |
| 68 | 115.57-116.26 | "Ooh ooh / 불을 지펴라" | deep, the giant's mouth, MS | MS at the mouth | FOCUS_PUSH_171 touches the giant's mouth with her flame: its heat rises as a standing column | 불을 지펴라 (float) + romanisation + English | flame | cut | light the fire = start the column (replaces the high-five, FIX 6 of review 2) |
| 69 | 116.26-118.32 | "까마디 까만 이 밤하늘을 달려", hit 116.22 | deep, from below | from below looking up after her (rise) | FLY_059 (cut sides out of frame) rides the column up; marine snow streams past like stars | the Korean line trailing behind her (float, light) + romanisation + English | flame | cut | the black water above IS her night sky |
| 70 | 118.32-119.89 | "Ooh ooh / 준비됐어 난", hit 118.52 | open water, MS | beside her, rising | CALM_REST_164 rotated: lies back on the heat, eyes closed; a school of fire-finned fish catches up beside her | 준비됐어 (float) + romanisation + English | - | cut | the calm beat - her new crowd joins |
| 71 | 119.89-121.06 | "Sit back relax", hits 119.89 / 120.12 | open water, vertical whip | whip down to Salmon chasing up with the bucket, whip back up | (Salmon) / CALM_REST_164 | sit back relax (float) | - | whip | Salmon follows - comedy inside the climb |
| 72 | 121.06-123.66 | "Gonna take it / When I start the fire" | deep (cliff), WS | side, the column and the wall converging | FLY_054 swims up fast beside a sea-mount cliff that appears in her light | start the fire - in light on the cliff (sign) | - | cut | a new place the light reveals (the cliff) |
| 73 | 123.66-125.57 | "better be ready for when I take it higher", hit 123.81 | deep (cliff), from below | from below, converging up | FLY_054 small (why_small) - on 123.81 the fire climbs the cliff's cracks a step ahead of her | higher - climbing the cliff with the fire (sign, light, key) | - | cut | she races the fire up |
| 74 | 125.57-127.29 | "Ooh ooh / When I start the fire", hit 125.62 | open water, macro | macro on the snow in her light | (edge of frame) her hand and the flame passing | fire (float) | flame | cut | texture beat: speed through the snow |
| 75 | 127.29-129.78 | "better be ready for when I take that take that", hit 128.36 | deep (cliff), side tracking | tracking along the wall | FLY_054 races the climbing fire line; the light from above turns bluer | take that (stamp) | - | cut |  |
| 76 | 129.78-131.53 | "I'm insane" - the cold returns | open water, WS | wide, the streak crosses | small in the column (why_small): the cyan current hits the column from the side, it bends and thins, the fish scatter | insane - blown sideways (sign) | - | cut | the antagonist returns (FIX 2 of review 2) |
| 77 | 131.53-133.42 | "Yeah I know you like it that way", hit 132.21 | open water, MS | MS, kick on 132.21 | SHY_DRAMA_039 (bust, framed close) - her flame shrinks to a spark in her cupped hands | like it that way (sign) | flame (a spark) | cut | she could lose it |
| 78 | 133.42-134.72 | hit 133.42 | open water, MS back | behind her | WS_BK_NA_WADE_182 curls her back against the current, shielding the spark ('I'm the lighter' paid off without words) | none | - | cut |  |
| 79 | 134.72-137.94 | "Chaos running wild in my veins", hits 134.75 / 137.76 | open water, CU | close on her hands | SHY_DRAMA_039 framed on the spark: her dots flare fire-coloured as she feeds it | veins (sign, light) | flame (growing) | cut |  |
| 80 | 137.94-141.26 | "느껴봐 차갑던 이 세상을" | deep, her POV down (no Raymi) | top_down from very high (city_down) | (off screen) - far below, the whole floor glows like a city at night; the bent column straightens as a line of light up to the lens | the Korean line on the dark water between (sign, light) + romanisation + English | - | cut | the look down: what she made |
| 81 | 141.26-143.80 | "붉게 물들일 이 순간", hit 141.3 | open water -> surface, MS | from below, she rises toward the moonlit surface | HAPPY_JUMP_161: the spark catches again, bigger; the column surges; her hand breaks the surface | 붉게 (sign, light) + romanisation + English | flame | cut | relit - for the last time |
| 82 | 143.80-144.30 | STOP | nightsea, split frame | half under water, half above (split_waterline), locked | SWIM_116 (cut sides out of frame): her head breaking the surface, frozen | none (silence) | face | cut | the surface - the split frame shows both worlds |
| 83 | 144.30-145.69 | "Oh I like a little drama" | nightsea, MS | low over the water, slow push | SHOUT_WET_177 waist-deep in her violet pool (uncut - the waterline sits above her knees), fist up with the flame like a lighthouse; the column glows beneath her | drama (sign on the water, light) | flame + the pool (light source) | cut | the first open sky of the video |
| 84 | 145.69-147.84 | "Call the fire fighter" (interpolated - by ear in the pilot) | nightsea, CU | close, from just above the water | MS_HAPPY_005 (waist up, the water hides the cut bottom) grins under her own flame; ripples of violet light on her face | fire fighter (sign on the water) | face + flame | cut | her face lit by her fire above water for the first time |
| 85 | 147.84-149.24 | hits 147.84 / 148.19 / 149.19 | nightsea, WS | wide behind her | WS_BK_NA_WADE_181 back view, waist-deep: the fire-finned fish surface behind her one by one, gold dots | none | - | cut | her crowd arrives (one fish per hit) |
| 86 | 149.24-150.81 | "Call me crazy" | nightsea, MS (no Raymi) | MS at the waterline | (Salmon) surfaces with the bucket, filled with glowing water | crazy (sign on the water) | - | cut |  |
| 87 | 150.81-151.82 | "call it Karma", hit 150.81 | nightsea, CU | close | MS_HAPPY_005 laughs at Salmon | karma (stamp) | face | cut |  |
| 88 | 151.82-153.32 | "got you burning so hot", hit 153.11 | nightsea, MS two-shot | two-shot | HAPPY_SALMON_117 (cut sides / bottom hidden by water and framing) lifts her flame toward the bucket | burning so hot (sign on the water) | flame | cut |  |
| 89 | 153.32-155.40 | "you'll be begging for water", hits 153.32 / 153.79 / 154.67 | nightsea, macro | macro on the flame and the bucket's rim | (her hand) - the TOAST: flame clinks against the bucket, a spark burst on 153.32, sparks hiss on the water on 153.79 / 154.67 | water - glowing on the bucket (sign) | flame | cut | the fire fighter has joined the fire |
| 90 | 155.40-156.84 | "Imma start a fire", hits 155.41 / 156.29 | nightsea, WS | wide, crane up | small in her pool (why_small): the gold fish ring her, the moon | start a fire (sign on the water, light) | - | cut |  |
| 91 | 156.84-158.63 | "Imma fire starter" | nightsea, low WS | low over the water, circling | SWIM_116 (cut sides out of frame) swims a quick circle round the pool, the fish follow her (a ring of gold) | fire starter (sign on the water) | - | cut |  |
| 92 | 158.63-160.64 | "Imma start a fire" - the cloud | nightsea, sky (no Raymi) | tilt up to the moon | (off screen) - a dark cloud edge drifts over the moon | none | - | cut | the rain's cause, seen before the gag (FIX 6 of review 2) |
| 93 | 160.64-162.73 | "Oh I like a little drama" | nightsea, MS | MS | THINK_CALM_036 (bust in water): Salmon looks at her; she squints at the cloud and confidently predicts rain (bulb icon, finger up) | drama (sign) | - | cut | her lore: the rain predictions (wrong more often than right) |
| 94 | 162.73-163.84 | "Call the fire fighter" | nightsea, MS (no Raymi) | MS on Salmon | (Salmon) looks up at the cloud, doubtful (sweat icon) | fire fighter (sign) | - | cut |  |
| 95 | 163.84-165.02 | rain 163.84, hits 163.84 / 164.3 | nightsea, WS (no Raymi) | wide over the sea | (off screen) - it RAINS: every drop that hits the glowing sea lights a ring of violet-gold | none | - | cut | rain cannot put it out either |
| 96 | 165.02-166.43 | "call it Karma", hits 165.02 / 165.47 | nightsea, MS | MS, push | MS_HAPPY_005 looks at the camera - told you; behind her the rings join into a path of light to the horizon | karma (sign) | face | cut | for once she was right |
| 97 | 166.43-168.14 | "If you can't take the heat", hits 166.6 / 167.3 | deep, main vent (no Raymi), WS | slow dolly | (off screen) - down at the main vent: the deep-sea fish sit around it in tiny towels, steam rising | heat (float in the steam) | - | cut | the comic breath before wow 5 |
| 98 | 168.14-170.49 | "then get out of the sauna", hit 169.11 | deep, main vent, CU (no Raymi) | close on the biggest fish | (off screen) - the biggest fish with a towel on its head and a shell over each eye; on 169.11 it sighs a steam bubble | SAUNA - written in the steam (float, light, key) | - | cut |  |
| 99 | 170.49-172.50 | "Imma start a fire" - wow 5 part 1, hit 170.94 | nightsea, under the surface, MS | under water, from below | FOCUS_PULL_187 dives down a few metres and winds up (anticipation, squash) | start a fire (float) | flame | cut | the impossible thing one last time: fire under water |
| 100 | 172.50-174.27 | "Imma fire starter", hits 173.94 | nightsea, under the surface, WS | from below, the flame climbing | FOCUS_PULL_188 throws it UP (release, stretch); it climbs on a trail of bubbles, the fish stream after it | fire starter (float) | flame (rising) | cut |  |
| 101 | 174.27-176.25 | "I'm a fire starter", hits 174.38 / 175.29 / 175.54 | nightsea, WS above water | wide over the sea | (small) - the flame bursts THROUGH the surface into the sky and explodes into LETTERS: 'FIRE STARTER' written across the sky in violet-gold sparks, mirrored in the sea; two more shells burst on 175.29 / 175.54 | FIRE STARTER - firework letters in the sky (new kind: firework) | fire_word (in the sky, huge) | cut | WOW 5: fire from under the water writes the song across the sky |
| 102 | 176.25-178.33 | "Work a lil harder", hits 176.19 / 177.12 / 177.56 / 177.82 | nightsea, just under the surface | camera half under the waterline | (off screen) - shells rise from all over the glowing sea and burst through the surface on each hit, each writing | work a lil harder - firework letters (firework) | - | cut | the whole sea answers - from below |
| 103 | 178.33-179.49 | "Got me fired up", hits 178.28 / 179.4 | nightsea, tracking at the waterline | racing beside her, half under, half above | SURF_125 (cut left out of frame) surfs the path of light toward the horizon | fired up - firework letters | - | cut | a ray riding the glow (no mount) |
| 104 | 179.49-181.65 | "Imma burn it down like", 'like' 181.0, hits 180.33 / 181.23 | nightsea, WS | wide, low | small on the path (why_small) - on 'like' the whole horizon lights at once | burn it down - firework letters | - | cut | the hang is finished by the picture |
| 105 | 181.65-182.42 | "I'm a fire starter" | nightsea, sky (no Raymi) | tilt up into the letters | (off screen) - I'm a fire starter written in sparks, biggest | I'm a fire starter - firework letters | fire_word | cut |  |
| 106 | 182.42-183.72 | hits 182.42 / 183.55 | nightsea, MS | MS beside her | SURF_126 (cut bottom hidden by the spray) laughing as two shells burst above her | none | - | cut |  |
| 107 | 183.72-185.23 | "Crazy out of order", hits 183.79 / 184.92 | nightsea, low WS | low over the water ahead of her | SURF_126 rushes at the lens through the reflections | out of order (firework) | - | cut |  |
| 108 | 185.23-185.86 | "I'm a" (1), hit 185.62 | nightsea, sky | snap | (off screen) - firework 1, near | I'm a (stamp) | - | cut | the signature move as fireworks: one per 'I'm a' |
| 109 | 185.86-186.55 | "I'm a" (2), hit 186.55 | nightsea, sky | snap | (off screen) - firework 2, farther | I'm a (stamp) | - | cut |  |
| 110 | 186.55-187.46 | "I'm a fire" (3), hit 187.46 | nightsea, sky | snap | (off screen) - firework 3, farthest | fire (firework) | fire_word | cut |  |
| 111 | 187.46-188.39 | "starter!" (186.89 sung; the point lands on 187.46) | nightsea, MS | push in | MS_HAPPY_006 spins to the lens and points straight at you, laughing | starter (stamp) | face | cut | the signature move ends as 'you' |
| 112 | 188.39-191.24 | outro (quiet) | nightsea, under the surface, WS | camera sinks under the surface beside her | (her legs above) - far below, the vent field glows like a city again: where she started | none | - | cut | the place she began, seen from where she arrived |
| 113 | 191.24-192.45 | outro, hit 191.24, vocal tag 191.5 | nightsea, MS | MS low over the water | CALM_REST_164 rotated, floating on her back; a fish lights her from below | none | face | cut |  |
| 114 | 192.45-195.00 | hit 192.45, vocal tag to 193.4 | nightsea, WS | wide, still | CALM_REST_164 rotated, floating; more fish light her one at a time; the rain stops; Salmon drifts by with the bucket as a pillow | none | - | cut |  |
| 115 | 195.00-195.40 | stop | nightsea, CU | close | CALM_REST_166: she blows out the small flame in her hand like a birthday candle - the whole sea pulses ONE step brighter | none | - | cut | the fire belongs to the sea now |
| 116 | 195.40-206.46 | tail, hit 196.6 | nightsea, CU face (the cold open framing) | the SAME framing as shot 1, very slow push | SMUG_PLAY_045 (framed close) lit from below by the glowing sea, calm; on the last note SLEEP_129 - her eyes close | none | face | black (music end) | the last frame repeats the first: the promise kept (FIX 3 of review 2) |

## Density per section (picture events per beat - loud parts aim ~80 %, story 45 %, calm 10-30 %)
| section | time | beats | shots | events | events / beat |
|---|---|---|---|---|---|
| cold open + intro | 0.00-12.84 | 26 | 10 | 22 | 85 % |
| hook x2 | 12.84-27.31 | 31 | 8 | 17 | 55 % |
| chorus 1 | 27.31-41.35 | 31 | 8 | 19 | 61 % |
| Korean verse + stop | 41.35-50.40 | 20 | 5 | 9 | 45 % |
| verse + pre-chorus | 50.40-70.76 | 44 | 10 | 25 | 57 % |
| chorus 2 | 70.76-86.37 | 34 | 8 | 24 | 71 % |
| hook x2 + stamps | 86.37-100.69 | 31 | 9 | 20 | 65 % |
| rap + drop | 100.69-115.57 | 34 | 9 | 29 | 85 % |
| bridge / the rise | 115.57-143.80 | 61 | 14 | 32 | 52 % |
| stop + final chorus 1 | 143.80-158.63 | 32 | 10 | 22 | 69 % |
| final chorus 2 + sauna | 158.63-174.27 | 34 | 9 | 22 | 65 % |
| hook outro | 174.27-188.39 | 31 | 11 | 30 | 97 % |
| outro | 188.39-206.46 | 18 | 5 | 7 | 39 % |
- Cut rate: first third 35.8 shots / min, last third 32.2 shots / min (the ending is
  not weaker - the last third has the open sky, three new beats, the biggest wow and the biggest type).
- **Hit events** (`hit_events`): in the loud sections (chorus 1, the verse + pre-chorus, chorus 2, the hook + stamps,
  rap + drop, the rise, the final choruses and the hook outro) EVERY measured hit inside a shot is a scripted picture
  change - on the floor a vent flares or a crack pulse runs out from her; in the verse the creatures' fins flare; in
  the rise the fire on the cliff climbs one step (or the column pulses when the cliff is out of frame); above water a
  shell bursts or the rain rings flash. The events column counts them (1 + hits inside the shot).
- Honest count: only shots and measured hits are counted; the hits come about once per two beats, so the loud
  sections land at 57-97 %. Under the ~80 % hint on purpose: the first hook half (12.84-20.24 is the song's calm part A:
  the catch must be read), the Korean verse (the name line and the wind are held pictures), the rise's calm beat
  (118-121, "sit back relax") and the outro (the music drops to -20..-24 dB).
- Beat-level life on top (not counted): her flame flickers on every beat (`flame_beats`), the crack network breathes
  one ring outward from her on the kick in acts 3, 6 and 7 (`pulse_beats`), the marine snow pulses with the bass.

## The Short (cut from the MV shots)
Window **0.00-19.90 (19.9 s)** = shots 1-14, composition `MVShort` 1080x1920, framing per shot via `camera[].short`;
her face never sliced by the narrow frame (face guard).
| # | from-to (song) | shots used | frame 0 / hook | CTA |
|---|---|---|---|---|
| S1 | 0.00-2.95 | 1 cold open + 2 rewind | frame 0: her face big under the violet flame, bright - readable in 0.5 s; hook text 0-2.5 s (her line, 6 words, top safe area): "they said fire can't burn underwater" | - |
| S2 | 2.95-12.84 | 3, 4, 6, 7, 8-10 (the Short drops shot 5, the crack that dies, so its own crack at the end is the first) | a gag every ~2 s | - |
| S3 | 12.84-18.19 | 11-13 (the catch, the shrug, the toss) | - | "what would YOU set on fire?" from 15.0 to the end (>= 2.5 s before the end, top safe area, over the flame play where no lyric fights it) |
| S4 | 18.19-19.90 | 14 with the SHORT override: she presses her palm down early and the crack runs UP the 9:16 frame toward your thumb, stopping at the bottom edge on 'like' | the cliffhanger: "Imma burn it down like..." - the MV finishes it | CTA still on |
The Short's own twist (not in the MV): the crack runs at YOUR thumb; in the MV she only looks at the dead cracks here.

## Reuse first (studio/catalog/status.json: toki-liked / approved parts before anything new)
- **Transitions** (toki-liked): `whip` through the chimney forest, the hook montage and the rise (42, 50-52, 71), `pass` through
  the flame at 0 -> 100 (62), `cut` on the hits everywhere else; NEW use: the whip between four zones of one field.
- **Puppet animation** (toki-liked): acts pop / hop / stomp / bounce / shake, held key poses - NEW: the held barb
  strike as her signature move (56-58, 66).
- **Effects** (toki-liked): glow pulse on her dots (now animated in colour UV -> fire-violet, 2, 36, 39, 70, 79, 85, 113-114), lens passes.
- **Lyrics v2** (the studio default since 2026-10-19, with the light material fixed today): heavy weight, lit, lying
  on surfaces (tilt -90 on the floor), Korean + romanisation + English; NEW: words written by cracks, by vent bubbles,
  and fireworks in the sky.
- **`deep` set** (built 2026-10-19 for the idea boards, round 2 checked by me): cracks, chimneys with lava seams,
  eruption, marine snow, Fires - NEW zones, a 7th giant, the cliff, the current.
- **Salmon** (aquarium_props) and **Fish** (props.tsx): reused as the fire fighter and the creatures.
- **Weather / aquarium / cardtable sets**: not used (a new world, PRINCIPLES D: never copy the last package's look).

## Build list (what the studio does not have yet)
| part | kind | used in shots | status |
|---|---|---|---|
| `deep` zones: named cameras `cold_open`, `strike_close` (exists), `barb_macro`, `forest_track`, `giant_low`, `rise`, `city_down`, `cliff_side`; marks per zone | set cameras / marks | all deep shots | to build |
| `deep` 7th giant vent on a rise + `vents_at` (per-vent ignite times) + `vent_cap` (value cap so her flame stays brightest) | set | 53, 59-61, 65, 67 | to build |
| `deep` `ignite_at` reversed curve (`rewind`) | set event | 2 | to build (ignite_at exists) |
| Fires: spark burst on a strike (`sparks`), residual ember, `bend` (current), puppet anchor (barb / hand) | fire.tsx | 1-11, 27-33, 61, 76-80 | to build (Flame / Fires exist) |
| `deep` `current` (cyan streak, snow sideways, flames bend; `kill_at` = every flame out in one frame) | set event | 7, 28, 31, 75-77 | to build |
| `deep` `tint_wave` (red-violet ring through the water) + act grade switch on its front | set event + grade | 41 | to build |
| `deep` `cliff` (sea-mount wall, own crack network + ignite curve) + `column` (heat column she rides, `column_bend`) | set | 67-80 | to build |
| Props: bucket (glowing water option), extinguisher (sprays bubbles), towels + eye shells for fish | props | 6, 21-22, 35, 44-45, 86, 88-89, 97-98, 114 | to build |
| Fish: `glow_edge` (fins lit), school motion (`school_follow`), sit-around-a-vent pose | creature | 4, 23, 70, 76, 85, 90-91, 97-98, 100, 113-114 | to build (Fish exists) |
| Puppet3D: glow colour animated over time; rotate for lying / floating | move | 2, 36, 39, 70, 79, 85, 113-114 | to build (glow exists) |
| NEW set `nightsea`: starry sky, low moon, cloud edge, sea surface lit from below (pool, path), `split_waterline` camera, rain + light rings, fireworks | set | 82-116 | to build |
| grade `ember` (act 9) | grade | 83-116 | to build |
| Words3D kind `firework` (letters drawn by sparks in the sky, mirrored in the sea) | type | 101-111 | to build |
| Words3D on cracks: words lit along with the crack front (`crack` timing on tilt -90 signs) | type | 14-17, 19, 46-47, 50 | to build (tilt -90 + light exist) |
| Short: palm-press crack running UP the 9:16 frame (`short` override on shot 14) | Short | S4 | to build (short overrides exist) |

## Must be finished vs allowed fallback
- **Must be finished as written** (they carry the hook and the story): 1-2 (cold open + rewind), 11 (the catch), 19
  (wow 1), 31-33 (the stop + gold venom), 41 (the red wave), 56-58 + 66 (signature move + drop), 76-81 (the cold
  returns, relit), 82 (split frame), 99-101 (wow 5 from under water), 116 (the last frame repeats the first).
- **May fall back** without changing what the viewer understands: crack-timed words -> words that fade in with the
  section; the tint wave -> a grade dissolve in a ring-shaped wipe; the cliff -> the column alone with crack lines on
  the column's edge; firework letters -> the words as `light` signs in the sky with a burst behind them; fish school
  motion -> fish passing the lens.

## Data part and checks
- `shots.json` will hold the same 116 shots, MV window 0-206.46, Short window 0-19.9 with hook + CTA, `heroes`
  (flame: prop, face: face, fire_word: word) and per shot `hero` and `why`.
- Before the first cloud render: `python -m raymi timeline` + `node guard.mjs --summary` (cut edges, face crops, lyrics
  parked on her face, words over set props, the hero sizes) - nothing is rendered on toki's PC.
- Proposed pilot (20-40 s, with sound): **0.00-27.31** (shots 1-18: the cold open, the five failures, the catch, the
  hook) - it proves the opening toki asked for; second candidate 97.43-118.32 (signature move, rap, drop, the rise).

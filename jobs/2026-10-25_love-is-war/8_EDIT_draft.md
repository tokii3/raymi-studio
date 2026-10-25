# EDIT DRAFT - Love is War (Mwk Remix) - cuts, holds, bursts, transitions, the Short

Editor pass on 3_TREATMENT.md v3 (PASS) against the MEASURED song (song_map.json, lyrics_timed.json, plus a raw-audio
check of the stop edges at 10-25 ms: ffmpeg RMS, scratch only). No code. Film = 30 fps, 187.57 s = 5627 frames.
Brief contract (0_BRIEF.md): NOT a oner - hard cuts are wanted (reality claims: >= 20 cuts/min, no static shot > 3 s,
max 2 static shots); no lyrics on screen; flashes only as single designed hits (X2).

## 0. Rules of this edit

1. **Cut rule.** A hard cut / cover lands ONE FRAME BEFORE the sound it belongs to: cut frame = round(t * 30) - 1, so the
   impact frame sits ON the hit. "time" columns give the picture first frame; "(hit ...)" is the measured sound.
2. **A picture change** = a hard cut (C), a cover / through-a-thing cut (V), or an event (E) inside a shot (two-tone
   flash, ink slash, ring, freeze, stutter on twos, push / whip, shake). H = hold. Counts in section 8.
3. **Two hit languages stay separate.** HER blow = ink slash (full-frame diagonal, 2 frames to draw) or ping ring.
   HIS blow = lamp flash (background-only two-tone, 2 frames, she keeps her values). Large-area flashes are >= 0.9 s
   apart everywhere in this plan (X2: single hits, never a flicker).
4. **Bars.** Bar lines = every 4th beat of song_map.beats from the downbeat 62.462. Before 31.7 they are NOT an even
   1.86 s (beats 8.5-17 run 0.42-0.44 s apart, bars 1.74-1.77 s): in 9.9-31.7 cut on the listed beats, never on a
   fixed grid. From 64.32 on the grid matches the low-band beat peaks (checked 64.79 / 65.27 / 65.73).
5. **Lip sync follows the measured spans, not the treatment list:** vocal_spans = 2.6-8.6, 9.4-16.9, 23.9-28.3,
   31.7-83.4, 86.7-120, 120.8-169.7 (word onsets in vocal_onsets). Outside them her mouth is CLOSED, including the
   whole outro 169.7-187.6 (finding F7).
6. **Refs.** `raymi refs find` does not run here (PATH Python is 3.7, the repo needs 3.9+; same as the camera round).
   Ref ids are the slugs already used in the treatment / camera boards, NOT re-paired to segments: edgerunners-this-
   fffire, hsr-hope-feathers, ado-usseewa, kda-firestarter (burst class), arcane-enemy. Pair them to `refs analyze`
   segments before the cut-critic run. Ok Go "This Too Shall Pass" is the only oner in the library: used only as the
   model for continuous camera moves INSIDE the long shots (the climb, the dive), not for the cutting.

## 1. Findings from the measured audio that change the treatment (read first)

| id | what the song really does | treatment said | edit decision |
|---|---|---|---|
| F1 | A SECOND stop that song_map.stops misses: audio gone 121.94-122.62 (-52 dB), drop at 122.615. 119.9-121.94 is a DUCKED passage (-17 dB; vocal 120.81-121.81 still sings; whisper has "dai" 121.84-122.62 and "suki" ON the drop 122.62), not silence. | stop 119.9-120.4, then "120.4 final chorus downbeat, superhero landing, flash, shake" | 119.9-120.4 stays black + dot heartbeat; 120.37-121.9 she GLIDES up through the surf (rain halo) in slow motion; 121.9 freeze = second hold (0.7 s); the landing + lamp flash + shake land ON 122.6, the real drop. Add the stop to song_map (t0 121.94, t1 122.62). |
| F2 | The "silence" bar 77.44-79.34 is NOT silent: -4 to -5 dB, vocal sings 77.05-77.45 and 78.2-78.8 (three falling notes 73 / 71 / 69). | "silence by contrast: only her mouth moves" | It is a PICTURE hold against a loud track: rain, beam, ink, hair hang; her mouth + a 2 % creeping push are the only motion (so it is not a dead frame). The contrast is visual. |
| F3 | The held B5 starts 79.5 (onset 79.52) not 79.35, ends 80.5; a second held note 80.75-81.25 (m71); sung phrase ends 82.3; loudness falls -6 to -11 only between 82.0 and 82.5. | crane 79.35-80.5, storm eye from 80.5 | Crane starts on the bar line 79.30 (rises without light), the pillar IGNITES at 79.467 on the note, holds to 80.467, drops to 40 % on the m71 note. Storm-eye picture starts 80.467 while the sung tail still plays to 82.3. |
| F4 | First sound is 1.93 (inst hit 1.95, sal 30 = strongest of the intro); 0-1.92 is digital silence. | beam crosses at 0.8; "0.9-1.6 silence" | Cold open carries its own sound (section 3); the beam blade ENTERS at 0.8 and reaches the lens at 1.90 -> lamp flash ON the first transient of the music. The silence is used, not hidden. |
| F5 | Outro = a ladder of 7 pulses at half-bar spacing (0.93 s) with RISING weight: 178.21 (36), 179.14 (38), 180.07 (36), 181.02 (66), 181.95 (60), 182.88 (80), 183.83 (107). 183.83 is the largest transient of the whole song. 177.24 is a hit out of a near-silent dip (176.9-177.2 at -38 dB). | 179.14 pull-out, 181.02 turn, 182.9 stars | 177.2 stays the strongest PICTURE (beam stops); the release is scored on the ladder: every pulse is a picture event, 183.83 is the star burst (section 6). |
| F6 | Final-chorus tracker bar lines: 124.32, 126.2, 128.08, 129.96, 131.82, 133.7 ...; hits 123.809, 131.077, 139.297 (+ inst 122.903, 131.1, 139.25, 146.332, 161.332). | cuts 122.7, 124.6, 126.4, 128.3, 130.2, 131.1 | The treatment times are 0.2-0.28 s late; cuts moved to the measured bar lines / hits (4.5). |
| F7 | The vocal stem ends 169.7 (last onset 169.74). 169.7-187.6 has no voice. | she "sings the last line" at 181.02 | She looks at us with a CLOSED mouth - a silent look is stronger than a faked line. |
| F8 | Drop onset 62.615 vs tracker bar line 62.462 (0.15 s earlier). | downbeat 62.6, bars 64.32 ... | Picture hit at 62.567; bars stay on the tracker grid (the low-band beats confirm it from 64.8). If the kick phase proves different by ear, shift bars 64.30-79.30 by +0.15 s as one block. |
| F9 | Single vocal notes at midi 83 inside 55-75 phrases (67.8, 150.4, 162.5, 164.25) are probably octave glitches. Trustworthy peaks: 12.7 (m85), 38.8 (m81) and the held 79.5-80.5 B5. The lead line is an estimate (CQT). | - | Melody effects follow held vocal notes and those three peaks only. 150.4 is used as a cut cue because the singer does leap there (check by ear). |
| F10 | Intro: lead 2.0 / 2.4 / 2.65 (m90-91) then 3.0 (m95) = a rising figure; singles 4.05 / 5.7 / 7.6; vocal phrases 2.7-3.3, 4.15, 5.55-6.85 (5-note arch), 7.65. | - | Used as the picture events of the intro (4.1). |

## 2. Energy and density per section (measured -> plan)

| time | section | loud dB | energy | cuts / bar | events | holds | ref |
|---|---|---|---|---|---|---|---|
| 0-0.47 | cold open | - | shock | 2 cuts in 0.4 s | war cry + beam fragments with their own audio | black 2 frames | edgerunners-this-fffire@91.25 |
| 0.47-9.33 | intro / calm 1.62-9.87 | -12 | quiet, rising | ~0.9 | beam flash 1.90, dot per sung note, stutter 8.63-9.0 | the eye 0.47-1.9 | hsr-hope-feathers@85.25 |
| 9.33-23.9 | peak (drop 1 + instrumental) | -4 | high | 1.0 | impact 9.36 / 9.45, ribbon on held notes, ring 16.93 | - | kda-firestarter (angle per bar) |
| 23.9-31.7 | build | -5 | rising | 0.6 | pings 30 / 55 / 90 % at 24.43 / 27.26 / 29.86 | the surface approaching | - |
| 31.7-62.2 | verse 1 + pre-chorus 1 | -3.8 | mid-high, busy | 0.9 | 7 stutters, 3 lamp flashes, 4 slashes, 3 rings | - | edgerunners@75.25 |
| 62.2-62.6 | STOP | -24 | held breath | 0 | hanging drop | freeze 12 frames | hsr@112.75 |
| 62.6-77.4 | chorus 1 | -4 | max attack | 1.0 + a half-bar event | slash / flash / barb / chroma / ink line | - | ado-usseewa@98.25, hsr@108.25, kda-firestarter@26.25 |
| 77.4-79.3 | chorus bar 9 | -5 | held | 0 | 2 % push | picture hold, 1 bar | hsr@112.75 |
| 79.3-80.5 | held B5 | -6 | peak of the line | crane | pillar | - | hsr@112.75 |
| 80.5-86.3 | storm eye | -6 to -11 | the breath | 0.55 | orbit + embers | 3 slow shots | - |
| 86.3-119.9 | verse 2 + pre-chorus 2 | -4 | mid, story hits | 0.6-0.7 | 8 stutters, slashes, shards, flash, moon | the moon 3 s | edgerunners@75.25, @91.25 |
| 119.9-122.6 | STOP + duck + STOP | -17 / -52 | held, then hit | 0 | heartbeat, glide, freeze | black 0.5 s, freeze 0.7 s | hsr@112.75 |
| 122.6-169.3 | final chorus A + B | -4 to -6 | densest, long | 1.0 | flash on beam passes, slash per landing, false wins | - | kda-firestarter, edgerunners@74.25, arcane-enemy@100 |
| 169.3-177.2 | outro build | -5 to -11 pumping | tension | 0.6 | four flashes, each closer | the dip 176.9-177.2 | edgerunners@91.25 |
| 177.2-187.6 | last hit + release | -13 to -53 | peak, then fade | 0.5 | 7-pulse ladder, stars | final held look, black | hsr@112.75 |

Curve check: the last third is the densest (cuts #54-#83 = 30 cuts in 54.6 s, 122.6-177.2); the strongest picture is the
last hit; the end is never weaker than the start (start = 12 flash frames + beam; end = beam stop + star burst + black).

## 3. Cold open (0-3 s)

Hook = the two strongest pictures of the film first, then the promise (brief-keeper note taken: black at most 2 frames).

| frames / time | picture | sound |
|---|---|---|
| f0-5 (0.000-0.200) | 6 frames of the war cry from 62.567 (face large, mouth open, claws at the lens, ink bursting) | the real audio of the drop 62.615-62.8 (song material, nothing invented) |
| f6-11 (0.200-0.400) | 6 frames of the beam filling the frame from 177.2, cut one frame before the flash peak | the real audio of the hit 177.225-177.4 |
| f12-13 (0.400-0.467) | black, 2 frames | silence |
| f14 (0.467) | from below the black surface; her eye opens at 40 % of the frame height; dots flare 20 % | silence |
| 0.8 | the beam blade ENTERS the top of the frame and starts to sweep | silence (first sound is 1.93) |
| 0.9-1.9 | slow pull-back, a pulse of light races up the cable ahead of her (a continuous move, never a static frame) | silence = the hold before the song |
| 1.900 (f57) | the leading edge of the beam reaches the lens: lamp flash, background-only two-tone, 2 frames; the pulse turns white | the song starts: onset 1.93, hit 1.95 (sal 30) |
| 2.633 | her mouth opens: first sung onset 2.66 | |
| 2.967 (f89) | CUT: up-shot of the black surface, the beam crossing it (lead note 3.0, m95, the top of the rising 2.0-3.25 figure) | |

Open choice for toki / sound: sampling the two song hits is the only way the first 0.4 s has sound without inventing any.
If she rejects it, the cold open is silent and the lamp flash at 1.90 is the first sound.

## 4. The full cut list (measured times)

Legend: C hard cut, V cover / through-a-thing cut, E event inside a shot, H hold. Time = first frame of the new picture.

### 4.1 Act 1 - the call (0 - 31.7)

| # | time (hit) | type | picture / camera | cause in the music | transition |
|---|---|---|---|---|---|
| 0a | 0.000 | C | war cry fragment | - | hard start |
| 0b | 0.200 | C | beam fills frame | - | cut |
| 0c | 0.400 | C | black 2 frames | - | |
| 1 | 0.467 | C | under the surface: eye + pull-back along the cable | - | out of black |
| E | 1.900 (1.93 / 1.95) | E | beam crosses the lens: lamp flash 2 frames, the pulse races | first sound | flash |
| 2 | 2.967 (3.0) | C | up-shot of the surface, the beam crossing it | lead m95 top note | match on the beam wedge |
| E | 4.017 (4.05) | E | one dot flares high, camera nudge | lead stab m90 | - |
| 3 | 5.500 (5.55) | C | close on her face singing up toward the beam; one dot per note by pitch (5.55-6.85, arch 64 -> 78) | vocal phrase onset | continuous push-in |
| 4 | 7.533 (7.6 / 7.65) | C | pull back wide: cable and pulse | lead stab + single vocal note | - |
| E | 8.633 (8.661) | E | picture stutters on twos for the fast run 8.661-9.009 (4 hits 8.661, 8.777, 8.893, 9.009); 9.009-9.325 compress 4 frames, camera pulls back | fast run | stutter |
| 5 | 9.333 (hit 9.358) | C | HIT 1: pulse blows up the cable white-hot, background two-tone 2 frames (9.358-9.42), lunge up, shake 5 frames; low converging-cable frame (camera board C1 / A1) | hit | cut inside the flash |
| E | 9.433 (inst 9.451, sal 18, 3940 Hz) | E | second accent 3 frames later: cable white at full width, second shake kick | transient pair | - |
| 6 | 9.833 (9.85) | C | tracking medium on her hand: violet ribbon grows along the cable for the held note 9.85-11.2 (m73), rests, grows again 11.85-12.55 | held vocal notes | ribbon = melody |
| E | 12.667 (12.7) | E | ribbon whips up, dots flare to the top of the frame | m85 peak, end of the 5-note rise | - |
| 7 | 12.767 (12.8) | C | drop 1: POV along the cable, things rush at the lens | section drop | cut on the pulse |
| 8 | 13.900 (beat 13.932) | C | face close, tracking front, she sings through the ride | beat | - |
| 9 | 15.780 (beat 15.813) | V | bubbles burst across the lens, camera through them | beat | bubble cover |
| E | 16.933 (inst 16.974, sal 10) | E | ring + 3-frame shake as the vocal ends (16.9) and the instrumental drop begins | first inst hit | - |
| 10 | 17.617 (beat 17.647) | C | top-down over her | beat | - |
| 11 | 19.520 (19.551) | C | low front, the cable converging into her | beat | - |
| 12 | 21.380 (21.409) | C | side track, speed lines of varied weight, smears on her turns | beat | - |
| 13 | 23.190 (23.22) | C | up through the water toward the surface, the beam above | beat | - |
| 14 | 24.400 (hit 24.427) | C | PING 1 (30 % of frame), rings upward; vocal enters 23.9-28.3 | hit | ring = cut |
| E | 25.400 (beat 25.426) | E | section edge: camera creeps up; sidechain dips begin (25.2-28.6) | section | - |
| 15 | 27.233 (hit 27.26; lead 27.2 m71) | C | PING 2 (55 %), closer to the surface | hit | - |
| 16 | 29.833 (hit 29.861; lead 29.3 m73 before) | C | PING 3 (90 % of the frame), the surface is a ceiling | hit | - |
| 17 | 31.867 (hit 31.904; inst 31.974; vocal onset 31.9) | V | CRASH UP through the water surface into the rain; lens half under water; the cut hides in the splash | hit | water surface |

### 4.2 Act 2 - the beam (31.7 - 62.2)

| # | time (hit) | type | picture / camera | cause | transition |
|---|---|---|---|---|---|
| E | 32.633 (fast run 32.67-32.903, 3 hits) | E | rain stutters on twos | fast run | stutter |
| E | 34.267 (hits 34.296 + 34.505, 0.21 s apart) | E | double hit: two small camera shoves (wave slap); the lighthouse stays behind her, not small | double hit | - |
| 18 | 34.933 (inst 35.016 sal 12; fast run 34.783-35.155) | C | SWEEP 1, close from the water, wave crest in front; LAMP FLASH two-tone 34.967-35.03 as the beam crosses the lens | fast run + inst hit | flash |
| E | 35.667 (lead 35.7, m95) | E | beam trailing edge flickers; vocal held 35.9-36.4 | lead note | - |
| 19 | 37.600 (vocal rise onset 37.65, 5 notes m64 -> 81) | C | she lunges at the passing light; the claw rises with the pitch | vocal rise | - |
| E | 38.767 (peak m81 at 38.8) | E | INK SLASH 1 (her blow) at the melody peak, beam still passing | confirmed peak | ink |
| 20 | 40.133 (fast run 40.171-40.403, hit 40.356) | V | rain curtain crosses the lens; she pings; stutter on twos to 40.4; RING 1 runs over the water toward the rock | fast run + hit | rain cover |
| E | 41.090 (fast run 41.123-41.355) | E | camera shove, RING 2 (bigger) | fast run | - |
| E | 41.970 (hit 42.005; run 42.051-42.284) | E | camera shove, RING 3 (biggest): the three rings are an escalating burst | hit + run | - |
| 21 | 42.267 (inst 42.284 sal 13) | C | SWEEP 2 from the lighthouse side, close on her (not small), she swims hard singing | cluster end | - |
| E | 44.867 (vocal 44.9) | E | camera swings to her front (inside the shot) | phrase onset | whip |
| E | 45.817 (lead 45.85 m87) | E | beam crosses her FACE: lamp flash 2 frames | lead high note | flash |
| 22 | 46.167 (inst 46.231) | C | SWEEP 3, POV from her eye toward the lighthouse, the beam swings at us and away | beat | - |
| E | 47.07 / 47.92 | E | two small dot flares on the single notes 47.1 / 47.95 | staccato notes | - |
| 23 | 48.100 (fast run 48.135-48.39) | C | a wave lifts her, low dutch; HOOK-PUNCH + slash at the beam on the crest | fast run | - |
| E | 49.267 / 50.317 / 51.417 (lead 49.3 m93, 50.35 m95, 51.45 m95) | E | INK SLASH 2 / 3 / 4 on the three bright lead stabs (vocal 49.2, 50.05, 50.85, 51.4 under them) | lead stabs | ink |
| E | 51.633 (fast run 51.664-52.129, 5 hits; inst 51.897 sal 11) | E | rain streaks stutter on twos, beam flickers, push-in | fast run | stutter |
| 24 | 52.033 (hit 52.082) | V | she dives: the camera goes DOWN THROUGH the water surface with her | hit | water surface |
| E | 52.567 (inst 52.593 sal 11) / 54.400 (hit 54.428; inst 54.869 sal 9) | E | bubble pulse beneath her; second pulse stronger | inst / hit | - |
| 25 | 55.567 (fast run 55.612-55.89; vocal held 55.45-55.9 m62) | V | bubbles burst past the lens on the fast run | fast run | bubble cover |
| 26 | 56.800 (beat 56.819) | C | worm eye, up through the water at the sweeping beam | beat | - |
| E | 58.367 (lead held 58.4-59.2 m95; beat 58.7) | E | roll 3 deg while the beam hangs on the surface (lead = estimate, soft cue only) | lead held note | - |
| 27 | 59.000 (hit 59.025) | C | close on her eyes looking up, push-in | hit | - |
| E | 60.033 (hit 60.07) | E | second push, tighter on the eye | hit | - |
| H | 62.167 (stop 62.2-62.6) | H | FREEZE: one drop hangs in the air, her eyes open; 12 frames | stop | freeze |

### 4.3 Act 3 - the declaration (62.2 - 86.7)

Bar lines (tracker; cut = bar minus 1 frame): 64.30, 66.167, 68.033, 69.933, 71.80, 73.667, 75.533, 77.40, 79.30.
Half-bar accents (small event: ring tick / 4 % punch / dot flare, no cut) on beat 3: 65.27, 67.13, 69.01, 70.89, 72.77,
74.63, 76.51.

| # | time (hit) | type | picture / camera | cause | transition |
|---|---|---|---|---|---|
| 28 | 62.567 (onset 62.615) | V | WAR CRY into the lens, mouth OPEN, claws; ring bursts past the glass in 8 frames; ink detonates (the cut hides in the ink); chromatic split 3 frames; shake 5 frames; two-tone background | the drop | ink |
| E | 62.717 (vocal 62.75) | E | the melody line starts drawing from her mouth; red note heads at 62.75, 63.1, 63.45, 63.9, 64.45 (m62 66 69 71 73) | vocal notes | - |
| E | 63.767 (hit 63.808) | E | barb flick: tail tip crosses the lens in 4 frames; 8 % punch-in | hit | cover |
| 29 | 64.300 (beat 64.319) | C | worm eye from the water on her roar lunge, SLASH 5 | bar 2 | - |
| 30 | 66.167 | V | THROUGH the ink crown: the camera punches through the black splash to her face singing (phrase 65.3-66.65, m71 -> 66) | bar 3 | ink |
| 31 | 68.033 | C | top-down on the hook-punch toward the lens, radial rain streaks, SLASH 6 (vocal peak 67.8-68.0) | bar 4 | - |
| 32 | 69.933 | C | dutch flip (-15 to +15 deg) on the back kick, SLASH 7 (vocal arch peak 69.75) | bar 5 | - |
| 33 | 71.800 | C | macro on the claw coming at the lens (roar 1.9, chest-height lens), BARB flick; inst 70.612 / 71.332 as ticks | bar 6 | - |
| 34 | 73.667 | C | wide from behind her: the beam sweeps over both of us, LAMP FLASH 2 frames (his blow); the 13-note rising run 72.8-77.45 begins | bar 7 | flash |
| 35 | 75.533 | C | close, low: she sings into the lens, hair whipped, SLASH 8; the melody line peaks at 76.1 (m74) | bar 8 | - |
| H | 77.400 | H | PICTURE HOLD one bar (to 79.30): rain, beam, ink, hair hang; mouth moves (note 77.05-77.45, falling notes 78.2-78.8); 2 % creeping push (F2) | bar 9 | freeze |
| 36 | 79.300 | C | CRANE straight up (no light yet) | bar line | - |
| E | 79.467 (vocal 79.52, held m83 to 80.5) | E | the PILLAR ignites, a violet-white column as tall as the note; WOW 3 | held note | - |
| 37 | 80.467 | C | storm eye: rain stops, clear blue-black sky, she floats on her back (floating-back-arched, rotY away); the pillar drops to 40 % on the m71 note 80.75-81.25 and fades; slow orbit + embers lifting from her dots | note release | hard cut |
| 38 | 82.333 (phrase ends 82.3; loudness -6 -> -11) | C | top-down on her floating, the fading pillar, orbit continues | phrase end | - |
| 39 | 84.933 (beat 84.962) | C | low from the water: a wall of cloud rolls back over the sky from the horizon (the eye closes) | beat | - |
| 40 | 86.267 (hit 86.309; loudness -11 -> -4 at 86.3) | V | the black edge of the cloud wall SWEEPS across the lens = the transition into verse 2 | hit | cloud cover |

### 4.4 Act 4 - the broken megaphone (86.7 - 119.9)

| # | time (hit) | type | picture / camera | cause | transition |
|---|---|---|---|---|---|
| E | 87.033 (fast run 87.052 / 87.168 / 87.284) | E | her ping hits the rock and SHATTERS: 12 two-tone shards fly at the lens, stutter on twos over the 3 hits, shake | fast run | shards |
| 41 | 88.567 (hit 88.607; held vocal 88.3-88.75 m62) | C | she grabs the rock, low angle, rain streaks | hit | - |
| E | 89.133 (fast run 89.165-89.629, 5 hits) / 89.365 (inst 89.397 sal 12) | E | stutter on twos; her grip lands on the biggest accent: small slash | fast run | stutter |
| 42 | 91.708 (fast run 91.742-91.974; hit 91.928) | C | she climbs, camera above looking down at the surf | fast run | - |
| 43 | 93.767 (hit 93.809; inst 94.041) | C | a wave rears behind her, low and wide | hit | - |
| E | 94.533 (fast run 94.552-94.784; inst 94.552 sal 10, 94.784 sal 11) | E | WAVE SMASH: held impact pose 6 frames at 94.552 (HOLD), then smear + stutter as she is thrown back | fast run | water cover |
| E | 95.47 / 95.68 (inst 95.504, 95.713 sal 8) | E | secondary splash across the lens | inst | splash |
| 44 | 96.167 (beat 96.2; fast run 96.432-96.641, 96.641 sal 11) | C | she falls to her knees in the surf (falling-to-knees / agony); knees hit the water on 96.641 | fast run | - |
| E | 97.82 (held vocal 97.85-98.3 m59) | E | slow push, her raised hand hangs through the low held note | held note | - |
| 45 | 98.667 (inst 98.708) | V | FIST hits the water: ink slash + splash at the lens | hit | splash cover |
| 46 | 101.767 (hit 101.796; inst 101.82) | C | she stands again, rain running off her, close | hit | - |
| E | 102.48 (inst 102.516 / 102.632 sal 7) | E | hair + rain whip on the pair | inst | - |
| 47 | 103.667 (beat 103.7; vocal flat note 103.45-104.15) | C | new angle: rain running off her face, 3/4, tighter | beat | - |
| 48 | 106.133 (fast run 106.162-106.51; inst 106.278 / 106.394 sal 10; hit 106.463) | C | THE SKY CLEARS: clouds part in 30 frames, THE moon (45 % height) over the lighthouse; WOW 4; the reveal starts ON the cut, moon complete by ~107.1 | cluster | - |
| E | 106.94 (inst 106.974 sal 8) | E | she looks up, the glare lands | inst | - |
| 49 | 109.200 (inst 109.227 sal 9; held vocal 109.9-110.35) | C | low close: she glares up at it | inst | - |
| E | 110.0 (fast run 110.016-110.248) | E | rain stutters on twos | fast run | stutter |
| 50 | 110.433 (hit 110.481) | C | the beam passes over her again; LAMP FLASH 110.45-110.5 | hit | flash |
| 51 | 113.467 (hit 113.499; inst 113.429 / 113.522) | C | push-in on her eyes narrowing (continuous push to 116.8); beam flicker at 114.44 (inst 114.474 sal 10) | hit | - |
| 52 | 116.800 (lead held 116.75-117.4; vocal long fall 116.25-120.1, m62 -> 57) | C | "not crying": rain on her face; the back-of-hand wipe starts 118.667 (held vocal 118.75-119.2 m57); the glare INTO the lens locks at 119.4 (held 119.45-120.1) | phrase | - |
| 52b | 119.867 (duck edge 119.9) | C+H | BLACK; her dots do ONE heartbeat at ~120.1 (0.5 s) | duck begins | cut to black |

### 4.5 Act 5 - war (120.4 - 169.3)

| # | time (hit) | type | picture / camera | cause | transition |
|---|---|---|---|---|---|
| 53 | 120.367 | C | out of black: she LEAPS from the water in slow motion, wrapped in the rain halo, glides up the surf toward the rock; camera low, following; the ducked vocal 120.81-121.81 is sung (mouth open) | duck, voice | - |
| H | 121.900 (silence 121.94-122.62) | H | FREEZE at the apex: drops hang, the lamp dark, nothing moves for 20 frames - the second hold (F1) | silent gap | freeze |
| 54 | 122.600 (drop 122.615; inst 122.694 / 122.903 sal 12) | V | SUPERHERO LANDING on the rock (swing-backflip-to-superhero-pose 1.9) ON the drop: LAMP FLASH two-tone, shake 5 frames, ring of rain; "suki" is sung on the downbeat (whisper 122.62) | drop | flash |
| E | 122.867 (inst 122.903 sal 12) | E | second shake kick + ink slash at the landing | inst | - |
| E | 123.767 (hit 123.809) | E | her hand finds the first rung: macro punch-in + slash | hit | - |
| 55 | 124.300 (bar 124.32; section "peak" starts) | C | the LADDER from below (worm eye); one step per bar from here | bar | - |
| 56 | 126.167 (bar 126.2) | C | leap across the tower face, side track with speed lines | bar | - |
| 57 | 128.033 (bar 128.08; held vocal 127-127.5 m69 just before) | C | grabs the gallery rail, close on her hand | bar | - |
| 58 | 129.933 (bar 129.96) | C | the beam passes inches over her head: LAMP FLASH 2 frames; she vaults the rail (jumping-over-obstacle) | bar | flash |
| 59 | 131.033 (hit 131.077; inst 131.1 sal 14, 131.332 sal 10) | C | top-down: she lands on the gallery, INK SLASH on the landing, ring on 131.332 | hit | - |
| E | 131.767 (bar 131.82) | E | camera pushes toward the lamp-room door, she rises | bar | - |
| 60 | 133.267 (held vocal 133.3-133.9 m66) | C | LAMP ROOM: macro on her hand gripping the brass frame of the Fresnel lens; the grip lasts as long as the held note | held note | - |
| E | 133.667 (bar 133.7) | E | the grip tightens: ring + grain pulse | bar | - |
| 61 | 135.533 (bar 135.558) | C | the lens rings turn past the camera (glass between us and her), her face through the rings | bar | glass cover |
| 62 | 137.433 (bar 137.462) | C | top-down on the heave; the cable she followed arrives through the floor into the lamp base | bar | - |
| 63 | 139.267 (hit 139.297; inst 139.25) | C | she throws her weight: the beam sweeps round OUTSIDE, wide from the sea | hit | - |
| 64 | 141.167 (bar 141.201) | C | close on her face, effort, singing through her teeth | bar | - |
| 65 | 143.033 (bar 143.081) | C | low angle, she hangs on the frame; slow rotation | bar | - |
| E | 144.9 (bar 144.939) | E | the beam begins to swing toward the lens (the light grows) | bar | - |
| 66 | 146.300 (hit 146.332, inst sal 8) | V | FALSE WIN 1: the beam swings round and PASSES the lens in 10 frames, LAMP FLASH 2 frames, shake | hit | beam / flash |
| E | 146.787 (bar 146.82) | E | she pulls again, shake | bar | - |
| 67 | 148.667 (bar 148.70; held vocal 148.35-148.9 m66) | V | FALSE WIN 2: the beam passes the lens, closer; flash 2 frames | bar + held note | beam / flash |
| 68 | 150.367 (vocal leap at 150.4) | C | she slips; macro on her hand catching the frame (check the leap by ear, F9) | pitch leap | - |
| 69 | 152.400 (bar 152.439) | C | dutch, she climbs back onto the base | bar | - |
| 70 | 154.300 (bar 154.32) | C | she SCREAMS with the effort, mouth open (overrides lip sync), SLASH | bar | - |
| 71 | 156.167 (bar 156.201) | C | half orbit of the camera around her and the lens | bar | - |
| 72 | 158.033 (bar 158.081) | C | her dots flare violet | bar | - |
| 73 | 159.900 (bar 159.939) | C | the violet runs down her arms into the brass | bar | - |
| 74 | 161.300 (inst 161.332 sal 23, the biggest hit of the section) | V | THE DIVE: the camera plunges through the surface; every cable on the sea floor lights violet; the sea glows from below; continuous descent; at the bar 161.82 the network is fully lit from above (E) | inst hit | water surface |
| 75 | 163.633 (held vocal 162.85-163.9 m73 / m74) | C | the camera follows ONE pulse up a cable through the water; the pulse climbs one step with each held note | held notes | match on the pulse |
| 76 | 165.533 (bar 165.581; vocal climb 165.3-166.1 m71 -> 74) | C | up the tower inside the cable | bar | - |
| 77 | 167.400 (bar 167.439) | C | the pulse bursts into the lamp: the beam turns violet-gold | bar | pulse = match |

### 4.6 Act 6 - the stop (169.3 - 187.57)

| # | time (hit) | type | picture / camera | cause | transition |
|---|---|---|---|---|---|
| 78 | 169.300 (bar 169.32; last held vocal 169.15-169.65 m71) | C | the sea now hers, wide; she hangs on the lamp in the distance | bar + note | - |
| 79 | 169.767 (inst 169.784) | V | PULL 1: the violet-gold beam passes far (wide), flash 2 frames | inst | beam flash |
| E | 171.63 (inst 171.665) | E | the beam creeps back, the light grows | half-bar | - |
| 80 | 172.500 (hit 172.524) | V | PULL 2: medium-wide, beam closer, flash | hit | beam flash |
| E | 173.49 / 175.37 (inst 173.523, 175.404) | E | half-bar creeps | half-bar | - |
| 81 | 174.400 (hit 174.428) | V | PULL 3: medium, flash | hit | beam flash |
| 82 | 176.267 (hit 176.286) | V | PULL 4: close, the beam nearly on the lens; flash | hit | beam flash |
| H | 176.9-177.2 | H | THE DIP (-38 dB): the beam makes its last swing slowly, everything dims, only her silhouette and the beam | the dip | slow motion |
| 83 | 177.200 (hit 177.238; onset 177.225) | C | THE LAST HIT: the beam STOPS on the lens: white-gold 100 % for 3 frames, her silhouette, chromatic split, shake 5 frames, then a held frame | hit | white-out |
| E | 177.483 / 177.65 (inst 177.517 sal 8 / 177.679 sal 14) | E | the beam overshoots by a hair, settles (the lag of the machine, her weight) | inst pair | - |
| E | 178.167 (inst 178.213 sal 36) | E | first stars appear as specks around the beam; her dots begin to lift | pulse 1 of 7 | - |
| 84 | 179.100 (inst 179.142 sal 38) | V | PULL-OUT through the lens glass; stars streak past; the sky begins to ink | pulse 2 | glass |
| E | 180.033 (inst 180.071 / 180.489 sal 36) | E | the ink creeps over the sky (3 s: 179.1 -> 182.0) | pulses 3-4 | ink |
| 85 | 181.000 (inst 181.023 sal 66) | C | slow turn: she looks at us from the lamp, mouth CLOSED (F7) | pulse 5, first big one | - |
| E | 181.933 (inst 181.952 sal 60) | E | her dots lift as the first sparks | pulse 6 | - |
| 86 | 182.833 (inst 182.88 sal 80) | C | close on her face: the dots rise into the ink as stars | pulse 7 | - |
| E | 183.800 (inst 183.832 sal 107) | E | STAR BURST: 60-90 drawn stars flare in one pulse, the ink is complete (the biggest transient of the song) | final pulse | - |
| H | 183.8-186.47 | H | HELD LOOK: her face, the stars, a slow breathing push; the audio decays (-16 dB at 184.0 -> -53 dB at 185.5) | decay | - |
| 87 | 186.467 | C | cut to black with the audio fading out (-61 dB at 186.0, silence at 187.0); one dot pulse in the black at ~187.0 as an echo of the heartbeat at 120.1 (optional) | fade | black |

## 5. Bursts, holds, transitions - the inventories

### 5.1 Bursts (a new angle on each hit for 3-6 hits, then a held shot)

| burst | time | the hits | then |
|---|---|---|---|
| B1 first drop | 8.63 - 9.83 | stutter x4 (8.661-9.009), compress, hit 9.358, hit 9.451 | ribbon tracking (9.83 - 12.77, 2.9 s) |
| B2 verse-1 rings | 40.13 - 42.27 | 3 stutters + hits (40.356, 41.12-41.36, 42.005 + 42.05-42.28): three escalating rings | sweep 2 (42.27 - 46.17) |
| B3 declaration | 62.57 - 69.93 | war cry, barb 63.8, then a new camera on bars 2, 3, 4, 5 (64.30, 66.17, 68.03, 69.93) | macro claw 71.8, wide beam 73.67, low sing 75.53, the hold |
| B4 the fall | 93.77 - 98.67 | wave, held impact, smash, splash 95.5, knees 96.64, fist 98.67 | she stands (101.77 - 103.67) |
| B5 the landing | 122.60 - 131.33 | landing + flash, shake, rung, ladder, leap, rail, flash + vault, top-down landing with ring (6 angles) | lamp-room macro 133.27 |
| B6 the pulls | 169.77 - 177.20 | four flashes, each tighter, the dip, the last hit | held beam |
| B7 star release | 178.17 - 183.80 | the 7-pulse ladder | held look |

### 5.2 Holds (stops are stops ON the screen)

| hold | time | length | picture | audio |
|---|---|---|---|---|
| silence before the song | 0.47 - 1.90 | 1.4 s | eye + slow pull-back (moving, not frozen) | digital silence |
| STOP 1 | 62.167 - 62.567 | 12 frames | freeze: hanging drop, her eyes open | -24 dB hush (62.225-62.6) |
| bar-9 picture hold | 77.40 - 79.30 | 1.9 s | rain / beam / ink hang; mouth + a 2 % push move | loud (-5 dB): visual only |
| held B5 | 79.467 - 80.467 | 1.0 s | the pillar, held exactly as long as the note | vocal m83 |
| storm eye | 80.467 - 86.267 | 5.8 s | three slow shots (80.47, 82.33, 84.93) + orbit + embers | -6 dB fading to -11 |
| held impact pose | 94.552 | 6 frames | she is thrown back, pose held, then smear | wave hit |
| the moon | 106.133 - 109.2 | 3.1 s | wide, moon complete, slow drift | cluster, then calm |
| STOP 2a | 119.867 - 120.367 | 0.5 s | black, ONE heartbeat of her dots | ducked -17 dB |
| STOP 2b | 121.900 - 122.600 | 0.7 s | apex freeze, drops hang (F1) | silence -52 dB |
| the dip | 176.9 - 177.2 | 0.3 s | everything dims, the last swing | -38 dB |
| beam stopped | 177.2 - 178.17 | 1.0 s | white-gold, her silhouette, overshoot + settle | decay -30 dB |
| held look | 183.8 - 186.47 | 2.7 s | her face, the stars | decay |

### 5.3 Transitions through things (no digital wipes)

| through what | where | how it looks |
|---|---|---|
| the BEAM (his light) | 1.90, 34.97, 45.82, 73.67, 110.45, 129.93, 146.30, 148.67, 169.77, 172.5, 174.4, 176.27, 177.2 | lamp flash two-tone 2 frames; the cut hides in the white |
| WATER SURFACE | 31.867 (up and out), 52.033 (down in), 161.300 (the dive) | the camera passes through it; foam / splash covers the cut |
| BUBBLES | 15.78, 55.567 | burst past the lens |
| RAIN CURTAIN | 40.133 | a dense sheet crosses the lens |
| INK (her blow) | 9.36, 38.77, 49.27, 50.32, 51.42, 62.567 (crown), 66.167 (through the crown), 98.667, 122.87, 131.077, 154.3, 180.0 (sky) | full-frame diagonal brush slash; cuts hide in the black |
| CLOUD WALL | 86.267 | black cloud edge sweeps across the lens |
| SPLASH | 94.55, 98.667 | water slams the lens |
| LENS GLASS (Fresnel rings) | 135.533, 179.100 | glass between us and her; the pull-out goes THROUGH the glass |
| the pulse (match cut) | 9.33, 12.77, 163.633, 165.533, 167.4 | the same light travels from shot to shot |
| SHATTER | 87.033 | the ring cracks into 12 shards at the lens |
| black | 0.40, 119.87, 186.47 | only at stops and the end |

## 6. The strongest moment near the end

177.20 stays the strongest PICTURE (the payoff of frame 0: the beam that crossed her dark now stops on you, held by her).
Why it hits: four flashes, each tighter (169.77 wide -> 172.50 -> 174.40 -> 176.27 close), then the picture DIMS for
0.3 s into a -38 dB dip, then the transient. 3 frames of 100 % white-gold, the silhouette, chromatic split and the
5-frame shake fire together only here. The release uses the own ladder of the song: 7 pulses at 0.93 s, weight 36 -> 107,
each a picture event (specks of stars, glass pull-out, ink creep, the turn, dots lift, dots rise), and the biggest
transient (183.83) is the star burst. So the last 10 s climb in weight while the loudness fades. Then the held look and
black with the audio.

## 7. Melody effects (C4) mapped to measured notes

| effect | time | measured driver |
|---|---|---|
| dot per sung note, height by pitch | 2.66 - 8.66 | vocal onsets 2.66, 2.86, 3.03 ... (phrases 2.7-3.3, 4.15, 5.55-6.85 arch 64 -> 78, 7.65) |
| violet ribbon, as long as the note | 9.85 - 11.2, 11.85 - 12.55 | held m73 notes |
| flare to the top of the frame | 12.667 | m85 peak, end of the 5-note rise |
| ping size 30 / 55 / 90 % | 24.43, 27.26, 29.86 | hits (lead 27.2 m71 / 29.3 m73 rising under them) |
| claw rises with the pitch | 37.65 - 38.8 | 5-note rise to m81 |
| ink melody line + red heads | 62.75 - 64.7; the whole 13-note run 72.8 - 77.45 (peak 76.1) | song_map.melody.vocal notes |
| pillar as tall as the note | 79.467 - 80.467, 40 % on 80.75 - 81.25 | held m83, held m71 |
| violet pulse climbs one step per note | 163.4 - 163.9, 165.3 - 166.1 | held m73 / m74, rising notes |

## 8. Counts and checks against the brief reality claims

- Hard cuts and covers (type C and V, cold open included): 91 in 187.57 s = about 29 per minute (claim: >= 20). By act:
  act 1 (0-31.9) 20, act 2 (31.9-62.2) 10, act 3 (62.2-86.7) 13, act 4 (86.7-119.9) 13, act 5 (119.9-169.3) 25, act 6
  (169.3-187.6) 10. Events (flashes, slashes, rings, stutters, pushes) add about 80 more picture changes.
- Shot lengths: nearly all are 1.7-3.3 s. The longest: 42.27 -> 46.17 (3.9 s: a whip at 44.87 + a flash at 45.82), 48.10 ->
  52.03 (3.9 s: three slashes + a stutter), 52.03 -> 55.57 (3.5 s underwater, two bubble pulses), 143.03 -> 146.3 (3.3 s: a
  slow rotation + the beam swing). Every shot over 3 s moves and has an internal event, so static seconds should be 0.
  Intended stills: the freezes (0.4 s, 0.7 s), the bar-9 hold (1.9 s, creeping push), the held look (2.7 s, breathing
  push) - all under 3 s. The storm eye (5.8 s) is cut into three slow shots (1.9 / 2.6 / 1.3 s), each with an orbit.
- Beat response: all 29 measured hits change the picture; all 16 fast runs stutter; every bar of chorus 1 and of the final
  chorus cuts. In the drops 9.9-23.9 there are almost no measured hits (9.358 / 9.451 / 16.974), so the beats array
  carries the cuts there.
- Flashes: the closest large-area flashes are 146.30 / 148.67 (2.4 s) and 172.5 / 174.4 / 176.27 (1.9 s). At 129.93 a
  flash is followed by a slash at 131.08 (different languages). No flicker.

## 9. The Short (9:16, rendered natively, not a crop)

Window 62.167 - 80.467 (18.3 s). Audio in on the hush of the stop (-20 dB at 62.225: clean, no vocal), out on the release
of the held B5. Both edges are phrase edges (the stop; the end of the held note 80.5).

| time (song) | Short time | picture (vertical) | note |
|---|---|---|---|
| 62.167 | 0.00 | FREEZE: her eyes opening, face = 45 % of the 9:16 frame, one drop hangs; hook text in her font, upper middle, <= 8 words: "the lighthouse never looks at me." (not a lyric; toki has not yet said yes to ANY text on screen) | frame 0 readable in < 1 s |
| 62.567 | 0.40 | WAR CRY into the lens, ink, ring, melody line climbing | the hook is the stop + the cry |
| 63.767 | 1.60 | barb flick | |
| 64.300 / 66.167 / 68.033 / 69.933 / 71.80 / 73.667 / 75.533 | 2.13 / 4.00 / 5.87 / 7.77 / 9.63 / 11.50 / 13.37 | the 7 bar cuts of chorus 1, re-staged TALL (tall tower + diagonal beam for the beam shots, ink slashes only where the diagonal still reads, face always in the middle band) | a change every 1.9 s, inside the 2-4 s rule |
| 77.400 | 15.23 | the bar-9 hold; the CTA starts here: "would you look back?" (<= 8 words, her font, off the UI bands) | CTA on screen 15.23 -> 18.30 = 3.07 s, >= 2.5 s before the end |
| 79.300 | 17.13 | crane straight up (vertical is the natural format for this shot) | |
| 79.467 | 17.30 | the pillar ignites, held to 80.467 | the strongest vertical picture |
| 80.467 | 18.30 | white-out of the pillar, 2 frames; audio fade 4 frames | LOOP: the white cuts back to the frozen first frame (eyes opening out of white) |

Short = 8 cuts (62.567 ... 75.533), one hold, one crane in 18.3 s. The bar-9 hold has loud audio (F2); in the Short it
carries the CTA. Alternative out (no hard audio stop): 81.25 (end of the second held note, 19.1 s) with a 0.3 s fade, if
toki hears the fade at 80.5 as abrupt. 169.3 - 177.9 (the four pulls to the last hit) is too short for a second Short.

## 10. Open items for the caller (nothing here is decided for toki)

1. Cold open sound: song samples of the two hits (my plan) or silence - toki ear.
2. Text on screen for the Short (hook + CTA): her answer on lyrics covers lyrics only; this text is not a lyric.
   Asked in the treatment, still open.
3. Verify by listening: the 0.15 s offset between the drop (62.615) and the tracker bar (62.462) (F8), the leap at 150.4
   (F9), and whether the second high note at 81.35-81.65 is real (a second pillar flash if yes).
4. song_map.stops lacks the 121.94-122.62 stop; lyrics_timed / lip sync must treat 120.81-121.81 as sung (ducked).
5. `raymi cuts` and `raymi reality` could not run in this session (PATH Python 3.7); frames are computed by hand
   (round(t * 30) - 1). Run both on the plan before the script.
6. Dependencies unchanged from the treatment: the clips marked "to verify" (climb, vault, pull, swim, wipe) and the
   background-only two-tone test at 62.75 s must exist before the lamp flashes in this list are promised (shots #18,
   #34, #50, #54, #58, #66, #67, #79-#82).
7. Treatment times this draft moved: first picture 0.8 -> 0.467 (the beam enters at 0.8); landing 120.4 -> 122.6;
   122.7 / 124.6 / 126.4 / 128.3 / 130.2 / 131.1 -> 122.6 / 124.3 / 126.17 / 128.03 / 129.93 / 131.03; storm eye 80.5 ->
   80.467 after the pillar; 181.02 "sings the last line" -> a closed-mouth look; overshoot 177.28 -> 177.48 / 177.65.

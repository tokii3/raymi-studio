Script v2 (4_SCRIPT.md) review. The two v1 blocking faults are fixed, so the verdict is PASS. Eight notes remain, listed after the fixes.

**Row times against 8_EDIT_draft.md section 4**
Every one of the roughly 98 row boundaries matches the edit's measured cut list. I checked all of them: 0a-0c, 1 through 87, and the added rows 27H, 35H, 52b and 53H. No cut sits inside a row any more. The cut-frame rule (round(t*30)-1) is stated and applied. The five cuts that v1 flagged as wrong or unreasoned are now clean: 13.900, 15.780, 17.617, 19.52 and 21.38. The 8-12 grid also matches. Lip-sync spans match the vocal spans: closed at 17.6-23.2, closed after 169.7, and the 120.8-121.8 duck is sung.

**v1 fixes, one by one**
- **FIX 1 (two cut grids): closed.** One shot list, and the row boundaries are the edit's cuts.
- **FIX 2 (action cell carried another row's clip): mostly closed.**
  - Rows 22, 28, 37 and 85-86 are corrected.
  - Rows 74-76 are marked "no body".
  - Remaining: row 45 says "fist hits the water" but grab-and-slam is "a grab, not a ground punch" (clips_seen). Row 14 says "both arms thrown up" but casting-spell is a forward lean.
  - Rows 17 and 53 describe a burst and a leap using clips (treading-water, jump-from-wall) that do not do that. These need the translation named.
- **FIX 3 (one body action for 33 s): partly closed.** The clips now vary: pull-heavy 1.0 and 1.9, hanging, pulling-up, yelling, casting-spell, and a slip-and-catch. Still, about 14 of rows 60-83 are pull-heavy-object, and rows 79-83 (169.8-179.1) vary only the camera. Acceptable, but it is the thinnest stretch.
- **FIX 4 (silhouette mismatch): closed.** Row 0b, row 83 and the thumbnail share the same pull-heavy-object 1.9 silhouette and the same camera (h 13.7, d 6, fov 58).
- **FIX 5 (Short hook and CTA): closed.** The hook text "the lighthouse never looks at me." and the CTA "would you look back?" are in, with the CTA on screen for 3.07 s, which meets the 2.5 s rule. toki OK'd both on 2026-10-26.
- **FIX 6 (opening): closed.** Black is 2 frames. Events at 0.8, 1.2 and 1.9 fill the dark glide.
- **FIX 7 (storm eye): closed.** The lens is now d 4.5 and d 3.0, with embers and a ripple.
- **FIX 8 (halo and poses): closed.** The AIR + halo rows are named (29, 32, 53-58) and the poses are named by clip and time.

**Retell (muted)**
- A 0.2 s scream at the lens, then 0.2 s of a black silhouette on white-gold.
- Two frames of black, then her eye snaps open under the water.
- She climbs the cable toward the beam, the pulse blows up on the first hit, she reaches along the cable, and a ride follows.
- Three pings break the surface into the storm. The lamp flashes pass her, she strikes at the beam, and the war cry lands after a freeze.
- Eight bars each get a new angle. A one-bar picture hold comes next, then a crane with the pillar.
- A quiet floating breath, then the rock, the wave, the knees, the moon, a second stop and the landing.
- The tower climb and the lamp-room pull follow, then a dive, four pulls and the beam stopping on the lens.
- A look at us, the stars, and black.
- I can see all of it without the lyrics.

**Slop test:** passes. Only Raymi works for these: the cable-sense pulse, her dots lighting by pitch, the barb flick, the moon that mocks her rain call, 灯闇 as lamp against lamp, and the hanging-her-weight ending.

**Against the top three:** strong enough. It has Renai's setup-and-payoff (frame 0 returns at 177.2) and LGW's blow-per-section structure.

**OPENING:** hooks. The scream is in frame 1 and the eye opens at 0.47. The beam enters at 0.8, a pulse sparks at 1.2, and the lamp flash lands at 1.9 on the first sound. The thumbnail's silhouette is tied to row 0b, though it is only 6 frames, so the thumbnail needs that exact frame. The last third is the strongest part. The Short ends on the pillar and whites out into frame 0, which is a good loop.

**Dead stretches**
- Row 51 (113.5-116.8, 3.3 s) holds the same pose, with only a push and a flicker.
- Row 63 (d 25, tiny Raymi) is brief at 1.9 s, which is fine.
- 74-76 are 6.1 s with no Raymi. They carry the moment, so that is fine.

**Unreasoned or physical-sense notes**
- Row 62: how does a sea-floor cable enter the lamp base at y 13? A line of text should say the cable rises up the tower, as rows 74-76 imply.
- Row 71: a half-orbit at d 2.0 is outside the lantern (r 1.6), so the camera is outside the glass. Say so or move it in.
- Row 33: roar 1.9 with the lens at y 0.3. clips_seen says a lens at eye height sees only the top of her head at roar 1.9. It needs the roar 1.0 fallback.
- Row 53 starts "sings" at 120.37, but the vocal starts at 120.81.
- Row 53H is "locked-feel with drift", while 27H is called "the only locked camera". Pick one wording.

**Short:** thin only in rows 29-35. They are "re-staged tall" with no per-shot vertical camera. The hook text must hold longer than the 0.4 s freeze of 27H, and no duration is given. The Short also contains no pointer to the MV.

**Reference check:** the slugs in the ref column exist in knowledge/references/segments.json (66 matches). The edit says they were never paired to specific segments, so pair them to segments before cut-critic.

VERDICT: PASS

FIX 1
observation: Row 45 says "fist hits the water: grab-and-slam", but clips_seen records "1.0 s both arms forward, a grab, not a ground punch". Row 14 says "both arms thrown up" for casting-spell, which is a forward lean. Rows 17 and 53 describe a burst and a leap with treading-water and jump-from-wall.
effect: The builder places a pose that does not do what the cell says. The rage beat at 98.7 turns into a limp grab.
cause: The action must belong to a clip actually seen.
change: Row 45: a translation, such as the clip's forward arm drop plus the INK SLASH plus the splash cover carrying the hit. Alternatively add a key pose in vrmPoses.ts to the build list. Row 14: "casting-spell 1.9 forward lean, camera below makes it a throw up". Rows 17 and 53: name the burst as the camera plus a halo, not the clip.
priority: medium

FIX 2
observation: Rows 79-83 (169.8-179.1) and about 14 of rows 60-83 use pull-heavy-object. Rows 79-83 vary only the camera, and the final 10 s are a single action.
effect: The strongest stretch before the hit repeats one pose. The escalation is carried by the beam alone.
cause: Variety per section (PRINCIPLES).
change: Give each pull a body change: row 79 a restart at 1.0, row 80 the foot on the rail, row 81 the hanging clip, row 82 the face-lens strain. Keep that, and add a slip or a re-grip between 80 and 81 if a clip exists. Otherwise accept it as a decision.
priority: medium

FIX 3
observation: Row 33 puts the roar 1.9 lens at y 0.3, d 0.5. clips_seen says roar 1.9 bends her so low that the lens sees only the top of her head.
effect: The macro claw shot shows the top of her head. The key pose for this shot is a stand-in.
cause: The clip findings should be applied by the script itself.
change: Name roar 1.0 as the primary, and keep 1.9 only with a lens above 0.6 m. Keep the M1 key pose in the build list.
priority: medium

FIX 4
observation: Rows 29-35 of the Short have no vertical camera. The hook text has no duration beyond the 0.4 s freeze. The Short has no pointer to the MV.
effect: The Short is built later with decisions left open. The hook may vanish before it is read.
cause: Shorts rules (CLAUDE.md section 4).
change: A column "vertical set-up" for each of the 7 bar cuts. Hook text held from 0.0 to at least 1.6 s, until the barb. Add "full MV on the channel" to the upload text.
priority: medium

FIX 5
observation: Row 62 has the cable arriving through the lamp-base floor, and row 71 orbits at d 2.0, outside the 1.6 m lantern.
effect: The physical logic of the tower is unclear: the cable runs from the sea floor to y 13 and the camera is outside the glass.
cause: Sense and love, places must make physical sense.
change: One convention line: "the cable climbs the tower inside the rock and the shaft (rows 74-76)". For row 71, move the camera to d 1.4 or name the glass as a cover.
priority: low

FIX 6
observation: Row 51 (113.5-116.8, 3.3 s) is a held pose with a push and a flicker. Row 53 has her singing at 120.37 before the vocal at 120.81. Row 53H and row 27H both claim the locked camera.
effect: Small mismatches between the script and the measurements.
cause: Measured map.
change: Add one event to row 51 (a drop falls across the eyes at 115.2). Change row 53 to "closed until 120.81". Reword 53H as "4 cm/s drift, not locked".
priority: low

FIX 7
observation: The references in the ref column are slugs. The edit says they are not paired to segments.
effect: The cut-critic cannot compare against a named reference segment.
cause: Bar = professional references.
change: Before the cut-critic, pair each slug to segments.json ids and write them in the ref column.
priority: low

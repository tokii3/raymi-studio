---
name: raymi-camera
description: Use for any camera work on a Raymi video - designing shots, lenses, angles, moves, camera rides, transitions by camera, framing Raymi, a camera script, previz stills, or judging the camera of a board / render. Also what the camera-director agent loads.
---

# Camera - the lens is the viewer, and it is directed, not computed

toki's verdicts (x6, 10-22..25): "Kamerawinkel und Fahrten eher Standard", "total langweilig ... die ganze Zeit frontal
mal von oben", "kamera soll wenn möglich nie still", "sie spielt mit der Kamera", "Raymi größer im Bild, oft wirkt alles
leer", Watch Me: "die kamera ist eine einzelne fahrt". Root cause of a month of failures: the camera was RULES
(director, v3 orbit, move functions) applied to every shot - the generic look itself.

## 1. Method (in this order)
1. Read the brief contract (`0_BRIEF.md`) - which C-lines are camera lines?
2. **Find references first**: `python -m raymi refs find <terms>` (e.g. `hand_to_lens`, `low push_in`, `oner`,
   `flirt`, `burst`). Pick a reference segment for EVERY key moment. Our own videos are never the reference.
3. **Design each moment by hand** - for this bar of music, this pose, this emotion: where is the lens (height, distance,
   side), what lens (fov), how does it move, what is in the foreground, where does the eye go, how does it leave.
   Write WHY. No two neighbours alike; shot size changes on every cut.
4. **Previz**: render stills (stills.json) of the key moments and pair each with its reference
   (`python -m raymi refs pair <ref> <our still> <out>`). If ours does not look like the reference in closeness,
   angle, light and energy - redesign before anything else.
5. Only then make it data (shots.json). A camera "function" may help to build the move; it never decides it.

## 2. Craft (professional MV / anime camera)
- **Shot size is emotion**: ECU eyes / lips / hands = intimacy and intensity; CU = feeling; MS = attitude; full = the
  dance / the line of the body; wide = world and loneliness. Big dance moments need full body; a flirt needs CU / ECU.
- **Angle is power**: low (lens at hip / knee, looking up) = power, she owns us; high / overhead = vulnerable, pattern,
  "seen"; worm's eye = monumental; dutch = unease, attitude; OTS = we follow her / she turns to us; POV = we are there.
- **Lens**: wide lens (fov 55-75) CLOSE to her = drama, foreshortened hands / legs reaching at us (FIRESTARTER);
  long lens (fov 15-25) far = compression, calm, voyeur, background melts; never the same middle fov everywhere.
- **Moves with motivation**: push-in on a held note / a realisation; pull-out = reveal; orbit = she is the centre
  of the world; crane up = release / finale; whip = energy + hidden cut; tracking with her walk = momentum; handheld
  = presence; crash zoom = comic / shock hit. A move starts and ends on musical events.
- **The oner (one continuous ride)**: variety comes from distance changes (wide -> ECU -> wide), height changes, speed
  changes on the music, the performer moving TO and AWAY from the lens, foreground objects wiping across, light
  changes, whips that hide set changes. References (measured: 0 visible cuts): `feist-1234` (a ride round a performer
  singing to the lens), `okgo-this-too-shall-pass` (travel through events), `billie-party-over` (one close shot).
- **Lens play (the performer addresses the viewer)**: gaze to lens on the line, hand to the lens (fills it, can cover
  = transition), leaning in, a wink, a kiss, pointing, walking into the lens, a look back over the shoulder, ignoring
  the lens on purpose then catching it. This needs CLIPS / poses that do it - check feasibility first.
- **Fill the frame**: she (or the subject) owns the frame; empty floor and wall are never the picture.
- **Anime 3D camera** (ZZZ, HSR, Genshin, SANZIGEN): fast cuts on accents, held poses framed tight, camera shake on
  hits, smear / speed lines with the move, rack focus, dramatic perspective cheats, 2-4 frame snap zooms.
- **Transitions by camera**: whip, push through an object, her hand / hair / tail covering the lens, a flash, a match
  on shape or motion, a fall / rise through a floor.

## 2b. Measured move rules
Read `pro_rules.md` (this folder) before designing moves: snap + tail, zoom size by move length, two-push
pans, parallax ratios, whips, dives, drift; the camera THROUGH a cut is the vector law (`raymi seams <job>`).

## 3. Raymi specifics (measured, memory raymi-3d-on-screen)
Close framing: eyes ~38-40 % from the top, face centred, measured on stills (standing ~1.40 m, seated ~1.05 m).
Skin pale, never blown out in close-ups. Mouth closed when silent. Her silhouette's thin parts (fins, tail, ears) read
best in profile / 3/4 - use that.

## 4. Looking at the camera of a board / render (checklist)
- For each key moment: next to its reference - same closeness? same angle energy? same light idea? same lens play?
- Is she addressing the lens where the brief says so - in the PICTURE (hand visible, eyes in lens), not in the data?
- Shot sizes over the film: count ECU / CU / MS / full / wide - is it varied? any frontal eye-level MS streaks?
- Does the camera ever stop when it should move (or the reverse)?
- Real measurement on the video: `python -m raymi reality <job> <video>` (cuts, camera motion, her size / position).

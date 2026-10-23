# Handoff 2026-10-24 - studio fixes + lessons from the POV Shorts week (read before building / rendering)

Everything below is on `main`. Source session: the 7 POV lore Shorts (`jobs/2026-10-23_pov-*`). Pull main first.

## 1. toki's rules on the 3D Raymi (her words: `knowledge/PRINCIPLES.md` 17, `jobs/2026-10-23_pov-*/toki.md`)
- **Face centred and a little high** in close framings (eyes ~38-40 % from the top). Aim the lens a few cm BELOW
  her face centre. **Measure her head height on a stills run, never guess:** standing head centre ~1.40 m; seated
  (pose `sit`, seat 0.45 m) ~1.05 m. Sitting Mixamo clips (`sitting-*`) at full mix SINK her during the clip - carry
  a seated shot with `pose: "sit"` + the clip at `motionMix` 0.2.
- **Mouth closed when she does not speak.** Fixed in `studio/src/three/VrmPuppet.tsx` (setExpressions): emotions
  (joy, fun, angry, surprised ...) now only move brows + eyes (raw `Fcl_BRW_* / Fcl_EYE_*` keys); only the voice /
  song visemes open the mouth. Applies to MVs too.
- **Hair never flings:** every spring joint gets a damping floor (`HAIR_DRAG 0.6`, `HAIR_STIFF 1.1` in VrmPuppet).
- **No burnt / loud picture:** `python -m raymi exposure <dir|imgs>` (raymi/exposure.py) - clipped, WASHED (near-white
  colourless share of the centre, max 8 %), chroma (sat x value, not raw HSV - dark blue is not "loud"), flatness.
  It now runs on every stills board (stills.yml step summary). Fix every "washed out" before a final.
- Arms of a pose vanish under a clip at mix >= 0.3: when the pose carries the gesture (hands on ears, finger at the
  mouth, fist), keep the clip at `motionMix` <= 0.12.

## 2. New studio parts (reusable)
- **Grades** `pov` (cool) / `pov_warm` (studio/src/film/grade.ts): contrast 1.06, saturate ~1.03. The older grades push
  saturation 15-30 % - toki: "nichts uebersaturiert".
- **Depth of field** per close-up: `opts.post = {dof: <distance lens->face m>, dofRange: ~0.35 x distance, bloom: 0.3}`.
  Default bloom 0.55 is too much for close faces.
- **Camera motion blur** (Film.tsx): automatic, the 3D layer blurs along the picture's travel per frame (whips,
  lunges); `opts.motion_blur` (default 0.45) scales it, never across a cut.
- **POV / lens fx** (studio/src/film/PovFx.tsx, shot `fx`): `cover` (her hand over the lens, `gap` = eye through the
  fingers), `pov_hand` (the viewer's hand, `taps` in song s), `ripple`, `algae` (word wiped into glass film),
  `freeze` (3D world holds, desaturated), `polaroid`, `stamp` (a word in her heavy font, x/y/size/rot - keep it
  inside the frame, size <= 0.05-0.07).
- **Props on her bones**: actor key `props: [{item, at: hand_r|hand_l|head|forearm_l|forearm_r|hips, off, rot, scale}]`
  (studio/src/three/wearables.tsx: chopsticks(_slice), salmon_hood, salmon_fin, salmon_tail). Frame is built from her
  joint positions, model-independent.
- **Acting**: `act: "flatten"` (a ray squashed flat), actor key `look: <mark | [x,y,z]>` (eyes on a point), `icon` on
  actor keys (3D Raymi reaction icons, new `bubbles`). Chest dots: `opts.chest_dots` + `opts.glow_flare: [t]` - use
  only where the story needs them; in close-ups they bloom into big blobs.
- **New poses** (vrmPoses.ts, checked on the 3/4-view pose sheet `jobs/2026-10-23_pov-poses/boards`): ears_cover,
  cover_lens, lean_in, sit_eat, sit_offer, shh, fist, fist_down, ray_hand, write_glass, fins_up, fins_down, ta_da,
  point_self. Note: a pose pointing AT the lens looks like a blob from the front - judge poses from a 3/4 view.
- **Set options**: train `pair` (2 seats by the window), `glass` (see-through windows + sea behind), `lights_off` keyed;
  weather `map: "japan"` + `rain_at` (cloud with 100 %), `live` (which studio camera is on air), `podium`; bedroom
  `lamp_at`, `lit`, `window_view` (salmon outside the round window); deep: `things` (pumpkins); things kinds
  plate_sashimi, bff_drawing, glass_ray, pumpkin, beach_rock, paper_sheet, crab; salmon `press_at`, `costume: "raymi"`.
  Train / bedroom now draw creatures (salmon, school). Studio camera bodies are SOLIDS: the lens must stay >= 0.2 m
  out of them (guard refuses otherwise).
- **Talking Shorts** (kind `pov`, room.py): `shots.json` `voice: [{at, text}]` -> one edge-tts take per line
  (`python -m raymi voice-lines`, cached by text hash), `bed` (music window, ducked), `sfx` (assets/sfx, synthesised,
  `python -m raymi sfx build`), `python -m raymi mix`. Lip sync from the spoken words. Music beds: Kevin MacLeod
  (CC BY 4.0, assets/music + CREDITS.md + `<name>.map.json` from `python -m raymi bed`).
- **Timing check** `python -m raymi pov <job>`: cuts one frame before a beat/hit, take overlaps, hook/CTA stamps.
  Compute times from the maps + takes - the script-critic blocked all 7 scripts written with hand-typed times.

## 3. CI fixes (affect every render / stills run)
- `apt-get` hung for hours on 2026-10-23. `.github/ffmpeg.sh` (used by all workflows): apt with timeouts, apt again
  via archive.ubuntu.com, then a static BtbN build (johnvansickle's static build hung the tests - do not use it).
- pytest runs `timeout 600 ... -v < /dev/null` (a hang names its test).
- stills.yml publishes the stills already made when a later job fails; a talking Short mixes its sound before the
  timeline (stills copy the audio into public/).
- Deleting a `render.json` triggers a render run (the push filter sees the path) - change it, don't delete it.

## 4. Process that saved rounds
- Pose sheet first (all new poses, no clips, 3/4 view) - 1 stills run instead of 3 failed Short boards.
- Pre-push check: tsc + pytest + every timeline + `node guard.mjs <job>` before pushing to main (one TS slip cost
  a run).
- Before a final: one stills run across the whole Short, `raymi exposure` on it, look at it yourself, then render.
- Agents (toki: limit): batch critics - one script-critic call judging several jobs, one stills check, no panels.
- Windows: Python `write_text` turns LF files into CRLF - write bytes (keep the file's own line endings).

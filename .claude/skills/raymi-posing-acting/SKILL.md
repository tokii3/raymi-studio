---
name: raymi-posing-acting
description: Use when Raymi has to move, dance, pose, act, react or address the camera in a video - choreography, pose choice, clips (Mixamo / VRM / poses), self-staging, flirting with the lens, acting a story beat, or judging her motion on a board / render. Also what the choreographer agent loads.
---

# Posing and acting - she performs FOR someone

toki's verdicts: "Raymi ist steif" (clips silently never played, 10-22), "springt komisch on beat rum", "von der
End-Bewegung zur Pose flüssig übergehen, nicht als harter Cut", "raymi muss noch mehr in Szene gesetzt werden, vor
allem bei ihren stillen Posen", "permanente Selbstinszenierung ... sie flirtet und posiert und präsentiert sich der
Kamera" (Watch Me). Poses: vogueing / JoJo as inspiration - and that is a CLASS (see raymi-reading-toki).

## 1. Method
1. Brief contract: which C-lines are about her body / attitude (flirt, power, sulk, joy ...)?
2. For each moment write her ACTION as a verb with an object and a target: "reaches for the lens to cover it",
   "leans in until her face fills it", "turns her back, looks over her shoulder at us". Never "dances".
3. **Feasibility per action**: which clip / pose in `studio/catalog/clips.json` / `vrmPoses.ts` does it? Test it on the
   REAL rig in the film path (a still at the key frame). Missing -> say it at once and find a source: toki's clip
   downloads, Mixamo, free mocap (CMU, Rokoko free packs, ActorCore free), MMD motion data (check license), a pose
   built in vrmPoses with a held key, Blender keyframing. Never move the camera around a body that cannot do it.
4. References: `python -m raymi refs find pose_to_lens`, `lean_in`, `hand_to_lens`, `wink`, `flirt`, `power` ...
   (Jennie SOLO, BLACKPINK, Genshin Furina, Oshi no Ko, FIRESTARTER).

## 2. Craft
- **Silhouette first**: a pose reads if its outline reads in black. Extended, asymmetric, diagonal; limbs away from the
  body; weight on one leg (contrapposto); head angle against the shoulder line. Vogue: hands framing face, angular arms,
  dips. JoJo: twisted spine, hips one way head the other, fingers splayed, foreshortened hand to camera. Idol: finger
  heart, wink + peace, hair flip, killing-part point at the lens. Fashion editorial: chin down eyes up, hand at collar,
  shoulder to camera.
- **Pose -> hold -> snap** (anime 3D, Arc System Works): key poses held 4-12 frames on accents, fast in-betweens
  (smears), body holds while hair / cloth / tail keep moving. Fewer, stronger poses beat constant motion.
- **Flow between poses**: the end of one move IS the start of the next (anticipation -> action -> follow-through);
  never a hard jump between unrelated clips; blend with overlapping action.
- **Acting**: one clear intention per shot; the eyes lead the head, the head leads the body; a reaction needs a cause
  in the frame; small = intimate (a blink, a breath) in close-ups, big = theatre in wides.
- **Addressing the lens**: eye line exactly into the lens on the key word; the hand reaches PAST the lens plane
  (foreshortening sells it); lean-ins come with a push or a slight pull of the lens.
- **Raymi's body as language**: tail flick, ears (tako, never horns), glowing dots flaring, going flat like paper,
  burying in sand - her own gestures beat generic dance.

## 3. Judging her motion (board / render)
- Can you name her action in each shot in 3 words? Is it aimed at someone / something?
- Does any shot show her standing in an idle / T-ish / default pose? (stiff = fail)
- Are holds readable (>= 4 frames) and do they land on the music?
- Bounces, slides, floating, clipping, hair flinging - QC v2 / probe classes on the real frames.
- Is the brief's attitude (flirt / power / ...) readable from her body alone, muted, as a stranger?

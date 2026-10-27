---
name: raymi-screening
description: Use whenever stills, boards, contact sheets or a render of a Raymi video are looked at or judged - before anything is shown to toki, before a render, after a render. How to LOOK (the picture, not the code), what to check, which critics and real-video checks to run, and the gate that stops faulty work.
---

# Screening - the picture is the truth, not the code

toki 2026-10-25: "nicht der code zählt sondern das Ergebnis - nur weil per code da steht Raymi ist im Bild heißt das
nicht, dass es auch am Ende so ist ... wenn du ein Skript schreibst in dem steht eine einzige Kamerafahrt, dann müssen
die Checks das erkennen." Watch Me: 124 tests green, video "total langweilig"; look-critic BLOCK x7 and the previews
still went to her.

## 1. Order (every board / render)
1. **Real measurements of the RESULT** (never of shots.json): `python -m raymi reality <job> <video|stills dir>` -
   real cut count and times, camera motion per shot, Raymi's face / figure found in the frame (size, position,
   visible or not). Then exposure, QC v2 / probe for fault classes.
2. **Gemini watches the video** with sound (`python -m raymi gemini <mp4> --prompt @writers_room/templates/watch.md`)
   - a cheap first description of what a viewer sees; stored verbatim in reviews/.
3. **I look myself** at full size, frame by frame, with the checklist below - as a stranger, not the builder.
4. **Critics** (batched, sonnet): `brief-keeper` (toki's words + references vs the result) always; blind-viewer for
   finals; look / motion / cut as the stage needs. Each gets reference pairs (`refs pair`).
5. **Gate**: `python -m raymi gate <job> <stage>` - any BLOCK / FAIL of brief-keeper or a critic, or a reality
   contradiction of the brief contract, and nothing goes to toki. If she asks to see it anyway, it goes with the word
   FAIL and the reasons in the same message.

## 2. The looking checklist (answer each in words, per frame)
- **Is Raymi there?** Where (position in frame), how big (fraction of height), face visible? Cut off? Hidden by hair /
  props / text? Transparent, clipped, holes, broken parts?
- **How does she look?** On-model, pale skin, not burnt, not plastic, expression readable, mouth right, hair calm.
- **What does she DO?** Name the action and to whom. Stiff / default pose = fail.
- **What does the picture convey?** One sentence of feeling as a stranger. Is it the feeling the brief contract asks
  for at this moment?
- **Does it match the plan AND the reference?** Next to the reference frame: closeness, angle, light, energy, pose.
- **Is it good?** Composition, depth (fg / mg / bg), light logic, one artwork, the main element readable at phone
  size, nothing empty. Would a professional MV ship this frame?
- **The whole**: re-read the brief contract top to bottom - is the GOAL still on screen, or did the fixes eat it?

## 2b. Slop tells
`slop_tells.md` (this folder): the AI default next to what a professional does - check a sheet against it,
describe every frame in one sentence BEFORE judging, name the weakest shot. Measured: `raymi seams`, `cuts`, `reality`.

## 3. Rules that are not negotiable
- Never write or edit a critic answer; never answer a check myself ("yes, checked") - only measured values or
  independent critics count.
- Never call something done because tests / guards are green.
- A check that passed a video toki rejected is broken: recalibrate it on that video + the professional references.

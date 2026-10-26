---
name: raymi-editing
description: Use for the edit of a Raymi video - cuts, rhythm, pacing, transitions, cutting to the music (beats, hits, sections, vocals), shot order, the Short cut from the MV, slow vs fast passages, or judging the edit of a render. Also what the editor agent loads.
---

<!-- measured bar: knowledge/references/LEARNED.md "Speed" -->
# Editing - the music decides, the feeling picks

toki: "cuts wirken random" (10-22), "transitions etwas zu schnell", "Kamera soll eine Kameraführung sein auch bei
cuts oder transitions" (10-25), "der Anfang muss stark und spannend sein" (10-19). A Watch-Me brief asked for ONE ride:
then there are no cuts at all - the "edit" happens inside the camera move.

## 1. Method
1. Brief contract first (is it a oner? fast TikTok rhythm? slow and sad?).
2. Song map: `python -m raymi analyze` / song_map.json (sections, hits, stops, sung lines from the vocal stem).
   Never guess times; a cut lands one frame before the syllable / hit.
3. Section by section decide the DENSITY (cuts or picture changes per bar) from the music's energy: intro sparse,
   verse medium, pre-chorus building, chorus / drop dense, bridge breathing, final chorus densest, outro release.
4. References for each section type: `python -m raymi refs find chorus fast`, `burst`, `slow verse`, `oner`.
5. Check with `python -m raymi cuts <job>` (plan) AND `python -m raymi reality <job> <video>` (the real video).

## 2. Craft
- **Murch's rule of six**: emotion > story > rhythm > eye trace > 2D plane > 3D space. A cut that feels right beats
  one that is "correct".
- **Cut on action / on motion**: the cut hides inside a movement (a turn, a hand, a whip); match on shape / direction.
- **Picture change on loud beats**, not only cuts: a pose snap, a light flash, a camera jolt inside the shot counts.
  Dance-pop ~80 % of hits change the picture in the chorus, story songs ~45 %, calm passages 10-30 %.
- **Contrast of rhythm**: holds next to 3-6-frame accents; a pause / black / freeze before the drop; the strongest
  burst near the end; the end never weaker than the start.
- **Measured bar** (knowledge/references/LEARNED.md, 5,999 pro shots): a picture change every 0.67 s (median), 0.5 s in
  2D anime / 3D cel, 0.33-0.67 s in aggressive anime / game MVs, p90 under 2-2.7 s. Short shots move more and are
  simpler (more empty room). Compare a plan with `refs shots` numbers before the critics, never by feel.
- **Density is a structure, not a metronome** (why pass over 13 pro videos): 0.17 s flashes on fills, rolls and builds
  BEFORE the drop; in the drop held anchor shots on the big action with micro-flash inserts on the hits; a held calm
  shot right after peak chaos. A flat "one cut per beat" hits the average and misses the effect.
- **Bursts**: a new angle on every hit for 3-6 hits (FIRESTARTER 1:51, K-pop killing parts), then a held shot.
- **Transitions through things**: cover (hand / hair / tail / object over the lens), whip, flash, match cut, push
  through a surface, a morph of the set. No menu of digital wipes.
- **Cold open**: the strongest picture of the video (or its question) in 0-3 s, then back.
- **Short from the MV**: 12-20 s around the hook, starts mid-energy, loops, the comment question readable >= 2.5 s.

## 3. Judging an edit (on the REAL video)
- Cut times vs song map: early / late / random? (reality + cuts)
- Density curve per section: does it follow the music? does the last third peak?
- Any two neighbouring shots with the same size and angle? Any shot that overstays without a reason?
- Brief: if a oner was asked for, how many hard cuts does the real video have? (must be the number the brief allows)

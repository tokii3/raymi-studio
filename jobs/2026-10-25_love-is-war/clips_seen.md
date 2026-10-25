# The 36 new Mixamo clips on raymi7 - SEEN 2026-10-25 (clip sheet, boards/clips/, 3 moments each: 0.35 / 1.0 / 1.9 s)

Board: jobs/2026-10-25_love-is-war-clipsheet (VrmBoard now loads clips - before this fix a board could not show any).
Looked at by me on 6 contact sheets (scratch, not committed). Verdicts per clip, only what the pictures show.

## Reads strongly (a usable key pose in the sampled moments)
- roar - 1.0 s a forward lunge, 1.9 s wide claws toward the lens: the best "attack at the viewer" so far
- spinning-back-kick-advancing - 1.9 s a high kick, body twisted: a real strike
- hook-punch - 1.0 s the arm fully out
- casting-spell - 1.0-1.9 s a deep forward lean, both arms thrown: a power release
- spin-flip-kick - 0.35-1.0 s wind-up, 1.9 s lands on the floor (low, tail up)
- swing-backflip-to-superhero-pose - 1.9 s the superhero landing crouch (strong); 1.0 s upside down at the floor (glitchy - avoid)
- floating-back-arched, floating-legs-bent-and-arms-spread, floating-legs-raised-arms-extended-upwards - clean held
  silhouettes (beautiful moments, the storm-eye / B3 kind)
- falling-to-knees-in-prayer (1.9 s on her knees), kneeling-down (1.9 s crouched), standing-up-from-a-kneeling-position
  (0.35 s crouch -> stands) - the Weltschmerz fall and the rise work
- yelling - 1.0-1.9 s arms thrown wide, chest open (a cry, not a lunge)
- agony - 1.9 s doubled over, hands at the head (strong Weltschmerz)

## Weak at these moments (the action may sit at other times - sample again before a script uses them)
- reaching-out, angry-point, pointing-forward-1, threatening, yelling-out, taunting-throwing-arms-back,
  male-cheering-head-banging, rallying, punch-combo, jab-punch, cross-punch, boxing-taunt, great-sword-power-up,
  long-yell-leaning-forward, yelling-while-standing-leaning-forward, long-yell-while-standing-leaning-back - mostly
  near-idle or small arm moves at 0.35 / 1.0 / 1.9 s
- pushing-with-both-hands, on-knees-arms-raised, arms-spread-looking-upwards - single-frame Mixamo "poses": they hold
  one shape (on-knees: hands behind the head, reads as despair, not "arms raised")

## Broken / faults seen (fault classes, not shots)
- backflip 1.0 s: her body is gone, only the boots on the floor + a white blob - the airborne frames of flip clips
  leave the frame or are pushed into the floor (grounding vs a body upside down). Same family: kip-up 0.35 s,
  swing-backflip 1.0 s. -> airborne / upside-down clips need `ground: false` and a check before use.
- a white hot blob on the floor under her whenever her body is low (backflip, kip-up, kneeling-down 1.9, spin-flip
  1.9, swing-backflip) - a light / bloom near the floor at her body; a fault class of the rig + set light, to find
  in the shared part before a film uses low poses.
- the whole sheet: her skin and dress read strong blue-violet under this board light (set shoot, grade wm_paper,
  materialStyle routine) - not the pale grey-blue skin rule; the boards in the real film path will show if it is the
  board light or the model.

## For the brief's MISSING (F1 lens attacks)
roar (lunge + claws), the kicks and hook-punch give strikes toward the lens when she faces it; a hand reaching INTO
the lens is still not proven (reaching-out showed no reach at the sampled moments) -> second sample of reaching-out /
angry-point / pointing at 10 moments each before the script, or key poses in vrmPoses.ts.

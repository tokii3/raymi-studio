# Edit - rules from the motion-design skill packs (2026-10-27)

Adopted from free packs (sources + licences: `knowledge/skillpacks/README.md`), in our words, for a music video.
They are defaults. When one of our professional MV references (`knowledge/references`) does it differently, the
reference wins: most of these numbers were measured on launch films and motion graphics, not on anime MVs.

## 1. The grid
- Beat length in frames = 60 / BPM * 30. **Anchor the grid on beat 1 of the song map**, never on 0:00, and round
  every beat's position from the start of the song (cumulative), not beat-to-beat, or a long edit slowly drifts
  off. `song_map.json` beats are measured, so use them and do not compute them.
- **Cut on phrases** (2 / 4 / 8 beats). Cutting on every beat gets frantic; use 8th notes only for accents
  (flash frames, stabs). Structural cuts go on beats or bar lines.
- Shape the arc: establish (longest holds) -> develop (cuts every 8 -> 4 beats) -> climax (1-2 beats, the biggest
  picture ON the drop) -> resolve (one long hold). Shots getting shorter = energy rising. One pace throughout reads
  as flat, whatever is on screen. (`raymi cuts` prints monotone runs.)

## 2. The seam: the vector law (toki 10-25: "Kameraführung auch bei cuts oder transitions")
How shot A leaves decides how shot B arrives:
1. **Axis**: a lateral move answers a lateral move, a push answers a push.
2. **Direction**: never mirrored. Z counts too: A pushing in and B pulling out is a mirrored vector, and the most
   common one, because "grow from small" is the default entrance.
3. **Speed**: B starts at about the speed A left with.
4. **Phase**: cut mid-move on BOTH sides. A shot that settles to rest before the cut, or starts from rest after
   it, is a dead beat.
- One **current** per film (one dominant direction for "next"). Other vectors are reserved and mean something:
  upward = elevation / reveal, push-through = deeper into the same thought, pull-back = arrival of something bigger,
  burst outwards = leaving a world. Never two neighbouring seams in opposite directions (ping-pong).
- **A change of direction needs a visible cause**: a hit, an impact, her strike, a section edge. A force licenses
  the flip.
- **Carriers**: the eye follows objects. The strongest seam hands a thing across the cut at the same place and
  speed: her hand, her tail, a petal, a light, the lyric object. Without a carrier, the hero carries it.
- **Before animating, write the handoff row** for each designed transition: A's last frame (object, position,
  size, colour, blur, speed) | B's first frame (same fields) | carrier | cut type | frame.
- Check: `python -m raymi seams <job>` measures every hard cut from the real camera keys (carried / turned /
  mirrored / half / static). `timeline` prints the summary and warns on a mirrored seam that no hit licenses.
  In a ride, "static" and "half" seams are dead. In a hard beat burst, static cuts on the hits are a choice.

## 3. Transitions
- **The hard cut is the default.** Everything else must be motivated. Match cut (shared shape / position / motion
  vector) is the strongest designed transition. Whip: about 8 frames, the cut at peak speed, the new shot already
  moving along the same vector.
- **No crossfade between scenes.** A dissolve has no carrier and smears the beat off the grid. Fade a single
  object at most, or a one-frame double exposure.
- **The effect becomes the next scene**: the flash becomes the new ground, the ink wipe is made of her own ink,
  the bubble is the water of the next world. Build transitions out of shapes that already live in the film
  (her fins, her glow, her barb, the set's own objects), never a generic wipe. (Our `cover / ink / pass / bubbles`
  kinds are already this. Keep it that way.)
- **Hard cuts land on finished frames**: what defines the new shot is complete on its first frame. Nothing pops in
  after a sub-second cut.
- **Speed ramp into a hit**: slow down INTO the impact (100 % -> ~25 %), land the slowest frame on the beat, snap
  back to 100 % after it. A ramp without motion blur looks strobed.

## 4. Time and drama
- **Silence before the payoff, loudest on the payoff.** A 0.3-1.5 s held picture (a breath, a stop in the song)
  right before the biggest hit, then the hit. Find the stop the song already has (`song_map` stops).
- **The busiest moment is not the loudest.** The densest cutting sits just BEFORE the breath. The hit is the turn.
- **Something new every 2-4 s** (a move, a reveal, a cut, a reaction), or a designed breath with a stated reason.
  Idle wobble (breathing, floating, glow pulse) is not "something new". It reads as "the video is waiting".
- **The end is the start, changed**: return to the opening image with the difference the story made.
- Name the weakest shot after every look and what would fix it. That is the next run's to-do.

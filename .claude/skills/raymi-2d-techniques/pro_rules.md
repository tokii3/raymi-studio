# Motion timing - measured rules from the motion-design skill packs (2026-10-27)

For effects, lyric / title objects, props, FX and her body. Adopted from free packs (`knowledge/skillpacks/README.md`),
in our words. Defaults: the professional MV reference for the moment wins.

## One system per film
- **One clock**: smooth 30, or on twos for the drawn layer (her body, 2D FX: poses hold 2 frames, onsets on even
  frames) while camera and type stay smooth. 12-fps drawn things on a smooth world are fine. Mixed step rates
  inside one layer read as a bug. (Studio: VrmPuppet `step: 2`, Fx2D on twos.)
- **One blur grammar**: per-element smear, OR crisp steps (no blur, change content during fast moves), OR a real
  shutter blur. Never smear on top of shutter blur, never shutter blur on an on-twos layer (it smears held poses).
- **One accent colour with one meaning** (her glow = her feeling, never decoration).

## Durations (medians of ~4,300 professional moves, 30 fps)
| move | median | normal range |
|---|---|---|
| entry by translate / scale | 12 f | 6-24 f |
| exit by translate | 13-14 f | |
| opacity helper | 6 f | 4-12 f |
| blur resolve | 7 f | |
| whip | 8 f | |
| everything pooled | 10 f (0.33 s) | 13 % are 2-3 f snaps |
A film built on 20-30-frame ease-outs for everything is slower than every professional sample.

## Entries, exits, arrivals
- **Land decelerates, leave accelerates**: entries put most travel in the first 4-8 frames and then a long tail.
  Exits ease in and leave at peak speed (thrown away).
- **Things arrive by moving, not fading**: offset / scale / blur decaying, opacity only as a 4-6 f helper. A pure
  fade-in is the AI default.
- **Arrival from oversize**: a word or an object crashes in from ~3.5x and comes down. Nothing grows from zero.
- **Stagger**: siblings 1-3 frames apart, uneven gaps (3,2,2,2...), each move ~2x the gap so tails overlap. Whole
  words 2-5 f apart (8-12 f when the voice leads). Words land 0-2 frames BEFORE they are sung.
- **Overshoot is rare**: one visible spring per film at most. No bounce / elastic eases.
- **Anticipation on the key move only**: a 3-frame drift opposite to the travel, or a 0.1 s still before the strike.
- **Impact**: a fast squash (2 f), a slower release, the target reacts 0-1 frame later. Brightening beats a ripple
  ring. A ripple ring or white flash is not the default.
- **One repeated (held) frame inside a fast move** adds impact. 1-2 per film.

## Smear numbers (smear films)
Directional blur along the travel axis on the FIRST frame of a fast move, halving each frame over 2-4 f, plus 1-3
faint trail copies (alpha 0.22 / 0.12 / 0.06). Word arrival 8-30 px, a body / prop sweep 15-35 px, whip 3 -> 65 px
over the last 3-5 frames, a one-frame camera smear up to ~500 px. Keep the smear length at 0.5-1x of that frame's
displacement. RGB split on the first word / the hero object only, gone by frame 9.

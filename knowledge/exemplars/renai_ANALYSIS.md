> Copied 2026-10-18 from the old engine (jobs/2026-10-04_renai-circulation/ANALYSIS.md) as evidence. Paths and tool names in it refer to the old engine (tokii3/raymi-vtuber) and do not exist here; the findings are what counts.

# Renai Circulation - why v1 failed and what v2 does (2026-10-04)

toki on the live extract of v1 (manga notebook): "Raymi still looks odd and low quality, lots of empty space, made
without love, what was analysed was not implemented, a step back from the Idol pilot. Like a desk where pages fly
away, doodles, collages, homework, notes, stickers - analyse, don't copy."

## Measured (36 frames each, 480 px)
| video | saturation | colour count | edge noise |
|---|---|---|---|
| Renai v1 (manga notebook) | 0.13 | 65 | 0.118 |
| Idol pilot v4 (liked) | 0.69 | 120 | 0.057 |
| 39 Music (reference) | 0.42 | 107 | 0.030 |
| Idol v5 | 0.60 | 209 | 0.081 |
| Desk board v2 (6 stills) | 0.33 | 153 | 0.091 |
My first "empty area" metric failed (paper texture counts as content) - emptiness must be measured as missing
OBJECTS, not as low variance.

## Levels (docs/METHOD.md)
1 instance: empty pages, blotchy converted Raymi.  2 rule: one figure + text per plain page.
3 system: the language converted the hero; no richness comparison before rendering.
4 check: none compared stills with the last liked pilot; I only checked for bugs (cut edges, text on face).
5 belief: "a medium derived from the song justifies converting everything into it" - false: it threw away
  Raymi's painted quality (the brand's main asset).

## Why a desk works (analysis of the idea, not a copy of any video)
- it holds REAL images: die-cut stickers, polaroids, a phone stream -> Raymi stays painted, full quality;
- depth from overlapping paper layers + shadows -> full frames without noise;
- every material brings colour (sticky notes, washi, graph paper, kraft) on an indigo mat in her UV/cyan palette;
- text becomes picture: every lyric line lives on an object (sticky note, homework answer, phone chat);
- physical transitions carry the beat: a page flies off, a sticker slaps down, tape rips;
- shot sizes come from object sizes (huge cropped sticker <-> small sticker under a sheet <-> her face in a photo).

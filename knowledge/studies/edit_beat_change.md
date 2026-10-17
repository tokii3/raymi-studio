> Copied 2026-10-18 from the old engine (reference/analysis/EDIT_STUDY.md) as evidence. Paths and tool names in it refer to the old engine (tokii3/raymi-vtuber) and do not exist here; the findings are what counts.

# Edit study: 39 Music!, YOASOBI Idol, Reol LUVORATORRRRRY! (2026-10-03, after toki's verdict on pilot 02)

toki: "39 Music feels empty and boring. The music is fast and poppy, the original has very many cuts to the beat."
Question: what EXACTLY does the original do on the beat, and how do we measure it so QC catches it?
Tools: tools/ref_analyze.py (every cut), tools/edit_grammar.py (cuts + in-shot accents on the 16-step bar grid,
bar sheets with a frame on every beat), tools/beat_change.py (does the picture change from beat to beat?).

## 1. Where the cuts sit (hypotheses tested, most of them FALSE)

| hypothesis | test | result |
|---|---|---|
| cuts land on the beat grid | Rayleigh phase locking of cuts vs beat / 8th / 16th | refs R = 0.03-0.13 (no lock). Our old engine (Idol v5) R = 0.6-0.7 |
| cuts land on sung syllables | cuts within -80..+20 ms of a vocal onset vs random times | lift 0.98-1.08 = chance level |
| cuts land on line starts | distance to the nearest LRC line start | 8-13 % = chance level |
| cut density follows loudness | correlation cuts per bar vs loudness | 0.09-0.19 (weak) |

So "cut on the beat" is not literally what the pros do. The cut times look free; what makes it FEEL on the beat is
something else.

## 2. What actually differs: the picture changes on almost every beat

`beat_change.py` samples the frame on every tracked beat and asks: is it clearly different from the previous beat?

| video | loud bars | quiet bars | song type |
|---|---|---|---|
| 39 Music! (original) | 84 % | 54 % | dance / pop |
| Reol LUVORATORRRRRY! | 84 % | 54 % | dance / pop |
| YOASOBI Idol | 43 % | 5 % | story |
| our Idol v5 | 53 % | 0 % | story |
| Okochama Sensou | 30 % | 31 % | calm cover |
| Cat Life | 11 % | 13 % | calm |
| **our pilot 02 v2 (39 Music)** | **27 %** | 14 % | - |
| our pilot 02 v3 chorus | 66 % | | |

How the originals reach 84 % (read from the bar sheets):
- **39 Music:** the chorus is a chain of "cards": a giant word filling the frame (大熱唱, Making, Night), a different
  shot of Miku, a colour-field flip, a mascot reaction - one per beat. Cuts are only one of the tools; type slams
  and colour flips change the picture without a camera cut.
- **Reol:** only ~1 cut per bar, but 84 % change: inside one shot the text builds word by word, the camera whips,
  the colour of the background flips (magenta -> green), giant faces slide. Change != cut.
- **Idol:** 43 % - the story song changes less, but its chorus still puts a new idea on most beats (hands, heart,
  crowd, rabbit, grid of lights, stars, 生まれ変わり type) and saves one empty pink card with a tiny rabbit as contrast.
- Pre-chorus of 39 Music: few cuts, the beat is carried by LIGHT (a lens flare blooms on every beat) and slow camera.

## 3. Why my pilots missed it (the step, not the instance)

I planned shots per LYRIC LINE (one picture per line = one change per 1-2 bars). The originals plan per BEAT in loud
parts: the line is split into its words and every word or beat gets its own visual event. The question that was
missing in my process: "what is the song's energy class, and how many visual events per beat does it want?"

## 4. Turned into process + QC
- docs/DIRECTION.md step 1 asks the energy class first and sets the target (dance ~80 %, story ~45 %, calm 10-30 %).
- cohesion.py `--energy dance|story|calm` fails a video whose loud-bar change rate is outside the target.
- Planning: chorus cards are anchored to MEASURED word times (a beat-counted card list drifted 4 beats in v3a).
- Pilot 02 v3 (rebuilt this way): chorus 32 % -> 66 % change per beat, flat card fills replaced by glowing fields.

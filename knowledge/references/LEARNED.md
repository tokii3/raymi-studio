# LEARNED - the rules behind the professional references (measured, then explained)

toki 2026-10-26: "die profi videos basieren ja auch auf 'regeln', optimalen ratios, farb an passung, kontrast etc, alles
hat ja grund und wirkung" + "nicht nur farben etc sondern auch character placements, dinge wie negative space,
schnelligkeit etc jede entscheidung ... von den profis abschauen wie und warum sie diese entscheidungen treffen".

Why this exists: the Love is War storyboard was BLOCKed twice because the library had no frame for a moment. A
frame is one example; a RULE (number + reason + effect) covers every moment of its class, also the ones nobody filmed.

## The tools (raymi/principles.py, all derived numbers - no footage in git)
| command | what it gives |
|---|---|
| `python -m raymi refs learn <slug\|all>` | per-frame rules every 1 s: value split, contrast, light / dark share, two-tone, saturation, palette + harmony, where the light sits, grit, placement, negative space -> `principles/<slug>.json` |
| `python -m raymi refs shots <slug\|all>` | the video cut into picture changes (cuts + flash frames) with length, motion speed and the frame rules of each -> `principles/<slug>.shots.json` |
| `python -m raymi refs why <slug\|all>` | Gemini watches the video WITH our measured shot list: per shot the decision, why, effect, music + 8-12 director rules, verbatim -> `principles/<slug>.why.json` |
| `python -m raymi refs rules` | joins measures + why: per effect (hit, pull_in, breathe, tension, beauty, scale, speed) the measured range of the choices that produced it + examples -> `principles/rules.json` |
| `python -m raymi refs card <name> <slug@t>.. --why ".." [--skip ..]` | a principle card for a moment class from frames I LOOKED at -> `principle_cards.json` |
| `python -m raymi refs measure <our still> --card <name>` | our still's numbers + which rules of the card it breaks |

Limits (say them, never hide them): "subject" is spectral-residual saliency, a proxy - right on a figure against a
plain ground, wrong on an ECU (finds the mouth) and in busy city light; cards for close-ups switch placement off.
Picture changes count flash frames as changes (they are beat events too). Gemini's why is a first pass; a key moment
is confirmed by looking at its frames.

## Measured over 5,999 professional shots (36 videos, the 3 oners left out) - 2026-10-26
**Speed**
- Picture change every 0.67 s (median); p10 0.17 s (4 frames), p90 2.7 s. 2D anime and 3D cel 0.5 s, live action 1.0 s.
- The shorter the shot, the more it moves and the SIMPLER it is: shots < 0.25 s have motion 0.105 frame widths/s and
  54 % empty frame; shots > 2 s have motion 0.032 and 38 % empty. Why: a 4-frame shot has to be read at once - one
  shape, lots of room, the motion carries it. A long shot can hold detail because the eye has time.
- Aggressive anime / game MVs (Edgerunners, ZZZ, Heartsteel, CSM, JJK): median 0.33-0.67 s, p90 under 2 s.
  Love is War script v2 (by our rows): median 1.90 s, p90 3.07 s - about 3x slower (our in-row flashes / two-tone
  frames are extra picture changes, so the real gap is smaller; not yet measured on a render).

**Placement + negative space**
- The figure sits in the centre band (x 0.4-0.6) in 57 % of shots, near a thirds point in only 30 %. Music videos
  centre the performer (symmetry = presence, the eye does not search); thirds are for story / landscape shots.
- About 45 % of the frame is empty (flat, nothing to read) in the median shot; "even" room in 44 %, top 18 %,
  left / right 14 % each, bottom 10 %. Empty room on top = the sky / the light above presses down or lifts.
- The figure's mass is small: ~6 % of the frame by saliency (a full body in a wide shot; close-ups break the proxy).

**Value + colour**
- Low key 49 %, mid 39 %, high key only 12 %: darkness is the default ground, light is the event.
- Palettes: analogous 57 %, triad 22 %, complementary 14 %, mono 6 %. One family of hues carries a video; the
  complementary accent is rare and therefore strong.
- A quarter of the pixels strongly saturated (sat > 0.6, median 0.26) - colour is a mass, not a sprinkle.

## Principle cards (frames looked at, then measured; `principle_cards.json`)
| card | frames | the rule | effect |
|---|---|---|---|
| flood_silhouette | yoasobi-idol@186.25, frieren-op@69.25, bp-hylt@139.25 | 38-66 % of the frame near white, the figure the only dark mass, 7-12 % big, even room around | loneliness + awe; nowhere else to look |
| light_pillar | frieren-op@53.25, edgerunners-this-fffire@32.25 | one vertical column of light, centred, 62-88 % dark, figure < 9 % at its base | scale, an event from above; its length reads as time |
| star_sky | calli-gura-q@143.25 | ink black + many small white points of varied size + 1-2 cross flares, a strong diagonal object | quiet vastness; the diagonal keeps it from being wallpaper |
| lens_attack | spiderverse-across-t2@117.25, arcane-paint-town-blue@105.25 | hands flat on the lens at the frame edges / face so close the lens bends it, drawn marks over it; face centred | the fourth wall breaks; the viewer is inside and threatened |
| ecu_scream | ado-usseewa@98.25, edgerunners-this-fffire@85.25, arcane-paint-town-blue@105.25 | the open mouth fills 30-60 %, wide lens, tilted, cut by the edges, one hue + black | the blow; no room to look away |
| two_tone_hit | edgerunners-this-fffire@74.25, calli-gura-q@141.25, spiderverse-across-t2@102.25 | >= 79 % of pixels in the two extremes, black really black (p05 ~0.01), >= 37 % white, diagonal strokes | impact frame - felt before seen; a short dose on the strongest hits |
| beam_at_lens | bp-hylt@28.25 | the source swings into the lens, centre flares to white with rays + dust | blinding = an invisible cut |

First use (2026-10-26): our board test `two_tone_cry_on.jpg` measured against two_tone_hit -> black p05 0.07 (navy,
not ink), light 28 % (< 37 %), two-tone 0.66 (< 0.79). The eye agrees: it reads soft, not like a blow.

## Effect rules from the why pass (13 of 39 videos, 879 classified shots; the rest hit the free Gemini quota 2026-10-26)
Per effect the measured choices that produced it (median; `principles/rules.json` has p10 / p90 and examples):
| effect | shots | shot length | motion | empty room | dark share | key | what it means |
|---|---|---|---|---|---|---|---|
| hit | 202 | 0.33 s (0.17-1.65) | 0.075 | 46 % | 39 % | low 58 % | short, moving, mostly dark - the blow is brief |
| speed | 143 | 0.5 s | 0.079 | 42 % | 42 % | low 56 % | the most motion |
| tension | 132 | 0.83 s | 0.024 | 47 % | 51 % | low 63 % | the darkest and emptiest, almost still - dread is waiting |
| pull_in | 100 | 1.0 s | 0.036 | 39 % | 38 % | low 63 % | held longer, less empty: the face fills it |
| breathe | 131 | 1.17 s | 0.026 | 39 % | 43 % | low 58 % | slow; the room often on top (sky) |
| scale | 99 | 1.33 s | 0.05 | 38 % | 43 % | low 62 % | the empty room mostly on the LEFT (29 vs 8 right) |
| beauty | 72 | 1.6 s (0.5-3.7) | 0.068 | 36 % | 38 % | low 54 % | the longest holds - beauty needs time |

**Director rules that recur across videos (each video's own list in rules.json):**
- **Contrast, not a metronome**: 0.17 s flash / micro-cuts on drum fills, snare rolls, 16th fills and builds BEFORE a
  drop (Ado SHOW, Ado Usseewa, aespa, Calli/Gura, CSM ED1, Arcane, Genshin, Edgerunners) - and in the drop itself held
  anchor shots on the big action (aespa 4-12 s, Ado 9-14 s, CSM > 1 s, Calli combat 2+ s), with micro-flash inserts
  slammed into them on the hits (Arcane, JJK). The average lands near 0.5 s, the structure is hold + flash.
- **Pre-drop blackout / flash**: near-black negative space with one small light for ~1.5 s before a major drop (Ado
  SHOW 124, 173), or a 0.15 s white flash frame right before it (Ado Usseewa 95.85, 118.8).
- **A held calm shot right after peak chaos** (CSM ED1 > 2 s) - the blow needs a place to land.
- **Centre the performer in fast cuts** (Arcane Paint 0.45-0.55) so the eye never searches; off-centre (0.2-0.35 /
  0.65-0.8) for reflective vocal passages (CSM ED1, Ado SHOW).
- **Colour worlds flip with the music's sections** (Ado Usseewa blue verses -> red choruses, bp-hylt per section,
  Arcane warm past / cold present).
- **Scale**: a tiny figure (< 5 %) against a huge light thing (moon, rocket, city) on vocal climaxes (Edgerunners,
  aespa).
- **ECU of eyes / bared teeth on vocal drops** (Ado Usseewa 51, 70.5; Edgerunners eye reflections; Arcane step-zooms
  into eyes before transitions).

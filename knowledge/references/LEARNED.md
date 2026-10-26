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

## Effect rules from the why pass
(filled from `principles/rules.json` once `refs why all` has run - see below)

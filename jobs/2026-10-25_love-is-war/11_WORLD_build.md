# 11_WORLD_build - ONE painted 2D world around the 3D Raymi (build spec, look-designer)

Why: toki X5 "eher richtung 2" + "immer noch plastik look, komisch belichtet". Brief core: immersive (layers fly past the lens), aggressive/raw (hard edges, grit, hatching), beautiful (calm indigo masses, one hot accent). Nothing lit: every layer = CanvasTexture drawn in code on a plane/card, MeshBasicMaterial (toneMapped false), flat value shapes. Only Raymi is lit (section 4). Depth = z behind her (she is at 0, lens looks toward -z, lighthouse at (-8,-30)).

## 0. The one hand (applies to every layer)
- Palette family "storm indigo" (layers pick 3 of these + one accent):
  INK #070b1c | DEEP #12183a | MID #26327a | LIGHT #5a6cc0 | MIST #aab6ec | PAPER #dfe6ff. Warm accent (one per shot): LAMP #ffd9a0 / core #fff0cd. Cold accent: BOLT #e8f0ff. Her violet #9b5cff only on her dots and a 1.5 % rim. Deep: signal cyan #5ef2ff (accent only).
- Paper grain (same everywhere): one shared 512 px tileable noise canvas at 2 scales (fibre 1 px, blotch 24 px), 6 % luma, anchored to the card (not the screen). Film grain 0.05 sits on top. Gradients are banded (posterised to the steps listed) with hatch-dither on band edges.
- Line weight (same everywhere): contour 3 px at 1080p on near cards, 2 px mid, 1.5 px far; colour INK (never #000), edge wobbled 1-2 px by low-freq noise. Hatching: parallel strokes 2 px wide, spacing 6 px, angle 35 deg in shade, one direction in the whole world.
- Hard edges only; the only soft things are mist cards and her glow. No specular dots; bloom only on lamp / bolt / dots.
- Depth rule: near = darker, heavier line, more contrast; far = hazier (value pulled 20-60 % toward DEEP/MID). A vertical strip must change in value with depth.
- Build as ONE helper PaintedLayer(spec): canvas 1024-2048, seeded RNG so every render is identical.

## 1. Layer table - nightsea
| layer | what | depth | palette (3 + accent) | technique (code) | motion |
|---|---|---|---|---|---|
| Storm sky | huge back card, 120 deg slice | -150 | INK, DEEP, MID; accent BOLT | 5 horizontal value bands, torn edges (noise); horizon glow = MID->LIGHT band 6 % of frame height (kills the hard line); dry-brush streaks 8 px, 15 % alpha | none; bolt = swap to a second canvas for 2 frames |
| Cloud wall A (far) | flat mass, silhouette | -110 | DEEP, MID, LIGHT rim | polygon from stacked circles (cauliflower edge), 3 flat steps, hatch in lowest step, 2 px contour | drifts 0.4 m/s |
| Cloud wall B (mid) | darker, bigger, lower | -60 | INK, DEEP, MID | belly flat INK, lit edge strip only on the lightning side | drifts 1 m/s; belly blocks flash |
| Cloud wall C (rolls in) | 3 cards, 60 m wide shelf cloud, hard front edge | -90 -> -14 over 30 s (shots 17-26) | INK, DEEP, LIGHT edge | scallop front edge 3 px contour, hatched underside | rolls 2.5 m/s, scale 1.0->1.3, one value step darker on arrival; rain heavier with it |
| Moon (one shot) | disc 45 % of frame height, clear of the tower | -140 | PAPER, MIST, MID | 3 flat steps (crescent shade, crater ovals hatched), limb contour 3 px, glow = 2 banded rings 10 % alpha, no gradient | static; cloud B drifts over its lower third |
| Waves far | 3 ridge rows | -80 / -50 / -30 | DEEP, MID, LIGHT crest | sawtooth-rounded polygons, 3 steps (trough INK, face DEEP, crest MID), foam = ragged short dashes MIST 70 % | bob 0.25 m, phase-offset rows, slide 0.5/0.8/1.2 m/s |
| Waves mid | readable swells | -14 / -8 | INK, MID, LIGHT + PAPER foam | foam = tapered dry-brush stroke with gaps, foam tongue as hatch lines down the face, 2.5 px INK contour on trough side | bob 0.4 m / 4 s; shoves at 34.27, 34.5 |
| Waves near | 2 low cards at the frame edge | -2.5 / -1.2 | INK, MID, MIST foam edge | almost pure INK silhouette with ragged foam edge; foreground cover in the bottom corners, never across her face | bob 0.15 m; fast slide in sweeps |
| Surf / foam around her | collar at waterline, 3 cards (flat + 2 standing ripples) | 0 to -0.6 | PAPER, MIST, DEEP | broken foam strokes hugging her chest outline, ragged inner edge, lumps = blob polygons with 1 hatch step, thin INK gap = contact; spray = 12 flat drops with one white fleck | rings expand 0.3 m/s, fade 1.2 s, re-spawn on each hit |
| Rain near | 25 streaks | -0.5..-3 | MIST 60 %, PAPER core | tapered quads 2.4 % of frame height | 14 m/s, 12 deg; wraps at the lens edge, never over the face |
| Rain mid | 120 streaks | -3..-12 | LIGHT 45 % | 1.2 % height, 2 px | 9 m/s |
| Rain far | one scrolling hatch sheet | -12..-40 | MID 30 % | 0.5 % height, 1 px dense hatch | 5 m/s; sinks into horizon band; stutter on twos in fast runs |
| Lighthouse tower | tall card, trapezoid perspective, 12 m | -30 (x -8) | MIST/PAPER, DEEP shade; red stripe #8a1c32 accent | 3 steps (lit, shade, stripe cast shade), plaster = horizontal hatch 6 px, window slits INK, contour 2 px far / 3 px near, lit edge on moon side | none; in the flash a pure INK silhouette on BOLT |
| Rock | wall card + base, top y 2.0 | -30 | INK, DEEP, MID facet edge | 5-7 flat shard facets, crack lines, barnacle dots low, foam collar at foot (same recipe) | collar pulses 0.5 Hz |
| Ladder | rails + rungs to ledge (-5.5,-27) | -27 | INK, MID edge | 2 rails + 6 px rungs, wobbled contour, rust dabs in MID | none |
| Beam | 3 flat wedge cards, no volume | from y 13.7 | LAMP core, #ffe9bd, #ffb860 30 % | hard-edged banded wedges; rain and dust specks lighter ONLY inside the wedge mask; one value step per 12 m | yaw sweep; crossing the lens = 2-frame two-tone flash |

## 2. Lantern room at her scale (shots 41-83)
| layer | what | depth | palette | technique | motion |
|---|---|---|---|---|---|
| Gallery floor + rail | disc y 12.38 r 2.6, rail 1.1 m | at her | INK, DEEP, MID top edge | radial plank hatch, 2 rails + balusters, 3 px contour, rust dabs | none |
| Lantern glass | 4 vertical cards, r 1.6, y 12.9-15.3 | around her | MIST glints 20 %, INK mullions | transparent card with 6-8 diagonal highlight strokes (2 widths), outside rain drips as hatched streaks | drips run down 1 m/s |
| Brass frame | ring y 13.4 + mullions to roof | at her | #6b4a1c, lit #d9a24a, shade #2a1a0c, accent LAMP glint | flat 3 steps, hammered texture = short random hatch ticks, rivets = 3 px ovals with a dark crescent, 3 px INK contour (drawn metal, not a tube) | lamp flicker moves the lit step +/-1 |
| Lamp | y 13.7 | at her | LAMP core, #fff0cd, white | disc, 3 concentric flat rings, 8-12 hard radial spikes | breathes 4 %; whiteout on the hit |
| Fresnel as painted glass | 6-9 concentric prism rings, card 0.3-0.8 m in front of her + a smaller one behind | between lens and her | MIST 30 %, PAPER lines, LAMP streaks | ring strokes 1-6 px, banded, broken arcs, ragged, 1.5 px contour; no rainbow | rotates 6 deg/s so highlights slide; brightens one step on the sweep |

## 3. Deep (shots 1-16, 74-76)
| layer | what | depth | palette | technique | motion |
|---|---|---|---|---|---|
| Surface ceiling (y 40) | big card seen from below, carries the beam | +40 | INK, DEEP, MID; beam LAMP; glints PAPER | concentric ripple polygons (3 steps), caustic web = broken light lines in banded cells, beam enters as a hard wedge with the same 3 shells + dapple spots | ripples drift 0.3 m/s; beam sweeps across; ping rings pulse through it |
| Floor + far haze | 2 cards | -20 / -45 | INK, #0b1230, #1c2a5c | silt bands, pebble blobs; far card lighter | none |
| Cable | stacked ring cards along z, x 0 y 0.1 | at her | #15161f, #0a0c18, edge #3a4a68; core #5ef2ff | ridge bands every 0.15 m with a lit edge strip; core 2 steps (#5ef2ff, #fff); contour 2 px only over haze | pulse = bright front + 8 m tail, 6 m/s |
| Barnacle crust | blob clusters on cable and rock, 3 densities | on the cable (rush at lens in shot 7) | #2a3358, #12183a, INK gaps | rounded cones: lit crescent + dark centre, 1.5 px contour, 8-40 px, seeded Poisson placement (no tiling) | scrolls with the ride up to 15 m/s |
| Marine snow | 40-80 specks, 3 sizes | -0.3..-4 | MIST 20-35 % | flat discs with a dark lower edge; near = larger, softer | drift 0.1 m/s |

Mist cards (near 10 %, mid 14 %): MIST on INK, banded blobs with dither, never over her face - the only soft shapes. Lightning = 2-frame canvas swap of sky, clouds, tower.

## 4. Light on her (a separate rig; the cards ignore light)
Rule: set colour never tints her skin. Own group: ambient neutral lavender #6f72b0 0.30; ramp 2 steps, lit #bcc1f0, shade #8e8ac8 (warmer violet, not darker blue); floor #6f6ab0, cap #e8eaff. Rim = hard fresnel edge 1.5-2 % of her width. Glow = dots 1.4 + violet pool 0.8 on the water ABOVE the surface. Checks: face >= 45 % luminance, she vs background >= 40 %, cheek hue 235-250, sat < 35 %.
| act | key | rim | her glow |
|---|---|---|---|
| Deep (1-16) | beam through the surface #dff6ff 1.0 from above-front; pulses as side lights #5ef2ff 0.8 only at the pulse; fill #8aa0e0 0.4 | UV #9b5cff 1.2 % far edge; cyan 1.5 % toward cable (never on skin) | dots + fin tips 1.5, aura #cfd2ff 0.6 |
| Storm (17-52) | bounce #b9c8ff 0.55 upper-left-back; lamp point #ffe6c0 0.9 right; bolt #e8f0ff 3.0 for 2 frames then 0.3 | #e8f0ff 1.5 % at bolt, gold #ffd27a 2 % lamp side | dots 1.4, violet pool on foam 0.8 |
| Lantern / last (41-83) | lamp #ffe9bd 3.5 from behind-right; lens-side fill #7d86c8 0.4; silhouette shots 0b/83: key off, rim only | gold 2 % + UV 1.5 % | white-violet 1.6 |
| Ink / end | her light is the key: UV #9b5cff 1.2, 1.2 m radius | UV top-only 1.5 % | dots become stars; two-tone changes the world only |

## 5. Build order and checks
1. PaintedLayer + grain + contour + hatch helpers (one file, seeded). 2. Sky, clouds, waves, rain. 3. Foam collar, lighthouse, rock. 4. Deep ceiling, cable, crust. 5. Lantern + Fresnel. 6. Moon.
- Test: greyscale thumbnail (she found in 1 s); a card at 200 % shows contour + grain + banded steps, no smooth gradient or sheen; same line weight across layers; depth strip gets hazier; no layer needs bloom to read.

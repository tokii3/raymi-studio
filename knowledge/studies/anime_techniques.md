> Copied 2026-10-18 from the old engine (docs/ANIME_TECHNIQUES.md) as evidence. Paths and tool names in it refer to the old engine (tokii3/raymi-vtuber) and do not exist here; the findings are what counts.

# ANIME_TECHNIQUES – how Japanese 2D animation is built, and what the Raymi rig takes from it

Research for the rig module (`engine/rig/`, docs/RIG.md), 2026-10-04. toki's starting observation: in anime
production the outlines are jagged (pixelig) and only get smoothed at the very end. That is correct, and it is the
key to the whole pipeline. Every section ends with **Rig rule:** what we do with it.

## 1. The pipeline (工程)

| Stage | JP | What happens |
|---|---|---|
| Layout / key animation | レイアウト / 原画 (genga) | poses, timing, camera |
| In-betweens | 動画 (douga) | clean final lines, drawings between the keys (中割り nakawari) |
| Ink & paint | 仕上げ (shiage) | lines are binarised, areas filled with exact colours from the colour sheet |
| Colour design | 色彩設計 / 色指定 (shikisai sekkei / iro shitei) | defines every colour per part per lighting situation |
| Compositing | 撮影 (satsuei) | stacks cels on the background, smoothing, light effects, camera moves, grade |

The look of modern anime is mostly made in 仕上げ + 撮影, not in the drawing itself.

## 2. Binary lines, smoothing at the end (2値化 → スムージング)

- Lines are **binarised** (2値化, nichika): every pixel is either line or not, no anti-aliasing, no grey edge.
- Reason: paint-bucket fills meet a hard line exactly. Anti-aliased lines leave half-transparent edge pixels that the
  fill cannot cover, which gives halos and gaps. Fills are binary too.
- Lines can be coloured (red/blue/green) to mark where shadow and highlight areas start (see 4).
- In 撮影 the stacked image is smoothed **once**, as the first and most basic operation ("without it compositing is
  impossible", senzui). Tools: KW_Smoothing, PSOFT Anti-Aliasing, OLM Smoother (open, Apache 2.0, from studio OLM),
  all based on morphological anti-aliasing (MLAA): find the stair-step patterns, blend along them, no general blur.
- History: early digital PCs could not afford anti-aliased painting; the hard-lines-then-smooth trick stuck because
  it simply works better.

**Rig rule:** every mask, fill, shadow and line is rendered **hard** at supersampled resolution (3x). Clipping uses
these hard masks, so a clipped shadow can never leak a seam. Anti-aliasing happens once, on the final composite
(area downscale = what MLAA approximates). No layer is anti-aliased on its own.

## 3. Cel shading (アニメ塗り)

- Per part: **normal colour** (ノーマル色, the part in neutral daylight) + **shadow colour** (影色, kage-iro) +
  **highlight** (ハイライト). Some productions add a second, darker shadow (二影, futa-kage) in deep folds.
- The border between light and shadow is a **hard edge** by default; the shape of the shadow tells the form.
- Shadow colour is not "normal colour darker". It is shifted in hue toward the ambient light (blue/violet in cool
  light, red-brown in warm skin shadows). Skin shadow is often redder and more saturated than the skin.
- Colour design defines **scene colours** (シーンカラー) on top: night, sunset, underwater all get their own
  normal/shadow pairs. Not a filter on the result, a designed palette per situation.

**Rig rule:** every part has a palette entry `{normal, shadow, shadow2, highlight, line}`. Lighting presets
(`day`, `uv_night`, `deep_sea`) are full palette swaps, not filters. Shadow hue is chosen, not computed by darkening.

## 4. Line colour (色トレス, iro-tore)

- Main lines (主線, shusen) are dark but rarely pure black in modern anime.
- 色トレス: lines **inside** a coloured area (skin creases, inner hair lines, blush) are drawn in a darker version
  of that area's colour instead of black. Traditionally blue pencil = border normal/shadow, red = highlight border,
  green = patterns. The result: soft, airy faces; only the silhouette has the dark line.
- Raymi's sprites follow this: the face outline is a dark violet-grey, the lower lash line is pink-red, the upper lash
  band runs from near-black into warm brown at the bottom edge.

**Rig rule:** each part has a `line` colour. Silhouettes use the dark ink (navy/violet, measured), interior lines use
the 色トレス colour of the area they sit in. Lines taper at the ends (入り抜き, iri-nuki: the stroke enters and
leaves thin).

## 5. Compositing effects (撮影処理)

| Effect | JP | How it is built | Rig use |
|---|---|---|---|
| Smoothing | スムージング | MLAA on the binary composite | final step, see 2 |
| Diffusion | ディフュージョン (DF) | duplicate the image, blur strongly, screen/soft-light on top at low opacity → bright areas bloom softly | **the key to matching the painted sprites' softness** |
| Para | パラ | gradient overlay (from the old paraffin technique), e.g. warm top / cool bottom on a whole cel | per-part form gradients + one scene para |
| Glow | グロー | bright, self-luminous parts (flames, lasers) get a blurred, additive copy | iris shine, bioluminescent dots on the dress |
| Transmitted light | 透過光 (T光) | mask the light area, duplicate several times, different blur radii + colours, add | stage lights, jellyfish |
| Ambient light | 環境光 | gradients + blend modes that reinforce the light direction | rim light from UV light |
| Lens flare | レンズフレア | stylised, may ignore physics | rare |

Blend modes in 撮影 are the same as in Photoshop: multiply for shadows, screen/add for light, overlay/soft light for
grade.

**Rig rule:** the rig renders flat cel layers; the `look` stage adds para → glow → DF → grade, in that order, all
parameterised, so the same rig can look crisp-cel or soft-painted.

## 6. Timing (コマ打ち, koma-uchi)

- 24 fps base. **2コマ打ち** (on twos) = each drawing held 2 frames = 12 drawings/s. **3コマ打ち** (on threes) = 8/s,
  the TV anime standard. Fast action goes on ones.
- Camera moves (pan, zoom, slide) run on ones (smooth) even when the drawing is on threes. That contrast (smooth
  camera, stepped character) is part of the anime feel.
- **Limited animation** (Mushi Pro onward): hold the body, animate only what matters (mouth, eyes, hair). A held
  still image in the rhythm of a cut does not read as "static".
- **Smear frames**: one stretched/blurred in-between for very fast moves.

**Rig rule:** the rig computes continuous parameters, but the output can be **stepped** per layer group: body on
threes, mouth on threes, hair physics + camera on ones. `step` is a per-group setting. Not everything moves at once.

## 7. Blink and mouth (目パチ, 口パク)

- **Blink (目パチ, mepachi):** open → half (中目, about 70 % closed) → closed → open, very fast. Closing has no
  in-between (中無し); opening has a slight ease near the end. Rules from animators: the pupil stays identical
  (same trace) or it looks like it moves; lash thickness and brow length never change. Emotional variant: an extra
  squeeze frame before opening (surprise), smaller pupils for wide-eyed shock.
- **Mouth (口パク, kuchipaku):** TV anime uses 3 shapes: closed, half, open. Shown on threes, **randomly but evenly**
  (closed must appear often enough, or speech looks like shouting). Matching every syllable feels unnatural in
  Japanese animation; accent the important sounds only. Film-level work (AKIRA) used 7 shapes.

**Rig rule:** blink = closed in 1 step, half-open step, open with ease; pupil layer never moves during a blink.
Mouth sync = 3 shapes from the voice envelope, quantised to threes, with an "even mix" check.

## 8. Live2D mechanics (what the reference models do)

- **Parts = art meshes** on a texture atlas (see `inbox/hiyori_vts/hiyori.2048/texture_00.png`): face base, bangs
  strands, side and back strands separately, eye white, iris, lash band, lower lash, brows, mouth parts, blush, ears,
  neck. Hidden areas are drawn complete (the face under the bangs, the back hair behind the head), so moving parts
  never reveal holes. Suiika's editor PSD calls these **underfills**.
- **Deformers**: warp deformers (a bezier grid that bends everything inside) and rotation deformers (pivot +
  angle), nested in a hierarchy: children follow parents (head → face → eye → iris).
- **Parameters** (~100 per model): `ParamEyeLOpen`, `ParamEyeLSmile`, `ParamMouthForm`, `ParamMouthOpenY`,
  `ParamBrowLY`, `ParamAngleX/Y/Z`, `ParamBodyAngleX/Z`, `ParamBreath`, `ParamHairFront/Side/Back`... Each mesh
  stores key shapes at parameter values; in-between shapes are interpolated.
- **Expressions** (`.exp3.json`) = parameter offsets (add/multiply/overwrite). **Motions** (`.motion3.json`) =
  bezier curves per parameter over time (30 fps).
- **Physics** (`.physics3.json`): multi-step pendulums. Inputs = head/body angles with weights, output = hair
  parameters. Hiyori's values: 2 vertices, mobility 0.9–0.95, delay 0.6–0.9, acceleration 1.5, radius 3 (front
  hair) / 10 (ribbons, skirt) / 15 (back hair). Longer hair = larger radius = slower swing.
- Pro tip from rigging guides: keep physics subtle (strong physics looks jittery), test half-blinks and mouth
  corners for pinching, hierarchy first.

**Rig rule:** our rig copies this model, minus tracking: parts + underfills, rotation/warp deformers in a tree,
named parameters, expressions as parameter sets, motions as curves, pendulum physics with the values above as the
starting point.

## 9. Layer decomposition research (for later)

"See-through: Single-image Layer Decomposition for Anime Characters" (2026, arXiv 2602.03749): splits one anime
illustration into 19 semantic layers with drawing order and **inpaints the hidden parts**. Needs an RTX 4090-class GPU
(~74 s per 1024² image), licence CC BY-NC-SA, code announced but not confirmed released. Not usable on the 3070
right now; worth watching as a helper for tracing Raymi's sprites.

## 10. Order of operations in the rig (summary)

1. Parameters (expression + motion + physics) → part transforms and shape keys
2. Render every part **hard** at 3x: fill → para gradient → cel shadow (multiply, clipped) → shadow2 → highlight
   (screen/add, clipped) → 色トレス interior lines → silhouette line
3. Auto shadows: where a part lies over another, the occluder's shape, offset along the light, becomes a hard
   multiply shadow clipped to the receiver
4. Composite parts in draw order, still hard
5. Downscale 3x → 1x (the one smoothing step)
6. Look: glow → DF → scene para → grade
7. Step timing per group (ones/twos/threes)

## Sources

- CLIP STUDIO ASK, anti-aliasing in anime production: https://ask.clip-studio.com/ja-jp/detail?id=79792 , https://ask.clip-studio.com/ja-jp/detail?id=79841
- senzui, アニメーション撮影の基本処理: https://note.com/senzui/n/n0d16db89be1c
- animestyle.jp, 撮影講座 第5回 エフェクト: https://animestyle.jp/2016/03/07/9837/
- DF/glow/para explanations: https://souzoulog.com/2020/05/08/ , https://togetter.com/li/1318181
- 色トレス: https://animehack.jp/image/linecolorchange.html , https://note.com/sa10ma/n/n29c3fd375393 , ノーマル色: https://note.com/sa10ma/n/n9eed72859a92
- Colour design: https://www.amg.ac.jp/animation-column/job/anime-colour/
- Cel shading: https://en.wikipedia.org/wiki/Cel_shading , https://www.clipstudio.net/how-to-draw/archives/162911
- コマ打ち: https://ja.wikipedia.org/wiki/%E3%82%B3%E3%83%9E%E6%89%93%E3%81%A1 , https://lenlogi.com/posts/anime-drawing-3koma-2koma-timing
- 目パチ: https://note.com/yodakanohoshi/n/ne77b4827e53f , 口パク: https://video-knowledge.com/kuchipaku/
- Limited animation: https://en.wikipedia.org/wiki/Limited_animation , smear frames: https://en.wikipedia.org/wiki/Smear_frame
- Live2D physics: https://docs.live2d.com/en/cubism-editor-manual/physical-operation-setting/
- OLM OpenTools (OLM Smoother): https://olm.co.jp/rd/technology/tools/?lang=en
- See-through paper: https://arxiv.org/html/2602.03749v1
- Reference models (structure only, licences forbid redistribution; moved 2026-10-05 to D:/RAYMI D/_archiv/inbox_rig_refs, BOOTH PSD + VTS exports may still be in inbox/): BOOTH パーツ分け PSD, Suiika editor PSDs, hiyori/akari VTS exports

---

## 10. For VIDEOS (not only the rig): what we take from anime, Live2D and Spine (2026-10-06)

toki: "pruefen ob Techniken der Anime-Produktion und Live2D / Spine 2D in leichten Versionen Anwendung finden koennen,
nur das nehmen was wir brauchen - insgesamt mehr Bewegung und Dynamik, von Assets und Lyrics." Each technique: what it
is, why it helps OUR videos, the engine block. Only light versions of what our flat painted PNGs can carry.

| technique | from | why for us | engine |
|---|---|---|---|
| cel shading for code shapes (影 + highlight shape) | anime 仕上げ | code-drawn things must look like the same artist as the painted assets (the flat Kawaikute fish looked cheaper) | `comp.material.paint(cel=...)`, `material.fish`, `material.surface`, `material.painted_detail` (floor/walls from the painted backgrounds' own grain) |
| flat-fill QC | studio check (色指定 / 検査) | nobody noticed the flat fish before toki; now board_review flags > 10 % flat area per still | `material.flat_fill`, board_review auto flag |
| secondary motion / physics (tail, hair) | Live2D physics, Spine | the body sways, the tail FOLLOWS a bit later (follow-through) - a PNG starts to feel alive | `puppet.pose` tail / tail_y from the measured tail tips (anatomy), mood-dependent (wag, flick, snap, hang) |
| animating on twos / threes (koma) | anime limited animation | crisper, more "drawn" motion for energetic moments; camera stays on ones | `puppet.draw(..., koma=2)` |
| attachment points (bones / slots) | Spine | props held IN her hand (mic, lightstick, card) instead of floating next to her | `anatomy.screen_point(name, "hands", i, x, y, s)` |
| squash & stretch, anticipation, overshoot | 12 principles / sakuga | landings, slaps, pops read as physical | `C.back_out`, `unify.figure(sy=...)`, typo jelly / slam |
| impact frames (2-4 f two-tone + burst) | anime fights / MV accents | the biggest beat hits harder than a cut; flash-safe (no white frame) | `fx.impact(dst, u, cx, cy)` |
| focus / speed lines (集中線) | manga + anime | push energy into a reaction or a shout, flicker on twos | `fx.speed_lines` |
| kinetic type: slam, jelly, bounce, exits | MV lyric animation (Ado, Reol, YOASOBI MVs) | lyrics are part of the choreography: key words slam in, lines leave (float / scatter / sink) instead of vanishing | `typo.mask(anim=..., out=..., out_u=...)`, `Lyrics.free(anim=, out=, bp=)` |
| multiplane parallax | 撮影 (camera work) | depth for free in every camera move | `comp.world`, set cameras |
| 撮影 finish: DF diffusion, bloom, grain, one grade | 撮影 | one piece, painted softness | `comp.look` |
| blinks / mouth flaps | Live2D | NOT done: our PNGs have no separate eye/mouth layers; faking it on the painted face looks wrong. Use clips (they blink) and the rig (engine/rig) later | - |

Rules: use a technique because a moment asks for it (write it in the BOOK); secondary motion and the shading are
always on (they are "craft", not effects); impact frames and speed lines are accents (a few per song, on the biggest
beats).

DESCRIBE
S_surface: v1 = small yellow JP line lying on the felt, perspective, one big yellow word. v2 = same, bigger, big word centred, plus romaji and English translation on the felt (cream, small).
W_wide: v1 = black-outlined yellow/white JP, flat sticker on the underwater scene, upright. v2 = outline gone, white/yellow puffy "foam" letters, tilted, romaji and English arcing over the shell, bubbles overlap the letters.
N_own_light: v1 = glowing white JP on the weather map, cut by the black silhouette at left; v2 = bigger, stronger glow, plus romaji and English underneath.
C_close: v1 = JP line with black outline, flat, top left of the board. v2 = no outline, soft shadow, line tilted, romaji and English arc toward her hand.

FELT EFFECT
v1 reads as a sticker on top: one outline, one size, same everywhere (toki's complaint). v2 is clearly closer to being in the picture. On the felt the type lies in the table's perspective and lights. The foam letters sit with the underwater look. The glow reads as light from the screen. Hierarchy now exists in S and W (big noun, small particles).

CRAFT
- Type belongs to the object: S best (on the felt, but it does not touch the card or deck, the table is empty). W is a layer with a tilt (no depth, no occlusion). C is a layer with a shadow only. N is lit but not on the screen surface.
- Phone size at 390 px (about 20% scale): romaji and English lines (about 30-40 px tall on 1080p, about 6-8 px at phone size) are unreadable. They are clutter, not lyrics. W: the white foam English over the pale shell and light seabed has weak contrast. C: the English line runs toward her hand, and the arc is not a designed path. N: the romaji and English are small white on dark purple, readable on desktop only. N: the black silhouette cuts the first kana of the JP line (パッパッパ), and むき is half hidden. That reads as a cut word.
- Reading speed is fine (short lines), but three lines of three scripts per moment is too much.
- Variety: v2 uses the same treatment in all four shots (white or yellow foam, same blob edge, romaji plus EN under the JP). Only the colour and tilt change. It is still "one style everywhere".
- Extreme or reduced? The extreme would be the key word as a world object (a letter-shaped cut-out in the felt, a shell-shaped sign). The reduced one would be JP only, big, with no translation. v2 sits in between.

JUDGEMENT: v2 is closer than v1 to type that belongs to the picture, but it is still half-hearted.

BLOCK: fault: N_own_light v2 (and v1): the first kana of パッパッパ and part of むき sit under the black silhouette, so the word is cut and cannot be read.
BLOCK: slop: all four v2 frames: the same translation stack (JP, romaji, EN) under every line, the same foam treatment. This is a subtitle block moved into the scene.

FIX 1
observation: v2 S/W/N/C: romaji and English lines of 6-8 px at phone size; in W white foam on a pale shell, in C arcing across the frame.
effect: unreadable clutter, it kills the clean JP hierarchy.
cause: module 06 (hierarchy, phone size)
change: drop romaji and English from the frame, or show only one small line at 40% opacity at least 48 px high at 1080p. Keep the key word at 220 px or more.
priority: high
level: local
retest: at 390 px wide every shown word is readable, and a frame has at most two levels.

FIX 2
observation: N_own_light 0-600 px left, the silhouette covers the start of パッパッパ.
effect: reads as a cut word.
cause: composition / depth order (module 06)
change: move the lyric to x >= 700 px, or lower the silhouette's overlap. Set a minimum 40 px safe margin from any occluder.
priority: high
level: local
retest: every glyph fully visible in N.

FIX 3
observation: W and C: type tilted and flat, over the scene without contact. Only S sits on a surface.
effect: still a layer.
cause: lyric object (principle B 11)
change: put each line on a prop of the set. W: on a sign in the sand or carved into the shell. N: on the weather map as a map label. C: on a speech card or ticker. Add contact shadow, occlusion by one foreground object, and light from the scene.
priority: high
level: structural:elements
retest: each shot has a named carrier object, and the text is partly occluded or lit by it.

FIX 4
observation: all four shots use the same foam letters, same size jump, same edge.
effect: toki's "immer dieselbe Farbe, Groesse, Umrandung" again.
cause: variety (module 06 / 01)
change: give each shot its own material from the Raymi font (felt-embossed gold in S, bubbles/foam in W, light-emitting in N, ink on paper in C), and vary scale 3x to 5x between key word and filler.
priority: medium
level: structural:elements
retest: four stills side by side show four different treatments.

VERDICT: FAIL
WORST: The same foam-letter translation stack sits on every shot as a flat layer, and in N the silhouette cuts the word, so it is still type placed over the picture.

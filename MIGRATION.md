# MIGRATION - what came over from the old engine (2026-10-17) and why

Source: old engine on toki's PC (C:\raymi, repo tokii3/raymi-vtuber). Rule from toki: copy only what is needed and
check everything again so no old fault moves over. Nothing was copied blindly; code was rewritten or ported with tests.

## Taken
| What | How it was checked |
|---|---|
| 172 Raymi sprites (`assets/sprites`, 128 ok + 44 limited) | old registry status + my own alpha/edge scan + eye check of every contact sheet; trimmed to the visible figure, re-measured (size, cut sides with a >2 % edge rule, anatomy boxes, face box) -> `assets/catalog.json` |
| Raymi-Regular.ttf (brand font) | glyph coverage tested; it has no `@` -> the plan check fails loudly instead of falling back |
| canon: character, brand, video catalog, puls snapshot, history, search/tags, titles, series, kaomoji | read through; old-engine commands marked as history (`canon/README.md`); script guide rewritten as `canon/03_script_guide.md` |
| `tts_text.py` (clean spoken text) | ported verbatim, tests |
| `channel_rules.py` (upload text rules) | ported with fixes (see below), tests |
| voice settings (AnaNeural, +17 %, -7 Hz) | unchanged on purpose: it is her voice |

## Not taken (on purpose)
- Backgrounds, props, other fonts, music, clips, plates: toki's decision. Worlds are built in `studio/src/World.tsx`.
- Old render code (MoviePy/Pillow pipelines, per-video scripts): replaced by the Remotion studio.
- Skeleton bending of sprites: dropped until the Live2D rig exists (puppet motion meanwhile, toki's OK).
- Deferred, port later with tests: song pipeline (lyrics_align, song_map, Demucs stems), channel pulse tool,
  raymi_voice experiments, Sumi assets, thumbnails.

## Old faults found during the check (not carried over)
1. **Sprites marked ok that are broken:** WS_F_SUSHI_UV_051 and _053 show three tails; MS_F_ANGRY_UV_002 has grey
   smear artefacts; CU_F_SUSHI_UV_071 is a chest crop without a face.
2. **Registry double count:** the old registry had RAY_-prefixed duplicate keys. My first count to toki
   ("147 ok + 70 limited") was wrong for that reason; real: 131 ok / 65 limited / 7 faulty. Prevention: the new
   catalog has one key per file and a test checks that every entry has exactly one file.
3. **Length rule:** a global 20 s cap contradicted the lore winners (25-35 s). Now per kind: song 12-20 s,
   lore 15-35 s.
4. **Word timing:** SentenceBoundary events were treated as words, and the length came from the last word instead
   of the audio. Now only WordBoundary, duration from ffprobe, whisper fallback aligned to the script.
5. **Font:** the `@` glyph is missing and was silently replaced. Now an error.
6. **Font licence note:** the Japanese glyphs in Raymi-Regular are derived from an OFL font. Before selling the
   font or a product that embeds it, check the OFL terms (using it in videos is fine as far as I know -
   weiss ich nicht sicher, toki should keep the source note).
7. Date labels in some old docs are off by one day; the expired "confession pause" rule was removed.

## Excluded sprites (31 of 203)
| Sprite | Reason |
|---|---|
| CU_F_MIC_UV_069 | old registry: faulty - calm stare, jellyfish lower right, NO mic visible; GREEN-SCREEN fringe on the left edge; FAULT green_fringe: 7.3k green px (audit scan 2026-10-10) |
| CU_F_MIC_UV_074 | old registry: faulty - smug tilted look with the mic, hand in hair; GREEN-SCREEN fringe top right; FAULT cut_edge: hair cut-out visible (noted since 2026-09-30, toki saw it 2026-10-09) |
| CU_F_MIC_UV_086 | old registry: faulty - calm straight stare, no mic visible; FAULT green_fringe: 13.1k green px at full res (audit scan 2026-10-10) |
| CU_F_SUSHI_UV_063 | old registry: faulty - smiling at you, salmon sushi plate at the bottom; FAULT hole: wasabi is chroma green, keyed out, shows as green hole in the food |
| CU_F_SUSHI_UV_071 | chest-only crop, no face (framing fault) |
| MS_F_ANGRY_UV_002 | grey smear artefacts at the lower left edge (eye check 2026-10-17) |
| WS_F_ANGRY_DRAMA_UV_001 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_ANGRY_ENERG_UV_002 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_ANGRY_ENERG_UV_004 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_ANGRY_PLAY_UV_003 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_ANNOYED_PLAY_UV_005 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_HAPPY_ENERG_UV_012 | old registry: faulty - alpha holes / eaten ruffles (tools/alpha_holes.py); cut left+right (hair/wings) and had a semi-transparent white box - free-standing only on dark painted scenes kneeling, fists up, cheering; cut left+ |
| WS_F_HAPPY_PLAY_UV_010 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_HAPPY_PLAY_UV_011 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_JELLYFISH_UV_064 | old registry: faulty - seen from above, floating among jellyfish (in the PNG, with a dark blob top left); FAULT artifact: large blue-grey translucent melted hair/jellyfish blob with many green holes and ragged edges |
| WS_F_JELLYFISH_UV_121 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_PLEAD_DRAMA_UV_020 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_POUT_DRAMA_UV_019 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_SMUG_PLAY_UV_006 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_SMUG_PLAY_UV_007 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_SMUG_PLAY_UV_008 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_SMUG_PLAY_UV_009 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_SUSHI_UV_051 | three tails (eye check 2026-10-17; old registry said ok) |
| WS_F_SUSHI_UV_052 | old registry: faulty - kneeling, eating sushi with eyes closed (bliss); FAULT second_tail: leaf-shaped tail tip plus a separate thin tail with its own tip |
| WS_F_SUSHI_UV_053 | three tails (eye check 2026-10-17; old registry said ok) |
| WS_F_THINK_CALM_UV_013 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_THINK_CALM_UV_014 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_UPSET_DRAMA_UV_018 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_WORRIED_DRAMA_UV_015 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_WORRIED_DRAMA_UV_016 | old alpha-hole scan: eaten ruffles / key holes |
| WS_F_WORRIED_DRAMA_UV_017 | old alpha-hole scan: eaten ruffles / key holes |

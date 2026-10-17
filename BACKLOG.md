# BACKLOG - parked items (anti-loop rule: a fix that failed twice lands here with what was tried)

- '@' glyph missing in Raymi-Regular.ttf: handles like @TouyamiRaymi cannot be drawn in her font. Options: add the
  glyph in a font editor (toki) or write "touyamiraymi" without @ on screen.
- Render speed: CPU-only render ~0.8 s per draft frame on 2 cores (local test 2026-10-17). Per-frame SVG noise
  filters were replaced by cached textures. If finals get too slow on Actions: lower particle count, pre-render
  the world layer as a video.
- Song pipeline port (lyrics_align, song_map, stems) with tests.
- Live2D slot: replace `studio/src/Raymi.tsx` by a Live2D component once the rig exists (same props: beat, place).

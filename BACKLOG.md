# BACKLOG - parked items (anti-loop rule: a fix that failed twice lands here with what was tried)

- '@' glyph missing in Raymi-Regular.ttf: handles like @TouyamiRaymi cannot be drawn in her font. Options: add the
  glyph in a font editor (toki) or write "touyamiraymi" without @ on screen.
- Render speed: CPU-only render ~0.8 s per draft frame on 2 cores locally (2026-10-17). Per-frame SVG noise
  filters were replaced by cached textures. If finals get too slow on Actions: lower particle count, pre-render
  the world layer as a video.
- Song pipeline port (lyrics_align, song_map, stems) with tests.
- Live2D slot: replace `studio/src/Raymi.tsx` by a Live2D component once the rig exists (same props: beat, place).
- Extreme close-ups (CU_F_HAPPY_UV_002 in S0): the head box spans almost the whole sprite, so the cut-side push
  crops the left eye. Prefer `close` over `extreme` for such sprites, or use the face box for close framing.
- S0 cloud draft: about 15 min per run incl. setup (2026-10-17). Setup (npm ci, browser) could be cached.

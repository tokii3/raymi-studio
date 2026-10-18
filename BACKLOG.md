# BACKLOG - parked items (anti-loop rule: a fix that failed twice lands here with what was tried)

- Render speed: CPU-only render ~0.8 s per draft frame on 2 cores locally (2026-10-17). Per-frame SVG noise
  filters were replaced by cached textures. If finals get too slow on Actions: lower particle count, pre-render
  the world layer as a video.
- Song pipeline port (lyrics_align, song_map, stems) with tests.
- Live2D slot: replace `studio/src/Raymi.tsx` by a Live2D component once the rig exists (same props: beat, place).
- Extreme close-ups (CU_F_HAPPY_UV_002 in S0): the head box spans almost the whole sprite, so the cut-side push
  crops the left eye. Prefer `close` over `extreme` for such sprites, or use the face box for close framing.
- S0 cloud draft: about 15 min per run incl. setup (2026-10-17). Setup (npm ci, browser) could be cached.
- Claude cloud render worker (render/CLOUD_WORKER.md) untested: no cloud environment in toki's account (2026-10-18).
  Needs her to add one (New session -> Cloud) - only worth it if Actions minutes run out.
- yt-dlp needs a JS runtime for YouTube now: `--js-runtimes node --remote-components ejs:github` (2026-10-18).
- Loudness after assemble lands at -14.7 LUFS (-14.06 single render): the apad silence tail lowers the integrated
  value slightly; still inside the QC tolerance. Watch it on music videos.
- KING verse 1 (15-26 s) lyric times are interpolated: GUMI's English voicebank sings Japanese, whisper hears English.
  If the pilot shows drift there: CTC forced alignment (MMS, romanised) on the vocal stem for weak lines.
- Studio look (blind viewer, style test 2026-10-18): the aquarium crowd reads as "identical round-headed silhouettes"
  and the set as "low-poly toy-like" - next look pass: varied silhouettes (hair, hats, kids on shoulders, coats),
  rim light from the tank, softer bevels / texture on rocks. The 3D film renders ~2.5 s per 1080p frame on Actions
  (12 s = 8.5 min with 3 workers); a full MV fits in 20 workers.
- The MVShort (9:16) of the style test is compiled + guarded but not rendered yet (one cloud run, render.json
  `"format": "short"`).
- Style-test Short (9:16): rendered once (run 10) from the same timeline, but since the face guard (2026-10-18) three
  shots need `camera[].short` overrides (her face sliced by the narrow frame at f24 / f92 / f234). Frame it before the
  next Short render.
- Style test screening round 5 (blind viewer PASS, 2026-10-18) left two readability BLOCKs: words too small at phone
  size in the far wide shot, the "パッパッパッハハ" stamp over her body hard to read. Text placement was iterated 4x by
  hand -> anti-loop: next fix is a guard, not a 5th patch: minimum projected cap height for on-screen words (~3.5 %
  of the frame height at phone size) and "no stamp across her body" unless lyrics.over.
- KING pilot STOP (2026-10-18, 3 blind-viewer FAILs, renders 13-15): recurring roots, not fixable by guards -
  crowd silhouettes read as placeholder blobs (build the look pass: varied silhouettes, rim light from the tank,
  never a dark mass in the lower third), Raymi tiny in hall wides (rewrite those shots as MS / CU or a figure-size
  guard: her figure >= ~25 % of frame height unless the script says "tiny on purpose"), the LED "You are KING" unreadable
  at phone size (bring the words down to her: a lyric object near her, not only on the far board), no hook at 0 s.
  Waiting for toki's decision (PROGRESS 2026-10-18).
- KING final STOP (2026-10-18, final renders 16 + 18, all 7 critics FAIL on final 2): the fixes that guards cannot make
  are studio / script work - a crowd look pass (varied silhouettes, rim light, phones with her face), richer set
  props (texture, wear, detail), an ambient backdrop for the night, a figure-size rule for wides, longer / bigger story
  beats for the setup and the scale payoff, more acting in holds, lyric colour per set. Waiting for toki's call.

- KING verdict (2026-10-19) open items:
  - Lyrics v2 not seen by toki yet: style frames prepared (jobs/2026-10-19_lyrics-v2), not rendered (toki: no new
    render). Raymi-Heavy.ttf is built by the cloud on the next stills / render run (~887 glyphs, a few minutes once).
  - stills.yml `passes` + `thumbs` and the hero contrast step are untested in the cloud (first thumbs run proves them).
  - The crown component (props.tsx CapCrown) is 13 x 7 cm on her 1.55 m figure: reuse it as a main element only at a
    screen scale (or framed close) - the hero guard refuses it otherwise. A crown look pass (thickness, a band that
    follows her head) was a critic FIX, not toki's.
  - KING's Short never got thumbnails (raymi next shows the thumbs step open) - only if toki wants them now.
  - Still open from the critics (not toki): crowd look pass, prop texture pass, night backdrop (status.json notes).

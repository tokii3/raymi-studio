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
  - stills.yml `passes` + `thumbs` and the hero contrast step are untested in the cloud (first thumbs run proves them).
  - The crown component (props.tsx CapCrown) is 13 x 7 cm on her 1.55 m figure: reuse it as a main element only at a
    screen scale (or framed close) - the hero guard refuses it otherwise. A crown look pass (thickness, a band that
    follows her head) was a critic FIX, not toki's.
  - KING's Short never got thumbnails (raymi next shows the thumbs step open) - only if toki wants them now.
  - Still open from the critics (not toki): crowd look pass, prop texture pass, night backdrop (status.json notes).
  - The new "lyrics hidden behind a prop" guard (2026-10-19) flags 2 delivered KING shots (lamp-deals, buried: behind
    a coin tower) - evidence only, KING is not re-rendered. The weather set now registers its studio cameras + desk,
    the card table its standing King card as solids.
- Lyrics v2 NEXT ROUND (toki 2026-10-19: v2 is the default, "die offenen Punkte vom type-critic gehen in die nächste
  Runde"; type-critic FAIL x2 in reviews/style_type-critic_1/2.md). Open points: aquarium shell / coral are not solids (a lyric row ran behind them - the guard could not
  see it); her Latin "m" reads like "n" in the heavy weight at small sizes; romaji / English rows still small on a
  390 px feed; critic wants a carrier object + a different form per shot (key word only, English only, an acted word).

- FIRESTARTER (2026-10-19) open items:
  - Lyric timing SOLVED 2026-10-19 (333 / 436 measured): second Whisper pass picks by sound (v1 "most words" failed,
    reverted) + monotonic alignment for repeated choruses. Still interpolated: 121-123 s, 138-149 s - by ear in the pilot.
  - Her tako ears read as horns in fire light / dark sets (boards A1, A3) - the devil framing canon/01 forbids. Sprites
    cannot change; lighting / framing must keep the ears out of red rim light, or the VRM model solves it.
  - "beat drop" (board A3) runs through the vent flames: key words must sit on a dark area, never over a flame.
  - Fixed: two cloud runs growing her font at once died on a binary rebase conflict -> .github/font_grow.sh retries.

- FIRESTARTER pilot (2026-10-20, renders 21 / 22 / 23, reviews/pilot_*_1..3.md) - parked by the anti-loop rule (two fix rounds):
  - Lyric readability: the guard's v2 minimum (7 % of the frame height) is met, yet every critic (3 rounds) calls the
    floor / wide-shot lines "tiny, thin, low contrast" at phone size ("Imma burn it down", "Crazy out of order", "Work a
    lil harder"). Tried: round 1 bigger + leaning floor words, round 2 the hook lines x1.4. Next idea (studio, not per
    shot): measure the CAP height on the phone sheet (not the texture box) and raise the v2 default to ~10 %, a dark
    halo behind light words, floor words only in shots that look down on them.
  - The dark middle 2-12.8 s: Raymi / flame small and mid-grey on navy, s6 / s10 near-black without her (swipe at
    8-12 s). Tried: round 1 set fill 0.18 -> 0.42 + violet fog + stronger glow light, closer frames; round 2 a light on
    Salmon, the vent mouth sooner. Next idea: a warm spark flash per failed strike (6-10 f), keep Raymi or her flame in
    every frame of 8.8-12.8 (script change: s6 / s10 with her in it), a rim light on the sprite.
  - Open from the pilot critics (not yet tried): the title "UNDERWATER." floats out of the frame at 1.5 s (float kind
    + push-in; the guard checks only 18 frames of a float), cuts at 4.9 / 6.87 / 8.8 off the beat grid (the script's
    strike times), 1 of 10 hits changes the picture, a one-frame Salmon flash at 8.8 s (its swim-in from / pos?),
    the salmon / bucket / pedestal read as flat placeholders, story: the fish never takes or threatens the flame.
  - Devil guard: the look critic answered "what are the shapes on her head?" with "horn-like nubs / little devil horns"
    in pilot 1 AND pilot 3 - the tako ears read as horns at phone size in this fire-lit world. Sprites cannot change;
    toki decides (VRM model, ear-shaped glow, or accept).

- FIRESTARTER thumbs (reviews/thumbs_1.md, FAIL): S1 cold open's "UNDERWATER." line sits behind her horns/hair (move the title line in the Short cold open or a thumbnail-only text layer); only one MV candidate has a face (M3/M5 empty) - thumbnails need their own framing (close face + flame + one word), not film frames. Not looped (toki: lean, full package).

- 3D switch, stage A leftovers (2026-10-22):
  - Guards still read sprite anatomy: the film path (shots.json -> timeline.py -> check.ts) has no bone-based face /
    figure / hero boxes for the VRM yet (vrmAnatomy exists). Needed before the first full VRM film.
  - shots.json has no `vrm` keys yet (pose / motion / motionMix / expr per key, step, outline, fx per shot): the film
    compiler must learn them for Beach; until then VrmClip proves the parts.
  - Only two Mixamo clips (dance, idle) in the secret bundle. Beach needs walk, typing / desk, slump, throw, reach /
    grab, free dance - toki downloads them only if there is no other way (CMU mocap BVH is a free alternative to test).
  - Manga panel / split-screen layouts (several views of the same moment) need a second render pass - not built.
  - Song analysis for Beach: instrument hits (guitar stabs ~4-5 s, can-open ~17 s) and who sings which line
    (Ado / Dan Reynolds) are not in song.py yet.
- Beach Short: shots 24 + 28 still fail the Short guards (portrait framing); the 0.5 s beach insert at the Short's
  frame 0 (4_SCRIPT S1) is not built.
- Hero occlusion (Beach final round 1, 2026-10-23): the postcard hung 1 mm behind her monitor's glass (z .76, screen
  face at .759) through stills, guards and the whole MV - all guards passed, only the post-render hero check
  (sep 0.00) and five critics caught it. Needed: a guard that raycasts from the lens to each hero box and refuses
  a hero that is hidden behind set or thing geometry (before any cloud render).
- Beach critic FIXes not taken into the re-render (structural, toki decides; reviews/final_*_1.md): squash +
  overshoot pops on hits and on icons / words (motion), picture change on >= 70% of hits in the peaks + cuts moved
  onto hits (cut), every lyric line >= 6% frame height in the wides + romaji / English >= 70% of the JP size (type),
  reaction icons (! ? sweat anger Zz heart) and face cut-ins at each plot turn, prop actions for the Ado verse
  (story), the battery as a checked hero (vision).
- Beach rebuild 2026-10-24 (screening reviews/final_*_2.md), parked for toki:
  - Lyric type at phone size (blind viewer BLOCK, type critic round 1): the 3-language Ado block (JP + romaji + EN)
    and the dream-wide lines are thin and small. Needs a type rule (min height per frame, one language at a time?)
    - a decision for toki, not a per-shot patch.
  - Shot 11 (0:05-0:08, asleep behind the file pile): tried 3x (top-down, 3/4 over the monitor, wider + higher) - the
    blind viewer still reads "half hidden, near static". Anti-loop: parked; next idea a cut-in on her face instead.
  - Lyric words pop without overshoot (motion critic FIX 3): a Words3D option (0 -> 1.2 -> 1 in 3 frames).
  - The hero check counts the postcard in shots 23 / 24 / 75 where it is hidden by her monitor or leaves the frame on
    purpose (why_small) - the kit's hero.json should skip rows with a why_small.
- Beach structural pass 2026-10-24 (knowledge/HANDOFF_2026-10-24_beach_3d_film.md), open:
  - Airborne clipping: in the dream she flies / falls / kicks into cushions and rocks from above (~119 probe frames,
    mostly < 0.15 m) - clearSolids pushes only in x / z; airborne keys need a vertical push (or a lifted path).
  - Rooms: light depth + textures v2 are in; the props / detail pass (lived-in objects per set, toki "leer, lieblos,
    ohne Details") is not built.
  - The scene probe is a process step (stills.json "probe"), not an automatic gate in render.yml yet.
  - Runs 58 / 59 unscreened (no critic, no toki verdict).
- Lead melody of the band on a dense mix (song_map.melody.lead, 2026-10-25 Love is War): tried (1) librosa pyin on
  the Demucs `other` stem -> 0 % voiced (monophonic tracker on chords); (2) CQT top line with overtone pruning
  (`lead_track`) -> exact on a synthetic chord + lead, on the real remix 49 % voiced but jittery (75 notes, 42 of 52
  phrases "flat", 95th percentile at the range ceiling = hi-hats / noise picked). The VOCAL melody is reliable
  (318 notes, median A4). Next idea: Spotify basic-pitch (free, polyphonic note transcription) on the other stem,
  keep the highest sustained note; or restrict the top line to harmonic peaks (spectral flatness gate).
- Ink brush slash standing in the air (sets/Paper `ink_slash`, Love is War boards 2026-10-25): round 1 bristle lines
  1-6 px -> a thin dark leaf; round 2 bristles 2-24 px -> still a small leaf at board distance. Suspect: the plane is
  12 x 3 m but the stroke texture only fills its middle band and the alpha tail eats the rest, so it reads small and
  thin. Next idea: draw the slash as a 2D layer (Fx2D, screen space, like the Transitions ink) instead of a plane in
  the set - a slash is a graphic hit (ref hsr-hope-feathers@108, ado-usseewa@98), not an object.
- Mixamo `roar` turns her body away from the lens at 1.9 s (boards A2 / B2 round 2: we see her back) - the clip's own
  hip yaw adds to rotY 'lens'. Attack clips need their yaw measured (hips forward vector at the key time) and
  compensated, else every "attack at the viewer" faces away. Seen on the boards, not fixed yet.
- Board look at the professional bar (Love is War idea boards, 2026-10-25, 3 rounds / 6 renders, look-critic FAIL +
  brief-keeper BLOCK each time, reviews/ideas_*_1/2.md): tried painted toon materials + ink contour on code primitives,
  neutral sky + rim per shot, calm grades, 2D hit layers. What WORKED: the 2D layers (brush slash, melody line), value
  contrast of the paper world, close low frames (A1, B1, C2). What stays below the bar: every 3D prop built from code
  primitives (cylinders, tubes, boxes) reads as plastic; she does not pick up set light; skin tint; blown white eyes.
  Root guess: a capability limit of hand-coded primitive sets, not a parameter. Options to toki: Blender-modelled +
  textured sets (cloud Blender, free), CC0 textures / HDRIs (Poly Haven, free, no account), or a graphic 2D world
  around the 3D Raymi. Also found: every board shot had `mouth: "silent"` - her war cry could never open the mouth.

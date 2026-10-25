---
name: raymi-video-production
description: Use for ANY work on Raymi (Touyami Raymi) videos - music videos, Shorts, lore / POV Shorts, ideas, treatments, scripts, storyboards, renders, reviews of a render, thumbnails, upload texts, and the raymi-studio code (Remotion, VRM, cloud render). Starts every session from the live production state and toki's standing verdicts instead of from zero. Use together with raymi-vtuber (persona / voice).
---

# Raymi video production - start with full context, never from zero

Why this skill exists (toki 2026-10-24): she kept repeating the same feedback and felt every session started from
zero. The knowledge exists - in the raymi-studio repo - but sessions did not load the newest state, and chat sessions
had none of it. This skill is the map + the acceptance list + the expert notes. The repo stays the source of truth.

## Since 2026-10-25: the skill library, the makers, the gate (knowledge/ANALYSE_2026-10-25_warum_es_scheitert.md)

**Load `raymi-reading-toki` FIRST, every time she writes.** Then the area skill for what you work on (loaded on
demand, so the start stays small):

| area | skill | maker agent | critic(s) |
|---|---|---|---|
| reading her brief / feedback | raymi-reading-toki | - | brief-keeper |
| idea, world, story, treatment | raymi-idea-story | - | script-critic + brief-keeper |
| camera | raymi-camera | camera-director | brief-keeper, look / motion |
| her body, poses, acting, lens play | raymi-posing-acting | choreographer | motion-critic, brief-keeper |
| cuts, rhythm, transitions | raymi-editing | editor | cut-critic |
| light, colour, materials | raymi-light-color | look-designer | look-critic |
| anime / 2D feel, effects as moments | raymi-2d-techniques + canon/02_raymi_toolkit.md | fx-designer, look-designer | look / motion |
| framing, depth, sets | raymi-composition | - | look-critic |
| lyrics, type | raymi-lyrics-type | - | type-critic |
| looking at stills / renders | raymi-screening | - | all + `raymi reality` |
| references, the bar | raymi-references | - | - |
| Shorts, thumbnails, upload | raymi-shorts-thumbs-upload | - | thumb-critic |

- **Step 0 of every job = `0_BRIEF.md`** (her words verbatim, core, classes, CONFLICTS between her messages, visible
  proof, reality claims, feasibility). A MISSING capability or an open conflict is told to toki at once; `raymi next`
  keeps the job there until she answers.
- **IDEAS start with the idea matrix** (every line x `canon/02_raymi_toolkit.md` x medium x references); every T-id
  used or skipped with a reason. **Effects are moments** (treatment table, fx-designer), never global rules.
- **Storyboard before the build** (`storyboard.json` -> `raymi storyboard`): reference | previz or PLAN card per key
  moment, brief-keeper PASS, toki's verdict - the first pictures she sees no longer come out of the build.
- **The bar = professional references** (`python -m raymi refs find ...`, `knowledge/references/`), never our own
  older videos. Key moments on boards are shown as pairs: reference left, ours right (`refs pair`).
- **Gemini watches video** for free (`python -m raymi gemini <url|mp4> --prompt ...`): references, first watch of our
  renders. Free tier = 20 requests / day / model.
- **Checks on the real video**: `python -m raymi reality <job> <video>` (cuts, camera motion, her face to the lens,
  size) against the brief's reality claims.
- **The gate**: `python -m raymi gate <job> <stage> <files>`; the SendUserFile hook refuses pictures / videos without
  GATE_PASS.json (or GATE_FAIL.json + "FAIL" in the caption when she asked to see a failed one).
- **Budget** (toki 2026-10-25): a whole video ~20 % of her weekly limit over 1-2 days; makers and critics on sonnet
  with small briefs; bulk looking goes to Gemini.

## 0. Start protocol (do this BEFORE planning or answering anything about a video)

1. **Load the live state, never from memory alone.** The repo `tokii3/raymi-studio` is public:
   `git clone --depth 30 --filter=blob:limit=200k https://github.com/tokii3/raymi-studio.git`
   (or `raw.githubusercontent.com/tokii3/raymi-studio/main/<path>`). Read:
   - the newest `knowledge/HANDOFF_*.md` (date in the file name) - the last session's root causes, tools, open items
   - `PROGRESS.md` - WARNING: until fixed, entries are NOT strictly newest-first; grep the dates, read the newest
   - `BACKLOG.md` (parked items, what was already tried), `git log --since="3 days ago" --oneline`
   - `git branch -r` - `claude/*` branches are sessions in flight (work there is not on main yet)
   - on toki's PC: `C:\raymi-studio` (its main checkout can lag origin; in-flight work sits in
     `.claude\worktrees\<name>`). Other agents (Codex) may also work in this repo.
2. **Find the job:** `jobs/<date>_<slug>/` - `toki.md` holds her verdicts verbatim = the acceptance list of THAT job.
   `python -m raymi next <job>` (Claude Code) says which step is open.
3. **Name which items of section 3 the task touches** (one line), then plan. Bigger tasks: plan -> toki's OK ->
   do it all in one go.

## 1. The system (state 2026-10-24 - verify against the repo)

| what | where / how |
|---|---|
| Live studio | `C:\raymi-studio` = github.com/tokii3/raymi-studio (public). Private: tokii3/raymi-private-assets (Mixamo FBX clips, VRM models) via deploy key on the runner only |
| Old engine | `C:\raymi` (tokii3/raymi-vtuber, Python frame renderer) - RETIRED for video since 2026-10-17, read-only history. Still the home of the channel pulse: `raymi.cmd pulse daily|subs|channel` (YouTube Analytics, comments, multilingual subtitles; studio uploads must be mapped in `brain/subs/studio_jobs.json`) |
| Google Drive "Raymi-VTuber" | Canva / PixAI era docs and assets (Sept). Not the production source any more |
| Render | ONLY in the cloud - GitHub Actions (`render.yml` parallel up to 20 workers, `stills.yml`, `analyze.yml`, `vrm-clip.yml`). Never on toki's PC, not even one still (toki 2026-10-18). Trigger by pushing `jobs/<job>/render.json` (change its `_take`, never delete it), `stills.json`, `analyze.json`. Results: pre-release `render-<job>-<run>` (final.mp4, sheet.jpg, qc.json) + branch `renders` `reports/<job>/` |
| Stack | Remotion 4 (React) + @remotion/three + three-vrm. Raymi = VRM model `raymi5` (toki built it in VRoid) driven by Mixamo clips + a pose library (`vrmPoses.ts`), lip sync from the vocal stem; sets / props / creatures BUILT in code (`studio/src/three`), only Raymi is ever AI-generated. 172 checked 2D sprites (`assets/catalog.json`) remain for 2D work |
| CLI | `python -m raymi new|next|timeline|check|probe|cuts|exposure|pov|voice-lines|mix|screen|name|font ...`; `cd studio && node guard.mjs <job>` = the real pre-render gate |
| Fixed | Voice edge-tts `en-US-AnaNeural` +17 % / -7 Hz. Font Raymi-Regular / Raymi-Heavy (missing glyphs are BUILT in her style, never a fallback font). Skin pale grey-blue under any light. English content |
| Read order (Claude Code) | `CLAUDE.md` -> `PRODUCTION.md` -> `knowledge/PRINCIPLES.md` -> `canon/01_character.md`; before planning a video also `knowledge/CASEBOOK.md`, `canon/07_video_catalog.md`, newest `canon/10_kanal_puls*` |

**Song package flow (writers' room, one file per step in the job):** `0_BRIEF.md` (her words -> core, classes,
visible proof, reality claims, feasibility) -> `1_DOSSIER.md` (meaning of every line, the gap
in existing videos, measured song map via analyze.yml) -> `2_IDEAS.md` (3 really different worlds as IMAGE boards,
toki picks) -> `3_TREATMENT.md` (script-critic PASS) -> `4_SCRIPT.md` + `shots.json` (script-critic PASS; times
computed from the maps, never hand-typed) -> build (reusable components first, `studio/catalog/status.json` = what
toki liked / approved / faulted) -> stills board >= 12 across the whole film + scene probe + exposure, look-critic
BEFORE toki sees it (no pilot since 2026-10-22) -> final MV + Short cut from it (12-20 s) -> `5_THUMBS.md` (5 MV +
5 Short candidates, 168 px feed sheet, thumb-critic, toki picks) -> `upload.md` -> learn (toki.md verbatim,
catalog line, CASEBOOK, critic calibration).
**Lore Short:** 3 claims -> `plan.json` -> check -> cloud. **POV talking Short** (kind `pov`): voice lines
(edge-tts per line) + Kevin MacLeod bed (CC BY 4.0, credit) + own SFX, `python -m raymi pov <job>` timing check.
**Critics** (`.claude/agents`, model sonnet): blind-viewer first, then look / motion / type / cut / story / vision;
answers stored VERBATIM in `reviews/`, the builder never writes one; only `BLOCK: fault|slop` stops; calibrated per
package (`knowledge/calibration/`) - toki's verdict beats the critics on taste.
**Deliveries:** `<upload day>_Raymi_<recommended title>_<Short|MV>.mp4` + `upload.md`, named files in the chat;
toki uploads herself. "Volles Paket" = MV + Short + thumbnails + upload texts.

## 2. What each surface can do

- **Chat / Cowork (claude.ai):** read the public repo, research, write writers'-room drafts (dossier, ideas,
  treatment, script) as files, review a finished render (download the release asset, contact sheet with ffmpeg,
  judge it like a stranger), upload texts, channel analytics (vidIQ sparingly - credits). Cannot push (no repo
  credentials): hand changes over as a patch / files plus a short prompt for Claude Code. With the PC linked: read and
  place files in `C:\raymi-studio` (no shell there - nothing runs on her PC).
- **Claude Code (VS Code, `C:\raymi-studio`):** builds, tests, commits, pushes, triggers cloud renders. One session =
  one stage. toki's weekly limit is tight: batch critics, no extra subagents without her yes, never watch a render.

## 3. toki's acceptance list - her standing verdicts (weight = how often she had to say it)

Read this as the INTENT behind her words; her example is never the spec. Repeated feedback means the process let it
through - fix the check / the shared part, not the one instance.

**A. How to work with her (x5)**
- "hör auf alles punktuell zu fixen, das sind meistens Strukturfehler und du weisst das" (10-24): measure the fault
  CLASS over the whole film (scene probe, guards), fix it in the shared part, re-measure. Never shot by shot.
- "du hörst nicht zu und denkst nicht nach" (10-22): restate her core before building; compare with the last two
  liked videos; never swing to the opposite extreme after a correction.
- Never show her anything below the bar - not a film the motion / cut / look critics already failed, not a stills
  board no critic has looked at ("billig, flach, leer, lieblos" 10-23). Look at the contact sheet yourself first.
- Every existing step is done and used (measured song analysis, vocal-stem lyric timing, probe) - no shortcuts
  ("du weigerst dich alle Schritte zu machen und präsentierst mir dann Scheiße" 10-15).
- Principles with written reasons, not walls of rules; critics find faults and slop, they do not block her taste.
- Process weight must not eat the idea: the best videos had one strong idea and light process (LML: heaviest
  process, cancelled).
- Never render on her PC. Never say "AI" about Raymi. Ask before accounts / costs.

**B. Idea and story (x5)**
- One world from the song + Raymi (her name 灯闇 = lamp in the dark, body, lore) with a change and a payoff; could
  another VTuber do it? then no. Standard to beat: Renai, Let's Get Weird, POP IN 2.
- Metaphors stay metaphors: "Mountain und Beach sollen Symbole sein ... kein echter Berg bzw. Strand" (10-23).
- A story of actions, understood muted; 5 planned wows, the end the strongest; cold open - the strongest picture in
  the first 0-3 s ("der Anfang muss stark und spannend sein" 10-19). Never "generisch, alle Szenen gleich, PowerPoint".

**C. Raymi on screen - 3D (x4, 10-22..24)**
- She ACTS and moves ("Raymi ist steif") - clips must really play in the film path (they silently did not for two
  videos). Natural motion, on-model.
- Sings by sound: natural mouth shapes, never 100 % open; mouth CLOSED when she does not speak.
- Close framing: face centred, a little high (eyes ~38-40 % from the top); measure head height on stills (standing
  ~1.40 m, seated ~1.05 m), never guess.
- Stands / sits ON real surfaces - no floating, sinking, clipping into furniture, "fällt aus dem Himmel"; her chair /
  props exist where she uses them.
- Hair swings, never flings. Tako ears must never read as horns. She need not be forced into every frame - a shot
  of her world / the main element / a huge lyric may carry a moment.
- The camera imitates a viewer ("observer": slight breath / sway); she reacts to it as someone who sees her.

**D. Look (x5)**
- Depth: foreground / midground / background separated, the back darker than the front ("hinten so hell wie vorne"
  10-24), contrast, motion blur, depth of field.
- Never burnt / overexposed, never oversaturated ("grell" Queencard), never grey and washed out (LML "Urin"); big
  colour masses calm, accents loud; per-act grade (that was what made KING better).
- Places with love and lived-in detail that MAKE SENSE ("leer, lieblos, ohne Details", "keine Textur").
- 3D but a 2D anime feel like her reference MVs; 3D surfaces stylised and matte, never plastic.
- The main element (crown, battery, postcard...) must read at phone size - "muss selber erkannt werden" (10-19).

**E. Lyrics - the most repeated complaint (x10+)**
- "zu klein, zu dünn, wirken aufgesetzt / nicht stimmig mit dem Gesamtbild", "abgeschnitten, hinter Raymi / Assets,
  clippen in Assets" (10-19, 10-20 x2), cheap one-style subtitle bands (old engine, 10 times).
- Timed from the vocal stem word by word, cut one frame before the syllable; heavy weight of her font; one family;
  key word huge, fillers small; colour from the scene; lying on / living in the set; use empty space; may fly over
  her briefly but never parked on her face. Japanese line = romaji + English under it, always.

**F. Edit and camera (x4)**
- "cuts wirken random" (10-22): cuts on the music (`raymi cuts`: hits, stabs, sections), a picture change on most
  hits in the peaks, transitions through things / camera moves, not a menu of wipes.
- "Kamerawinkel und Fahrten eher Standard": crash, push, orbit, crane, through, whip, vertigo... (`camera_moves.py`);
  shot size changes on every cut; no centred bust in front of a background as a moment.

**G. Shorts, thumbnails, upload (x3-4)**
- Hook a swiper reads in < 1 s (face big, bright, <= 8 words), holds >= 1.2 s; comment question readable >= 2.5 s
  before the end; no text in the UI bands; loop; phrase edges, length from the music.
- Thumbnails: 4-5 per format, also for the Short; title BIG and bold, readable at 168 px; a message, not a tidy
  layout; say the song + "fan animation".
- Upload texts in Raymi's voice (lowercase, kaomoji, no em dashes), titles search-first, credits complete.

## 4. Expert craft notes (researched 2026-10-24, cross-checked where marked)

**3D that reads as 2D anime** (Arc System Works, Guilty Gear Xrd, GDC 2015 - Motomura talk + "Animation of GG Xrd /
DBFZ" breakdown): stepped / held keys instead of smooth interpolation - each pose acts as one drawing held for a
chosen time; the fewest poses that still sell the action (they test 10 -> 8 -> 6 -> 3); body parts can hold while
hair / cloth keep moving; proportions and perspective are cheated per shot for emphasis; smears as stretched solid
shapes; hit / speed FX as animated 2D textures. Shading: hard two-tone terminator, no bounce / GI, vertex colours
force shadow areas (under chin, toward feet), edited normals so faces shade cleanly. For raymi5: body on twos (or
held keys on accents), camera at full rate; if face shadows look blotchy, the fix is sphere-ized face normals in
Blender (Abnormal / Normal Edit) - model work, not code.

**Mixamo -> VRM pitfalls:** hips height must be scaled to the model, rest pose and VRM0 / VRM1 axis differences,
root motion kept or stripped deliberately, the clip name (`mixamo.com` vs `Take 001`), bone-map misses that fail
silently. Test on the real rig in the real film path (studio lesson: clips never played for two videos while a side
test looked fine).

**Shorts distribution (vidIQ 2026 + channel data):** a seed audience first, expansion only if it engages; "viewed
vs swiped away" is the first gate; since 31 Mar 2025 every start and loop counts as a view, engaged views count for
YPP; the first 3 s decide. Channel's own data beats generic advice: lore winners kept 45-51 % past the swipe, song
Shorts 22-28 %; lore ~1 sub / 100 views, song Shorts ~0.15.

**Shorts safe zones 1080x1920** (two sources agree): top ~15 % (~288 px) search / menu; bottom title + channel
~15 % minimum, 25-35 % to be safe with long titles; right ~140 px action buttons. Keep hook / CTA in the upper-middle.

**Text size:** Shorts caption guidance 55-85 px on a 1920 frame (3-4.5 % of height), bold 700+, word-by-word
70-85 px. A 16:9 MV watched in the phone's portrait inline player is only ~1/5 of the screen tall, so a word at 7 %
of the frame is tiny there - my inference (not a published number): key words >= 10-12 % of the frame height in the
heavy weight, judged on a ~390 px-wide phone render and measured by CAP height, not the texture box.

**Devices:** smartphones ~63 % of global YouTube watch time (2025), but in the US TV overtook mobile - MVs are also
watched on big screens, where grading flaws and noise show more and small text gets lost.

## 5. End of every session (so the next one does not start from zero)

- Her words verbatim into `jobs/<job>/toki.md`; a new lesson becomes a check, guard or template field - prose alone
  does not stick; big sessions end with a `knowledge/HANDOFF_<date>_<topic>.md`.
- `PROGRESS.md`: the new entry goes at the TOP.
- Commit + push to `main` (merge the worktree branch) - the next session, the chat and other agents only see main.
- In chat sessions: no files on the repo are changed directly; deliver a patch + prompt for Claude Code.

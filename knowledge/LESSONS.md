# LESSONS - what went wrong in the old engine (2026-09-29 .. 10-17), with evidence, and what this studio does instead

Sources: old engine docs LESSONS_LEARNED, AUDIT_2026-10-10, SESSION_2026-10-09_MORE, SESSION_2026-10-16_CRAFT,
VIDEO_LEARNINGS, PROGRESS (repo tokii3/raymi-vtuber). Read once per session that plans a video.

## 1. The big ones (structural)

| # | what happened | evidence | this studio instead |
|---|---|---|---|
| 1 | **Process grew, ideas did not.** The best videos (Renai, POP IN 2, Let's Get Weird) had ONE strong idea and little process. Later jobs (Live My Life, Know My Name) had REFS + TREATMENT + ELEMENTS + VISION + 5 critics + dozens of gates and were worse. | LML: 5 critics FAIL in 4 rounds with the same roots, cancelled after 3+ days (PROGRESS 10-15/16). Renai ~17 h, LGW ~1.5 days. | Effort goes into the IDEA and the SCRIPT (writers' room). Few documents, each one a step. Gates only for real faults. |
| 2 | **Blind QC.** Gates measured proxies (96x54 diffs, counts of headings); reviews were answered by a script of the builder. | 0 "no" in 2,893 gate answers; MORE v1 passed every gate and was a "PowerPoint slideshow" (AUDIT 10-10). | Screening: critics look at the REAL video (phone size, with sound via Gemini), compare shot by shot with the script and with reference frames. Answers stored, never written by the builder. |
| 3 | **Craft lived in throw-away job scripts.** Every good trick (shuffle, transitions, Renai's note lyrics, jellyfish) stayed in one job and was gone the next time. | jobs/*.py 33.8k lines vs engine 5.6k; `swim` reinvented; comp.typo used by 0 jobs after LGW (AUDIT 10-10). | A video is DATA (script + timeline). Every new look, move, set or effect is a reusable studio component, catalogued with a still. |
| 4 | **Knowledge as prose.** 28 docs, 40 memories, RULES rewritten 10x in 10 days; "lyrics integrated" in >= 21 files and still repeated. | AUDIT 10-10 root cause 5. | One PRINCIPLES page; each writers' room step names the 1-2 knowledge files it needs; a lesson becomes a template field, a critic question or a code check - not another paragraph. |
| 5 | **Proxies followed literally made videos safe and dead.** "max 25 % window", "text never on face", "every effect max 2x". | toki 10-06: "statisch ... nichts wird gewagt"; 10-16: rules "zu woertlich". | Principles + written reasons; only section C of PRINCIPLES is hard. |
| 6 | **Feedback rounds without a new idea.** "Better choices" rounds stayed mediocre; big jumps came from a new concept or a hand-written shot list. | Idol v1-v5; Mesmerizer v1 -> v3; Renai v1 -> v2. | If a concept fails twice, the writers' room goes back to IDEAS, not to more fixes (anti-loop). |
| 7 | **The end got weaker** (budget spent early). | Cut rate per third MORE v1 29/19/18; toki 5x. | Script plans the 5 wows with the biggest at the end; screening compares the last third with the first. |
| 8 | **Judged stills, not motion.** | MORE v1, Electric Angel, 3 Shorts 10-06. | Pilot WITH SOUND before every final; critics get motion strips + the video. |

## 2. Craft faults that came back (each has a fixed place now)
- Lyrics a line late / off: LRC times late (~90 ms), an invented "+11.5 s" offset (LML), lines mapped on a bar grid
  (Verity chorus 2 at 33 s instead of 41.9 s). -> the song dossier measures sections and lyric times from the vocal stem.
- Cut sprites / broken sprites (two tails, holes, green fringe) reached videos 8x. -> only `assets/catalog.json`,
  framing pushes cut edges past the frame (studio/src/framing.ts).
- Text slapped on top (6x), static slideshow (6x), flat single colour (6x), no story (5x), not one piece (5x).
  -> PRINCIPLES 1-11, the shooting script fields, the screening questions.
- Silence / TV noise after the last note (KICK BACK 7.7 s), Short cut mid-phrase. -> length from the music, phrase edges.
- Loud source rips (-3.9 LUFS, +5.5 dBTP) -> two-pass loudnorm on every video (raymi/qc.py).
- Warm light turned her skin peach; upscaler look odd. -> skin stays pale; no upscaler.
- Generated backgrounds sneaked in through a storyboard. -> only Raymi is generated.
- Raymi converted into the medium (manga notebook) lost her painted quality. -> never convert the hero.
- Colours too loud (Queencard), grey and washed out (LML). -> big masses calm, accents loud, coloured shadows.

## 3. Process faults
- Started heavy renders next to toki's games / froze her PC with 8 workers. -> renders run in the cloud now.
- Endless waiters (206 min). -> every wait has a max time and a real end marker.
- Showed proxy / placeholder renders without saying so. -> a placeholder is named PLATZHALTER in the same sentence.
- Planned manual steps for toki although she asked for "alles automatisch". -> the cloud renders and checks itself.
- Asset "toki ok" was self-delegated; status spread over 10 files. -> one catalog, status + notes per sprite.
- Long single sessions hit context limits. -> one session = one stage; PROGRESS notes; small commits.

## 4. What is kept on purpose (worked)
- The approval flow: 2-3 concepts as IMAGES -> pilot with sound -> final (toki 10-06).
- Hand-written shot lists / treatments (LGW TREATMENT = the exemplar).
- Measured song analysis before trusting any structure or BPM; cut one frame before the syllable.
- Picture change on loud beats as a hint (dance ~80 %, story ~45 %, calm 10-30 %), not a verdict.
- The critic raster (craft module 00): vision -> blind description -> felt effect -> analysis -> fix list.
- Two-pass loudness, ends with the music, CTA hold, hook hold.

## 5. The first raymi-studio package (KING, 2026-10-18/19) - what the new studio learned
| what happened | evidence | the studio now |
|---|---|---|
| The main element (a crown) was too small to read in almost every shot, and no critic asked about it. | 28 of 30 crown shots at 0.2-4.2 % of the frame height (measured afterwards); critics filed it as one note among many. | The treatment names the main element(s); shots mark them; the hero guard measures size before every render and value contrast after it; every critic answers MAIN ELEMENT first. |
| Lyrics: the same complaint as in the old engine, now "too small, too thin, pasted on" + no romaji / English. | toki 2026-10-19; type-critic and the Short's blind viewer said it too. | Lyrics v2: her heavy weight, colour from the grade, lit + shadowed in the set, lying on surfaces, romaji + English under Japanese lines, a higher readable size at phone size. |
| Critics blocked art toki approved and praised (crowd, props, holds, rhythm). | 6 of 7 FAIL with BLOCKs on taste; toki uploaded, "animationen ... mag ich alle sehr". | Calibration per package; BLOCK only real faults / slop; the catalog status says what toki already approved. |
| Thumbnails were an afterthought: 4 for the MV, none for the Short. | toki 2026-10-19 | A thumbs step in the writers' room (4-5 per format, cloud stills, 168 px feed view, thumb-critic, her pick). |
| The per-act grade made the difference she noticed. | "nach der kritik mit den farben abmischen ... schon besser" | The grade library + shots.json acts are the default look step. |
| Guards ended every mechanical fault class for good. | pilot + final screenings | Keep turning every mechanical fault into a guard - but as a principle with a default and a written exception, never a law that makes videos safe and dead (LESSONS 1.5). |

## 6. The first 3D film (Take Me to the Beach, 2026-10-22..24) - knowledge/HANDOFF_2026-10-24_beach_3d_film.md
| what happened | evidence | the studio now |
|---|---|---|
| "Raymi steif" - her Mixamo clips never played in a film; poses hid it for two videos. | Motion reel: she stood in the stand pose in every shot; a node test on the real rig: hips 0.88 with and without a clip. | Clips load after the model, a key asking for an unloaded clip fails the render, a clip test on the rig. Test the thing on the real path (film), not in a side tool. |
| Fault after fault fixed shot by shot (shot 11 three times, 66 four times, the postcard, the phone...). | toki 2026-10-24: "hör auf alles punktuell zu fixen, das sind Strukturfehler". | The scene probe measures fault CLASSES over the whole film; a class is fixed in the shared part (support.ts, VrmPuppet, the set, the compiler) and re-measured. |
| Heights by hand: she floated up to 0.55 m, sank 0.39 m, things sat inside cushions. | probe run 1 | Bodies stand on the surface a ray finds in the real scene; limbs pushed out of solids. |
| A film shown to toki that the motion / cut critics had failed. | run 40 | A critic FAIL on motion / cut / look = not presentable (memory execution-over-checks). |
| Black frames nobody saw: one invalid pixel spread by bloom / DoF / AO. | shot 31; post off = clean (debug job) | 8-bit post buffer; QC black-picture check; a tiny debug job with variants names the guilty part in one run. |

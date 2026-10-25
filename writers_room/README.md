# Writers' room - how a Raymi video is thought up (before any pixel)

Why this exists: the old engine's best videos (Renai, POP IN 2, Let's Get Weird) came from ONE strong idea and a
hand-written treatment; the worst ones had heavy process and a weak idea (`knowledge/CASEBOOK.md`,
`knowledge/LESSONS.md` 1). So the effort goes HERE. Pixels are cheap to redo, a boring idea is not.

`python -m raymi next <job>` shows the next open step, the template and the knowledge it needs.
`python -m raymi new <job> --kind mv|short|lore` creates the folder with the templates.

## The steps (one file each in `jobs/<date>_<slug>/`)

| # | file | who writes / decides | done when |
|---|---|---|---|
| 0 | `0_BRIEF.md` | Claude, from toki's words (skill raymi-reading-toki) - since 2026-10-25 | her words quoted + dated, core, classes, visible proof lines, reality claims; nothing MISSING unless toki answered (`missing ok: toki <date>`) |
| 1 | `1_DOSSIER.md` | Claude researches (web, measured song analysis) | no TODO left; every lyric line has its meaning; the song map is MEASURED |
| 2 | `2_IDEAS.md` + `boards/` | Claude writes 3 different ideas + 3 key frames each (images) | toki picks one: `approved: toki <date> <idea>` line |
| 3 | `3_TREATMENT.md` | Claude, at the depth of `knowledge/exemplars/lets-get-weird_TREATMENT.md` | script critic PASS + brief-keeper PASS (`reviews/treatment_brief-keeper_<n>.md`) |
| 4 | `4_SCRIPT.md` | Claude merges the makers' drafts (camera-director, choreographer, editor, look-designer: `6_CAMERA_draft` .. `9_LOOK_draft`), a professional ref per key moment | script critic PASS + brief-keeper PASS; every needed part exists or is on the build list |
| 5 | build | reuse what toki liked first (`studio/catalog/status.json`); missing parts become reusable components | `shots.json` exists; each new part has a still in `studio/catalog/` |
| 6 | stills | >= 12 cloud stills across the whole MV (no pilot since toki 2026-10-22), key moments as reference pairs (`refs pair`) | brief-keeper + look-critic in `reviews/stills_*`, `raymi gate <job> stills`, then `stills: toki <date>` in `toki.md` |
| 7 | final | full MV + Short (cut from the MV), rendered in the cloud | `raymi reality` (brief claims), Gemini watch + critics in `reviews/final_*`, `raymi gate <job> final`, toki's verdict in `toki.md` |
| 8 | `5_THUMBS.md` | 5 MV + 5 Short candidates, cloud stills from the sets | `boards/thumb_mv_*` + `thumb_short_*`, thumb-critic in `reviews/thumbs_*`, `picked: toki <date>` |
| 9 | `upload.md` | upload texts (canon/12, channel_rules.py) | toki uploaded: `toki.md` line `uploaded: toki <date>` |

A lore Short uses steps 1 (light: what the channel needs, `canon/10_kanal_puls*`), 2 (3 claims / hooks), 4 (`plan.json`),
then thumbs (5 MV + 5 Short candidates) and upload.

## What each step must achieve (and the trap it avoids)
1. **Dossier - understand before inventing.** What every line MEANS (not only translates), what story the song tells,
   what the original MV and the fan versions already did (the gap is the chance), who loves the song and why, and the
   measured map (sections, turns, drops, pauses). Trap: guessing structure or lyric times (Verity, LML).
2. **Ideas - three really different worlds**, each from the song + Raymi (her name, body, lore). Each must pass:
   could another VTuber do it? story understood muted? is it as strong as Renai / LGW / POP IN 2? Images, not text,
   go to toki (she judges pictures). Trap: one idea with two variations; a reused liked look.
3. **Treatment - the whole video in words.** One idea, Raymi's part, the story with its turn and payoff, colour
   script per section, song map -> picture for every section, 5 wows with the strongest at the end, every element's
   chain (meaning -> idea -> perfect version -> connections -> exists -> reinvented in her world), the Short.
   Trap: thin treatments that leave decisions to the render; effects without a reason.
4. **Shooting script - every shot decided.** Time (measured), what we see, where the camera goes, what Raymi DOES,
   how the lyric lives in the picture, the transition, and WHY (the feeling it serves). This is the contract
   screening checks the video against. Trap: shots per lyric line only (no beat events), a centred bust.

## The script critic (`.claude/agents/script-critic.md`)
Runs after 3 and after 4, before anything is built. It gets the job folder and judges the TEXT against PRINCIPLES,
CASEBOOK and the exemplars: slop test, muted story, the 5 wows and the ending, every element reasoned, dead stretches.
Only `BLOCK: slop|fault|thin` stops; everything else is notes. Its answer is stored verbatim in `reviews/`; the
builder never writes or edits a review. Two BLOCKs on the same step -> back to IDEAS (anti-loop), not a third patch.

## Screening (steps 6 + 7, built in phase 2)
Critics look at the REAL video: phone-size frames, motion strips, a Gemini viewer that watches with sound. Blind first
(knows nothing), then shot by shot "script says X - screen shows Y", then against reference frames of the top three.
Only real faults and slop block; taste notes go to toki with the stills board / the final.

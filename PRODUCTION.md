# PRODUCTION - how a Raymi Short is made (one page)

1. **Idea** (Claude): read `canon/10_kanal_puls*` (what works now), `canon/07_video_catalog.md` (no repeats),
   `canon/series.json`. Pick a series and ONE claim viewers can disagree with.
2. **Script** (Claude): spoken text only, in Raymi's voice (`canon/01_character.md`), numbers spelled out,
   15-35 s for lore. Hook in the first sentence, a twist by second 4-5, payoff that loops into the start,
   comment question at the end.
3. **Plan** (Claude): `jobs/<date>_<slug>/plan.json` (copy the S0 test job as the format reference):
   - `beats`: one per 2-4 s, keyed to a word index (`at_word`), each with a sprite whose expression fits THIS
     line (`assets/catalog.json`, read the notes), `shot` (wide/medium/close/extreme), `side`, `act`
     (pop/hop/tilt/lean/shake/slide_in/bounce/shrink/idle), optional `icon` and `key` words (drawn big in the
     accent colour, the camera kicks on them).
   - `look.world`: deep_sea / night_sky / sunset_reef / paper / screen - the place that fits the story.
   - `hook.text` (<= 8 words, readable in under a second) and `cta.text` (a question).
4. **Check locally if possible**: `python -m raymi check <job>` (the cloud runs it anyway).
5. **Push** -> GitHub Actions renders a draft (voice, check, render, loudness, QC). Look at `reports/<job>/` on the
   `renders` branch (sheet.jpg, qc.json) BEFORE telling toki; fix what fails.
6. **toki watches the draft** (release on GitHub, phone is fine). Her notes -> plan changes -> re-render.
7. **Final**: Actions -> render -> job + `final`. Upload texts follow `canon/12_titles_descriptions.md` and
   `raymi/channel_rules.py`. toki uploads (API uploads of an unverified project stay private).
8. **Learn**: one line in `canon/07_video_catalog.md`; a new reusable trick becomes a studio component.

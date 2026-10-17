# Cloud worker - a Claude cloud session that renders one frame range (extra capacity next to GitHub Actions)

GitHub Actions is the main render path (0 tokens, up to 20 workers, `PRODUCTION.md` "Render"). A Claude cloud session
is the fallback when the Actions minutes run out or a render needs more than Actions gives. Keep the session's work
mechanical (minimal tokens): no planning, no edits to code or jobs.

## Brief for a worker session (copy, fill <job>, <frames>, <k>, <quality>)
1. In the repo checkout: `git pull`. Install once: `pip install -r requirements.txt`, `cd studio && npm ci && npx
   remotion browser ensure` (needs ffmpeg; `apt-get install -y ffmpeg` if missing).
2. If `jobs/<job>/out/props.json` is missing: `python -m raymi props <job>` (needs voice.mp3 + words.json in the job).
3. `cd studio && node render.mjs <job> [--draft] --frames <frames> --muted --out ../render/parts/<job>/part_<k>.mp4`
4. Commit ONLY that part file to branch `parts/<job>` (`git checkout -B parts/<job>`, `git add -f`, commit
   "part <k> of <job>", push). Report: render seconds, file size, any error verbatim. Nothing else.
Joining: any session or the PC runs `python -m raymi assemble <job> render/parts/<job>` then `python -m raymi finish <job>`.

#!/usr/bin/env bash
# Her font grows in the cloud (stills.yml, render.yml): missing glyphs built in her style for the given jobs, her heavy
# weight rebuilt, committed back. Two runs at once (two sessions, 2026-10-19: Firestarter boards + VRM test) both
# rewrote Raymi-Heavy.ttf and the second push died on a binary rebase conflict - so on a failed push the run starts
# again from the newest main (keeping the other run's glyphs) and grows its own on top. Usage: font_grow.sh <job>...
set -e
git config user.name "raymi-font-bot"
git config user.email "actions@users.noreply.github.com"
BRANCH="${GITHUB_REF_NAME:-main}"
for TRY in 1 2 3 4; do
  for J in "$@"; do python -m raymi font ensure "$J"; done
  python -m raymi font heavy        # her heavy weight (lyrics v2) follows every grown glyph
  git add assets/fonts/Raymi-Regular.ttf assets/fonts/Raymi-Heavy.ttf assets/fonts/glyphs_built.txt 2>/dev/null || true
  if git diff --cached --quiet; then exit 0; fi
  git commit -qm "font: glyphs built for $* [skip ci]"
  if git pull --rebase -q origin "$BRANCH" && git push -q origin "HEAD:$BRANCH"; then exit 0; fi
  echo "font: another run changed the font at the same time - growing again on top of it (try $TRY)"
  git rebase --abort 2>/dev/null || true
  git fetch -q origin "$BRANCH"
  git reset -q --hard "origin/$BRANCH"
  sleep $((TRY * 5))
done
echo "font: could not push the grown font after 4 tries"
exit 1

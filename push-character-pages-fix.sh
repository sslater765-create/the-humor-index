#!/usr/bin/env bash
# Restores recurring-character pages to the sitemap and fixes duplicate
# character URLs. Builds first; pushes straight to main.
#   bash ~/the-humor-index/push-character-pages-fix.sh
set -euo pipefail
cd "$HOME/the-humor-index"
FILES=(app/sitemap.ts "app/shows/[slug]/characters/[name]/page.tsx" push-character-pages-fix.sh)

rm -f .git/index.lock .git/HEAD.lock
[ "$(git branch --show-current)" = main ] || { echo "Not on main, stopping."; exit 1; }
git status --short --untracked-files=no
git pull --ff-only origin main
npm run build

git add "${FILES[@]}"
git diff --cached --name-status
git commit -F - <<'MSG'
Put recurring characters back in the sitemap; one canonical per character

Search Console's first day of www data showed character pages earning
more impressions than any other page type, led by recurring guests:
Janice, Judy Geller, Steinbrenner, Dr. Drew, Avery, Diane. Most sit
under the 50-joke sitemap cut added on Monday, so it is back to the
page's own 20-joke / 3-episode bar.

Character canonicals now use the name as stored, so case variants like
/MAC/ and /Mac/ resolve to one page instead of competing.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBNbdKKRwKtHHVqoFCr
MSG
git push origin main
git status --short --untracked-files=no
echo "Pushed. Live in about 90 seconds."

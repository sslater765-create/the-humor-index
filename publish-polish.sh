#!/usr/bin/env bash
# 2026-11-11. Two small fixes found on the live check, pushed to the preview
# branch only. Production changes when ship-to-main.sh is run.
#   bash ~/the-humor-index/publish-polish.sh
set -euo pipefail
cd "$HOME/the-humor-index"
BRANCH="preview/site-pass"

rm -f .git/index.lock .git/HEAD.lock
git switch "$BRANCH"
git merge --ff-only main

echo "== build =="
npm run build

git add components/ui/ScrollToTop.tsx components/ui/ScaleNote.tsx \
        app/rankings/worst-episodes/page.tsx app/rankings/best-jokes/page.tsx \
        app/rankings/funniest-episodes/page.tsx app/rankings/jokes-per-minute/page.tsx \
        publish-polish.sh
git commit -q -F - <<'MSG'
Hide back-to-top on phones; align the ranking scope note with its page

On phones the floating back-to-top button sat on top of the right-aligned
leaderboard score. It is now desktop only. The scope note on the four
narrow ranking pages now uses the same column width as the content below.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBRWoStjiEfP5AfRn17
MSG

git push -u origin "$BRANCH"
git log --oneline -2
echo
echo "Pushed to $BRANCH. Production is unchanged until: bash ~/the-humor-index/ship-to-main.sh"

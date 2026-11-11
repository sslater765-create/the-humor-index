#!/usr/bin/env bash
# 2026-11-11. Twelve new blog posts, dated weekly from Aug 26 to Nov 11.
# Pushes to the preview branch only; production changes with ship-to-main.sh.
#   bash ~/the-humor-index/publish-blog-weekly.sh
set -euo pipefail
cd "$HOME/the-humor-index"
BRANCH="preview/site-pass"

rm -f .git/index.lock .git/HEAD.lock
git switch "$BRANCH"
git merge --ff-only main

echo "== build =="
npm run build

git add app/blog/posts.ts app/blog/page.tsx components/ui/WhatsNewPersonalized.tsx publish-blog-weekly.sh
git commit -q -F - <<'MSG'
Blog: twelve posts on the 13 current-model shows, dated weekly Aug 26 to Nov 11

Arrested Development on Netflix, Parks improving every season, first
seasons scoring lowest, what the rescore changed, The Office after
Michael, Veep and Seinfeld after their creators left, joke types,
callbacks, pilots, consistency, quotability, and Chappelle's Show.

Every figure is computed from public/data for the 13 shows on the
current model. The posts were written on 2026-11-11 and carry backfilled
publication dates.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBRWoStjiEfP5AfRn17
MSG

git push -u origin "$BRANCH"
git log --oneline -2
echo
echo "Pushed to $BRANCH. Production is unchanged until: bash ~/the-humor-index/ship-to-main.sh"

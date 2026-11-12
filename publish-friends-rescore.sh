#!/usr/bin/env bash
# 2026-11-11. Friends rescored on the current model: 231 episodes, 87.1.
# Pushes to the preview branch only; production changes with ship-to-main.sh.
#   bash ~/the-humor-index/publish-friends-rescore.sh
set -euo pipefail
cd "$HOME/the-humor-index"
BRANCH="preview/site-pass"

rm -f .git/index.lock .git/HEAD.lock
git switch "$BRANCH"
git merge --ff-only main

echo "== data check =="
node scripts/check-data.mjs

echo "== build =="
npm run build

git add public/data/friends public/data/shows.json public/data/comedy-dna.json lib/scale.ts publish-friends-rescore.sh
git commit -q -F - <<'MSG'
Friends rescored on the current model: 87.1, ranked 11th of 14

All 231 episodes went through the three-run consensus scorer. The show
moves from 73.0 on the earlier model to 87.1 and joins the ranked board
between Schitt's Creek and Broad City. Seven shows remain unranked.

Comedy DNA shares for Friends are recomputed from the new joke data.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBRWoStjiEfP5AfRn17
MSG

git push -u origin "$BRANCH"
git log --oneline -2
echo
echo "Pushed to $BRANCH. Production is unchanged until: bash ~/the-humor-index/ship-to-main.sh"

#!/usr/bin/env bash
# Promotes the reviewed preview branch to production.
#   bash ~/the-humor-index/ship-to-main.sh
# Fast-forward only: if main has moved since the preview was cut, this stops
# instead of merging, so nothing unexpected reaches the live site.
set -euo pipefail
cd "$HOME/the-humor-index"
BRANCH="preview/site-pass"

rm -f .git/index.lock .git/HEAD.lock
# Build leftovers can leave tracked files modified. Show them, but only stop if
# git itself refuses the switch or the fast-forward.
git status --short --untracked-files=no

git switch main
git merge --ff-only "$BRANCH"
git push origin main
echo
git log --oneline -5
echo "main is now at $BRANCH. Vercel deploys production in about 90 seconds."

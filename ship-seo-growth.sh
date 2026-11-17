#!/usr/bin/env bash
# Puts the reviewed SEO preview branch on production.
#   bash ~/the-humor-index/ship-seo-growth.sh
# Pushes the branch to main without checking anything out, so this folder's
# current branch is untouched. If main has moved since the preview was cut,
# it replays the commit on top of the new main in a scratch worktree,
# rebuilds, and only then pushes.
set -euo pipefail
REPO="$HOME/the-humor-index"
BRANCH="preview/seo-growth"
cd "$REPO"

# If the preview branch was never pushed, build and push it first.
if ! git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null; then
  echo "== $BRANCH is not on GitHub yet; running push-seo-growth.sh first =="
  bash "$REPO/push-seo-growth.sh"
fi

git fetch origin main "$BRANCH"

if git merge-base --is-ancestor origin/main "origin/$BRANCH"; then
  git push origin "origin/$BRANCH:refs/heads/main"
else
  echo "== main moved since the preview; rebasing onto it =="
  WT="$(mktemp -d)/seo-ship"
  git worktree add -B "$BRANCH" "$WT" "origin/$BRANCH"
  ln -s "$REPO/node_modules" "$WT/node_modules"
  [ -f .env.local ] && cp .env.local "$WT/.env.local"
  ( cd "$WT" && git rebase origin/main && npm run build && git push --force-with-lease origin "$BRANCH" && git push origin "$BRANCH:main" )
  git worktree remove --force "$WT"
fi
echo
git log --oneline -3 origin/main
echo "Live in about 90 seconds. Then resubmit the sitemap in Search Console."

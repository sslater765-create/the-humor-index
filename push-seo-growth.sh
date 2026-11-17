#!/usr/bin/env bash
# Puts the SEO growth batch on a preview branch cut from origin/main, builds
# it, and pushes it. Vercel posts a preview URL for the branch.
#   bash ~/the-humor-index/push-seo-growth.sh
#
# It works in a separate git worktree, so whatever branch this folder is on
# (another blog branch, say) is never switched or touched. Once the branch is
# pushed, the SEO edits are taken back out of this folder; they live on the
# preview branch until ship-seo-growth.sh puts them on main.
set -euo pipefail
REPO="$HOME/the-humor-index"
BRANCH="preview/seo-growth"
WT="$(mktemp -d)/seo-growth"
cd "$REPO"

NEW_FILES=(
  lib/quotes.ts
  lib/holidays.ts
  components/rankings/HolidayRanking.tsx
  "app/shows/[slug]/best-jokes/page.tsx"
  app/rankings/best-christmas-episodes/page.tsx
  app/rankings/best-thanksgiving-episodes/page.tsx
)
CHANGED_FILES=(
  app/sitemap.ts
  "app/compare/[matchup]/page.tsx"
  "app/shows/[slug]/page.tsx"
  "app/shows/[slug]/episodes-ranked/page.tsx"
  "app/shows/[slug]/characters/[name]/page.tsx"
  app/rankings/jokes-per-minute/page.tsx
  app/rankings/funniest-episodes/page.tsx
  app/rankings/page.tsx
  app/page.tsx
  app/llms.txt/route.ts
)
SCRIPTS=(push-seo-growth.sh ship-seo-growth.sh)
ALL=("${NEW_FILES[@]}" "${CHANGED_FILES[@]}" "${SCRIPTS[@]}")

for f in "${ALL[@]}"; do
  [ -f "$f" ] || { echo "Missing $f, stopping."; exit 1; }
done

echo "== This folder is on branch: $(git branch --show-current) (left as is) =="
git fetch origin main
git worktree add -B "$BRANCH" "$WT" origin/main

for f in "${ALL[@]}"; do
  mkdir -p "$WT/$(dirname "$f")"
  cp "$f" "$WT/$f"
done
ln -s "$REPO/node_modules" "$WT/node_modules"
[ -f .env.local ] && cp .env.local "$WT/.env.local"

echo "== Production build on origin/main + these changes =="
( cd "$WT" && npm run build )

cd "$WT"
git add "${ALL[@]}"
echo "== Staged =="
git diff --cached --name-status

git commit -F - <<'MSG'
SEO: funniest-quotes pages, holiday rankings, leaner sitemap

Organic search is the only channel growing, and it rewards ranked lists.
This adds more of them and stops spending crawl budget on thin URLs.

- /shows/[slug]/best-jokes for every scored show: the 50 funniest jokes,
  max three per episode, clip shows and repeated moments excluded, with
  why each one lands. ItemList and FAQ schema.
- /rankings/best-christmas-episodes (52 episodes) and
  /rankings/best-thanksgiving-episodes (18). Current-scale shows are
  ranked; shows awaiting rescore are placed within their own series.
- Sitemap: drop queued shows, per-show explore pages, cross-scale compare
  pairs and characters under 50 jokes / 5 episodes; add the new pages.
- noindex queued-show teasers and cross-scale compare pairs.
- Internal links to the new pages from the JPM ranking (top search page),
  homepage, rankings hub, show, episodes-ranked and character pages.
- JPM meta description now built from live data (it still said 9 shows).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBNbdKKRwKtHHVqoFCr
MSG

git push -u origin "$BRANCH"
cd "$REPO"
git worktree remove --force "$WT"

# Take the edits back out of this folder so they cannot ride along in an
# unrelated commit on whatever branch is checked out here.
git checkout -- "${CHANGED_FILES[@]}"
rm -f "${NEW_FILES[@]}"
rmdir -p "app/shows/[slug]/best-jokes" app/rankings/best-christmas-episodes \
  app/rankings/best-thanksgiving-episodes components/rankings 2>/dev/null || true

echo
git status --short --untracked-files=no
echo "Pushed $BRANCH. Vercel posts a preview URL in about 90 seconds."
echo "When it looks right: bash ~/the-humor-index/ship-seo-growth.sh"

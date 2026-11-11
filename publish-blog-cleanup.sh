#!/usr/bin/env bash
# 2026-11-10. Ships three commits, then pushes:
#   1. The September data work that never went out (collapsed double-scored
#      hours, Chappelle IMDb remap, Office characters, ranking scale notes).
#      This replaces publish-collapse-and-characters.sh.
#   2. The blog cleanup: six posts retired, the rest restricted to the 13
#      shows scored on the current model.
#   3. The site pass: leaderboard split by scale, score-first rows, shorter
#      homepage, five-item nav, shorter show hero.
# To look before shipping:  cd ~/the-humor-index && npm run dev
# Run:  bash ~/the-humor-index/publish-blog-cleanup.sh
# This pushes to the branch preview/site-pass ONLY. Production does not change.
# After checking the Vercel preview:  bash ~/the-humor-index/ship-to-main.sh
set -euo pipefail
cd "$HOME/the-humor-index"

rm -f .git/index.lock .git/HEAD.lock

# Everything goes to a preview branch, not main. Vercel builds a preview URL
# for it; production is untouched until ship-to-main.sh is run.
BRANCH="preview/site-pass"
git switch -c "$BRANCH" 2>/dev/null || git switch "$BRANCH"
echo "== on branch $(git branch --show-current) =="
rm -rf _to_delete

echo "== working tree before =="
git status --short | grep -v '^ M public/data' || true
echo "   (plus $(git status --short | grep -c '^ M public/data' || true) modified files under public/data)"

echo "== drop the eight collapsed episode files =="
git rm -q -f --ignore-unmatch \
  public/data/30-rock/s05e21.json \
  public/data/parks-and-recreation/s06e22.json \
  public/data/the-fresh-prince-of-bel-air/s01e09.json \
  public/data/friends/s02e13.json \
  public/data/friends/s05e24.json \
  public/data/friends/s07e24.json \
  public/data/friends/s09e24.json \
  public/data/friends/s10e18.json

echo "== checks =="
node scripts/check-data.mjs
python3 video/check_claims.py

echo "== tests =="
npm test

echo "== build =="
npm run build

echo "== commit 1: September data work =="
git add app/rankings public/data video tiktok-top-joke-series-30-sep2026.md
git commit -q -F - <<'MSG'
Collapse eight double-scored hour-longs, remap Chappelle IMDb, rebuild Office characters

Prepared 2026-09-09 and never pushed. Drops the second half of eight
hour-long episodes that had been scored twice from one transcript,
realigns Chappelle's Show IMDb ratings, publishes the rebuilt Office
character file, and adds the scale note to both character rankings.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBRWoStjiEfP5AfRn17
MSG

echo "== commit 2: blog cleanup =="
git add app/blog/posts.ts app/blog/page.tsx app/feed.xml/route.ts next.config.mjs \
        components/ui/WhatsNewPersonalized.tsx publish-blog-cleanup.sh ship-to-main.sh
git commit -q -F - <<'MSG'
Blog: retire posts on unrescored shows, restrict the rest to the current model

Retired with 301s to /blog/: futurama-launch, the-simpsons-all-20-seasons,
fresh-prince-geoffrey-butler, sunny-renaissance (shows still on pre-2026
scores), war-reconciliation (every WAR figure obsolete), and
character-comedy-spectrum (its joke-type shares predate the rescores:
Schitt's Creek 69.1% is now 40.0%).

density-vs-craft is rewritten around 30 Rock vs Broad City. The old lead
compared Fleabag with The Simpsons, which was never rescored. Correlations
recomputed on the true 13 current-model shows.

imdb-vs-humor-index recomputed on those 13 shows (1,057 episodes,
within-show r = +0.27). The noise-floor, Bayesian and Office posts lose
their references to current scores of unrescored shows.

The blog index and RSS feed now read from posts.ts instead of keeping
their own copies. The feed had been serving nine retired posts.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBRWoStjiEfP5AfRn17
MSG

echo "== commit 3: site pass =="
git add lib/scale.ts lib/siteStats.ts app/page.tsx app/LeaderboardClient.tsx \
        components/layout/Nav.tsx 'app/shows/[slug]/page.tsx' app/shows/ShowsGrid.tsx \
        app/llms.txt/route.ts app/api/embed/route.ts app/methodology/page.tsx \
        lib/tiers.ts lib/__tests__/logic.test.ts components/ui/ScaleNote.tsx \
        app/rankings app/50-funniest-episodes/page.tsx app/cards/page.tsx \
        components/explorer/HumorIndexExplorer.tsx 'app/shows/[slug]/[season]/[episode]/page.tsx' \
        lib/scoring.ts 'app/shows/[slug]/ShowPageClient.tsx' 'app/shows/[slug]/explore/page.tsx' \
        'app/shows/[slug]/episodes-ranked/page.tsx' 'app/shows/[slug]/arc/ArcClient.tsx'
git commit -q -F - <<'MSG'
Rank only shows on the current scale; score-first leaderboard; shorter homepage

lib/scale.ts lists the eight shows still awaiting a rescore. The homepage
leaderboard, show-page rank text, the catalog, llms.txt and the embed all
rank the other 13 and show the eight unranked. Delete a slug from that set
when its rescore is published.

Leaderboard rows lead with the score instead of a tier badge that 16 of
21 shows shared. The homepage drops the 21-card catalog (it repeated the
leaderboard) and the inline newsletter card; the sticky bar remains.
Nav goes from ten links to five plus a More menu. The show-page hero is
shorter so the scores sit on the first screen, and the summary counts
scored episodes, not aired ones. The Featured Insight now matches the
density post, which it used to contradict.

Every cross-show ranking page (episodes, jokes, characters, jokes per
minute, the 50 funniest) now covers only current-scale shows and says so.

Tier cut-offs are recalibrated for the current scale (97/92/87/82); the
April cut-offs put 99% of current-model episodes in Elite. Shows awaiting
a rescore keep the April cut-offs, which were tuned on their scale.

Episode rankings break ties on the Humor Index by average craft plus
impact, then jokes per minute. 49 episodes sit on the 100 cap and their
order was arbitrary. No published number changes.

comedy-dna.json joke-type shares are recomputed from the published joke
data for the 13 current-scale shows (Schitt's Creek character comedy was
still 69.1%; it is 40.0%). Fleabag and Freaks and Geeks gain entries, so
they are now eligible in the Comedy DNA quiz recommendations.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBRWoStjiEfP5AfRn17
MSG

echo "== push to the preview branch =="
git push -u origin "$BRANCH"

echo "== working tree after =="
git status --short
git log --oneline -4

echo
echo "Pushed to $BRANCH. Production is unchanged."
echo "Find the preview URL in the Vercel dashboard (Deployments, branch $BRANCH)"
echo "and send it over. When it looks right: bash ~/the-humor-index/ship-to-main.sh"

#!/usr/bin/env bash
# Ships the "Who is X" upgrade to every character page. Builds first.
#   bash ~/the-humor-index/push-character-who-is.sh
set -euo pipefail
cd "$HOME/the-humor-index"
FILES=("app/shows/[slug]/characters/[name]/page.tsx" push-character-who-is.sh)

rm -f .git/index.lock .git/HEAD.lock
[ "$(git branch --show-current)" = main ] || { echo "Not on main, stopping."; exit 1; }
git status --short --untracked-files=no
git pull --ff-only origin main
npm run build

git add "${FILES[@]}"
git diff --cached --name-status
git commit -F - <<'MSG'
Character pages answer "who is X" first

Search Console shows character pages drawing the most impressions, from
bare name searches ("janice friends", "dr drew 30 rock", "judy geller"),
but ranking 8 to 16. Each page now opens with the answer those searches
want: who the character is, main or recurring, the actor, how many
episodes they land jokes in and the earliest one, their funniest line
(one they lead, not one they are only in), and every episode for a
recurring character or the twelve busiest for main cast. FAQ schema for
who is / who plays / funniest line / which episodes.

Titles become "<Full name> in <Show>: Funniest Lines & Every Episode"
and the meta description leads with the who-is answer.

Episode counts come from the jokes on the page, capped at the episodes
on the site; the stored count could exceed it (George read 171 of 168).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBNbdKKRwKtHHVqoFCr
MSG
git push origin main
git status --short --untracked-files=no
echo "Pushed. Live in about 90 seconds."

#!/usr/bin/env bash
# Finishes the It's Always Sunny rescore and publishes it.
#   bash ~/the-humor-index/finish-sunny.sh
#
# Run after rescore-sunny-s05e01.sh has put the last episode on the current
# model. Stops unless all 177 episodes are on it.
set -euo pipefail
PIPE="$HOME/Downloads/the-humor-index"
SITE="$HOME/the-humor-index"

cd "$PIPE"
source .venv/bin/activate
bash backup-db.sh

python3 - <<'PY'
import sqlite3
c = sqlite3.connect("data/humor_index.db")
sid = c.execute("SELECT id FROM shows WHERE slug='its-always-sunny'").fetchone()[0]
total = c.execute("SELECT COUNT(*) FROM episodes WHERE show_id=?", (sid,)).fetchone()[0]
left = c.execute("""SELECT COUNT(*) FROM episodes e LEFT JOIN episode_scores s ON s.episode_id=e.id
                    WHERE e.show_id=? AND (s.scale_version IS NULL OR s.scale_version!='hi-v3-sonnet46')""", (sid,)).fetchone()[0]
print(f"{total} episodes, {left} not on the current model")
if left:
    raise SystemExit("Stopping: run rescore-sunny-s05e01.sh first.")
PY

python3 reaggregate_show.py --slug its-always-sunny
python3 refresh_show.py --slug its-always-sunny
python3 apply_imdb_ratings.py --slug its-always-sunny
python3 build_its_always_sunny_characters.py || echo "WARNING: character rebuild failed; the old characters.json stays"

cd "$SITE"
rm -f .git/index.lock .git/HEAD.lock
[ "$(git branch --show-current)" = main ] || { echo "Not on main, stopping."; exit 1; }
git pull --ff-only origin main
python3 - <<'PY'
p = "lib/scale.ts"
s = open(p).read()
s = s.replace("  'its-always-sunny',\n", "", 1)
open(p, "w").write(s)
PY
node scripts/check-data.mjs
npm run build

git add public/data/its-always-sunny public/data/shows.json lib/scale.ts finish-sunny.sh
git diff --cached --stat | tail -3
git commit -F - <<'MSG'
It's Always Sunny rescored on the current model

All 177 episodes went through the three-run consensus scorer and the
show joins the ranked board; six shows remain unranked. Its Christmas
and Thanksgiving episodes move into the ranked part of the holiday pages.

S05E01 "The Gang Exploits the Mortgage Crisis" was refused by the scorer
five times on its raw transcript. It was scored from a copy in which two
passages (a home-invasion fantasy at 6:23 and a slur at 11:39) are
summarized as stage notes; every other line is verbatim.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FEPyBNbdKKRwKtHHVqoFCr
MSG
git push origin main
echo
grep -A3 '"its-always-sunny"' public/data/shows.json | head -4 || true
echo "Pushed. Live in about 90 seconds."

#!/usr/bin/env bash
# Batch-render every video that has a clip and a timestamp.
#
#   1. drop source clips in video/clips/ named NN-anything.mp4  (09-asian-jim.mp4)
#   2. put punchline timestamps in video/timestamps.txt  ->  "09 00:12.4"
#   3. ./video/render_all.sh
#
# Re-running only renders what is missing, so it is safe to interrupt.
set -uo pipefail
cd "$(dirname "$0")/.."
TS=video/timestamps.txt
[ -f "$TS" ] || { echo "missing $TS"; exit 1; }
ok=0; skip=0; fail=0
while read -r n t rest; do
  [ -z "${n:-}" ] && continue
  case "$n" in \#*) continue;; esac
  n=$(printf '%02d' "$((10#$n))")
  out="video/out/$n.mp4"
  if [ -f "$out" ]; then echo "== $n already rendered, skipping"; skip=$((skip+1)); continue; fi
  clip=$(ls video/clips/$n-*.* 2>/dev/null | head -1)
  if [ -z "$clip" ]; then echo "== $n no clip in video/clips/, skipping"; skip=$((skip+1)); continue; fi
  echo "== $n  $clip  punchline $t"
  if python3 video/render.py "$((10#$n))" "$clip" --punchline "$t" ${rest:-}; then ok=$((ok+1)); else fail=$((fail+1)); fi
done < "$TS"
echo; echo "rendered $ok, skipped $skip, failed $fail"

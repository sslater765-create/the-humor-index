#!/usr/bin/env bash
# Download every source clip for the Top Joke Series.
#
#   ./video/fetch_clips.sh          # everything still missing
#   ./video/fetch_clips.sh 11 12    # just those
#
# Skips anything already in video/clips/. Safe to re-run.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p video/clips
FMT='bv*[height<=1080]+ba/b'

# number|url|slug
CLIPS=(
"11|https://www.youtube.com/watch?v=oizLqzdDQRk|duke-silver"
"12|https://www.youtube.com/watch?v=vm2uzJ_OM0A|gonna-jack"
"13|https://www.youtube.com/watch?v=QlCc0sXgIDw|loose-seal"
"14|https://www.youtube.com/watch?v=LDpSABM-ypE|gladys-glynnis"
"15|https://www.youtube.com/watch?v=3FsFUZVyG3E|eating-the-dog"
"16|https://www.youtube.com/watch?v=p-RIuSAlh9s|mariah-carey"
"17|https://www.youtube.com/watch?v=-WCriLd2Nyk|bart-gets-famous"
"18|https://www.youtube.com/watch?v=0Djs1ItWvkY|marry-his-cousin"
"19|https://www.youtube.com/watch?v=E9rdDzQySgs|god-bless-america"
"20|https://www.youtube.com/watch?v=lxL9dl1zR0o|own-grandfather"
"21|https://www.youtube.com/watch?v=_A2g8WuEjRg|foisted"
"23|https://www.youtube.com/watch?v=ZdVAH8Z5O90|rick-james"
"24|https://www.youtube.com/watch?v=YWLG7OQCuFo|ex-girlfriend-choir"
"27|https://www.youtube.com/watch?v=piPz1prPrzs|yellow-light"
"28|https://www.youtube.com/watch?v=FXE_yUy5Ll8|im-black"
"29|https://www.youtube.com/watch?v=z_uI-_dG96w|swingers"
"30|https://www.youtube.com/watch?v=PlIzKaGBeHk|perfect-crime"
"31|https://www.youtube.com/watch?v=PA5HRW4DWz0|magic-loogie"
"32|https://www.youtube.com/watch?v=9NLd53QJmmg|shark-week"
"33|https://www.youtube.com/watch?v=hA521XgMfdA|skim-milk"
"34|https://www.youtube.com/watch?v=RlJM8-7IMBM|huge-mistake"
"35|https://www.youtube.com/watch?v=XeE2-VSrEtU|pile-of-coats"
"36|https://www.youtube.com/watch?v=MVaxIwIFsow|fold-in-the-cheese"
"37|https://www.youtube.com/watch?v=CbwmOtJFJF0|eat-stickers"
"38|https://www.youtube.com/watch?v=wGclR8_7jZs|steamed-hams"
)
want=("$@")
ok=0; skip=0; fail=0
for row in "${CLIPS[@]}"; do
  IFS='|' read -r n url slug <<< "$row"
  if [ ${#want[@]} -gt 0 ]; then
    hit=0; for w in "${want[@]}"; do [ "$((10#$w))" -eq "$((10#$n))" ] && hit=1; done
    [ $hit -eq 1 ] || continue
  fi
  if ls video/clips/$n-* >/dev/null 2>&1; then echo "== $n already have it"; skip=$((skip+1)); continue; fi
  echo "== $n  $slug"
  if yt-dlp -f "$FMT" -o "video/clips/$n-$slug.%(ext)s" "$url"; then ok=$((ok+1)); else
    echo "   FAILED — find another upload for $n"; fail=$((fail+1)); fi
done
echo; echo "downloaded $ok, skipped $skip, failed $fail"
echo
echo "No source found for #22 Fleabag, #25 Larry Sanders, #26 Broad City."
echo "Check resolution before rendering:  for f in video/clips/*; do echo -n \"\$f \"; ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 \"\$f\"; done"

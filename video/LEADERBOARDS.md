# Leaderboard posts

No footage, no clip sourcing, no copyright exposure. Everything is generated
from `public/data`, so a post is a JSON entry plus one command.

```
python3 video/make_leaderboard.py video/leaderboards.json          # all
python3 video/make_leaderboard.py video/leaderboards.json negative # one
```

Output lands in `video/out/lb-<key>.mp4`, 1080x1920, about 6.6 seconds, silent.
Each spec carries its own `caption` and `pinned` text, so the JSON is the whole
post.

## Why these exist

The May numbers say the cross-show leaderboard post drew 14 comments on 635
views, three to seven times any other post that month, while the clip-and-score
videos topped out at 1,200 views and two comments. People argue with rankings.
They do not argue with a number stamped on a clip.

## Before posting the flagship

The obvious post is who is #1 all-time, and it is **not ready**. The live site
says Homer at 2,323.1 with Larry David second at 2,306.3. Recomputing from
current craft and impact puts Larry David first at 2,353.9 and Homer second at
2,320.6.

The gap is 33 points. Rounding `avg_craft` and `avg_impact` to two decimals in
the published files puts about +/-22 of uncertainty on Larry and +/-46 on Homer,
so the answer cannot be called from the published data at all. It needs the
scoring pipeline to emit WAR at full precision.

Eight shows are also carrying WAR values computed before their last rescore:
Curb, It's Always Sunny, Veep, Flight of the Conchords, The Larry Sanders Show,
Fresh Prince, Chappelle's Show and Freaks and Geeks. Curb is the worst, with
Larry David off by 47.6. Everything else differs only by two-decimal rounding.

So: regenerate WAR for those eight, then the #1 post is safe to build. The three
below avoid the question entirely.

## Built and ready

| Key | Claim | Depends on |
|---|---|---|
| `negative` | Rachel Green is the only lead below replacement | Friends, current |
| `per_episode` | Fleabag out-rates Larry David more than 2x per episode | Fleabag, current |
| `broad_city` | Two of the top 15 come from a 50-episode show | Broad City, current |

`negative` is the strongest of the three and the one to run first. It has a
named lead, a number nobody expects, and a defensible method behind it.

## The #1 question, settled

Earlier this file said the flagship post was blocked because Homer led Larry
David by 16.8 on the published data and trailed him by 33.3 once WAR was
recomputed. Rebuilding both from the raw joke rows settles it: Homer wins by
roughly 200, not 17, and the published gap is understated because of a second
staleness problem.

**The Simpsons character table covers 441 episodes. 552 are scored.** It was
built at the S1–20 mark (commit 3c3964d) and never rebuilt as later seasons
landed. Homer's stored 9,286 jokes across 441 episodes is really about 11,100
across 545, which puts his WAR near 2,516 rather than 2,323. Larry David's
stored 2,306 is understated too, but only by about 48. Every other show's
character table is current on episode coverage.

So the ordering on the live site is right even though both numbers are low, and
regenerating either table only widens Homer's lead. `goat` and `quality` are
safe to post now.

**Not fixed here.** Rebuilding the Simpsons table needs the pipeline. Character
aggregation cannot be reproduced from `public/data` alone: compound entries like
"Ross and Chandler" or "Homer/Marge" are attributed by a rule that lives in the
pipeline, and recomputing without it undercounts leads by about 2.5%. That is
small enough not to disturb the ranking and too large to write back into the
published files.

| Key | Claim | Safe to post |
|---|---|---|
| `goat` | Homer is #1 and the worst writer in the top five | yes |
| `quality` | Jack Donaghy is best per joke; Homer is 22nd of 40 | yes |

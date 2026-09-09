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

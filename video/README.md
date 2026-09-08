# Top Joke Series — render pipeline

Everything for the 30 videos (#9–#38) except the source clips, which have to
come from you. Per video your job is one download, one timestamp, one command.

## One-time setup

Nothing to install. Uses ffmpeg, Python and Pillow, all already on this machine.

You need `yt-dlp` for the clips:

    brew install yt-dlp

## Per video

**1. Get the clip.** Each entry in `../tiktok-top-joke-series-30-sep2026.md` has a
**YouTube search** line. Grab 20–40 seconds around the punchline:

    yt-dlp -f 'bv*[height<=1080]+ba/b' -o 'video/clips/09-asian-jim.mp4' '<url>'

Name it `NN-anything.mp4` where NN is the video number, zero-padded.

**2. Find the punchline.** Scrub to the moment the punchline *lands* (for #9,
"hats off to you for not being racist"). Note the timestamp.

**3. Render.**

    python3 video/render.py 9 video/clips/09-asian-jim.mp4 --punchline 0:12.4

Out comes `video/out/09.mp4`: 1080×1920, 30fps, H.264/AAC, about 16 seconds.
Takes roughly 30 seconds.

## Batch

Put every timestamp in `video/timestamps.txt` (it is pre-seeded with all 30
lines, commented out), drop the clips in `video/clips/`, then:

    ./video/render_all.sh

It skips anything already rendered, so it is safe to interrupt and re-run.

## What the renderer does

| Time | What |
| :-- | :-- |
| 0s | cold open, original audio, logo lock-up top and handle bottom, nothing else |
| punchline | score popup punches in over the moment, burned-in caption fades up |
| +3.8s | popup fades, caption stays |
| after the cut | full-bleed end card: the stat line, the combined score, the "Fight me." bait |
| last 1.2s | hard cut back to the punchline frame, so the loop is seamless |

16:9 source is centred at full width over a blurred, darkened copy of itself, so
nothing is cropped off the sides.

Timing controls, if a joke needs more room to breathe:

    --pre 8      seconds of setup before the punchline   (default 6)
    --post 4     seconds to run after it                 (default 5)
    --no-endcard bare cut, for checking framing quickly

Total length is `pre + post + 5.2`. Keep it under 20 seconds; the renderer warns
if you go over.

## Cards

`video/cards/` holds four PNGs per video, pre-rendered from `videos.json`:
`chrome` (logo and handle), `caption` (the burned-in punchline), `popup` (the
score), `endcard`. To change wording, edit the markdown, then:

    python3 video/parse_scripts.py     # markdown -> videos.json
    python3 video/make_cards.py        # videos.json -> cards (add numbers for just some)

`make_cards.py` auto-sizes every string, so longer copy shrinks to fit rather
than overflowing.

## After a rescore

Every figure in the scripts is a snapshot of the data: combined scores, craft
and impact, ranks, episode and joke counts, and the cross-show comparisons. A
rescore moves all of it. When new data lands:

    npm run check:claims

It verifies 193 figures across the 30 scripts and names every video that no
longer matches. Then fix the wording in the markdown and regenerate:

    python3 video/parse_scripts.py     # markdown -> videos.json
    python3 video/make_cards.py        # add numbers to rebuild only some
    python3 video/make_publer_csv.py

Any video already rendered needs re-rendering after its cards change. The clips
and timestamps do not change, so that is one command each.

It is deliberately conservative: it only checks unambiguous phrasings, so a
sentence it cannot resolve is left unchecked rather than reported as an error.
`-v` lists what it skipped.

## Scheduling

`video/publer.csv` is all 30 rows in Publer's import format: the scheduled slot
(daily, 7:30 PM ET, Sep 8 to Oct 7), the post caption with hashtags, and the
pinned comment in the Comment(s) column.

Media URL is deliberately blank, because Publer's importer wants a URL and these
files are local. Import the CSV, then attach `video/out/NN.mp4` to each row. Rows
are in date order, so they line up with the numbers.

To regenerate after editing the scripts:

    python3 video/make_publer_csv.py

## Not in git

`clips/` and `out/` are gitignored. Source clips are copyrighted footage and the
renders are large; neither belongs in the repo.

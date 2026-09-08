#!/usr/bin/env python3
"""Write video/publer.csv — one row per video, in Publer's import format."""
import csv,json,os,datetime
HERE=os.path.dirname(os.path.abspath(__file__))
vids=sorted(json.load(open(f'{HERE}/videos.json')),key=lambda v:v['slot'])
COLS=["Date - Intl. format or prompt","Text","Link(s) - Separated by comma for FB carousels",
"Media URL(s) - Separated by comma","Title - For the video, pin, PDF ..","Label(s) - Separated by comma",
"Alt text(s) - Separated by ||","Comment(s) - Separated by ||","Pin board, FB album, or Google category",
"Post subtype - I.e. story, reel, PDF ..","CTA - For Facebook links or Google",
"Reminder - For stories, reels, shorts, and TikToks"]
with open(f'{HERE}/publer.csv','w',newline='') as f:
    w=csv.writer(f); w.writerow(COLS)
    for v in vids:
        dt=datetime.datetime.fromisoformat(v['slot'])
        text=(v['post_caption']+"\n\n"+v['hashtags']).strip()
        title=f"{v['show'].title()} — {v['burned_caption'][:60]}"
        w.writerow([dt.strftime('%Y-%m-%d %H:%M'),text,'','',title,'Top Joke Series','',
                    v['pinned'],'','','',''])
print(f"wrote {HERE}/publer.csv  ({len(vids)} rows, {vids[0]['slot'][:10]} to {vids[-1]['slot'][:10]})")
print("Media URL is intentionally blank: attach video/out/NN.mp4 to each row after import (rows are in date order).")

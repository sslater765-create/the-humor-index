#!/usr/bin/env python3
"""Verify every rank claim in the scripts against the live scored data.

The scripts assert things like "#1 OF 13,316 SEINFELD JOKES". Those ranks are a
snapshot: repairing one episode can silently demote a joke and leave a video
claiming a #1 it no longer holds. That happened on 2026-09-08, when fixing the
Dinner Party record pushed Asian Jim from #1 to #2 hours before it was due to
post. Run this after any change to public/data.
"""
import json,glob,os,re,sys
EP=re.compile(r'^s\d{2}e\d{2}\.json$')
HERE=os.path.dirname(os.path.abspath(__file__))
BASE=os.path.join(HERE,'..','public','data')
SLUG={'THE OFFICE':'the-office','SEINFELD':'seinfeld','PARKS AND RECREATION':'parks-and-recreation',
'30 ROCK':'30-rock','ARRESTED DEVELOPMENT':'arrested-development','FRIENDS':'friends',
"IT'S ALWAYS SUNNY":'its-always-sunny',"SCHITT'S CREEK":'schitts-creek','THE SIMPSONS':'the-simpsons',
'COMMUNITY':'community','VEEP':'veep','FUTURAMA':'futurama','CURB YOUR ENTHUSIASM':'curb-your-enthusiasm',
'FLEABAG':'fleabag',"CHAPPELLE'S SHOW":'chappelles-show','FLIGHT OF THE CONCHORDS':'flight-of-the-conchords',
'THE LARRY SANDERS SHOW':'the-larry-sanders-show','BROAD CITY':'broad-city','TAXI':'taxi',
'THE FRESH PRINCE':'the-fresh-prince-of-bel-air','FREAKS AND GEEKS':'freaks-and-geeks'}
cache={}
def ranked(slug):
    if slug in cache: return cache[slug]
    rows=[]
    for f in glob.glob(os.path.join(BASE,slug,'*.json')):
        if not EP.match(os.path.basename(f)): continue
        ep=json.load(open(f))
        for j in ep.get('jokes',[]):
            c,i=j.get('craft_total'),j.get('impact_score')
            if c is None or i is None: continue
            rows.append(((c+i)/2,ep['season'],ep['episode_number']))
    rows.sort(reverse=True); cache[slug]=rows; return rows

vids=json.load(open(os.path.join(HERE,'videos.json')))
problems=[]
for v in vids:
    slug=SLUG.get(v['show'])
    if not slug: problems.append(f"#{v['n']}: unknown show {v['show']!r}"); continue
    rows=ranked(slug)
    best=[r[0] for r in rows if (r[1],r[2])==(v['season'],v['episode'])]
    if not best: problems.append(f"#{v['n']} {v['show']}: cited episode S{v['season']:02d}E{v['episode']:02d} has no scored jokes"); continue
    score=max(best)
    # competition ranking: joint 5th counts as 5th, not 6th
    actual=sum(1 for r in rows if r[0]>score)+1
    sub=v['popup_sub'].upper()
    m=re.search(r'#(\d+)\s+OF',sub)
    if m:
        claimed=int(m.group(1))
    elif re.search(r'\bTOP\b.*\b(THAT|WE|WITHOUT|POSTABLE|QUOTED|QUOTABLE)\b',sub):
        continue                       # deliberately qualified: "top joke that isn't X"
    elif 'TOP-SCORED' in sub or sub.startswith('#1'):
        claimed=1
    else:
        continue                       # not a rank claim
    if claimed!=actual:
        problems.append(f"#{v['n']} {v['show']} S{v['season']:02d}E{v['episode']:02d}: claims #{claimed}, data says #{actual}  [{v['popup_sub']}]")
print(f"checked rank claims on {len(vids)} videos")
if problems:
    print(f"\n{len(problems)} problem(s):")
    for p in problems: print("  x "+p)
    sys.exit(1)
print("all rank claims match the current data")

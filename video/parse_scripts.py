#!/usr/bin/env python3
"""Parse tiktok-top-joke-series-30-sep2026.md into video/videos.json."""
import json,re,sys,os,datetime
SRC=os.path.join(os.path.dirname(__file__),'..','tiktok-top-joke-series-30-sep2026.md')
txt=open(SRC).read()
blocks=re.split(r'^## #(\d+) — (.+)$', txt, flags=re.M)[1:]
out=[]
for num,head,body in zip(blocks[0::3],blocks[1::3],blocks[2::3]):
    def sec(label,nxt):
        m=re.search(rf'\*\*{label}\*\*\s*\n?(.*?)(?=\n\*\*(?:{nxt})\*\*|\n---|\Z)',body,re.S)
        return m.group(1).strip() if m else ''
    post=re.search(r'\*\*Post:\*\* (\w+) (\w+) (\d+), (\d+):(\d+) (AM|PM) ET',body)
    mon={'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
    hh=int(post.group(4))%12+(12 if post.group(6)=='PM' else 0)
    dt=datetime.datetime(2026,mon[post.group(2)],int(post.group(3)),hh,int(post.group(5)))
    joke=sec('The joke:','YouTube search:|Framing note:|Airability note:|Honesty note:|Hook is the negative:')
    ep=re.search(r'S(\d+)E(\d+) "([^"]+)"',joke)
    sc=re.search(r'Combined \*\*([\d.]+)\*\* \(craft ([\d.]+), impact ([\d.]+)(?:, quotability ([\d.]+))?\)',joke)
    pop=sec('Score popup:','End card:')
    big=re.search(r'- Big: \*\*(.+?)\*\*',pop); sub=re.search(r'- Sub: (.+)',pop)
    cap=re.search(r'- Caption burned in: "(.+?)"',pop)
    endcard=sec('End card:','Caption:')
    fight=re.search(r'\*\*(.+?)\*\* Fight me\.',endcard)
    endlines=[l.strip() for l in endcard.split('\n') if l.strip() and 'Fight me' not in l]
    postcap=sec('Caption:','Pinned comment:')
    tags=[l for l in postcap.split('\n') if l.strip().startswith('#')]
    captxt='\n\n'.join(l.strip() for l in postcap.split('\n') if l.strip() and not l.strip().startswith('#'))
    clip=sec('Clip target:','Score popup:')
    dur=re.match(r'(\d+)[–-](\d+)s',clip)
    out.append(dict(
        n=int(num), slot=dt.isoformat(), show=head.split(' — ')[0].strip(),
        headline=head.split(' — ',1)[1].strip() if ' — ' in head else '',
        season=int(ep.group(1)) if ep else None, episode=int(ep.group(2)) if ep else None,
        episode_title=ep.group(3) if ep else None,
        combined=float(sc.group(1)) if sc else None, craft=float(sc.group(2)) if sc else None,
        impact=float(sc.group(3)) if sc else None,
        quotability=float(sc.group(4)) if sc and sc.group(4) else None,
        popup_big=big.group(1).strip() if big else '', popup_sub=sub.group(1).strip() if sub else '',
        burned_caption=cap.group(1) if cap else '',
        end_card=endlines, fight_line=fight.group(1).strip() if fight else '',
        post_caption=captxt, hashtags=tags[0].strip() if tags else '',
        pinned=sec('Pinned comment:','$^'),
        clip_seconds=[int(dur.group(1)),int(dur.group(2))] if dur else [14,18],
        clip_note=clip.split('\n')[0] if clip else '',
        youtube_search=sec('YouTube search:','Clip target:').strip(),
    ))
assert len(out)==30, f"expected 30, got {len(out)}"
dst=os.path.join(os.path.dirname(__file__),'videos.json')
json.dump(out,open(dst,'w'),indent=2)
print(f"parsed {len(out)} videos -> {dst}")
bad=[v['n'] for v in out if not (v['popup_big'] and v['burned_caption'] and v['post_caption'] and v['pinned'] and v['end_card'])]
print("incomplete:",bad if bad else "none")

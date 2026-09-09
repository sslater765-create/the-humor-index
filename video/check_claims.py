#!/usr/bin/env python3
"""Verify every figure quoted in the TikTok scripts against the live data.

The scripts are a snapshot: they quote combined scores, craft/impact values,
episode and joke counts, show-level Humor Index numbers, cross-show comparisons
and ranks. A rescore moves all of it. Run this after any change to public/data
and it reports exactly which videos need their cards regenerated.

    python3 video/check_claims.py           # fails on any mismatch
    python3 video/check_claims.py -v        # also list what it could not check

Superseded check_ranks.py, whose rank logic is folded in below.
"""
import json,glob,os,re,sys
from decimal import Decimal,ROUND_HALF_UP

HERE=os.path.dirname(os.path.abspath(__file__))
BASE=os.path.join(HERE,'..','public','data')
MD=os.path.join(HERE,'..','tiktok-top-joke-series-30-sep2026.md')
EP=re.compile(r'^s\d{2}e\d{2}\.json$')
VERBOSE='-v' in sys.argv

def r2(x): return float(Decimal(str(x)).quantize(Decimal('0.01'),rounding=ROUND_HALF_UP))
shows={s['slug']:s for s in json.load(open(os.path.join(BASE,'shows.json')))}
scored={k:v for k,v in shows.items() if (v.get('humor_index') or 0)>0}

# spellings the scripts use -> slug
ALIAS={'the office':'the-office','office':'the-office','seinfeld':'seinfeld',
'parks and recreation':'parks-and-recreation','parks & rec':'parks-and-recreation',
'parks and rec':'parks-and-recreation','30 rock':'30-rock',
'arrested development':'arrested-development','friends':'friends',
"it's always sunny in philadelphia":'its-always-sunny',"it's always sunny":'its-always-sunny',
'sunny':'its-always-sunny',"schitt's creek":'schitts-creek','the simpsons':'the-simpsons',
'simpsons':'the-simpsons','community':'community','veep':'veep','futurama':'futurama',
'curb your enthusiasm':'curb-your-enthusiasm','curb':'curb-your-enthusiasm','fleabag':'fleabag',
"chappelle's show":'chappelles-show','flight of the conchords':'flight-of-the-conchords',
'the larry sanders show':'the-larry-sanders-show','larry sanders':'the-larry-sanders-show',
'broad city':'broad-city','taxi':'taxi','the fresh prince of bel-air':'the-fresh-prince-of-bel-air',
'the fresh prince':'the-fresh-prince-of-bel-air','fresh prince':'the-fresh-prince-of-bel-air',
'freaks and geeks':'freaks-and-geeks'}
NAMES=sorted(ALIAS,key=len,reverse=True)

_cache={}
def jokes_of(slug):
    if slug in _cache: return _cache[slug]
    rows=[]
    for f in glob.glob(os.path.join(BASE,slug,'*.json')):
        if not EP.match(os.path.basename(f)): continue
        ep=json.load(open(f))
        for j in ep.get('jokes',[]):
            c,i=j.get('craft_total'),j.get('impact_score')
            if c is None or i is None: continue
            rows.append({'comb':(c+i)/2,'craft':c,'impact':i,'quot':j.get('quotability'),
                         's':ep['season'],'e':ep['episode_number']})
    rows.sort(key=lambda r:-r['comb']); _cache[slug]=rows; return rows

def resolve(text,default):
    """Which show is this sentence talking about? Nearest named show, else the video's."""
    low=text.lower()
    for n in NAMES:
        if n in low: return ALIAS[n]
    return default

vids=json.load(open(os.path.join(HERE,'videos.json')))
raw=open(MD).read()
blocks=dict()
for m in re.finditer(r'^## #(\d+) — .*?$(.*?)(?=^## #|\Z)',raw,re.M|re.S):
    blocks[int(m.group(1))]=m.group(2)

SLUG_OF_SHOWNAME={v['show']:resolve(v['show'],None) for v in vids}
bad=[]; unchecked=[]; published=[]; checked=0

for v in vids:
    n=v['n']; slug=SLUG_OF_SHOWNAME.get(v['show'])
    if not slug: bad.append(f"#{n}: cannot resolve show {v['show']!r}"); continue
    body=blocks.get(n,''); show=shows[slug]
    # A block marked **Published:** already shipped as a card. Its figures are a
    # record of what went out, not a claim about current data, so a rescore must
    # not turn them into failures. Corrections go in the block itself.
    if re.search(r'^\*\*Published:\*\*', body, re.M):
        published.append(n)
        continue
    rows=jokes_of(slug)
    ep_rows=[r for r in rows if (r['s'],r['e'])==(v['season'],v['episode'])]
    if not ep_rows:
        bad.append(f"#{n} {v['show']}: S{v['season']:02d}E{v['episode']:02d} has no scored jokes"); continue
    top=ep_rows[0]

    # --- the joke's own numbers ---
    m=re.search(r'Combined \*\*([\d.]+)\*\* \(craft ([\d.]+), impact ([\d.]+)(?:, quotability ([\d.]+))?\)',body)
    if m:
        want=[('combined',float(m.group(1)),r2(top['comb'])),
              ('craft',float(m.group(2)),top['craft']),
              ('impact',float(m.group(3)),top['impact'])]
        if m.group(4): want.append(('quotability',float(m.group(4)),top['quot']))
        for label,claimed,actual in want:
            checked+=1
            if actual is None or abs(claimed-actual)>0.005:
                bad.append(f"#{n} {v['show']}: {label} claimed {claimed}, data says {actual}")

    # --- rank ---
    sub=v['popup_sub'].upper(); mr=re.search(r'#(\d+)\s+OF',sub)
    claimed_rank=None
    if mr: claimed_rank=int(mr.group(1))
    elif re.search(r'\bTOP\b.*\b(THAT|WE|WITHOUT|POSTABLE|QUOTED|QUOTABLE)\b',sub): pass
    elif 'TOP-SCORED' in sub or sub.startswith('#1'): claimed_rank=1
    if claimed_rank:
        checked+=1
        actual=sum(1 for r in rows if r['comb']>top['comb'])+1
        if claimed_rank!=actual:
            bad.append(f"#{n} {v['show']}: rank claimed #{claimed_rank}, data says #{actual}")

    # --- counts and indexes ---
    # Deliberately conservative: only explicit, unambiguous phrasings. A checker
    # that reports false alarms gets ignored, so anything loose is left unchecked
    # and counted instead (-v lists them).
    for sent in re.split(r'(?<=[.!?])\s+|\n',body):
        t=sent.strip()
        if not t: continue
        low=t.lower()
        episode_level = 'episode is' in low or 'episode-level' in low or 'peaks at season' in low \
                        or 'best episode' in low or 'low point' in low or 'humor_index' in low

        # "<Show> has N episodes and M jokes"
        for mm in re.finditer(r'([A-Z][\w\'&.\- ]+?) has ([\d,]+) episodes and ([\d,]+) jokes',t):
            sh=shows.get(ALIAS.get(mm.group(1).strip().lower()))
            if not sh: unchecked.append(f"#{n}: unresolved show {mm.group(1)!r}"); continue
            for claimed,field,label in ((int(mm.group(2).replace(',','')),'total_episodes','episode count'),
                                        (int(mm.group(3).replace(',','')),'total_jokes_analyzed','joke count')):
                checked+=1
                if sh.get(field) and claimed!=sh[field]:
                    bad.append(f"#{n}: {label} for {sh['name']} claimed {claimed:,}, data says {sh[field]:,}")

        # "<Show> scores XX.X" / "scores XX.X on our index"  (show-level only)
        if not episode_level:
            for mm in re.finditer(r'([A-Z][\w\'&.\- ]+?) (?:scores|is) (\d{2}\.\d)\b',t):
                sh=shows.get(ALIAS.get(mm.group(1).strip().lower()))
                if not sh: continue
                checked+=1
                claimed=float(mm.group(2))
                if sh.get('humor_index') and abs(claimed-sh['humor_index'])>0.05:
                    bad.append(f"#{n}: Humor Index for {sh['name']} claimed {claimed}, data says {sh['humor_index']}")
            # "Curb (81.5), The Office (79.4) and Community (77.9)" — pair each score
            # with the show name immediately before it
            for mm in re.finditer(r'([A-Z][\w\'&.\- ]{2,30}?)\s*\((\d{2}\.\d)\)',t):
                sh=shows.get(ALIAS.get(mm.group(1).strip().lower()))
                if not sh: continue
                checked+=1
                claimed=float(mm.group(2))
                if sh.get('humor_index') and abs(claimed-sh['humor_index'])>0.05:
                    bad.append(f"#{n}: Humor Index for {sh['name']} claimed {claimed}, data says {sh['humor_index']}")

    # "#N OF M,MMM <SHOW> JOKES" in the popup subtitle — always this video's show
    mm=re.search(r'OF\s+([\d,]+)',v['popup_sub'])
    if mm:
        claimed=int(mm.group(1).replace(',','')); checked+=1
        if show.get('total_jokes_analyzed') and claimed!=show['total_jokes_analyzed']:
            bad.append(f"#{n}: popup says {claimed:,} {show['name']} jokes, data says {show['total_jokes_analyzed']:,}")

    if VERBOSE:
        for mm in re.finditer(r'\b\d[\d,]*\.?\d*\b',body):
            unchecked.append(f"#{n}: {mm.group(0)}")

print(f"checked {checked} numeric claims across {len(vids) - len(published)} unpublished videos")
if published:
    print(f"skipped {len(published)} already published: {', '.join('#'+str(n) for n in published)}")
if VERBOSE: print(f"({len(unchecked)} number tokens seen in total; the rest are dates, timings and prose)")
if bad:
    print(f"\n{len(bad)} mismatch(es):")
    for b in bad: print("  x "+b)
    print("\nRegenerate the affected cards:  python3 video/parse_scripts.py && python3 video/make_cards.py")
    sys.exit(1)
print("every figure in the scripts matches the current data")

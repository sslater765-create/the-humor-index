#!/usr/bin/env python3
"""Build a leaderboard video: no footage, no clip sourcing, entirely generated.

    python3 video/make_leaderboard.py leaderboards.json          # all
    python3 video/make_leaderboard.py leaderboards.json worst    # one by key

Rows reveal bottom-to-top over a dark card, then the claim and the bait land.
Output is 1080x1920 H.264/AAC-silent, the same shape as the clip videos.
"""
import json, os, subprocess, sys, textwrap
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FRM = os.path.join(HERE, '_lb'); OUT = os.path.join(HERE, 'out')
W, H = 1080, 1920
GOLD = (232, 185, 49, 255); DARK = (15, 15, 15, 255); WHITE = (245, 245, 245, 255)
MUTED = (150, 150, 150, 255); RED = (214, 92, 76, 255); PANEL = (26, 26, 26, 255)
FB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
FPS = 30

def f(p, s): return ImageFont.truetype(p, s)
def tw(d, t, fo): b = d.textbbox((0, 0), t, font=fo); return b[2] - b[0], b[3] - b[1]

def fit(d, text, path, maxw, start, minsize=28):
    s = start
    while s > minsize:
        fo = f(path, s)
        if tw(d, text, fo)[0] <= maxw: return fo
        s -= 2
    return f(path, minsize)

def wrap(d, text, path, size, maxw):
    fo = f(path, size)
    for width in range(46, 10, -1):
        lines = textwrap.wrap(text, width=width)
        if all(tw(d, l, fo)[0] <= maxw for l in lines): return fo, lines
    return fo, textwrap.wrap(text, 20)

def frame(spec, shown, show_claim, show_bait):
    """One frame with `shown` rows revealed from the bottom of the list up."""
    im = Image.new('RGB', (W, H), DARK[:3]); d = ImageDraw.Draw(im)
    d.text((W // 2, 168), 'THE HUMOR INDEX', font=f(FB, 34), fill=GOLD, anchor='mm')

    fo = fit(d, spec['title'], FB, W - 130, 82, 44)
    d.text((W // 2, 274), spec['title'], font=fo, fill=WHITE, anchor='mm')
    if spec.get('subtitle'):
        d.text((W // 2, 342), spec['subtitle'], font=f(FR, 34), fill=MUTED, anchor='mm')

    rows = spec['rows']; n = len(rows)
    top, rh = 432, 112
    for i, r in enumerate(rows):
        if i < n - shown: continue                      # not revealed yet
        y = top + i * rh
        neg = str(r['value']).strip().startswith('-')
        d.rounded_rectangle([70, y, W - 70, y + rh - 14], 16, fill=PANEL[:3])
        d.text((124, y + (rh - 14) // 2), str(r['rank']), font=f(FB, 40),
               fill=GOLD if r['rank'] in (1, '1') else MUTED, anchor='lm')
        nf = fit(d, r['name'], FB, 520, 44, 26)
        d.text((208, y + 34), r['name'], font=nf, fill=WHITE, anchor='lm')
        d.text((208, y + 70), r['show'], font=f(FR, 27), fill=MUTED, anchor='lm')
        d.text((W - 124, y + (rh - 14) // 2), str(r['value']), font=f(FB, 46),
               fill=RED if neg else GOLD, anchor='rm')

    base = top + n * rh + 40
    if show_claim:
        cf, lines = wrap(d, spec['claim'], FB, 50, W - 150)
        for j, l in enumerate(lines):
            d.text((W // 2, base + 30 + j * 62), l, font=cf, fill=WHITE, anchor='mm')
        base += 30 + len(lines) * 62
    if show_bait:
        d.text((W // 2, base + 66), spec['bait'], font=f(FB, 58), fill=GOLD, anchor='mm')
    d.text((W // 2, H - 96), '@thehumorindex', font=f(FR, 30), fill=MUTED, anchor='mm')
    return im

def build(key, spec):
    os.makedirs(FRM, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    for old in os.listdir(FRM): os.remove(os.path.join(FRM, old))
    n = len(spec['rows'])
    plan = ([(0, 0, 0)] * 12                                    # title beat
            + [(i + 1, 0, 0) for i in range(n) for _ in range(11)]   # reveal each row
            + [(n, 0, 0)] * 14 + [(n, 1, 0)] * 40 + [(n, 1, 1)] * 78)
    for i, (shown, claim, bait) in enumerate(plan):
        frame(spec, shown, claim, bait).save(os.path.join(FRM, f'{i:05d}.png'))
    out = os.path.join(OUT, f'lb-{key}.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS),
                    '-i', os.path.join(FRM, '%05d.png'),
                    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', out], check=True)
    print(f'  {out}  ({len(plan)/FPS:.1f}s, {n} rows)')

if __name__ == '__main__':
    specs = json.load(open(sys.argv[1]))
    keys = sys.argv[2:] or list(specs)
    for k in keys:
        print(f'#{k}'); build(k, specs[k])

#!/usr/bin/env python3
"""Pre-render the score popup and end card for every video as transparent PNGs.

    python3 video/make_cards.py          # all 30
    python3 video/make_cards.py 9 10     # just those
"""
import json,os,sys,textwrap
from PIL import Image,ImageDraw,ImageFont

HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(HERE,'cards'); os.makedirs(OUT,exist_ok=True)
W,H=1080,1920
GOLD=(232,185,49,255); DARK=(15,15,15,255); WHITE=(245,245,245,255)
MUTED=(160,160,160,255); SHADOW=(0,0,0,190)
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
FR='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
def f(path,size): return ImageFont.truetype(path,size)
def tw(d,t,fo): b=d.textbbox((0,0),t,font=fo); return b[2]-b[0],b[3]-b[1]

def fit(d,text,path,maxw,start,minsize=34):
    """Largest font size at which `text` fits `maxw`."""
    s=start
    while s>minsize:
        fo=f(path,s)
        if tw(d,text,fo)[0]<=maxw: return fo
        s-=2
    return f(path,minsize)

def wrap_fit(d,text,path,maxw,size,maxlines):
    fo=f(path,size)
    for width in range(40,8,-1):
        lines=textwrap.wrap(text,width=width)
        if len(lines)<=maxlines and all(tw(d,l,fo)[0]<=maxw for l in lines): return fo,lines
    return fo,textwrap.wrap(text,width=18)[:maxlines]

def popup(v):
    """Score popup: punches in over the punchline. Transparent, centred band."""
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    big=v['popup_big']; sub=v['popup_sub']
    fbig=fit(d,big,FB,W-150,104,56)
    fsub=fit(d,sub,FB,W-190,40,22)
    bw,bh=tw(d,big,fbig); sw,sh=tw(d,sub,fsub)
    padx,pady=54,40; gap=26
    boxw=max(bw,sw)+padx*2; boxh=bh+gap+sh+pady*2
    x0=(W-boxw)//2; y0=int(H*0.40)
    d.rounded_rectangle([x0+7,y0+9,x0+boxw+7,y0+boxh+9],28,fill=SHADOW)
    d.rounded_rectangle([x0,y0,x0+boxw,y0+boxh],28,fill=(17,17,17,242),outline=GOLD,width=5)
    d.text(((W-bw)//2,y0+pady-4),big,font=fbig,fill=GOLD)
    d.text(((W-sw)//2,y0+pady+bh+gap),sub,font=fsub,fill=WHITE)
    im.save(f'{OUT}/popup_{v["n"]:02d}.png')

def caption(v):
    """Burned-in punchline caption, bottom third, yellow on a dark plate."""
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    fo,lines=wrap_fit(d,v['burned_caption'],FB,W-170,72,3)
    lh=tw(d,'Ay',fo)[1]+22
    total=lh*len(lines)
    y=int(H*0.735)
    d.rounded_rectangle([60,y-34,W-60,y+total+26],22,fill=(0,0,0,170))
    for i,l in enumerate(lines):
        lw=tw(d,l,fo)[0]
        d.text(((W-lw)//2+3,y+i*lh+3),l,font=fo,fill=(0,0,0,220))
        d.text(((W-lw)//2,y+i*lh),l,font=fo,fill=GOLD)
    im.save(f'{OUT}/caption_{v["n"]:02d}.png')

def chrome(v):
    """Persistent frame: logo lock-up top, handle bottom."""
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    fl=f(FB,40); t='THE HUMOR INDEX'
    lw,lh=tw(d,t,fl)
    d.rounded_rectangle([(W-lw)//2-32,44,(W+lw)//2+32,44+lh+34],18,fill=(0,0,0,150))
    d.text(((W-lw)//2,60),t,font=fl,fill=GOLD)
    fh=f(FR,32); h='@thehumorindex'
    hw,hh=tw(d,h,fh)
    d.text(((W-hw)//2,H-96),h,font=fh,fill=(245,245,245,205))
    im.save(f'{OUT}/chrome_{v["n"]:02d}.png')

def endcard(v):
    """Full-bleed end card. The whole block is centred as a unit, so cards with
    a long stat line and cards with a short one both sit balanced."""
    im=Image.new('RGBA',(W,H),DARK); d=ImageDraw.Draw(im)

    body=' '.join(v['end_card'])
    fbody,blines=wrap_fit(d,body,FB,W-150,60,7)
    blh=tw(d,'Ay',fbody)[1]+30
    ffight,flines=wrap_fit(d,v['fight_line'],FB,W-170,58,2)
    flh=tw(d,'Ay',ffight)[1]+18
    fnum=f(FB,150); fk=f(FB,30); fm=f(FB,72)
    num=f"{v['combined']:.2f}" if v['combined'] is not None else None

    block=blh*len(blines)
    if num:
        block+=70+tw(d,num,fnum)[1]+30+tw(d,'COMBINED SCORE',fk)[1]+80
    block+=flh*len(flines)+30+tw(d,'Fight me.',fm)[1]

    y=(H-block)//2 + 40          # nudge down: the header sits above it
    for l in blines:
        w,_=tw(d,l,fbody); d.text(((W-w)//2,y),l,font=fbody,fill=WHITE); y+=blh
    if num:
        y+=70
        nw,nh=tw(d,num,fnum); d.text(((W-nw)//2,y),num,font=fnum,fill=GOLD); y+=nh+30
        kw,kh=tw(d,'COMBINED SCORE',fk); d.text(((W-kw)//2,y),'COMBINED SCORE',font=fk,fill=MUTED); y+=kh+80
    for l in flines:
        w,_=tw(d,l,ffight); d.text(((W-w)//2,y),l,font=ffight,fill=WHITE); y+=flh
    y+=30
    mw,_=tw(d,'Fight me.',fm); d.text(((W-mw)//2,y),'Fight me.',font=fm,fill=GOLD)

    # header and footer, drawn last so they always sit at the edges
    fl=f(FB,40); t='THE HUMOR INDEX'
    lw,_=tw(d,t,fl); d.text(((W-lw)//2,86),t,font=fl,fill=GOLD)
    fs=f(FB,34); sline=f"{v['show']}  \u00b7  S{v['season']:02d}E{v['episode']:02d}"
    sw,_=tw(d,sline,fs); d.text(((W-sw)//2,150),sline,font=fs,fill=MUTED)
    fu=f(FR,32); u='every joke in every sitcom, scored  \u00b7  thehumorindex.com'
    uw,_=tw(d,u,fu); d.text(((W-uw)//2,H-120),u,font=fu,fill=MUTED)
    im.convert('RGB').save(f'{OUT}/endcard_{v["n"]:02d}.png',quality=95)

vids=json.load(open(f'{HERE}/videos.json'))
want=[int(a) for a in sys.argv[1:]]
n=0
for v in vids:
    if want and v['n'] not in want: continue
    popup(v); caption(v); chrome(v); endcard(v); n+=1
print(f"rendered cards for {n} video(s) -> {OUT}")

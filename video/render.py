#!/usr/bin/env python3
"""Render one Top Joke Series video.

    python3 video/render.py 9 clips/09-asian-jim.mp4 --punchline 00:12.4

`--punchline` is where the punchline LANDS in the source clip. Everything else
is derived: the cut starts `--pre` seconds before it and runs `--post` after,
then the end card and a loop hint are appended.

Output: video/out/09.mp4 — 1080x1920, 30fps, H.264/AAC, ready for Publer.
"""
import argparse,json,os,subprocess,sys,shutil,tempfile

HERE=os.path.dirname(os.path.abspath(__file__))
CARDS=os.path.join(HERE,'cards'); OUT=os.path.join(HERE,'out')
W,H,FPS='1080','1920','30'
ENDCARD_SEC=4.0; LOOP_SEC=1.2; POPUP_SEC=3.8

def ts(v):
    """Accept 12, 12.4, 1:02.5 or 00:01:02.5."""
    v=str(v).strip()
    if ':' not in v: return float(v)
    p=[float(x) for x in v.split(':')]
    while len(p)<3: p.insert(0,0.0)
    return p[0]*3600+p[1]*60+p[2]
def run(cmd):
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: print(r.stderr[-2500:],file=sys.stderr); raise SystemExit(f"ffmpeg failed: {' '.join(cmd[:9])}...")
def probe(path,stream='v'):
    r=subprocess.run(['ffprobe','-v','error','-select_streams',stream+':0','-show_entries',
                      'stream=duration','-of','csv=p=0',path],capture_output=True,text=True)
    try: return float(r.stdout.strip().split(',')[0])
    except: return None

ap=argparse.ArgumentParser()
ap.add_argument('number',type=int)
ap.add_argument('clip')
ap.add_argument('--punchline',required=True,help='where the punchline lands in the source clip')
ap.add_argument('--pre',type=float,default=6.0,help='seconds of setup before the punchline')
ap.add_argument('--post',type=float,default=5.0,help='seconds to run after the punchline')
ap.add_argument('--no-endcard',action='store_true')
ap.add_argument('--out',default=None)
a=ap.parse_args()

vids={v['n']:v for v in json.load(open(os.path.join(HERE,'videos.json')))}
if a.number not in vids: raise SystemExit(f"no video #{a.number} in videos.json")
v=vids[a.number]
if not os.path.exists(a.clip): raise SystemExit(f"clip not found: {a.clip}")
for f in ('chrome','caption','popup','endcard'):
    p=f'{CARDS}/{f}_{a.number:02d}.png'
    if not os.path.exists(p): raise SystemExit(f"missing card {p} — run: python3 video/make_cards.py {a.number}")
os.makedirs(OUT,exist_ok=True)

punch=ts(a.punchline)
start=max(0.0,punch-a.pre)
pt=punch-start                      # punchline offset inside the cut
dur=pt+a.post
src=probe(a.clip)
if src and start+dur>src:
    dur=max(2.0,src-start); print(f"  clip is only {src:.1f}s, trimming the tail to {dur:.1f}s")
if src and punch>src: raise SystemExit(f"--punchline {punch:.1f}s is past the end of the clip ({src:.1f}s)")

tmp=tempfile.mkdtemp(prefix='hi-render-')
main=f'{tmp}/main.mp4'; endc=f'{tmp}/end.mp4'; loop=f'{tmp}/loop.mp4'
try:
    # ---- main segment: blurred fill behind, chrome, caption from the punchline, popup punch-in
    vf=(
      f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
      f"gblur=sigma=28,eq=brightness=-0.28:saturation=0.7,setsar=1[bg];"
      f"[0:v]scale={W}:-2,setsar=1[fg];"
      f"[bg][fg]overlay=(W-w)/2:(H-h)/2[base];"
      f"[1:v]format=rgba[chrome];[base][chrome]overlay=0:0[c1];"
      f"[2:v]format=rgba,fade=t=in:st={pt:.3f}:d=0.18:alpha=1[cap];"
      f"[c1][cap]overlay=0:0:enable='gte(t,{pt:.3f})'[c2];"
      f"[3:v]format=rgba,fade=t=in:st={pt:.3f}:d=0.10:alpha=1,"
      f"fade=t=out:st={pt+POPUP_SEC-0.45:.3f}:d=0.45:alpha=1[pop];"
      f"[c2][pop]overlay=0:0:enable='between(t,{pt:.3f},{pt+POPUP_SEC:.3f})'[vout]"
    )
    run(['ffmpeg','-y','-ss',f'{start:.3f}','-t',f'{dur:.3f}','-i',a.clip,
         '-loop','1','-t',f'{dur:.3f}','-i',f'{CARDS}/chrome_{a.number:02d}.png',
         '-loop','1','-t',f'{dur:.3f}','-i',f'{CARDS}/caption_{a.number:02d}.png',
         '-loop','1','-t',f'{dur:.3f}','-i',f'{CARDS}/popup_{a.number:02d}.png',
         '-filter_complex',vf,'-map','[vout]','-map','0:a?',
         '-af',f'afade=t=out:st={max(0,dur-0.35):.3f}:d=0.35',
         '-r',FPS,'-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',
         '-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-shortest',main])

    parts=[main]
    if not a.no_endcard:
        run(['ffmpeg','-y','-loop','1','-t',f'{ENDCARD_SEC}','-i',f'{CARDS}/endcard_{a.number:02d}.png',
             '-f','lavfi','-t',f'{ENDCARD_SEC}','-i','anullsrc=r=48000:cl=stereo',
             '-vf',f'scale={W}:{H},setsar=1,fade=t=in:st=0:d=0.25','-r',FPS,
             '-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',
             '-c:a','aac','-b:a','192k','-ar','48000','-ac','2',endc])
        parts.append(endc)
        # loop hint: hard cut back to the punchline frame so the replay is seamless
        run(['ffmpeg','-y','-ss',f'{punch:.3f}','-i',a.clip,'-frames:v','1','-q:v','2',f'{tmp}/frame.png'])
        run(['ffmpeg','-y','-loop','1','-t',f'{LOOP_SEC}','-i',f'{tmp}/frame.png',
             '-loop','1','-t',f'{LOOP_SEC}','-i',f'{CARDS}/chrome_{a.number:02d}.png',
             '-f','lavfi','-t',f'{LOOP_SEC}','-i','anullsrc=r=48000:cl=stereo',
             '-filter_complex',
             f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},gblur=sigma=28,"
             f"eq=brightness=-0.28:saturation=0.7,setsar=1[bg];[0:v]scale={W}:-2,setsar=1[fg];"
             f"[bg][fg]overlay=(W-w)/2:(H-h)/2[b];[1:v]format=rgba[c];[b][c]overlay=0:0[vout]",
             '-map','[vout]','-map','2:a','-r',FPS,
             '-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',
             '-c:a','aac','-b:a','192k','-ar','48000','-ac','2',loop])
        parts.append(loop)

    dst=a.out or f'{OUT}/{a.number:02d}.mp4'
    with open(f'{tmp}/list.txt','w') as f:
        for p in parts: f.write(f"file '{p}'\n")
    run(['ffmpeg','-y','-f','concat','-safe','0','-i',f'{tmp}/list.txt','-c','copy',dst])
    total=probe(dst)
    print(f"\n#{a.number} {v['show']} — {v['headline']}")
    print(f"  cut {start:.1f}s to {start+dur:.1f}s of the source, punchline at +{pt:.1f}s")
    print(f"  {dst}  ({total:.1f}s, 1080x1920)")
    if total and total>20: print(f"  WARNING: {total:.1f}s is over the 20s ceiling — lower --pre or --post")
finally:
    shutil.rmtree(tmp,ignore_errors=True)

import type { Metadata } from 'next';
import Link from 'next/link';
import { ARCHES, EMBLEMS, emblemSVG, AXES, showStyle, tileText } from '@/lib/comedyDna';

export const dynamic = 'force-dynamic';

interface Profile { a: number; c?: string; x?: number[]; s?: [string, string, number][]; }

function parse(d?: string): Profile | null {
  if (!d) return null;
  try {
    const p = JSON.parse(decodeURIComponent(d));
    if (typeof p.a !== 'number' || !ARCHES[p.a]) return null;
    return p as Profile;
  } catch { return null; }
}

export function generateMetadata({ searchParams }: { searchParams: { d?: string } }): Metadata {
  const p = parse(searchParams.d);
  const a = p ? ARCHES[p.a] : null;
  const top = p?.s?.[0]?.[1];
  const title = a ? `I'm ${a.name} — Comedy DNA` : 'Comedy DNA';
  const sub = a ? (top ? `Top match: ${top}. What's your comedy type?` : a.tag) : 'Find your comedy type';
  const og = '/api/og?title=' + encodeURIComponent(title) + '&subtitle=' + encodeURIComponent(sub);
  return {
    title,
    description: sub,
    robots: { index: false, follow: true },
    openGraph: { title, description: sub, type: 'article', images: [{ url: og, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description: sub, images: [og] },
  };
}

export default function ProfilePage({ searchParams }: { searchParams: { d?: string } }) {
  const p = parse(searchParams.d);

  if (!p) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center text-brand-text-primary">
        <h1 className="text-2xl font-bold mb-2">No result to show</h1>
        <p className="text-brand-text-secondary mb-6">This link doesn&apos;t carry a Comedy DNA result. Take the quiz to find yours.</p>
        <Link href="/comedy-dna" className="inline-flex rounded-full bg-brand-gold text-brand-dark font-bold px-6 py-3">Find your Comedy DNA →</Link>
      </main>
    );
  }

  const a = ARCHES[p.a];
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14 text-brand-text-primary">
      <div className="flex items-center gap-2.5 font-extrabold tracking-tight text-sm mb-6">
        <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-brand-coral rotate-45" />
        THE HUMOR INDEX <span className="text-brand-text-secondary font-semibold">· comedy DNA</span>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl text-center px-7 py-9">
        <span className="text-brand-gold text-xs font-extrabold tracking-widest uppercase">Comedy DNA result</span>
        <div className="my-2 flex justify-center">
          <span className="inline-flex items-center justify-center rounded-full border-[2.5px] bg-brand-surface"
            style={{ borderColor: EMBLEMS[a.emblem].c, width: 88, height: 88 }} aria-hidden
            dangerouslySetInnerHTML={{ __html: emblemSVG(a.emblem, 54) }} />
        </div>
        {p.c && <div className="text-brand-teal text-xs font-extrabold tracking-widest uppercase">{p.c} this type</div>}
        <div className="text-4xl md:text-5xl font-black tracking-tight my-2">{a.name}</div>
        <div className="text-brand-gold text-lg font-bold">{a.tag}</div>
        <p className="max-w-xl mx-auto text-brand-text-secondary mt-3">{a.blurb}</p>
      </div>

      {Array.isArray(p.x) && p.x.length === 4 && (
        <div className="mt-8">
          <span className="text-brand-gold text-xs font-extrabold tracking-widest uppercase block mb-3.5">Taste, on four axes</span>
          {AXES.map((ax, i) => {
            const pr = p.x![i] ?? 0.5;
            const leftOn = pr < 0.5;
            return (
              <div key={ax.left} className="my-4">
                <div className="flex justify-between text-[13px] font-bold text-brand-text-secondary mb-1.5"><span className={leftOn ? 'text-brand-text-primary' : ''}>{ax.left}</span><span className={!leftOn ? 'text-brand-text-primary' : ''}>{ax.right}</span></div>
                <div className="relative h-2.5 bg-brand-border rounded-full"><div className="absolute top-1/2 w-[18px] h-[18px] rounded-full bg-brand-gold -translate-x-1/2 -translate-y-1/2" style={{ left: `${pr * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}

      {Array.isArray(p.s) && p.s.length > 0 && (
        <div className="mt-8">
          <span className="text-brand-gold text-xs font-extrabold tracking-widest uppercase block mb-3.5">Shows built for this taste</span>
          <div className="bg-brand-card border border-brand-border rounded-2xl px-5 py-2">
            {p.s.map(([slug, name, pct], i) => {
              const st = showStyle(slug);
              return (
                <div key={slug} className={`flex items-center gap-3.5 py-2.5 ${i < p.s!.length - 1 ? 'border-b border-brand-border' : ''}`}>
                  <span className="tabular-nums font-black text-brand-text-muted w-6 text-[15px]">{i + 1}</span>
                  <span className="inline-flex items-center justify-center rounded-[9px] font-black shrink-0" style={{ background: st.c, color: tileText(st.c), width: 34, height: 34, fontSize: 13 }}>{st.m}</span>
                  <a href={`https://www.thehumorindex.com/shows/${slug}/`} className={`font-bold flex-1 hover:underline ${i === 0 ? 'text-brand-teal' : 'text-brand-text-primary'}`}>{name}</a>
                  <span className="tabular-nums font-black w-12 text-right text-[15px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10 bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold mb-1">What&apos;s your Comedy DNA?</h2>
        <p className="text-brand-text-secondary mb-4">Pick which joke is funnier and find your comedy archetype + the shows built for your taste.</p>
        <Link href="/comedy-dna" className="inline-flex rounded-full bg-brand-gold text-brand-dark font-bold px-6 py-3">Take the quiz →</Link>
      </div>
    </main>
  );
}

'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  centeredShow, rankShows, rankArchetypes, whyText, topUserTypes,
  showStyle, tileText, TYPE_LABEL, DNA_TYPES,
  type ShowFingerprint,
} from '@/lib/comedyDna';
import { syncProfile, saveRating, saveWatch, type Rating } from '@/lib/profile/sync';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

interface MyShow { slug: string; name: string; hi: number; poster: string | null; eps: number; network: string; }
interface FpLite { slug: string; fp: number[]; n: number; }

function Tile({ slug, size = 44 }: { slug: string; size?: number }) {
  const st = showStyle(slug);
  return (
    <div
      className="rounded-lg flex items-center justify-center font-mono font-semibold shrink-0"
      style={{ width: size, height: size, background: st.c, color: tileText(st.c), fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {st.m}
    </div>
  );
}

export default function MyIndex({ shows, fps, meanFp, weights }:
  { shows: MyShow[]; fps: FpLite[]; meanFp: number[]; weights: number[] }) {
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [watch, setWatch] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    syncProfile().then(({ uid, data }) => {
      if (!active) return;
      setUid(uid);
      setRatings(data.ratings);
      setWatch(data.watchlist);
      setReady(true);
    });

    // Re-sync when the user signs in or out mid-session.
    let unsub = () => {};
    if (supabaseConfigured) {
      const supabase = createClient();
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          syncProfile().then(({ uid, data }) => {
            if (!active) return;
            setUid(uid);
            setRatings(data.ratings);
            setWatch(data.watchlist);
          });
        }
      });
      unsub = () => sub.subscription.unsubscribe();
    }
    return () => { active = false; unsub(); };
  }, []);

  const showBySlug = useMemo(() => Object.fromEntries(shows.map(s => [s.slug, s])), [shows]);
  const fpBySlug = useMemo(() => {
    const m: Record<string, ShowFingerprint> = {};
    for (const f of fps) m[f.slug] = { slug: f.slug, name: showBySlug[f.slug]?.name ?? f.slug, fp: f.fp, n: f.n };
    return m;
  }, [fps, showBySlug]);

  function rate(slug: string, r: Rating) {
    setRatings(prev => {
      const next = { ...prev };
      let verdict: Rating | null;
      if (next[slug] === r) { delete next[slug]; verdict = null; }
      else { next[slug] = r; verdict = r; }
      void saveRating(uid, slug, verdict);
      return next;
    });
  }
  function toggleWatch(slug: string) {
    setWatch(prev => {
      const onList = !prev.includes(slug);
      const next = onList ? [...prev, slug] : prev.filter(s => s !== slug);
      void saveWatch(uid, slug, onList);
      return next;
    });
  }

  // ---- taste model ----
  const lovedWithFp = useMemo(
    () => Object.keys(ratings).filter(s => ratings[s] === 'love' && fpBySlug[s]),
    [ratings, fpBySlug]
  );

  const pref = useMemo(() => {
    if (lovedWithFp.length < 2) return null;
    const acc = new Array(DNA_TYPES.length).fill(0);
    for (const slug of lovedWithFp) {
      const c = centeredShow(fpBySlug[slug], meanFp);
      for (let i = 0; i < acc.length; i++) acc[i] += c[i];
    }
    return acc.map(x => x / lovedWithFp.length);
  }, [lovedWithFp, fpBySlug, meanFp]);

  const archetypeName = useMemo(() => {
    if (!pref) return null;
    return rankArchetypes(pref, weights)[0]?.arche.name ?? null;
  }, [pref, weights]);

  const myTypes = useMemo(() => {
    if (!pref) return [] as string[];
    return topUserTypes(pref, weights, 3).map(t => TYPE_LABEL[t]);
  }, [pref, weights]);

  const recs = useMemo(() => {
    if (!pref) return [];
    const candidates = fps
      .filter(f => !ratings[f.slug])
      .map(f => fpBySlug[f.slug])
      .filter(Boolean);
    return rankShows(pref, candidates, meanFp, weights).slice(0, 6);
  }, [pref, fps, ratings, fpBySlug, meanFp, weights]);

  if (!ready) return <div className="h-40" />;

  const watchShows = watch.map(s => showBySlug[s]).filter(Boolean) as MyShow[];
  const ratedSlugs = Object.keys(ratings);

  return (
    <div className="space-y-10">
      {/* Taste summary */}
      <section className="bg-gradient-to-br from-brand-surface to-brand-card border border-brand-border rounded-2xl p-6">
        {pref ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">Your taste reads as</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary mb-2">{archetypeName}</h2>
            <p className="text-sm text-brand-text-secondary">
              Built from {lovedWithFp.length} show{lovedWithFp.length === 1 ? '' : 's'} you love. You gravitate toward{' '}
              {myTypes.length === 3 ? `${myTypes[0]}, ${myTypes[1]}, and ${myTypes[2]}` : myTypes.join(' and ') || 'a distinct mix'}.
            </p>
            <Link href="/comedy-dna" className="inline-block mt-3 text-xs text-brand-gold hover:underline">
              Take the full Comedy DNA quiz →
            </Link>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">Get started</p>
            <h2 className="font-serif italic text-2xl text-brand-text-primary mb-2">Love at least two shows below</h2>
            <p className="text-sm text-brand-text-secondary">
              Tap <span className="text-brand-gold">♥</span> on the sitcoms you love. Once you’ve picked two, we’ll
              read your comedy taste and rank every other show for you. Prefer a guided version?{' '}
              <Link href="/comedy-dna" className="text-brand-gold hover:underline">Take the Comedy DNA quiz</Link>.
            </p>
          </>
        )}
      </section>

      {/* Recommended */}
      {recs.length > 0 && (
        <section>
          <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Ranked for you</h2>
          <p className="text-sm text-brand-text-muted mb-4">Shows you haven’t rated, ordered by how well they fit your taste.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {recs.map(rec => {
              const meta = showBySlug[rec.slug];
              return (
                <div key={rec.slug} className="bg-brand-card border border-brand-border rounded-xl p-4 flex gap-3">
                  <Tile slug={rec.slug} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link href={`/shows/${rec.slug}`} className="font-serif italic text-lg text-brand-text-primary hover:text-brand-gold truncate">
                        {rec.name}
                      </Link>
                      <span className="font-mono text-sm text-brand-gold shrink-0">{rec.pct}% match</span>
                    </div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-snug">{whyText(rec, pref!, weights, meanFp)}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => rate(rec.slug, 'love')} className="text-xs text-brand-text-muted hover:text-brand-gold">♥ Love</button>
                      <button onClick={() => toggleWatch(rec.slug)} className="text-xs text-brand-text-muted hover:text-brand-gold">
                        {meta && watch.includes(rec.slug) ? '★ On list' : '☆ Watchlist'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Watchlist */}
      <section>
        <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Your watchlist</h2>
        {watchShows.length === 0 ? (
          <p className="text-sm text-brand-text-muted">Nothing saved yet — tap ☆ on any show to add it.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-3">
            {watchShows.map(s => (
              <span key={s.slug} className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full pl-1.5 pr-3 py-1">
                <Tile slug={s.slug} size={22} />
                <Link href={`/shows/${s.slug}`} className="text-xs text-brand-gold hover:underline">{s.name}</Link>
                <button onClick={() => toggleWatch(s.slug)} aria-label={`Remove ${s.name}`} className="text-brand-gold/60 hover:text-brand-gold text-xs">✕</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Library — rate everything */}
      <section>
        <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Your library</h2>
        <p className="text-sm text-brand-text-muted mb-4">
          {ratedSlugs.length ? `${ratedSlugs.length} rated.` : 'Rate the shows you’ve seen.'} ♥ love · ◦ seen-it · ☆ watchlist
        </p>
        <div className="space-y-2">
          {shows.map(s => {
            const r = ratings[s.slug];
            const onList = watch.includes(s.slug);
            return (
              <div key={s.slug} className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl p-3">
                <Tile slug={s.slug} size={38} />
                <div className="min-w-0 flex-1">
                  <Link href={`/shows/${s.slug}`} className="font-serif italic text-base text-brand-text-primary hover:text-brand-gold truncate block">
                    {s.name}
                  </Link>
                  <span className="text-[11px] text-brand-text-muted font-mono">HI {s.hi.toFixed(1)} · {s.eps} eps</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => rate(s.slug, 'love')}
                    aria-pressed={r === 'love'}
                    className={`text-sm px-2.5 py-1.5 rounded-lg border transition-colors ${r === 'love' ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/40' : 'border-brand-border text-brand-text-muted hover:text-brand-gold hover:border-brand-gold/40'}`}
                  >♥</button>
                  <button
                    onClick={() => rate(s.slug, 'meh')}
                    aria-pressed={r === 'meh'}
                    className={`text-sm px-2.5 py-1.5 rounded-lg border transition-colors ${r === 'meh' ? 'bg-brand-surface text-brand-text-secondary border-brand-border' : 'border-brand-border text-brand-text-muted hover:text-brand-text-secondary'}`}
                  >◦</button>
                  <button
                    onClick={() => toggleWatch(s.slug)}
                    aria-pressed={onList}
                    className={`text-sm px-2.5 py-1.5 rounded-lg border transition-colors ${onList ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/40' : 'border-brand-border text-brand-text-muted hover:text-brand-gold hover:border-brand-gold/40'}`}
                  >{onList ? '★' : '☆'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

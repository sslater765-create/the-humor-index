'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import type { RouletteJoke } from '@/lib/data';

const BUTTON = ['One more', 'Hit me again', 'Another', 'Keep going', 'Again', 'One more. Last one.', 'Okay, one more', 'You said last one'];

// Stable day index so the first line is the same for everyone today (and for the
// static HTML), then the button shuffles through the pool without repeats.
function dayIndex(n: number) {
  const d = new Date();
  const k = d.getUTCFullYear() * 400 + d.getUTCMonth() * 32 + d.getUTCDate();
  return (k * 7919) % n;
}

export default function JokeRoulette({ pool, firstLabel = 'Today’s funniest line' }: { pool: RouletteJoke[]; firstLabel?: string }) {
  const order = useMemo(() => {
    const idx = pool.map((_, i) => i);
    // Deterministic shuffle so server and client agree on the first pick.
    let seed = 1337;
    for (let i = idx.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [pool]);
  const [pos, setPos] = useState(0);
  const [start, setStart] = useState(0);
  const [spun, setSpun] = useState(0);
  useEffect(() => { if (pool.length) setStart(dayIndex(pool.length)); }, [pool.length]);
  if (!pool.length) return null;

  const j = pool[order[(start + pos) % order.length]];
  const next = () => {
    setPos(p => p + 1);
    setSpun(s => s + 1);
    trackEvent('joke_roulette_spin', { n: spun + 1 });
  };
  const label = spun === 0 ? firstLabel : `Line ${spun + 1} of ${pool.length}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-card via-brand-card to-brand-gold/[0.06] px-5 sm:px-10 py-7 sm:py-9">
      <div aria-hidden className="pointer-events-none absolute -bottom-16 sm:-bottom-24 right-4 sm:right-10 font-serif italic text-[9rem] sm:text-[12rem] leading-none text-brand-gold/10 select-none">&rdquo;</div>
      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-brand-gold">{label}</p>
          <p className="text-[11px] sm:text-xs text-brand-text-muted font-mono">
            scored <span className="text-brand-gold">{j.score.toFixed(1)}</span>/10
          </p>
        </div>
        <blockquote key={`${j.slug}-${j.s}-${j.e}`} className="animate-[fadeUp_.35s_ease-out] font-serif italic text-2xl sm:text-4xl leading-snug text-brand-text-primary min-h-[4.5rem] sm:min-h-[6rem]">
          &ldquo;{j.text}&rdquo;
        </blockquote>
        <p className="mt-3 text-xs sm:text-sm text-brand-text-secondary">
          <span className="text-brand-text-primary">{j.who}</span>
          {' · '}
          {j.movie ? (
            <>
              <Link href={`/movies/${j.slug}/`} className="hover:text-brand-gold">{j.show}</Link>
              {' · '}
              <span>Movie, at {j.t}</span>
            </>
          ) : (
            <>
              <Link href={`/shows/${j.slug}/`} className="hover:text-brand-gold">{j.show}</Link>
              {' · '}
              <Link href={`/shows/${j.slug}/${j.s}/${j.e}/`} className="hover:text-brand-gold">
                S{j.s}E{j.e} &ldquo;{j.t}&rdquo;
              </Link>
            </>
          )}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={next}
            className="bg-brand-gold text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:brightness-110 active:scale-[0.97] transition"
          >
            {BUTTON[Math.min(spun, BUTTON.length - 1)]} &rarr;
          </button>
          <Link
            href={j.movie ? `/movies/${j.slug}/quotes/` : `/shows/${j.slug}/${j.s}/${j.e}/`}
            onClick={() => trackEvent('joke_roulette_episode', { show: j.slug })}
            className="text-sm text-brand-text-secondary hover:text-brand-gold"
          >
            {j.movie ? 'Every joke in this movie, ranked' : 'Every joke in this episode, ranked'}
          </Link>
        </div>
      </div>
    </div>
  );
}

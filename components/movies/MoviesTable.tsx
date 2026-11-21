'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MovieSummary, LaughBin } from '@/lib/movies';
import MiniLaughMap from './MiniLaughMap';

type SortKey = 'humor_index' | 'avg_jpm' | 'avg_craft' | 'year';

export interface MovieRowExtra { line: string; who?: string; bins: LaughBin[] }

const short = (t: string) => { const s = t.split(':')[0].trim(); return s.length >= 4 ? s : t; };

export default function MoviesTable({ movies, extras }: { movies: MovieSummary[]; extras: Record<string, MovieRowExtra> }) {
  const [sort, setSort] = useState<SortKey>('humor_index');
  const [decade, setDecade] = useState<string>('all');
  const [star, setStar] = useState<string>('all');

  const decades = useMemo(() => Array.from(new Set(movies.map(m => `${Math.floor(m.year / 10) * 10}s`))).sort(), [movies]);
  const stars = useMemo(() => {
    const counts = new Map<string, number>();
    movies.forEach(m => m.stars.slice(0, 3).forEach(s => counts.set(s, (counts.get(s) ?? 0) + 1)));
    return Array.from(counts.entries()).filter(([, n]) => n >= 2).map(([s]) => s).sort();
  }, [movies]);

  const rows = movies
    .filter(m => decade === 'all' || `${Math.floor(m.year / 10) * 10}s` === decade)
    .filter(m => star === 'all' || m.stars.slice(0, 3).includes(star))
    .sort((a, b) => (sort === 'year' ? b.year - a.year : (b[sort] as number) - (a[sort] as number)));

  const btn = (k: SortKey, label: string) => (
    <button type="button" onClick={() => setSort(k)}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sort === k ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-border text-brand-text-secondary hover:text-brand-text-primary'}`}>
      {label}
    </button>
  );
  const stat = (m: MovieSummary) =>
    sort === 'avg_jpm' ? { v: m.avg_jpm.toFixed(2), l: 'jokes/min' }
      : sort === 'avg_craft' ? { v: m.avg_craft.toFixed(1), l: 'craft' }
      : { v: m.humor_index.toFixed(1), l: 'Humor Index' };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">The movie leaderboard</h2>
          <p className="text-sm text-brand-text-muted mt-1">The bars are each film&rsquo;s Laugh Map: jokes across the runtime, brightest where it&rsquo;s funniest.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {btn('humor_index', 'Funniest')}
        {btn('avg_jpm', 'Most jokes per minute')}
        {btn('avg_craft', 'Best crafted')}
        {btn('year', 'Newest')}
        <select value={decade} onChange={e => setDecade(e.target.value)} aria-label="Decade"
          className="ml-auto text-xs bg-brand-card border border-brand-border rounded-lg px-2 py-1.5 text-brand-text-secondary">
          <option value="all">All decades</option>
          {decades.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {stars.length > 0 && (
          <select value={star} onChange={e => setStar(e.target.value)} aria-label="Star"
            className="text-xs bg-brand-card border border-brand-border rounded-lg px-2 py-1.5 text-brand-text-secondary">
            <option value="all">Any star</option>
            {stars.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
      <ol className="space-y-2.5">
        {rows.map(m => {
          const x = extras[m.slug];
          const s = stat(m);
          return (
            <li key={m.slug}>
              <Link href={`/movies/${m.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-3 sm:p-4 hover:border-brand-gold/40 hover:bg-brand-surface transition-colors">
                <span className={`font-mono text-lg w-7 text-center shrink-0 ${m.rank <= 3 ? 'text-brand-gold' : 'text-brand-text-muted'}`}>{m.rank}</span>
                <div className="relative w-14 sm:w-16 aspect-[2/3] rounded-md overflow-hidden bg-brand-surface border border-brand-border shrink-0">
                  {m.poster_path && <Image src={`https://image.tmdb.org/t/p/w185${m.poster_path}`} alt={`${m.title} poster`} fill sizes="64px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                    {short(m.title)} <span className="text-brand-text-muted text-sm">({m.year})</span>
                  </p>
                  <p className="text-xs text-brand-text-muted truncate">{m.stars.slice(0, 2).join(', ') || m.director} · {m.total_jokes} jokes</p>
                  {x?.line && (
                    <p className="hidden sm:block text-sm text-brand-text-secondary italic mt-1.5 line-clamp-1">
                      {x.who && <span className="not-italic text-brand-gold/80 mr-1">{x.who}:</span>}&ldquo;{x.line}&rdquo;
                    </p>
                  )}
                </div>
                {x?.bins?.length ? (
                  <div className="hidden md:block w-40 shrink-0">
                    <MiniLaughMap bins={x.bins} className="h-10" />
                  </div>
                ) : null}
                <div className="text-right w-20 shrink-0">
                  <p className="font-mono text-2xl text-brand-gold leading-none">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-wider text-brand-text-muted mt-1">{s.l}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MovieSummary } from '@/lib/movies';

type SortKey = 'humor_index' | 'avg_jpm' | 'year';

const short = (t: string) => { const s = t.split(':')[0].trim(); return s.length >= 4 ? s : t; };

export default function MoviesTable({ movies }: { movies: MovieSummary[] }) {
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
      className={`text-xs px-3 py-1.5 rounded-full border ${sort === k ? 'border-brand-gold text-brand-gold' : 'border-brand-border text-brand-text-secondary hover:text-brand-text-primary'}`}>
      {label}
    </button>
  );

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {btn('humor_index', 'Funniest')}
        {btn('avg_jpm', 'Most jokes per minute')}
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
      <div className="rounded-2xl border border-brand-border overflow-hidden">
        {rows.map(m => (
          <Link key={m.slug} href={`/movies/${m.slug}`}
            className="flex items-center gap-4 px-4 py-3 border-b border-brand-border last:border-0 bg-brand-card hover:bg-brand-surface transition-colors">
            <span className="font-mono text-sm text-brand-text-muted w-6">{m.rank}</span>
            <div className="relative w-9 h-[54px] rounded overflow-hidden bg-brand-surface shrink-0">
              {m.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" fill sizes="36px" className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-brand-text-primary truncate">{short(m.title)}</p>
              <p className="text-xs text-brand-text-muted truncate">{m.year} · {m.stars.slice(0, 2).join(', ') || m.director}</p>
            </div>
            <span className="hidden sm:block text-xs text-brand-text-muted w-24 text-right">{m.avg_jpm.toFixed(2)} jokes/min</span>
            <span className="font-mono text-lg text-brand-gold w-14 text-right">{m.humor_index.toFixed(1)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

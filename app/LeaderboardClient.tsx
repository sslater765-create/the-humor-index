'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShowScore } from '@/lib/types';
import { formatIndex } from '@/lib/scoring';
import FormatBadge from '@/components/ui/FormatBadge';
import RankBadge from '@/components/ui/RankBadge';

type SortKey = 'humor_index' | 'avg_jpm' | 'avg_craft' | 'avg_impact';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'humor_index', label: 'Index' },
  { key: 'avg_jpm', label: 'Jokes/min' },
  { key: 'avg_craft', label: 'Craft' },
  { key: 'avg_impact', label: 'Impact' },
];

const COLS: { key: SortKey | 'imdb'; label: string }[] = [
  { key: 'imdb', label: 'IMDb' },
  { key: 'avg_jpm', label: 'Jokes/min' },
  { key: 'avg_craft', label: 'Craft' },
  { key: 'avg_impact', label: 'Impact' },
];

function cell(show: ShowScore, key: SortKey | 'imdb'): string {
  if (key === 'imdb') return show.avg_imdb_rating?.toFixed(1) ?? '–';
  return show[key].toFixed(1);
}

function Row({ show, rank, sortKey }: { show: ShowScore; rank: number | null; sortKey: SortKey }) {
  const pending = rank === null;
  return (
    <Link
      href={`/shows/${show.slug}`}
      className="group grid grid-cols-[2.25rem_1fr_auto] sm:grid-cols-[2.75rem_minmax(0,1fr)_7rem_repeat(4,4.5rem)] items-center gap-x-3 sm:gap-x-4 py-3.5 sm:py-3 border-b border-brand-border/50 hover:bg-brand-surface transition-colors"
    >
      <div>
        {pending ? (
          <span className="font-mono text-xs text-brand-text-muted pl-2">{'–'}</span>
        ) : (
          <RankBadge rank={rank} />
        )}
      </div>
      <div className="min-w-0">
        <p className={`font-medium truncate transition-colors group-hover:text-brand-gold ${pending ? 'text-brand-text-secondary' : 'text-brand-text-primary'}`}>
          {show.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <FormatBadge format={show.format} />
          {/* Phones have no room for the metric columns, so the active sort rides here. */}
          {sortKey !== 'humor_index' && (
            <span className="sm:hidden font-mono text-[11px] text-brand-text-muted">
              {SORT_OPTIONS.find(o => o.key === sortKey)?.label} {show[sortKey].toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right sm:text-left">
        <span className={`font-serif italic leading-none text-3xl ${pending ? 'text-brand-text-muted' : 'text-brand-gold'}`}>
          {formatIndex(show.humor_index)}
        </span>
      </div>
      {COLS.map(c => (
        <div
          key={c.key}
          className={`hidden sm:block font-mono text-sm ${c.key === sortKey ? 'text-brand-text-primary' : 'text-brand-text-secondary'}`}
        >
          {cell(show, c.key)}
        </div>
      ))}
    </Link>
  );
}

export default function LeaderboardClient({ shows, pending = [] }: { shows: ShowScore[]; pending?: ShowScore[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('humor_index');

  const sorted = useMemo(() => [...shows].sort((a, b) => b[sortKey] - a[sortKey]), [shows, sortKey]);
  const sortedPending = useMemo(() => [...pending].sort((a, b) => b[sortKey] - a[sortKey]), [pending, sortKey]);

  return (
    <div>
      <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl w-fit mb-5">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            aria-pressed={sortKey === opt.key}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              sortKey === opt.key
                ? 'bg-brand-gold text-black font-medium'
                : 'text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Column heads, desktop only */}
      <div className="hidden sm:grid grid-cols-[2.75rem_minmax(0,1fr)_7rem_repeat(4,4.5rem)] gap-x-4 pb-2 border-b border-brand-border text-[10px] uppercase tracking-widest text-brand-text-muted">
        <span>Rank</span>
        <span>Show</span>
        <span>Humor Index</span>
        {COLS.map(c => (
          <span key={c.key}>{c.label}</span>
        ))}
      </div>

      <div>
        {sorted.map((show, i) => (
          <Row key={show.slug} show={show} rank={i + 1} sortKey={sortKey} />
        ))}
      </div>

      {sortKey === 'humor_index' && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          Scores within about 1.2 points of each other are statistically tied, so several neighbours on this list are closer than the order suggests.{' '}
          <Link href="/methodology" className="text-brand-gold hover:underline">How we score →</Link>
        </p>
      )}

      {sortedPending.length > 0 && (
        <div className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-text-muted mb-2">Awaiting rescore</p>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl mb-3">
            These {sortedPending.length} shows are fully scored, but on our earlier model. Shows gain 9 to 15 points
            when they move to the current one, so their numbers are not comparable with the list above and they
            are left unranked until their rescore is published.
          </p>
          <div className="border-t border-brand-border">
            {sortedPending.map(show => (
              <Row key={show.slug} show={show} rank={null} sortKey={sortKey} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShowScore } from '@/lib/types';
import { formatIndex } from '@/lib/scoring';
import FormatBadge from '@/components/ui/FormatBadge';
import RankBadge from '@/components/ui/RankBadge';
import MatchPill from '@/components/comedy-dna/MatchPill';
import QuickPick from '@/components/comedy-dna/QuickPick';
import { useDna } from '@/components/comedy-dna/DnaProvider';
import { trackEvent } from '@/lib/analytics';
import type { QuizJoke } from '@/lib/comedyDna';

type MetricKey = 'humor_index' | 'avg_jpm' | 'avg_craft' | 'avg_impact';
type SortKey = MetricKey | 'match';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'humor_index', label: 'Index' },
  { key: 'avg_jpm', label: 'Jokes/min' },
  { key: 'avg_craft', label: 'Craft' },
  { key: 'avg_impact', label: 'Impact' },
  { key: 'match', label: 'For you' },
];

const COLS: { key: MetricKey | 'imdb'; label: string }[] = [
  { key: 'imdb', label: 'IMDb' },
  { key: 'avg_jpm', label: 'Jokes/min' },
  { key: 'avg_craft', label: 'Craft' },
  { key: 'avg_impact', label: 'Impact' },
];

function cell(show: ShowScore, key: MetricKey | 'imdb'): string {
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
      <div className="min-w-0 flex items-center gap-3 sm:gap-5">
        <div className="min-w-0 w-36 sm:w-64 shrink-0">
          <p className={`font-medium truncate transition-colors group-hover:text-brand-gold ${pending ? 'text-brand-text-secondary' : 'text-brand-text-primary'}`}>
            {show.name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <FormatBadge format={show.format} />
            <MatchPill slug={show.slug} />
            {/* Phones have no room for the metric columns, so the active sort rides here. */}
            {sortKey !== 'humor_index' && sortKey !== 'match' && (
              <span className="sm:hidden font-mono text-[11px] text-brand-text-muted">
                {SORT_OPTIONS.find(o => o.key === sortKey)?.label} {show[sortKey].toFixed(1)}
              </span>
            )}
          </div>
        </div>
        {/* Wide backdrop strip, faded at both ends so it melts into the row. */}
        <div
          aria-hidden="true"
          className="relative flex-1 min-w-0 h-11 sm:h-14 overflow-hidden rounded-md"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 70%, transparent 100%)',
          }}
        >
          {show.backdrop_path && (
            <Image
              src={`https://image.tmdb.org/t/p/w780${show.backdrop_path}`}
              alt=""
              fill
              sizes="(min-width: 640px) 420px, 40vw"
              className={`object-cover object-[center_30%] transition-all duration-300 group-hover:scale-105 ${
                pending ? 'opacity-25 grayscale' : 'opacity-45 group-hover:opacity-70'
              }`}
            />
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

export default function LeaderboardClient({ shows, pending = [], quickPool = [] }: { shows: ShowScore[]; pending?: ShowScore[]; quickPool?: QuizJoke[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('humor_index');
  const dna = useDna();
  const matchFor = dna?.matchFor;
  const personal = sortKey === 'match' && !!dna?.hasProfile;

  const sorted = useMemo(() => [...shows].sort((a, b) => {
    if (sortKey === 'match') {
      return personal && matchFor ? (matchFor(b.slug)?.score ?? -9) - (matchFor(a.slug)?.score ?? -9) : b.humor_index - a.humor_index;
    }
    return b[sortKey] - a[sortKey];
  }), [shows, sortKey, personal, matchFor]);
  const pendingKey: MetricKey = sortKey === 'match' ? 'humor_index' : sortKey;
  const sortedPending = useMemo(() => [...pending].sort((a, b) => b[pendingKey] - a[pendingKey]), [pending, pendingKey]);
  const needPicks = sortKey === 'match' && !!dna?.ready && !dna.hasProfile;

  return (
    <div>
      <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl w-fit mb-5">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => { setSortKey(opt.key); if (opt.key === 'match') trackEvent('cdna_leaderboard_for_you', { has_profile: !!dna?.hasProfile }); }}
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

      {needPicks && quickPool.length > 0 && (
        <QuickPick
          className="mb-5 !bg-brand-surface"
          jokes={quickPool}
          source="leaderboard_for_you"
          title="Sort this list by your taste"
          subtitle="Pick the funnier joke a few times and the leaderboard reorders around what makes you laugh."
        />
      )}

      <div>
        {sorted.map((show, i) => (
          <Row key={show.slug} show={show} rank={i + 1} sortKey={sortKey} />
        ))}
      </div>

      {personal && dna && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          Ordered by how well each show fits the jokes you pick in Comedy DNA ({dna.profile.picks} picks so far).{' '}
          <Link href="/comedy-dna" className="text-brand-gold hover:underline">Sharpen your read →</Link>
        </p>
      )}

      {sortKey === 'humor_index' && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          Scores within about 1.2 points of each other are statistically tied, so several neighbours on this list are closer than the order suggests.{' '}
          <Link href="/methodology" className="text-brand-gold hover:underline">How we score →</Link>
        </p>
      )}

      {sortedPending.length > 0 && (
        // Folded by default: six unranked rows used to take a full screen of the homepage.
        <details className="group mt-8 border-t border-brand-border pt-4">
          <summary className="list-none cursor-pointer select-none flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-text-muted">
              + {sortedPending.length} shows awaiting rescore
            </span>
            <span className="text-xs text-brand-text-muted">
              {sortedPending.map(s => s.name.replace(/^The /, '')).join(', ')}
              <span className="text-brand-gold ml-2 group-open:hidden">Show ↓</span>
              <span className="text-brand-gold ml-2 hidden group-open:inline">Hide ↑</span>
            </span>
          </summary>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl mt-3 mb-3">
            These shows are fully scored, but on our earlier model. Shows gain 8 to 15 points when they move to the
            current one, so their numbers are not comparable with the list above and they stay unranked until their
            rescore is published.
          </p>
          <div className="border-t border-brand-border">
            {sortedPending.map(show => (
              <Row key={show.slug} show={show} rank={null} sortKey={sortKey} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

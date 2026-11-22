'use client';
import { Fragment, useEffect, useState, useMemo } from 'react';
import { estimateText } from '@/lib/scale';
import Link from 'next/link';
import Image from 'next/image';
import { ShowScore } from '@/lib/types';
import { formatIndex } from '@/lib/scoring';
import { boardTiers, tierName } from '@/lib/boardTiers';
import FormatBadge from '@/components/ui/FormatBadge';
import RankBadge from '@/components/ui/RankBadge';
import MatchPill from '@/components/comedy-dna/MatchPill';
import QuickPick from '@/components/comedy-dna/QuickPick';
import { useDna } from '@/components/comedy-dna/DnaProvider';
import { trackEvent } from '@/lib/analytics';
import type { QuizJoke } from '@/lib/comedyDna';

type MetricKey = 'humor_index' | 'avg_jpm' | 'avg_craft' | 'avg_impact';
type SortKey = MetricKey | 'peak_22' | 'match';

const SHORT_RUN = 22;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'humor_index', label: 'Index' },
  { key: 'peak_22', label: 'Best 22' },
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

/** A 95% interval drawn on the board's own score range, with the point marked. */
function Whisker({ show, lo, hi }: { show: ShowScore; lo: number; hi: number }) {
  if (show.ci_95_low === undefined || show.ci_95_high === undefined || hi <= lo) return null;
  const pos = (v: number) => `${Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100))}%`;
  const half = (show.ci_95_high - show.ci_95_low) / 2;
  return (
    <span className="mt-1.5 block" title={`95% interval ${show.ci_95_low.toFixed(1)} to ${show.ci_95_high.toFixed(1)}`}>
      <span className="relative block h-1.5 w-full rounded-full bg-brand-border/60">
        <span className="absolute top-0 h-1.5 rounded-full bg-brand-gold/40" style={{ left: pos(show.ci_95_low), width: `calc(${pos(show.ci_95_high)} - ${pos(show.ci_95_low)})` }} />
        <span className="absolute -top-[2px] h-2.5 w-[3px] rounded bg-brand-gold" style={{ left: `calc(${pos(show.humor_index)} - 1px)` }} />
      </span>
      <span className="mt-0.5 block font-mono text-[11px] text-brand-text-secondary">±{half.toFixed(1)}</span>
    </span>
  );
}

function Row({ show, rank, sortKey, lo = 0, hi = 0 }: { show: ShowScore; rank: number | null; sortKey: SortKey; lo?: number; hi?: number }) {
  const pending = rank === null;
  return (
    <Link
      href={show.href ?? `/shows/${show.slug}`}
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
            {show.kind !== 'movie' && <FormatBadge format={show.format} />}
            {show.kind !== 'movie' && <MatchPill slug={show.slug} />}
            {/* Phones have no room for the metric columns, so the active sort rides here. */}
            {sortKey !== 'humor_index' && sortKey !== 'match' && sortKey !== 'peak_22' && (
              <span className="sm:hidden font-mono text-[11px] text-brand-text-muted">
                {SORT_OPTIONS.find(o => o.key === sortKey)?.label} {show[sortKey].toFixed(1)}
              </span>
            )}
            {show.kind !== 'movie' && show.scored_episodes !== undefined && show.scored_episodes < SHORT_RUN && (
              <span className="font-mono text-[11px] text-brand-text-muted" title={`Only ${show.scored_episodes} episodes: a short run, so its average carries less proof than a long one.`}>
                short run · {show.scored_episodes} eps
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
        <span className={`font-mono leading-none text-2xl sm:text-3xl ${pending ? 'text-brand-text-muted' : 'text-brand-gold'}`}>
          {sortKey === 'peak_22' && show.peak_22 !== undefined ? show.peak_22.toFixed(1) : formatIndex(show.humor_index)}
        </span>
        {!pending && sortKey === 'peak_22' && show.peak_22 !== undefined && (
          <span className="mt-1 block font-mono text-[11px] text-brand-text-secondary">
            {show.kind === 'movie' ? `best of ${show.scored_episodes} reels` : (show.scored_episodes ?? 0) >= SHORT_RUN ? `best 22 of ${show.scored_episodes}` : `all ${show.scored_episodes}`} · Index {formatIndex(show.humor_index)}
          </span>
        )}
        {!pending && sortKey === 'humor_index' && <Whisker show={show} lo={lo} hi={hi} />}
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

export default function LeaderboardClient({ shows: tvShows, movies = [], pending: tvPending = [], quickPool = [] }: { shows: ShowScore[]; movies?: ShowScore[]; pending?: ShowScore[]; quickPool?: QuizJoke[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('humor_index');
  // TV and movies are separate boards on separate scales: the switch flips
  // between them, it never mixes them into one list.
  const [kind, setKind] = useState<'tv' | 'movies'>('tv');
  const isMovies = kind === 'movies';
  const shows = isMovies ? movies : tvShows;
  const pending = useMemo(() => (isMovies ? [] : tvPending), [isMovies, tvPending]);
  const sortOptions = SORT_OPTIONS
    .filter(o => !(isMovies && o.key === 'match'))
    .map(o => (isMovies && o.key === 'peak_22' ? { ...o, label: 'Best reel' } : o));
  const switchKind = (k: 'tv' | 'movies') => { setKind(k); if (k === 'movies' && sortKey === 'match') setSortKey('humor_index'); };
  // /?sort=best22 opens the board on the peak view (linked from short-run notes).
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('sort') === 'best22') setSortKey('peak_22');
      if (q.get('board') === 'movies') setKind('movies');
    } catch { /* ignore */ }
  }, []);
  const dna = useDna();
  const matchFor = dna?.matchFor;
  const personal = sortKey === 'match' && !!dna?.hasProfile;

  const sorted = useMemo(() => [...shows].sort((a, b) => {
    if (sortKey === 'match') {
      return personal && matchFor ? (matchFor(b.slug)?.score ?? -9) - (matchFor(a.slug)?.score ?? -9) : b.humor_index - a.humor_index;
    }
    if (sortKey === 'peak_22') return (b.peak_22 ?? b.humor_index) - (a.peak_22 ?? a.humor_index);
    return b[sortKey] - a[sortKey];
  }), [shows, sortKey, personal, matchFor]);
  const pendingKey: MetricKey = sortKey === 'match' || sortKey === 'peak_22' ? 'humor_index' : sortKey;
  const sortedPending = useMemo(() => [...pending].sort((a, b) => b[pendingKey] - a[pendingKey]), [pending, pendingKey]);
  const needPicks = sortKey === 'match' && !!dna?.ready && !dna.hasProfile;

  // Whisker scale: the board's own range, so intervals are readable.
  const lows = shows.map(s => s.ci_95_low ?? s.humor_index);
  const highs = shows.map(s => s.ci_95_high ?? s.humor_index);
  const scaleLo = Math.floor(Math.min(...lows, 100)) - 1;
  const scaleHi = Math.min(100, Math.ceil(Math.max(...highs, 0)) + 1);

  return (
    <div>
      {movies.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl w-fit" role="tablist" aria-label="TV or movies">
            {(['tv', 'movies'] as const).map(k => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                onClick={() => switchKind(k)}
                className={`text-sm px-4 py-1.5 rounded-lg transition-all ${kind === k ? 'bg-brand-text-primary text-black font-medium' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
              >
                {k === 'tv' ? `TV · ${tvShows.length}` : `Movies · ${movies.length}`}
              </button>
            ))}
          </div>
          <span className="text-xs text-brand-text-muted">Separate boards: a 22-minute episode and a 100-minute film aren’t on the same scale.</span>
        </div>
      )}

      <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl w-fit mb-5">
        {sortOptions.map(opt => (
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
      <div className="hidden sm:grid grid-cols-[2.75rem_minmax(0,1fr)_7rem_repeat(4,4.5rem)] gap-x-4 pb-2 border-b border-brand-border text-[11px] uppercase tracking-widest text-brand-text-muted">
        <span>Rank</span>
        <span>{isMovies ? 'Film' : 'Show'}</span>
        <span>Humor Index</span>
        {COLS.map(c => (
          c.key === 'imdb'
            ? <Link key={c.key} href="/rankings/index-vs-imdb/" title="Average IMDb episode rating: what viewers felt. The Index and IMDb barely move together; see where they disagree." className="underline decoration-dotted underline-offset-2 hover:text-brand-gold">{c.label}</Link>
            : <span key={c.key}>{c.label}</span>
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
        {(() => {
          // Tiers: a show joins the current tier while its interval reaches the
          // tier leader's. Measuring against the leader, not the row above, stops
          // ties from chaining all the way down the board.
          const { tierOf, sizes: tierSize } = sortKey === 'humor_index' ? boardTiers(sorted) : { tierOf: new Map<string, number>(), sizes: [] as number[] };
          let lastTier = 0;
          return sorted.map((show, i) => {
          // Shared rank for equal displayed values: Parks and Community at
          // 91.9 are both 8th, not 8th and 9th by accident of sort order.
          const key: MetricKey = sortKey === 'match' || sortKey === 'peak_22' ? 'humor_index' : sortKey;
          const shown = (s: ShowScore) => Math.round((sortKey === 'peak_22' ? (s.peak_22 ?? s.humor_index) : s[key]) * 10);
          const rank = sortKey === 'match' && personal ? i + 1 : 1 + sorted.filter(o => shown(o) > shown(show)).length;
          const t = tierOf.get(show.slug) ?? 0;
          const header = t > 0 && t !== lastTier;
          if (t > 0) lastTier = t;
          return (
            <Fragment key={show.slug}>
              {header && (
                <div className={`flex items-baseline gap-2 pb-1 ${i > 0 ? 'pt-5' : 'pt-1'}`}>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-brand-gold">{tierName(t)}</span>
                  <span className="text-[11px] text-brand-text-muted">
                    {tierSize[t - 1] > 1 ? `${tierSize[t - 1]} ${isMovies ? 'films' : 'shows'}, statistically tied` : 'alone'}
                  </span>
                </div>
              )}
              <Row show={show} rank={rank} sortKey={sortKey} lo={scaleLo} hi={scaleHi} />
            </Fragment>
          );
          });
        })()}
      </div>

      {personal && dna && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          Ordered by how well each show fits the jokes you pick in Comedy DNA ({dna.profile.picks} picks so far).{' '}
          <Link href="/comedy-dna" className="text-brand-gold hover:underline">Sharpen your read →</Link>
        </p>
      )}

      {sortKey === 'peak_22' && isMovies && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          Best reel is the peak: each film’s funniest stretch, scored like an episode (about 22 minutes). The Index is the whole film.{' '}
          <Link href="/methodology#peak" className="text-brand-gold hover:underline">How we score →</Link>
        </p>
      )}

      {sortKey === 'peak_22' && !isMovies && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          Best 22 is the peak: the average of each show’s 22 best episodes, about one network season. The Index is the whole career, every episode counted.
          A long run has more chances at 22 great ones; a short run uses everything it has, so it’s marked.{' '}
          <Link href="/methodology#peak" className="text-brand-gold hover:underline">How we score →</Link>
        </p>
      )}

      {sortKey === 'humor_index' && isMovies && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          The bar under each score is its 95% interval. A film has only a handful of reels, so the interval comes from the spread of its own jokes instead, converted to the Index scale. Films are grouped into tiers the same way as TV: every film in a tier has an interval that reaches the tier leader’s. Movies rank against movies only.{' '}
          <Link href="/movies" className="text-brand-gold hover:underline">The movies page →</Link>
        </p>
      )}

      {sortKey === 'humor_index' && !isMovies && (
        <p className="mt-4 text-xs text-brand-text-muted leading-relaxed">
          The bar under each score is its 95% interval, from the spread of the show’s episode scores. Shows are grouped into tiers, from the Pantheon down: every show in a tier has an interval that reaches the tier leader’s, so the order inside a tier is a statistical tie. The Index is the career average; switch to Best 22 for the peak.{' '}
          <Link href="/methodology" className="text-brand-gold hover:underline">How we score →</Link>
        </p>
      )}

      {sortedPending.length > 0 && (
        // Folded by default: six unranked rows used to take a full screen of the homepage.
        <details className="group mt-8 border-t border-brand-border pt-4">
          <summary className="list-none cursor-pointer select-none flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-brand-text-muted">
              Not ranked: {sortedPending.length} shows scored on our earlier model
            </span>
            <span className="text-xs text-brand-text-muted">
              {sortedPending.map(s => s.name.replace(/^The /, '')).join(', ')}
              <span className="text-brand-gold ml-2 group-open:hidden">Show ↓</span>
              <span className="text-brand-gold ml-2 hidden group-open:inline">Hide ↑</span>
            </span>
          </summary>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl mt-3 mb-3">
            Yes, The Simpsons and Curb are missing from the ranking on purpose. These shows were fully scored, but on
            our earlier model, so their numbers aren’t comparable with the list above and they stay unranked. We are
            not rescoring older shows for now; new shows come first. Friends, Sunny and Community gained 8 to 14 points when they moved to the
            current model; applied here, that puts {sortedPending.map(s => `${s.name.replace(/^The /, '')} at ${estimateText(s.humor_index)}`).join(', ')}.
            Estimates, not scores.
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

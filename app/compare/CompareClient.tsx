'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShowScore } from '@/lib/types';
import { formatIndex } from '@/lib/scoring';
import SocialShare from '@/components/ui/SocialShare';
import { RadarCompareChart, JokeTypesCompareChart } from '@/components/charts';

interface Props {
  shows: ShowScore[];
  dnaBySlug: Record<string, Record<string, number>>;
}

function ShowSelector({
  label,
  shows,
  value,
  onChange,
  exclude,
}: {
  label: string;
  shows: ShowScore[];
  value: string;
  onChange: (v: string) => void;
  exclude: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">{label}</p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-brand-card border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text-primary focus:outline-none focus:border-brand-gold"
      >
        <option value="">Select a show…</option>
        {shows
          .filter(s => s.slug !== exclude)
          .map(s => (
            <option key={s.slug} value={s.slug}>
              {s.name} ({formatIndex(s.humor_index)})
            </option>
          ))}
      </select>
    </div>
  );
}

export default function CompareClient({ shows, dnaBySlug }: Props) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get('show');

  const [slugA, setSlugA] = useState(() => {
    if (preselected && shows.some(s => s.slug === preselected)) return preselected;
    return shows[0]?.slug ?? '';
  });
  const [slugB, setSlugB] = useState(() => {
    if (preselected && shows[0]?.slug === preselected) return shows[1]?.slug ?? '';
    return shows[1]?.slug ?? '';
  });

  const showA = shows.find(s => s.slug === slugA);
  const showB = shows.find(s => s.slug === slugB);

  const ready = showA && showB;

  const dnaA = dnaBySlug[slugA];
  const dnaB = dnaBySlug[slugB];

  const dims: { key: keyof ShowScore; label: string }[] = [
    { key: 'humor_index', label: 'Humor Index' },
    { key: 'avg_jpm', label: 'JPM' },
    { key: 'avg_craft', label: 'Craft' },
    { key: 'avg_impact', label: 'Impact' },
  ];

  return (
    <div className="space-y-10">
      {/* Selectors — framed as "The Matchup" */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-serif italic text-brand-gold text-lg">Pick your matchup.</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <ShowSelector
            label="Show A"
            shows={shows}
            value={slugA}
            onChange={setSlugA}
            exclude={slugB}
          />
          <div className="hidden sm:flex items-center justify-center pb-2">
            <span className="font-serif italic text-brand-text-muted text-xl">vs</span>
          </div>
          <ShowSelector
            label="Show B"
            shows={shows}
            value={slugB}
            onChange={setSlugB}
            exclude={slugA}
          />
        </div>
      </div>

      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-10"
        >
          {/* Editorial split-screen hero */}
          {(() => {
            const diff = Math.abs(showA.humor_index - showB.humor_index);
            const tied = diff < 1.5;
            const winner = showA.humor_index >= showB.humor_index ? showA : showB;
            const loser = winner === showA ? showB : showA;
            return (
              <div className="relative rounded-2xl overflow-hidden border border-brand-border">
                {/* Backdrops split */}
                <div className="relative h-[260px] sm:h-[320px] grid grid-cols-2">
                  <div className="relative overflow-hidden">
                    {showA.backdrop_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w780${showA.backdrop_path}`}
                        alt={showA.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 600px"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-brand-surface" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/40 via-brand-dark/20 to-brand-dark/80" />
                  </div>
                  <div className="relative overflow-hidden">
                    {showB.backdrop_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w780${showB.backdrop_path}`}
                        alt={showB.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 600px"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-brand-surface" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-l from-brand-dark/40 via-brand-dark/20 to-brand-dark/80" />
                  </div>
                  {/* Center VS pillar */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-brand-gold/40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand-dark border border-brand-gold/60 flex items-center justify-center shadow-lg">
                      <span className="font-serif italic text-brand-gold text-xl sm:text-2xl">vs</span>
                    </div>
                  </div>
                </div>

                {/* Names + HI numbers */}
                <div className="bg-brand-card border-t border-brand-border grid grid-cols-2">
                  <div className="p-5 sm:p-7 text-right border-r border-brand-border">
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-1">Show A</p>
                    <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight mb-3">
                      {showA.name}
                    </h2>
                    <p className="font-serif italic text-5xl sm:text-6xl text-brand-gold leading-none">
                      {formatIndex(showA.humor_index)}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-2">Humor Index</p>
                  </div>
                  <div className="p-5 sm:p-7">
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-1">Show B</p>
                    <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight mb-3">
                      {showB.name}
                    </h2>
                    <p className="font-serif italic text-5xl sm:text-6xl text-brand-blue leading-none">
                      {formatIndex(showB.humor_index)}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-2">Humor Index</p>
                  </div>
                </div>

                {/* Editorial caption */}
                <div className="bg-brand-surface border-t border-brand-border px-5 sm:px-7 py-4 text-center">
                  {tied ? (
                    <p className="text-sm text-brand-text-secondary font-serif italic">
                      Within the noise floor — {diff.toFixed(1)} points separates them. Statistically tied.
                    </p>
                  ) : (
                    <p className="text-sm text-brand-text-secondary font-serif italic">
                      <span className="text-brand-text-primary not-italic font-medium">{winner.name}</span>
                      {' '}clears{' '}
                      <span className="text-brand-text-primary not-italic font-medium">{loser.name}</span>
                      {' '}by{' '}
                      <span className="text-brand-gold not-italic font-medium">{diff.toFixed(1)} points</span>.
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Sub-metrics in a clean 4-up row */}
          <section>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">By the Numbers</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dims.filter(d => d.key !== 'humor_index').map(d => {
                const aVal = showA[d.key] as number;
                const bVal = showB[d.key] as number;
                const aWins = aVal >= bVal;
                return (
                  <div key={d.key} className="bg-brand-card border border-brand-border rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-3">{d.label}</p>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-mono text-xs text-brand-text-muted truncate mr-2">{showA.name}</span>
                      <span className={`font-mono text-base ${aWins ? 'text-brand-gold font-medium' : 'text-brand-text-secondary'}`}>
                        {aVal.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-xs text-brand-text-muted truncate mr-2">{showB.name}</span>
                      <span className={`font-mono text-base ${!aWins ? 'text-brand-blue font-medium' : 'text-brand-text-secondary'}`}>
                        {bVal.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Radar */}
          <section>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Comedy Shape</p>
            <p className="font-serif italic text-xl text-brand-text-primary mb-5">
              How each show distributes its laughs across the four axes.
            </p>
            <RadarCompareChart showA={showA} showB={showB} />
          </section>

          {/* Joke types compare */}
          {dnaA && dnaB && (
            <section>
              <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Comedy DNA</p>
              <p className="font-serif italic text-xl text-brand-text-primary mb-5">
                The joke-type fingerprint — what each show is actually made of.
              </p>
              <JokeTypesCompareChart
                showAName={showA.name}
                showBName={showB.name}
                distA={dnaA}
                distB={dnaB}
              />
            </section>
          )}

          {/* The Verdict — pull-quote treatment */}
          {(() => {
            const aWins = dims.filter(d => (showA[d.key] as number) >= (showB[d.key] as number)).length;
            const bWins = dims.length - aWins;
            const winsCount = aWins >= bWins ? aWins : bWins;
            const overall = aWins >= bWins ? showA : showB;
            const other = overall === showA ? showB : showA;
            const sweep = winsCount === dims.length;
            return (
              <section className="relative bg-gradient-to-b from-brand-card to-brand-surface border border-brand-border rounded-2xl px-6 sm:px-10 py-10 sm:py-12 overflow-hidden">
                {/* Decorative quote mark */}
                <div className="absolute top-4 left-6 font-serif italic text-brand-gold/20 text-7xl leading-none select-none">
                  &ldquo;
                </div>

                <div className="relative max-w-2xl mx-auto text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-brand-text-muted mb-5">The Final Word</p>
                  <h3 className="font-serif italic text-2xl sm:text-4xl text-brand-text-primary leading-snug mb-5">
                    {sweep ? (
                      <>
                        <span className="text-brand-gold">{overall.name}</span> sweeps{' '}
                        <span className="text-brand-text-secondary">{other.name}</span>.
                      </>
                    ) : (
                      <>
                        <span className="text-brand-gold">{overall.name}</span> takes it,{' '}
                        <span className="font-mono not-italic text-brand-gold">{winsCount}–{dims.length - winsCount}</span>.
                      </>
                    )}
                  </h3>
                  <p className="text-sm text-brand-text-secondary leading-relaxed mb-2">
                    Across {dims.length} dimensions of comedy — Humor Index, jokes-per-minute, craft, and impact —
                    {' '}<span className="text-brand-text-primary">{overall.name}</span> wins {winsCount}.
                  </p>

                  {/* Per-dimension chips */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6 mb-7">
                    {dims.map(d => {
                      const aVal = showA[d.key] as number;
                      const bVal = showB[d.key] as number;
                      const winner = aVal >= bVal ? showA : showB;
                      const isA = winner === showA;
                      return (
                        <span
                          key={d.key}
                          className={`text-xs px-3 py-1.5 rounded-full border ${
                            isA
                              ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold'
                              : 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue'
                          }`}
                        >
                          {d.label}: <span className="font-medium">{winner.name}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex justify-center">
                    <SocialShare
                      title={`${overall.name} beats ${other.name} on The Humor Index`}
                      text={`${overall.name} wins ${winsCount} of ${dims.length} dimensions vs ${other.name} on The Humor Index`}
                      url={`/compare?show=${slugA}`}
                    />
                  </div>
                </div>
              </section>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

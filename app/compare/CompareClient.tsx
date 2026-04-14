'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShowScore } from '@/lib/types';
import { formatIndex } from '@/lib/scoring';
import { MOCK_DNA_DATA } from '@/lib/constants';
import ScoreCard from '@/components/ui/ScoreCard';
import SocialShare from '@/components/ui/SocialShare';
import { RadarCompareChart, JokeTypesCompareChart } from '@/components/charts';

interface Props {
  shows: ShowScore[];
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

export default function CompareClient({ shows }: Props) {
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

  const dnaA = MOCK_DNA_DATA[slugA as keyof typeof MOCK_DNA_DATA];
  const dnaB = MOCK_DNA_DATA[slugB as keyof typeof MOCK_DNA_DATA];

  const dims: { key: keyof ShowScore; label: string }[] = [
    { key: 'humor_index', label: 'Humor Index' },
    { key: 'avg_jpm', label: 'JPM' },
    { key: 'avg_craft', label: 'Craft' },
    { key: 'avg_impact', label: 'Impact' },
  ];

  return (
    <div className="space-y-8">
      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ShowSelector
          label="Show A"
          shows={shows}
          value={slugA}
          onChange={setSlugA}
          exclude={slugB}
        />
        <ShowSelector
          label="Show B"
          shows={shows}
          value={slugB}
          onChange={setSlugB}
          exclude={slugA}
        />
      </div>

      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Metric cards side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-gold mb-3">{showA.name}</p>
              <div className="grid grid-cols-2 gap-3">
                {dims.map(d => (
                  <ScoreCard
                    key={d.key}
                    label={d.label}
                    value={showA[d.key] as number}
                    highlight={d.key === 'humor_index'}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-blue mb-3">{showB.name}</p>
              <div className="grid grid-cols-2 gap-3">
                {dims.map(d => (
                  <ScoreCard
                    key={d.key}
                    label={d.label}
                    value={showB[d.key] as number}
                    highlight={d.key === 'humor_index'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Radar */}
          <RadarCompareChart showA={showA} showB={showB} />

          {/* Joke types compare */}
          {dnaA && dnaB && (
            <JokeTypesCompareChart
              showAName={showA.name}
              showBName={showB.name}
              distA={dnaA}
              distB={dnaB}
            />
          )}

          {/* Verdict */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">Verdict</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              {dims.map(d => {
                const aVal = showA[d.key] as number;
                const bVal = showB[d.key] as number;
                const winner = aVal >= bVal ? showA : showB;
                const color = aVal >= bVal ? '#E8B931' : '#378ADD';
                return (
                  <div key={d.key} className="bg-brand-surface rounded-lg p-3">
                    <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{d.label}</p>
                    <p className="text-sm font-medium" style={{ color }}>{winner.name}</p>
                    <p className="font-mono text-xs text-brand-text-muted">
                      {aVal.toFixed(1)} vs {bVal.toFixed(1)}
                    </p>
                  </div>
                );
              })}
            </div>
            {(() => {
              const aWins = dims.filter(d => (showA[d.key] as number) >= (showB[d.key] as number)).length;
              const bWins = dims.length - aWins;
              const overall = aWins >= bWins ? showA : showB;
              return (
                <div className="border-t border-brand-border pt-4">
                  <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Overall Winner</p>
                  <p className="text-lg font-medium text-brand-gold">{overall.name}</p>
                  <p className="text-xs text-brand-text-muted mt-0.5">
                    Wins {aWins >= bWins ? aWins : bWins} of {dims.length} dimensions
                  </p>
                  <div className="mt-4">
                    <SocialShare
                      title={`${overall.name} beats ${overall === showA ? showB.name : showA.name} on The Humor Index`}
                      text={`${overall.name} wins ${aWins >= bWins ? aWins : bWins} of ${dims.length} dimensions vs ${overall === showA ? showB.name : showA.name} on The Humor Index`}
                      url={`/compare?show=${slugA}`}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}
    </div>
  );
}

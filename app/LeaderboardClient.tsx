'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShowScore } from '@/lib/types';
import { scoreToColor, formatIndex } from '@/lib/scoring';
import FormatBadge from '@/components/ui/FormatBadge';
import RankBadge from '@/components/ui/RankBadge';
import MetricBadge from '@/components/ui/MetricBadge';
import TierBadge from '@/components/ui/TierBadge';

type SortKey = 'humor_index' | 'avg_jpm' | 'avg_craft' | 'avg_impact';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'humor_index', label: 'Index' },
  { key: 'avg_jpm', label: 'JPM' },
  { key: 'avg_craft', label: 'Craft' },
  { key: 'avg_impact', label: 'Impact' },
];

export default function LeaderboardClient({ shows }: { shows: ShowScore[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('humor_index');

  const sorted = useMemo(
    () => [...shows].sort((a, b) => b[sortKey] - a[sortKey]),
    [shows, sortKey]
  );

  return (
    <div>
      {/* Sort tabs */}
      <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl w-fit mb-4">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
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

      {/* Table — desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Rank', 'Show', 'Format', 'Humor Index', 'IMDb', 'JPM', 'Craft', 'Impact'].map(h => {
                const isBadge = ['Humor Index', 'IMDb', 'JPM', 'Craft', 'Impact', 'Best Season'].includes(h);
                return (
                  <th key={h} className="text-left text-xs uppercase tracking-widest text-brand-text-muted font-normal pb-3 pr-4 first:pl-0">
                    {isBadge ? <MetricBadge label={h} /> : h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((show, i) => (
              <motion.tr
                key={show.slug}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: 'easeOut' }}
                className="border-b border-brand-border/50 hover:bg-brand-surface transition-colors"
              >
                <td className="py-3 pr-4">
                  <RankBadge rank={i + 1} />
                </td>
                <td className="py-3 pr-4">
                  <Link href={`/shows/${show.slug}`} className="font-medium text-brand-text-primary hover:text-brand-gold transition-colors">
                    {show.name}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <FormatBadge format={show.format} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <TierBadge score={show.humor_index} ciLow={show.ci_95_low} ciHigh={show.ci_95_high} />
                    <span className="font-mono text-xs text-brand-text-muted" style={{ color: scoreToColor(show.humor_index) }}>
                      {formatIndex(show.humor_index)}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-brand-text-secondary">{show.avg_imdb_rating?.toFixed(1) ?? '—'}</td>
                <td className="py-3 pr-4 font-mono text-xs text-brand-text-secondary">{show.avg_jpm.toFixed(1)}</td>
                <td className="py-3 pr-4 font-mono text-xs text-brand-text-secondary">{show.avg_craft.toFixed(1)}</td>
                <td className="py-3 pr-4 font-mono text-xs text-brand-text-secondary">{show.avg_impact.toFixed(1)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="sm:hidden space-y-3">
        {sorted.map((show, i) => (
          <motion.div
            key={show.slug}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link href={`/shows/${show.slug}`}>
              <div className="bg-brand-card border border-brand-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <RankBadge rank={i + 1} />
                    <span className="font-medium text-brand-text-primary">{show.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <TierBadge score={show.humor_index} ciLow={show.ci_95_low} ciHigh={show.ci_95_high} size="sm" />
                    <span className="font-mono text-[10px] text-brand-text-muted" style={{ color: scoreToColor(show.humor_index) }}>
                      {formatIndex(show.humor_index)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-brand-text-muted flex-wrap">
                  {show.avg_imdb_rating && (
                    <span className="flex items-center gap-1"><MetricBadge label="IMDb" /> <span className="font-mono text-brand-text-secondary">{show.avg_imdb_rating.toFixed(1)}</span></span>
                  )}
                  <span className="flex items-center gap-1"><MetricBadge label="JPM" /> <span className="font-mono text-brand-text-secondary">{show.avg_jpm.toFixed(1)}</span></span>
                  <span className="flex items-center gap-1"><MetricBadge label="Craft" /> <span className="font-mono text-brand-text-secondary">{show.avg_craft.toFixed(1)}</span></span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

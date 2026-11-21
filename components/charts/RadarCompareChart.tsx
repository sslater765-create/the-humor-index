'use client';
import { ShowScore } from '@/lib/types';
import ShareButton from '../ui/ShareButton';

interface Props {
  showA: ShowScore;
  showB: ShowScore;
}

/**
 * Head-to-head as paired bars, one row per metric, each on its own scale with
 * the real values printed. (Was a radar chart: it put the 0 to 100 index, the
 * 0 to 10 IMDb rating and WAR on one polygon, and radar area exaggerates gaps.)
 * Kept under the old export name so both Compare pages pick it up.
 */
const METRICS: Array<{ label: string; get: (s: ShowScore) => number | null | undefined; min: number; max: number; fmt: (v: number) => string; note: string }> = [
  { label: 'Humor Index', get: s => s.humor_index, min: 60, max: 100, fmt: v => v.toFixed(1), note: '0 to 100' },
  { label: 'Craft', get: s => s.avg_craft, min: 6, max: 8, fmt: v => v.toFixed(2), note: 'avg per joke, of 10' },
  { label: 'Impact', get: s => s.avg_impact, min: 6, max: 8, fmt: v => v.toFixed(2), note: 'avg per joke, of 10' },
  { label: 'Jokes per minute', get: s => s.avg_jpm, min: 1, max: 4.5, fmt: v => v.toFixed(2), note: 'density' },
  { label: 'IMDb', get: s => s.avg_imdb_rating, min: 6.5, max: 9, fmt: v => v.toFixed(1), note: 'avg episode rating' },
];

const pct = (v: number, min: number, max: number) => Math.max(3, Math.min(100, ((v - min) / (max - min)) * 100));

export default function RadarCompareChart({ showA, showB }: Props) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Head-to-head</p>
          <p className="text-base font-medium text-brand-text-primary">{showA.name} vs {showB.name}</p>
        </div>
        <ShareButton targetId="h2h-bars" filename={`${showA.slug}-vs-${showB.slug}`} />
      </div>
      <div id="h2h-bars" className="space-y-4">
        {METRICS.map(m => {
          const a = m.get(showA), b = m.get(showB);
          if (a == null || b == null) return null;
          const lead = a === b ? null : a > b ? 'a' : 'b';
          return (
            <div key={m.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-sm text-brand-text-primary">{m.label}</p>
                <p className="text-[11px] text-brand-text-muted">{m.note}</p>
              </div>
              {([['a', showA, a], ['b', showB, b]] as const).map(([k, s, v]) => (
                <div key={k} className="flex items-center gap-3 mb-1">
                  <span className="w-24 shrink-0 truncate text-xs text-brand-text-secondary">{s.name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-brand-surface overflow-hidden">
                    <div className={`h-full rounded-full ${k === 'a' ? 'bg-brand-gold' : 'bg-brand-blue'}`} style={{ width: `${pct(v, m.min, m.max)}%`, opacity: lead && lead !== k ? 0.55 : 1 }} />
                  </div>
                  <span className={`w-12 text-right font-mono text-sm ${lead === k ? 'text-brand-text-primary' : 'text-brand-text-muted'}`}>{m.fmt(v)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

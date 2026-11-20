'use client';
import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export interface LaughMapBin {
  start: number;
  end: number;
  count: number;
  total: number;
  best?: { line: string; speaker?: string; t: number | null; score: number } | null;
}

interface Props {
  slug: string;
  bins: LaughMapBin[];
  peakStart: number;
  slump: { start: number; end: number } | null;
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

// Heat scale from muted to brand gold. Bars are colored by their share of the
// peak bin so the funniest stretch always reads as the brightest.
function heat(share: number): string {
  if (share >= 0.9) return '#E8B931';
  if (share >= 0.75) return '#D9A12A';
  if (share >= 0.6) return '#BA7517';
  if (share >= 0.45) return '#8A5A1C';
  return '#4A3A22';
}

export default function LaughMap({ slug, bins, peakStart, slump }: Props) {
  const peakIdx = Math.max(0, bins.findIndex(b => b.start === peakStart));
  const [active, setActive] = useState(peakIdx);
  const max = Math.max(...bins.map(b => b.total), 1);
  const endT = bins[bins.length - 1]?.end ?? 1;

  const pct = (t: number) => (t / endT) * 100;

  const a = bins[active];
  const pick = (i: number) => {
    setActive(i);
    trackEvent('laugh_map_bin', { movie: slug, start: bins[i].start });
  };

  return (
    <div>
      <div className="relative h-44 sm:h-56">
        {slump && (
          <div className="absolute top-0 bottom-6 rounded-md bg-white/[0.035]"
            style={{ left: `${pct(slump.start)}%`, width: `${pct(slump.end) - pct(slump.start)}%` }}>
            <span className="absolute top-1 left-0 right-0 text-center text-[10px] sm:text-xs text-brand-text-muted whitespace-nowrap">plot happens here</span>
          </div>
        )}
        <div className="absolute inset-x-0 top-6 bottom-6 flex items-end border-b border-brand-border"
          role="img" aria-label="Laugh Map: joke strength across the film's runtime in five-minute stretches">
          {bins.map((b, i) => {
            const isPeak = i === peakIdx;
            return (
              <button key={b.start} type="button" onMouseEnter={() => pick(i)} onFocus={() => pick(i)} onClick={() => pick(i)}
                className="relative h-full flex items-end px-[1.5px] sm:px-[2px] focus:outline-none"
                style={{ width: `${pct(b.end) - pct(b.start)}%` }}
                aria-label={`${fmt(b.start)} to ${fmt(b.end)}, ${b.count} jokes`}>
                <span className="block w-full rounded-[3px] sm:rounded-md transition-[outline]"
                  style={{
                    height: `${Math.max((b.total / max) * 100, b.count ? 2 : 0)}%`,
                    background: heat(b.total / max),
                    outline: i === active ? '2px solid #F5F5F5' : 'none',
                    outlineOffset: 1,
                  }} />
                {isPeak && (
                  <span className="absolute left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-brand-gold whitespace-nowrap"
                    style={{ bottom: `calc(${(b.total / max) * 100}% + 4px)` }}>
                    funniest 5 min
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-5">
          {bins.filter((_, i) => i % 3 === 0).map(b => (
            <span key={b.start} className="absolute text-[10px] sm:text-xs text-brand-text-muted" style={{ left: `${pct(b.start)}%` }}>
              {Math.round(b.start / 60)}m
            </span>
          ))}
        </div>
      </div>

      {a && (
        <div className="mt-3 rounded-xl border border-brand-border bg-brand-card p-4 min-h-[96px]" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="font-mono text-xs text-brand-text-muted">
              {fmt(a.start)} to {fmt(a.end)} · {a.count} {a.count === 1 ? 'joke' : 'jokes'}
            </span>
            {active === peakIdx && <span className="text-[11px] uppercase tracking-wider text-brand-gold">Funniest five minutes</span>}
          </div>
          {a.best ? (
            <p className="text-sm sm:text-base text-brand-text-primary leading-relaxed">
              {a.best.speaker && <span className="text-brand-gold font-medium mr-1.5">{a.best.speaker}:</span>}
              &ldquo;{a.best.line}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-brand-text-muted">No scored jokes in this stretch.</p>
          )}
        </div>
      )}
      <p className="mt-2 text-xs text-brand-text-muted">Each bar is five minutes of the film. Taller and brighter means more, and stronger, jokes. Tap a bar to see its best line.</p>
    </div>
  );
}

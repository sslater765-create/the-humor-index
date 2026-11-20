'use client';
import { useState } from 'react';
import { EpisodeScore, SeasonScore } from '@/lib/types';
import { formatIndex, relativeColorFn, RELATIVE_SCALE, RELATIVE_LABELS } from '@/lib/scoring';
import ShareButton from '../ui/ShareButton';

interface Props {
  episodes: EpisodeScore[];
  seasons: SeasonScore[];
  showName: string;
}

interface TooltipState {
  episode: EpisodeScore;
  x: number;
  y: number;
}

export default function HeatmapGrid({ episodes, seasons, showName }: Props) {
  const colorOf = relativeColorFn(episodes.map(e => e.humor_index));
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const bySeasonMap = new Map<number, EpisodeScore[]>();
  for (const ep of episodes) {
    if (!bySeasonMap.has(ep.season)) bySeasonMap.set(ep.season, []);
    bySeasonMap.get(ep.season)!.push(ep);
  }

  // Size every row to the longest season so cells stay uniform squares,
  // columns align, and no row wraps (the half-width card can't fit 25
  // fixed-width cells on one line — flex-wrap was spilling them into stub rows).
  const maxEps = Math.max(1, ...Array.from(bySeasonMap.values(), eps => eps.length));

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">{showName}</p>
          <p className="text-base font-medium text-brand-text-primary">Episode Heatmap</p>
        </div>
        <ShareButton targetId="heatmap-wrap" filename={`${showName}-heatmap`} />
      </div>

      <div id="heatmap-wrap" className="space-y-1.5">
        {seasons.map(s => {
          const eps = bySeasonMap.get(s.season) ?? [];
          return (
            <div key={s.season} className="flex items-center gap-2">
              <span className="font-mono text-xs text-brand-text-muted w-5 shrink-0">S{s.season}</span>
              <div
                className="grid gap-0.5 flex-1 min-w-0"
                style={{ gridTemplateColumns: `repeat(${maxEps}, minmax(0, 1fr))` }}
              >
                {eps.map(ep => (
                  <button
                    type="button"
                    key={ep.episode_id}
                    aria-label={`S${ep.season}E${ep.episode_number} ${ep.title}, Humor Index ${formatIndex(ep.humor_index)}`}
                    className="aspect-square w-full rounded-sm cursor-pointer transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    style={{ backgroundColor: colorOf(ep.humor_index) + 'CC' }}
                    onMouseEnter={e => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setTooltip({ episode: ep, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={e => {
                      // Tap-to-toggle the tooltip on touch devices (no hover).
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setTooltip(prev => prev?.episode.episode_id === ep.episode_id ? null : { episode: ep, x: rect.left, y: rect.top });
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-4 pt-3 border-t border-brand-border">
        <span className="text-xs text-brand-text-muted">Within {showName}</span>
        {RELATIVE_SCALE.map((color, i) => ({ label: RELATIVE_LABELS[i], color })).reverse().map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-brand-text-muted">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-brand-surface border border-brand-border rounded-lg px-3 py-2 shadow-xl"
          style={{ left: tooltip.x + 8, top: tooltip.y - 56 }}
        >
          <p className="text-xs font-medium text-brand-text-primary">
            S{tooltip.episode.season}E{tooltip.episode.episode_number} — {tooltip.episode.title}
          </p>
          <p className="font-mono text-xs text-brand-gold">{tooltip.episode.humor_index.toFixed(1)}</p>
        </div>
      )}
    </div>
  );
}

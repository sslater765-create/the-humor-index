'use client';
import { useState } from 'react';
import { EpisodeScore, SeasonScore } from '@/lib/types';
import { scoreToColor } from '@/lib/scoring';
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
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const bySeasonMap = new Map<number, EpisodeScore[]>();
  for (const ep of episodes) {
    if (!bySeasonMap.has(ep.season)) bySeasonMap.set(ep.season, []);
    bySeasonMap.get(ep.season)!.push(ep);
  }

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
              <div className="flex gap-0.5 flex-wrap">
                {eps.map(ep => (
                  <div
                    key={ep.episode_id}
                    className="w-4 h-4 rounded-sm cursor-pointer transition-transform hover:scale-125"
                    style={{ backgroundColor: scoreToColor(ep.humor_index) + 'AA' }}
                    onMouseEnter={e => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ episode: ep, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-brand-border">
        <span className="text-xs text-brand-text-muted">Score</span>
        {[
          { label: '85+', color: '#E8B931' },
          { label: '75+', color: '#BA7517' },
          { label: '65+', color: '#378ADD' },
          { label: '55+', color: '#888780' },
          { label: '<55', color: '#5F5E5A' },
        ].map(item => (
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

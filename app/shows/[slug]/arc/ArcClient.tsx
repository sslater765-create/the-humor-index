'use client';
import { ShowScore, SeasonScore, EpisodeScore } from '@/lib/types';
import { formatIndex, scoreToColor } from '@/lib/scoring';

interface Props {
  show: ShowScore;
  seasons: SeasonScore[];
  episodes: EpisodeScore[];
}

export default function ArcClient({ show, seasons, episodes }: Props) {
  // Find peak and trough
  const peak = seasons.reduce((best, s) => s.humor_index > best.humor_index ? s : best, seasons[0]);
  const trough = seasons.reduce((worst, s) => s.humor_index < worst.humor_index ? s : worst, seasons[0]);

  const maxIndex = Math.max(...seasons.map(s => s.humor_index));
  const minIndex = Math.min(...seasons.map(s => s.humor_index));
  const range = maxIndex - minIndex || 1;

  return (
    <div className="space-y-8">
      {/* Key stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Peak</p>
          <p className="font-mono text-2xl text-brand-gold font-medium">S{peak.season}</p>
          <p className="font-mono text-sm text-brand-text-secondary">{formatIndex(peak.humor_index)}</p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Overall</p>
          <p className="font-mono text-2xl text-brand-text-primary font-medium">{formatIndex(show.humor_index)}</p>
          <p className="text-xs text-brand-text-muted">{show.total_seasons} seasons</p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Trough</p>
          <p className="font-mono text-2xl text-brand-text-muted font-medium">S{trough.season}</p>
          <p className="font-mono text-sm text-brand-text-secondary">{formatIndex(trough.humor_index)}</p>
        </div>
      </div>

      {/* Visual arc — bar chart */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-6">
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Humor Index by Season</p>
        <div className="flex items-end gap-2 h-48">
          {seasons.map(s => {
            const height = ((s.humor_index - minIndex + range * 0.1) / (range * 1.2)) * 100;
            const isPeak = s.season === peak.season;
            return (
              <div key={s.season} className="flex-1 flex flex-col items-center gap-1">
                <span className="font-mono text-xs text-brand-text-muted">
                  {formatIndex(s.humor_index)}
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(height, 5)}%`,
                    backgroundColor: isPeak ? '#E8B931' : scoreToColor(s.humor_index),
                    opacity: isPeak ? 1 : 0.7,
                  }}
                />
                <span className={`text-xs ${isPeak ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                  S{s.season}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Season-by-season breakdown */}
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">Season Details</p>
        <div className="space-y-3">
          {seasons.map(s => {
            const seasonEps = episodes
              .filter(e => e.season === s.season)
              .sort((a, b) => b.humor_index - a.humor_index);
            const bestEp = seasonEps[0];
            const worstEp = seasonEps[seasonEps.length - 1];

            return (
              <div key={s.season} className="bg-brand-card border border-brand-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm font-medium ${s.season === peak.season ? 'text-brand-gold' : 'text-brand-text-primary'}`}>
                      Season {s.season}
                    </span>
                    {s.season === peak.season && (
                      <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2 py-0.5">
                        Peak
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-lg font-medium" style={{ color: scoreToColor(s.humor_index) }}>
                    {formatIndex(s.humor_index)}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-brand-text-muted mb-2">
                  <span>JPM {s.avg_jpm.toFixed(1)}</span>
                  <span>Craft {s.avg_craft.toFixed(1)}</span>
                  <span>Impact {s.avg_impact.toFixed(1)}</span>
                  <span>{s.total_jokes} jokes</span>
                </div>
                {bestEp && (
                  <div className="text-xs text-brand-text-muted">
                    Best: <span className="text-brand-text-secondary">{bestEp.title}</span>
                    <span className="font-mono text-brand-gold ml-1">({formatIndex(bestEp.humor_index)})</span>
                    {worstEp && bestEp !== worstEp && (
                      <>
                        {' · '}Worst: <span className="text-brand-text-secondary">{worstEp.title}</span>
                        <span className="font-mono ml-1">({formatIndex(worstEp.humor_index)})</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

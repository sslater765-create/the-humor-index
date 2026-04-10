import { EpisodeScore } from '@/lib/types';
import { scoreToColor, formatIndex } from '@/lib/scoring';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';

interface Props {
  episode: EpisodeScore;
  rank?: number;
}

export default function EpisodeRow({ episode, rank }: Props) {
  const dominantType = episode.dominant_joke_types[0];

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-brand-surface transition-colors rounded-lg">
      {rank !== undefined && (
        <span className="font-mono text-xs text-brand-text-muted w-5 text-right shrink-0">{rank}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-brand-text-muted shrink-0">
            S{episode.season}E{String(episode.episode_number).padStart(2, '0')}
          </span>
          <span className="text-sm text-brand-text-primary truncate">{episode.title}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {episode.air_date && (
            <span className="text-xs text-brand-text-muted">{episode.air_date}</span>
          )}
          {dominantType && (
            <span className="text-xs text-brand-text-muted bg-brand-surface border border-brand-border rounded px-1.5 py-0.5">
              {JOKE_TYPE_LABELS[dominantType]}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted">JPM</p>
          <p className="font-mono text-xs text-brand-text-secondary">{episode.jpm.toFixed(1)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted">Craft</p>
          <p className="font-mono text-xs text-brand-text-secondary">{episode.avg_craft.toFixed(1)}</p>
        </div>
        <div
          className="font-mono text-base font-medium w-12 text-right"
          style={{ color: scoreToColor(episode.humor_index) }}
        >
          {formatIndex(episode.humor_index)}
        </div>
      </div>
    </div>
  );
}

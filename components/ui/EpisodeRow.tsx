import Link from 'next/link';
import { EpisodeScore } from '@/lib/types';
import { scoreToColor, formatIndex } from '@/lib/scoring';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';

interface Props {
  episode: EpisodeScore;
  rank?: number;
  showSlug?: string;
}

function formatAirDate(raw: string): string {
  // raw is ISO "YYYY-MM-DD". Render compact: "Dec '89".
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return raw;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mi = parseInt(m[2], 10) - 1;
  const yy = m[1].slice(2);
  return `${months[mi] || m[2]} '${yy}`;
}

export default function EpisodeRow({ episode, rank, showSlug }: Props) {
  const dominantType = episode.dominant_joke_types?.[0];
  const slug = showSlug || episode.slug || '';
  const href = slug
    ? `/shows/${slug}/${episode.season}/${episode.episode_number}`
    : '#';

  return (
    <Link href={href} className="block">
      <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-brand-surface active:bg-brand-surface transition-colors rounded-lg group">
        {rank !== undefined && (
          <span className="font-mono text-xs text-brand-text-muted w-5 text-right shrink-0">{rank}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-brand-text-muted shrink-0">
              S{episode.season}E{String(episode.episode_number).padStart(2, '0')}
            </span>
            <span className="text-sm text-brand-text-primary truncate group-hover:text-brand-gold transition-colors">
              {episode.title}
            </span>
          </div>
          {dominantType && JOKE_TYPE_LABELS[dominantType] && (
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-brand-text-muted bg-brand-surface border border-brand-border rounded px-1.5 py-0.5 hidden sm:inline">
                {JOKE_TYPE_LABELS[dominantType]}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Index — first, purple badge so it doesn't blend with IMDb yellow */}
          <div className="text-right w-14">
            <p className="text-xs text-brand-text-muted"><span className="bg-purple-500 text-white font-bold text-[9px] px-1 py-0.5 rounded">Index</span></p>
            <p
              className="font-mono text-sm font-semibold"
              style={{ color: scoreToColor(episode.humor_index) }}
            >
              {formatIndex(episode.humor_index)}
            </p>
          </div>
          {/* WAR */}
          {episode.war !== undefined && episode.war !== null && (
            <div className="text-right hidden sm:block w-12">
              <p className="text-xs text-brand-text-muted"><span className="bg-red-500 text-white font-bold text-[9px] px-1 py-0.5 rounded">WAR</span></p>
              <p className="font-mono text-xs text-brand-text-secondary">{episode.war.toFixed(1)}</p>
            </div>
          )}
          {/* JPM */}
          <div className="text-right hidden sm:block w-12">
            <p className="text-xs text-brand-text-muted"><span className="bg-cyan-500 text-white font-bold text-[9px] px-1 py-0.5 rounded">JPM</span></p>
            <p className="font-mono text-xs text-brand-text-secondary">{episode.jpm.toFixed(1)}</p>
          </div>
          {/* Craft */}
          <div className="text-right hidden sm:block w-12">
            <p className="text-xs text-brand-text-muted"><span className="bg-blue-500 text-white font-bold text-[9px] px-1 py-0.5 rounded">Craft</span></p>
            <p className="font-mono text-xs text-brand-text-secondary">{episode.avg_craft.toFixed(1)}</p>
          </div>
          {/* IMDb */}
          {episode.imdb_rating && (
            <div className="text-right hidden sm:block w-12">
              <p className="text-xs text-brand-text-muted"><span className="bg-[#F5C518] text-black font-bold text-[9px] px-1 py-0.5 rounded">IMDb</span></p>
              <p className="font-mono text-xs text-brand-text-secondary">{episode.imdb_rating.toFixed(1)}</p>
            </div>
          )}
          {/* Air Date */}
          {episode.air_date && (
            <div className="text-right hidden sm:block w-16">
              <p className="text-xs text-brand-text-muted"><span className="bg-slate-500 text-white font-bold text-[9px] px-1 py-0.5 rounded">Aired</span></p>
              <p className="font-mono text-xs text-brand-text-secondary">{formatAirDate(episode.air_date)}</p>
            </div>
          )}
          <span className="text-brand-text-muted text-xs hidden sm:inline">→</span>
        </div>
      </div>
    </Link>
  );
}

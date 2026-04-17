'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIndex } from '@/lib/scoring';
import type { ShowFormat } from '@/lib/types';

const FORMAT_LABELS: Record<'all' | ShowFormat, string> = {
  all: 'All formats',
  single_camera: 'Single-cam',
  multi_camera_live: 'Multi-cam (live)',
  multi_camera_sweetened: 'Multi-cam (laugh track)',
  hybrid: 'Hybrid',
};

export interface RankedEpisode {
  showName: string;
  showSlug: string;
  showFormat: ShowFormat;
  season: number;
  episode_number: number;
  title: string;
  humor_index: number;
  jpm: number;
  avg_craft: number;
  avg_impact: number;
  total_jokes: number;
  imdb_rating?: number;
  percentile_in_show?: number;
  ci_95_low?: number;
  ci_95_high?: number;
}

export default function EpisodesClient({ episodes }: { episodes: RankedEpisode[] }) {
  const [format, setFormat] = useState<'all' | ShowFormat>('all');
  const [showSlug, setShowSlug] = useState<string>('all');

  const availableShows = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of episodes) map.set(e.showSlug, e.showName);
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [episodes]);

  const availableFormats = useMemo(() => {
    return Array.from(new Set(episodes.map(e => e.showFormat)));
  }, [episodes]);

  const filtered = useMemo(() => {
    let list = episodes;
    if (format !== 'all') list = list.filter(e => e.showFormat === format);
    if (showSlug !== 'all') list = list.filter(e => e.showSlug === showSlug);
    return [...list].sort((a, b) => b.humor_index - a.humor_index).slice(0, 50);
  }, [episodes, format, showSlug]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <label htmlFor="ep-format" className="text-xs text-brand-text-muted pl-2">Format:</label>
          <select
            id="ep-format"
            value={format}
            onChange={e => setFormat(e.target.value as 'all' | ShowFormat)}
            className="text-xs bg-transparent text-brand-text-primary py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            <option value="all">{FORMAT_LABELS.all}</option>
            {availableFormats.map(f => (
              <option key={f} value={f}>{FORMAT_LABELS[f]}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <label htmlFor="ep-show" className="text-xs text-brand-text-muted pl-2">Show:</label>
          <select
            id="ep-show"
            value={showSlug}
            onChange={e => setShowSlug(e.target.value)}
            className="text-xs bg-transparent text-brand-text-primary py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            <option value="all">All shows</option>
            {availableShows.map(s => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-brand-text-muted self-center">Showing top {filtered.length}</p>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((ep, i) => (
            <motion.div
              key={`${ep.showSlug}-${ep.season}-${ep.episode_number}`}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Link
                href={`/shows/${ep.showSlug}/${ep.season}/${ep.episode_number}`}
                className="flex items-center justify-between p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-brand-text-primary font-medium group-hover:text-brand-gold transition-colors truncate">
                        {ep.title}
                      </span>
                      <span className="text-xs text-brand-text-muted">
                        {ep.showName} · S{ep.season}E{String(ep.episode_number).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-brand-text-muted">
                      <span>{ep.total_jokes} jokes</span>
                      <span>{ep.jpm.toFixed(1)} JPM</span>
                      {ep.percentile_in_show != null && (
                        <span>p{ep.percentile_in_show.toFixed(0)} in show</span>
                      )}
                      {ep.imdb_rating && (
                        <span className="text-amber-400">IMDb {ep.imdb_rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="font-mono text-lg text-brand-gold font-medium">{formatIndex(ep.humor_index)}</span>
                  {ep.ci_95_low != null && (
                    <p className="text-[10px] text-brand-text-muted">±{((ep.ci_95_high! - ep.ci_95_low) / 2).toFixed(1)}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-brand-text-muted text-center py-8 text-sm">No episodes match this filter.</p>
        )}
      </div>
    </div>
  );
}

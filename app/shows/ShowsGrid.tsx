'use client';
import { useState, useMemo } from 'react';
import { ShowScore, ShowFormat } from '@/lib/types';
import ShowCard from '@/components/ui/ShowCard';
import { motion, AnimatePresence } from 'framer-motion';

const FORMAT_LABELS: Record<'all' | ShowFormat, string> = {
  all: 'All formats',
  single_camera: 'Single-cam',
  multi_camera_live: 'Multi-cam (live audience)',
  multi_camera_sweetened: 'Multi-cam (laugh track)',
  hybrid: 'Hybrid',
  animation: 'Animation',
  sketch: 'Sketch',
};

export default function ShowsGrid({ shows }: { shows: ShowScore[] }) {
  const [format, setFormat] = useState<'all' | ShowFormat>('all');
  const [sort, setSort] = useState<'hi' | 'war' | 'warep' | 'jokes'>('hi');

  const availableFormats = useMemo(() => {
    const set = new Set(shows.map(s => s.format));
    return Array.from(set);
  }, [shows]);

  const filtered = useMemo(() => {
    let list = shows;
    if (format !== 'all') list = list.filter(s => s.format === format);
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'war': return (b.war || 0) - (a.war || 0);
        case 'warep': return (b.war_per_episode || 0) - (a.war_per_episode || 0);
        case 'jokes': return b.total_jokes_analyzed - a.total_jokes_analyzed;
        default: return b.humor_index - a.humor_index;
      }
    });
    return sorted;
  }, [shows, format, sort]);

  return (
    <div>
      {/* Editorial header above the grid */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-2">The Leaderboard</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight">
            {filtered.length === shows.length
              ? 'Every show on the index.'
              : `${filtered.length} of ${shows.length} shows.`}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-card border border-brand-border rounded-full">
            <label htmlFor="format-filter" className="text-[10px] uppercase tracking-widest text-brand-text-muted">Format</label>
            <select
              id="format-filter"
              value={format}
              onChange={e => setFormat(e.target.value as 'all' | ShowFormat)}
              className="text-xs bg-transparent text-brand-text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">{FORMAT_LABELS.all}</option>
              {availableFormats.map(f => (
                <option key={f} value={f}>{FORMAT_LABELS[f]}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 p-1 bg-brand-card border border-brand-border rounded-full">
            {([
              { key: 'hi', label: 'HI' },
              { key: 'war', label: 'WAR' },
              { key: 'warep', label: 'WAR/Ep' },
              { key: 'jokes', label: 'Jokes' },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`text-[11px] uppercase tracking-widest px-3 py-1 rounded-full transition-all ${
                  sort === opt.key
                    ? 'bg-brand-gold text-black font-medium'
                    : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((show, i) => (
            <motion.div
              key={show.slug}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ShowCard show={{ ...show, rank: show.humor_index > 0 ? i + 1 : undefined }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShowScore, SeasonScore, EpisodeScore, CharacterStats, JokeType } from '@/lib/types';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
import { MOCK_DNA_DATA } from '@/lib/constants';
import Link from 'next/link';
import TabBar from '@/components/ui/TabBar';
import EpisodeRow from '@/components/ui/EpisodeRow';
import { formatIndex, scoreToColor } from '@/lib/scoring';
import { EpisodeArcChart, SeasonBarChart, CharacterBubbleChart, CharacterBarChart, ComedyDNADonut, HeatmapGrid } from '@/components/charts';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'episodes', label: 'Episodes' },
  { id: 'characters', label: 'Characters' },
  { id: 'dna', label: 'Comedy DNA' },
];

interface Props {
  show: ShowScore;
  seasons: SeasonScore[];
  episodes: EpisodeScore[];
  characters: CharacterStats[];
}

export default function ShowPageClient({ show, seasons, episodes, characters }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>(1);

  const seasonEpisodes = selectedSeason === 'all'
    ? [...episodes].sort((a, b) => b.humor_index - a.humor_index)
    : episodes.filter(e => e.season === selectedSeason).sort((a, b) => b.humor_index - a.humor_index);

  const dnaData = MOCK_DNA_DATA[show.slug as keyof typeof MOCK_DNA_DATA] ?? MOCK_DNA_DATA['the-office'];
  const dnaEntries = Object.entries(dnaData) as [string, number][];
  const topType = dnaEntries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const bottomType = dnaEntries.reduce((a, b) => (b[1] < a[1] ? b : a));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (() => {
        const top5 = [...episodes].sort((a, b) => b.humor_index - a.humor_index).slice(0, 5);
        const bottom3 = [...episodes].sort((a, b) => a.humor_index - b.humor_index).slice(0, 3);
        const avgIndex = episodes.length > 0
          ? episodes.reduce((sum, e) => sum + e.humor_index, 0) / episodes.length
          : 0;

        return (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Top 5 Must-Watch Episodes */}
            <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-border">
                <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Essential Viewing</p>
                <h3 className="text-lg font-medium text-brand-text-primary">
                  Top 5 Episodes of {show.name}
                </h3>
                <p className="text-sm text-brand-text-secondary mt-1">
                  The highest-scoring episodes by our Humor Index. Start here.
                </p>
              </div>
              <div>
                {top5.map((ep, i) => (
                  <Link
                    key={`top-${ep.season}-${ep.episode_number}`}
                    href={`/shows/${show.slug}/${ep.season}/${ep.episode_number}`}
                    className="flex items-center gap-4 px-5 py-4 border-b border-brand-border/30 last:border-0 hover:bg-brand-surface transition-colors group"
                  >
                    <span className={`font-mono text-xl font-bold w-8 text-center ${
                      i === 0 ? 'text-brand-gold' : 'text-brand-text-muted'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-brand-text-primary font-medium group-hover:text-brand-gold transition-colors truncate">
                          {ep.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-brand-text-muted">
                        <span>S{ep.season}E{String(ep.episode_number).padStart(2, '0')}</span>
                        <span>{ep.total_jokes} jokes</span>
                        <span>Craft {ep.avg_craft.toFixed(1)}</span>
                        <span>Impact {ep.avg_impact.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className="font-mono text-2xl font-bold"
                        style={{ color: scoreToColor(ep.humor_index) }}
                      >
                        {formatIndex(ep.humor_index)}
                      </span>
                      <p className="text-[10px] text-brand-text-muted">/ 100</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="px-5 py-3 bg-brand-surface border-t border-brand-border">
                <button
                  onClick={() => setActiveTab('episodes')}
                  className="text-sm text-brand-text-muted hover:text-brand-gold transition-colors"
                >
                  View all {episodes.length} episodes →
                </button>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-brand-card border border-brand-border rounded-xl p-5">
                <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Best Season</p>
                <p className="font-mono text-3xl text-brand-gold font-bold">S{show.best_season}</p>
                <p className="text-xs text-brand-text-muted mt-1">
                  {seasons.find(s => s.season === show.best_season)?.total_jokes || 0} jokes analyzed
                </p>
              </div>
              <div className="bg-brand-card border border-brand-border rounded-xl p-5">
                <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Average Episode</p>
                <p className="font-mono text-3xl text-brand-text-primary font-bold">{formatIndex(avgIndex)}</p>
                <p className="text-xs text-brand-text-muted mt-1">across {episodes.length} episodes</p>
              </div>
              <div className="bg-brand-card border border-brand-border rounded-xl p-5">
                <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Score Range</p>
                <p className="text-sm text-brand-text-secondary mt-1">
                  <span className="font-mono text-brand-gold text-lg">{formatIndex(top5[0]?.humor_index || 0)}</span>
                  <span className="text-brand-text-muted mx-2">→</span>
                  <span className="font-mono text-brand-text-muted text-lg">{formatIndex(bottom3[0]?.humor_index || 0)}</span>
                </p>
                <p className="text-xs text-brand-text-muted mt-1">best to worst</p>
              </div>
            </div>

            {/* Skip These */}
            {bottom3.length > 0 && (
              <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
                <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">Lowest Scoring Episodes</p>
                <div className="space-y-2">
                  {bottom3.map(ep => (
                    <Link
                      key={`bot-${ep.season}-${ep.episode_number}`}
                      href={`/shows/${show.slug}/${ep.season}/${ep.episode_number}`}
                      className="flex items-center justify-between py-1.5 hover:text-brand-text-primary transition-colors group"
                    >
                      <span className="text-sm text-brand-text-muted group-hover:text-brand-text-secondary truncate">
                        S{ep.season}E{String(ep.episode_number).padStart(2, '0')}: {ep.title}
                      </span>
                      <span className="font-mono text-sm text-brand-text-muted ml-3 shrink-0">
                        {formatIndex(ep.humor_index)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Charts */}
            <EpisodeArcChart episodes={episodes} showName={show.name} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SeasonBarChart seasons={seasons} showName={show.name} />
              <HeatmapGrid episodes={episodes} seasons={seasons} showName={show.name} />
            </div>
          </motion.div>
        );
      })()}

      {/* Episodes Tab */}
      {activeTab === 'episodes' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Season selector */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            <button
              onClick={() => setSelectedSeason('all')}
              className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all ${
                selectedSeason === 'all'
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-brand-border text-brand-text-muted hover:border-brand-text-muted'
              }`}
            >
              All
            </button>
            {seasons.map(s => (
              <button
                key={s.season}
                onClick={() => setSelectedSeason(s.season)}
                className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedSeason === s.season
                    ? 'border-brand-gold text-brand-gold'
                    : 'border-brand-border text-brand-text-muted hover:border-brand-text-muted'
                }`}
              >
                S{s.season}
              </button>
            ))}
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-border">
              <p className="text-xs uppercase tracking-widest text-brand-text-muted">
                {selectedSeason === 'all' ? `All ${seasonEpisodes.length} episodes` : `Season ${selectedSeason} — ${seasonEpisodes.length} episodes`}, ranked by Humor Index
              </p>
            </div>
            <div className="divide-y divide-brand-border/50">
              {seasonEpisodes.map((ep, i) => (
                <EpisodeRow key={ep.episode_id} episode={ep} rank={i + 1} showSlug={show.slug} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Characters Tab */}
      {activeTab === 'characters' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <CharacterBubbleChart characters={characters} showName={show.name} />
          <CharacterBarChart characters={characters} showName={show.name} />
        </motion.div>
      )}

      {/* Comedy DNA Tab */}
      {activeTab === 'dna' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <ComedyDNADonut distribution={dnaData} showName={show.name} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Most Common</p>
              <p className="text-sm font-medium text-brand-text-primary">
                {JOKE_TYPE_LABELS[topType[0] as JokeType] ?? topType[0].replace(/_/g, ' ')}
              </p>
              <p className="font-mono text-brand-gold text-sm mt-1">{topType[1]}%</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Rarest Type</p>
              <p className="text-sm font-medium text-brand-text-primary">
                {JOKE_TYPE_LABELS[bottomType[0] as JokeType] ?? bottomType[0].replace(/_/g, ' ')}
              </p>
              <p className="font-mono text-brand-text-secondary text-sm mt-1">{bottomType[1]}%</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Signature Style</p>
              <p className="text-sm font-medium text-brand-text-primary">
                {JOKE_TYPE_LABELS[topType[0] as JokeType] ?? topType[0].replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-brand-text-muted mt-1">Dominant across all seasons</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

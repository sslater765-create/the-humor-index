'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShowScore, SeasonScore, EpisodeScore, CharacterStats, CharacterProfile, JokeType } from '@/lib/types';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
// DNA data now passed as prop from server component
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
  characterProfiles?: CharacterProfile[];
  comedyDna?: Record<string, number>;
}

export default function ShowPageClient({ show, seasons, episodes, characters, characterProfiles = [], comedyDna = {} }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>(1);
  const [episodeSort, setEpisodeSort] = useState<'score' | 'war' | 'jpm' | 'craft' | 'imdb' | 'airdate'>('score');

  const SORT_OPTIONS: { key: typeof episodeSort; label: string }[] = [
    { key: 'score', label: 'Humor Index' },
    { key: 'war', label: 'WAR' },
    { key: 'jpm', label: 'JPM' },
    { key: 'craft', label: 'Craft' },
    { key: 'imdb', label: 'IMDb' },
    { key: 'airdate', label: 'Air Date' },
  ];

  const sortLabel = SORT_OPTIONS.find(o => o.key === episodeSort)?.label || 'Humor Index';

  const seasonEpisodes = (() => {
    const filtered = selectedSeason === 'all'
      ? [...episodes]
      : episodes.filter(e => e.season === selectedSeason);
    switch (episodeSort) {
      case 'war': return filtered.sort((a, b) => (b.war || 0) - (a.war || 0));
      case 'jpm': return filtered.sort((a, b) => b.jpm - a.jpm);
      case 'craft': return filtered.sort((a, b) => b.avg_craft - a.avg_craft);
      case 'imdb': return filtered.sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0));
      case 'airdate': return filtered.sort((a, b) => a.season - b.season || a.episode_number - b.episode_number);
      default: return filtered.sort((a, b) => b.humor_index - a.humor_index);
    }
  })();

  const dnaData = comedyDna;
  const dnaEntries = Object.entries(dnaData) as [string, number][];
  const topType = dnaEntries.length > 0 ? dnaEntries.reduce((a, b) => (b[1] > a[1] ? b : a)) : ['none', 0] as [string, number];
  const bottomType = dnaEntries.length > 0 ? dnaEntries.reduce((a, b) => (b[1] < a[1] ? b : a)) : ['none', 0] as [string, number];
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
        const above90 = episodes.filter(e => e.humor_index >= 90).length;
        const above80 = episodes.filter(e => e.humor_index >= 80).length;
        const above70 = episodes.filter(e => e.humor_index >= 70).length;
        // below70 available if needed: episodes.filter(e => e.humor_index < 70).length
        const scores = episodes.map(e => e.humor_index);
        const stdDev = scores.length > 1
          ? Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avgIndex, 2), 0) / scores.length)
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
                <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Episode Mean</p>
                <p className="font-mono text-3xl text-brand-text-primary font-bold">{formatIndex(avgIndex)}</p>
                <p className="text-xs text-brand-text-muted mt-1">unweighted avg · {episodes.length} episodes</p>
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

            {/* Volume + Consistency */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
                <p className="font-mono text-2xl text-brand-gold font-bold">{above90}</p>
                <p className="text-[10px] text-brand-text-muted mt-1">Episodes 90+</p>
              </div>
              <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
                <p className="font-mono text-2xl text-emerald-400 font-bold">{above80}</p>
                <p className="text-[10px] text-brand-text-muted mt-1">Episodes 80+</p>
              </div>
              <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
                <p className="font-mono text-2xl text-brand-text-primary font-bold">{above70}</p>
                <p className="text-[10px] text-brand-text-muted mt-1">Episodes 70+</p>
              </div>
              <div className="bg-brand-card border border-brand-border rounded-xl p-4 text-center">
                <p className="font-mono text-2xl text-brand-text-primary font-bold">{stdDev.toFixed(1)}</p>
                <p className="text-[10px] text-brand-text-muted mt-1">Consistency (σ)</p>
                <p className="text-[9px] text-brand-text-muted">lower = more consistent</p>
              </div>
            </div>

            {/* WAR */}
            {show.war != null && show.war > 0 && (
              <div className="bg-brand-card border border-red-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">WAR</span>
                  <span className="text-xs text-brand-text-muted">Comedy Wins Above Replacement</span>
                </div>
                <div className="flex items-baseline gap-6">
                  <div>
                    <p className="font-mono text-3xl text-red-400 font-bold">{show.war?.toLocaleString()}</p>
                    <p className="text-[10px] text-brand-text-muted mt-1">Total comedy value above replacement</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl text-brand-text-primary font-bold">{show.war_per_episode}</p>
                    <p className="text-[10px] text-brand-text-muted mt-1">WAR per episode</p>
                  </div>
                </div>
                <p className="text-[10px] text-brand-text-muted mt-3">
                  Like baseball&apos;s WAR — measures total comedy value above a &quot;replacement-level&quot; baseline (craft 6.0, impact 6.0). Higher = more valuable.
                </p>
              </div>
            )}

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
          {/* Season selector + sort toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="flex flex-wrap gap-1.5">
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
            <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-lg w-fit sm:ml-auto flex-wrap">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setEpisodeSort(opt.key)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                    episodeSort === opt.key
                      ? 'bg-brand-gold text-black font-medium'
                      : 'text-brand-text-secondary hover:text-brand-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-border">
              <p className="text-xs uppercase tracking-widest text-brand-text-muted">
                {selectedSeason === 'all' ? `All ${seasonEpisodes.length} episodes` : `Season ${selectedSeason} — ${seasonEpisodes.length} episodes`}{episodeSort === 'airdate' ? ', in air date order' : `, ranked by ${sortLabel}`}
              </p>
            </div>
            <div className="divide-y divide-brand-border/50">
              {seasonEpisodes.map((ep, i) => (
                <EpisodeRow key={ep.episode_id} episode={ep} rank={episodeSort !== 'airdate' ? i + 1 : undefined} showSlug={show.slug} />
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

          {/* Clickable character list */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">All Characters</p>
            <p className="text-base font-medium text-brand-text-primary mb-4">Explore by Character</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...characterProfiles].sort((a, b) => b.total_jokes - a.total_jokes).slice(0, 18).map(c => (
                <Link
                  key={c.name}
                  href={`/shows/${show.slug}/characters/${encodeURIComponent(c.name)}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-brand-border hover:border-brand-gold/40 hover:bg-brand-surface transition-colors group"
                >
                  {c.profile_path ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                        alt={c.actor || c.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                      <span className="text-xs text-brand-text-muted">{c.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                      {c.character_full_name || c.name}
                    </p>
                    {c.actor && (
                      <p className="text-xs text-brand-text-muted truncate">{c.actor}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-brand-text-muted shrink-0">
                    {c.total_jokes}
                  </span>
                </Link>
              ))}
            </div>
          </div>
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

'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShowScore, SeasonScore, EpisodeScore, CharacterStats } from '@/lib/types';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
import { MOCK_DNA_DATA } from '@/lib/constants';
import TabBar from '@/components/ui/TabBar';
import EpisodeRow from '@/components/ui/EpisodeRow';
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
  const [selectedSeason, setSelectedSeason] = useState(1);

  const seasonEpisodes = episodes.filter(e => e.season === selectedSeason)
    .sort((a, b) => b.humor_index - a.humor_index);

  const dnaData = MOCK_DNA_DATA[show.slug as keyof typeof MOCK_DNA_DATA] ?? MOCK_DNA_DATA['the-office'];
  const dnaEntries = Object.entries(dnaData) as [keyof typeof dnaData, number][];
  const topType = dnaEntries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const bottomType = dnaEntries.reduce((a, b) => (b[1] < a[1] ? b : a));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <EpisodeArcChart episodes={episodes} showName={show.name} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeasonBarChart seasons={seasons} showName={show.name} />
            <HeatmapGrid episodes={episodes} seasons={seasons} showName={show.name} />
          </div>
        </motion.div>
      )}

      {/* Episodes Tab */}
      {activeTab === 'episodes' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Season selector */}
          <div className="flex flex-wrap gap-1.5 mb-6">
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
                Season {selectedSeason} — {seasonEpisodes.length} episodes, ranked by Humor Index
              </p>
            </div>
            <div className="divide-y divide-brand-border/50">
              {seasonEpisodes.map((ep, i) => (
                <EpisodeRow key={ep.episode_id} episode={ep} rank={i + 1} />
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
                {JOKE_TYPE_LABELS[topType[0]]}
              </p>
              <p className="font-mono text-brand-gold text-sm mt-1">{topType[1]}%</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Rarest Type</p>
              <p className="text-sm font-medium text-brand-text-primary">
                {JOKE_TYPE_LABELS[bottomType[0]]}
              </p>
              <p className="font-mono text-brand-text-secondary text-sm mt-1">{bottomType[1]}%</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Signature Style</p>
              <p className="text-sm font-medium text-brand-text-primary">
                {JOKE_TYPE_LABELS[topType[0]]}
              </p>
              <p className="text-xs text-brand-text-muted mt-1">Dominant across all seasons</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

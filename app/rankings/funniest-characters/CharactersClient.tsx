'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface WarCharacter {
  name: string;
  showName: string;
  showSlug: string;
  war: number;
  warPerEpisode: number;
  totalJokes: number;
  episodesAppeared: number;
  avgCraft: number;
  avgImpact: number;
}

type SortMode = 'total_war' | 'war_per_ep';
type Tier = 'all' | 'main' | 'recurring' | 'guest';

const TIER_LABEL: Record<Tier, string> = {
  all: 'All characters',
  main: 'Main cast',
  recurring: 'Recurring',
  guest: 'Guest / minor',
};

const TIER_DESCRIPTION: Record<Tier, string> = {
  all: 'Every character with at least 10 jokes analyzed.',
  main: '200+ episodes or 1,000+ jokes — the show\'s core ensemble.',
  recurring: '25–200 episodes — regular supporting roles.',
  guest: 'Under 25 episodes — one-offs and short arcs.',
};

function classifyTier(c: WarCharacter): Tier {
  if (c.episodesAppeared >= 200 || c.totalJokes >= 1000) return 'main';
  if (c.episodesAppeared >= 25) return 'recurring';
  return 'guest';
}

export default function CharactersClient({ characters }: { characters: WarCharacter[] }) {
  const [sortMode, setSortMode] = useState<SortMode>('total_war');
  const [tier, setTier] = useState<Tier>('all');
  const [showSlug, setShowSlug] = useState<string>('all');

  // Unique shows present in the data, sorted alphabetically
  const shows = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of characters) {
      if (!map.has(c.showSlug)) map.set(c.showSlug, c.showName);
    }
    return Array.from(map.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [characters]);

  const baseList = useMemo(() => {
    let list = characters;
    if (showSlug !== 'all') list = list.filter(c => c.showSlug === showSlug);
    if (tier !== 'all') list = list.filter(c => classifyTier(c) === tier);
    return list;
  }, [characters, showSlug, tier]);

  const filtered = useMemo(() => {
    const sorted = [...baseList].sort((a, b) =>
      sortMode === 'total_war' ? b.war - a.war : b.warPerEpisode - a.warPerEpisode
    );
    return sorted.slice(0, 25);
  }, [baseList, sortMode]);

  // Two-tower view: side-by-side leaderboards for Total WAR vs WAR/ep
  const towerList = useMemo(() => {
    const byTotal = [...baseList].sort((a, b) => b.war - a.war).slice(0, 10);
    const byPerEp = [...baseList].sort((a, b) => b.warPerEpisode - a.warPerEpisode).slice(0, 10);
    return { byTotal, byPerEp };
  }, [baseList]);

  const maxValueForBar = useMemo(() => {
    if (!filtered.length) return 1;
    return sortMode === 'total_war' ? filtered[0].war : filtered[0].warPerEpisode;
  }, [filtered, sortMode]);

  return (
    <div>
      {/* Section heading */}
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Most Valuable Characters of All Time</p>
        <p className="text-sm text-brand-text-muted">
          Career WAR (Wins Above Replacement) — total comedic value across every episode.
        </p>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Sort mode */}
        <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-lg">
          {([
            { key: 'total_war', label: 'Total WAR' },
            { key: 'war_per_ep', label: 'WAR / Episode' },
          ] as const).map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortMode(opt.key)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                sortMode === opt.key
                  ? 'bg-brand-gold text-black font-medium'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Show filter */}
        <div className="flex items-center gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <label htmlFor="show-filter" className="text-xs text-brand-text-muted pl-2">Show:</label>
          <select
            id="show-filter"
            value={showSlug}
            onChange={e => setShowSlug(e.target.value)}
            className="text-xs bg-transparent text-brand-text-primary py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            <option value="all">All shows</option>
            {shows.map(s => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Tier */}
        <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-lg">
          {(['all', 'main', 'recurring', 'guest'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                tier === t
                  ? 'bg-brand-gold text-black font-medium'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-brand-text-muted mb-4">{TIER_DESCRIPTION[tier]}</p>

      {/* Main ranked leaderboard with horizontal bars */}
      <div className="space-y-2 mb-12">
        {filtered.map((c, i) => {
          const value = sortMode === 'total_war' ? c.war : c.warPerEpisode;
          const pct = maxValueForBar > 0 ? (value / maxValueForBar) * 100 : 0;
          return (
            <Link
              key={`${c.name}-${c.showSlug}`}
              href={`/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`}
              className="relative block bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/40 transition-colors group overflow-hidden"
            >
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 bg-brand-gold/5 border-r border-brand-gold/20 transition-all"
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                    {i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-text-primary font-medium group-hover:text-brand-gold transition-colors">{c.name}</span>
                      <span className="text-xs text-brand-text-muted">{c.showName}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-brand-text-muted">
                      <span>{c.totalJokes.toLocaleString()} jokes</span>
                      <span>{c.episodesAppeared} eps</span>
                      {sortMode === 'total_war'
                        ? <span>{c.warPerEpisode.toFixed(2)} WAR/ep</span>
                        : <span>{c.war.toFixed(1)} total WAR</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg text-brand-gold font-medium">{value.toFixed(sortMode === 'total_war' ? 1 : 2)}</span>
                  <p className="text-[10px] text-brand-text-muted uppercase tracking-widest">
                    {sortMode === 'total_war' ? 'WAR' : 'WAR/ep'}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-brand-text-muted text-center py-8 text-sm">No characters match this filter.</p>
        )}
      </div>

      {/* Two-tower comparison */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Head-to-Head: Volume vs Efficiency</p>
        <p className="text-sm text-brand-text-muted mb-4">
          Who racked up the most total value versus who delivered the most value per appearance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total WAR tower */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-brand-text-primary font-medium">Most Total WAR</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Volume</p>
            </div>
            <div className="space-y-1.5">
              {towerList.byTotal.map((c, i) => {
                const pct = towerList.byTotal[0].war > 0 ? (c.war / towerList.byTotal[0].war) * 100 : 0;
                return (
                  <Link
                    key={`tw-total-${c.name}-${c.showSlug}`}
                    href={`/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`}
                    className="relative block px-3 py-2 rounded-lg bg-brand-surface/50 hover:bg-brand-surface transition-colors group overflow-hidden"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-gold/10"
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-mono text-xs w-5 text-right shrink-0 ${i < 3 ? 'text-brand-gold' : 'text-brand-text-muted'}`}>{i + 1}</span>
                        <div className="min-w-0">
                          <div className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">{c.name}</div>
                          <div className="text-[10px] text-brand-text-muted truncate">{c.showName}</div>
                        </div>
                      </div>
                      <span className="font-mono text-sm text-brand-gold shrink-0">{c.war.toFixed(1)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* WAR/ep tower */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-brand-text-primary font-medium">Most WAR per Episode</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Efficiency</p>
            </div>
            <div className="space-y-1.5">
              {towerList.byPerEp.map((c, i) => {
                const pct = towerList.byPerEp[0].warPerEpisode > 0 ? (c.warPerEpisode / towerList.byPerEp[0].warPerEpisode) * 100 : 0;
                return (
                  <Link
                    key={`tw-perep-${c.name}-${c.showSlug}`}
                    href={`/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`}
                    className="relative block px-3 py-2 rounded-lg bg-brand-surface/50 hover:bg-brand-surface transition-colors group overflow-hidden"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-gold/10"
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-mono text-xs w-5 text-right shrink-0 ${i < 3 ? 'text-brand-gold' : 'text-brand-text-muted'}`}>{i + 1}</span>
                        <div className="min-w-0">
                          <div className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">{c.name}</div>
                          <div className="text-[10px] text-brand-text-muted truncate">{c.showName}</div>
                        </div>
                      </div>
                      <span className="font-mono text-sm text-brand-gold shrink-0">{c.warPerEpisode.toFixed(2)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

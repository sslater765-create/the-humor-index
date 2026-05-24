'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface RankedJoke {
  id?: number | string;
  text: string;
  characters: string[];
  joke_types: string[];
  craft_total: number;
  impact_score: number;
  quotability: number;
  explanation?: string;
  showName: string;
  showSlug: string;
  season: number;
  episodeNumber: number;
  episodeTitle: string;
}

export default function BestJokesClient({ jokes }: { jokes: RankedJoke[] }) {
  const [showSlug, setShowSlug] = useState('all');
  const [jokeType, setJokeType] = useState('all');

  const availableShows = useMemo(() => {
    const m = new Map<string, string>();
    for (const j of jokes) m.set(j.showSlug, j.showName);
    return Array.from(m.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [jokes]);

  const availableTypes = useMemo(() => {
    const s = new Set<string>();
    for (const j of jokes) for (const t of j.joke_types) s.add(t);
    return Array.from(s).sort();
  }, [jokes]);

  const filtered = useMemo(() => {
    let list = jokes;
    if (showSlug !== 'all') list = list.filter(j => j.showSlug === showSlug);
    if (jokeType !== 'all') list = list.filter(j => j.joke_types.includes(jokeType));
    return [...list]
      .sort((a, b) => (b.craft_total + b.impact_score) - (a.craft_total + a.impact_score))
      .slice(0, 100);
  }, [jokes, showSlug, jokeType]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <label htmlFor="bj-show" className="text-xs text-brand-text-muted pl-2">Show:</label>
          <select
            id="bj-show"
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

        <div className="flex items-center gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <label htmlFor="bj-type" className="text-xs text-brand-text-muted pl-2">Type:</label>
          <select
            id="bj-type"
            value={jokeType}
            onChange={e => setJokeType(e.target.value)}
            className="text-xs bg-transparent text-brand-text-primary py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
          >
            <option value="all">All types</option>
            {availableTypes.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-brand-text-muted self-center">Showing top {filtered.length}</p>
      </div>

      <div className="space-y-4">
        {filtered.map((joke, i) => (
          <div
            key={`${joke.showSlug}-${joke.season}-${joke.episodeNumber}-${i}`}
            className="bg-brand-card border border-brand-border rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-sm w-8 text-center ${
                    i < 3 ? 'text-brand-gold font-bold text-lg' : i < 10 ? 'text-brand-gold' : 'text-brand-text-muted'
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <Link
                    href={`/shows/${joke.showSlug}/${joke.season}/${joke.episodeNumber}`}
                    className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors"
                  >
                    {joke.showName} · S{joke.season}E{String(joke.episodeNumber).padStart(2, '0')} {'“'}{joke.episodeTitle}{'”'}
                  </Link>
                </div>
              </div>
              <div className="flex gap-3 font-mono text-sm">
                <span className="text-brand-blue" title="Craft score">C:{joke.craft_total.toFixed(1)}</span>
                <span className="text-brand-teal" title="Impact score">I:{joke.impact_score.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-brand-text-primary leading-relaxed mb-2">
              {'“'}{joke.text}{'”'}
            </p>
            {joke.characters?.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                {joke.characters.map(c => (
                  <Link
                    key={c}
                    href={`/shows/${joke.showSlug}/characters/${encodeURIComponent(c)}`}
                    className="text-xs text-brand-text-muted border border-brand-border rounded px-1.5 py-0.5 hover:text-brand-gold hover:border-brand-gold/50 transition-colors"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}

            {joke.explanation && (
              <p className="text-xs text-brand-text-muted italic">
                {joke.explanation}
              </p>
            )}

            <div className="flex gap-2 mt-3 flex-wrap">
              {joke.joke_types.map(t => (
                <span
                  key={t}
                  className="text-xs bg-brand-surface border border-brand-border rounded-full px-2 py-0.5 text-brand-text-muted"
                >
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
              {joke.quotability >= 7 && (
                <span className="text-xs bg-brand-gold/10 border border-brand-gold/30 rounded-full px-2 py-0.5 text-brand-gold">
                  highly quotable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-brand-text-muted text-center py-12">
          No jokes match this filter.
        </p>
      )}
    </div>
  );
}

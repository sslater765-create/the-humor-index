'use client';
import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Joke } from '@/lib/types';

interface SearchableJoke extends Joke {
  showName: string;
  showSlug: string;
  season: number;
  episodeNumber: number;
  episodeTitle: string;
}

export default function SearchClient({ jokes }: { jokes: SearchableJoke[] }) {
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'craft' | 'impact'>('relevance');
  const [filterType, setFilterType] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    jokes.forEach(j => j.joke_types.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [jokes]);

  // Build suggestion index: characters, episode titles, show names
  const suggestionIndex = useMemo(() => {
    const items = new Map<string, { label: string; type: 'character' | 'episode' | 'show'; count: number }>();
    jokes.forEach(j => {
      j.characters.forEach(c => {
        const existing = items.get(c.toLowerCase());
        if (existing) existing.count++;
        else items.set(c.toLowerCase(), { label: c, type: 'character', count: 1 });
      });
      const epKey = `${j.showName} S${j.season}E${String(j.episodeNumber).padStart(2, '0')} ${j.episodeTitle}`;
      if (!items.has(epKey.toLowerCase())) {
        items.set(epKey.toLowerCase(), { label: epKey, type: 'episode', count: 1 });
      }
    });
    return Array.from(items.values()).sort((a, b) => b.count - a.count);
  }, [jokes]);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2 || !showSuggestions) return [];
    const q = query.toLowerCase();
    return suggestionIndex
      .filter(s => s.label.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, suggestionIndex, showSuggestions]);

  const selectSuggestion = (label: string) => {
    setQuery(label);
    setCommitted(label);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSubmit = () => {
    setCommitted(query);
    setShowSuggestions(false);
  };

  const activeQuery = committed || '';

  const results = useMemo(() => {
    if (!activeQuery && !filterType) return [];

    let filtered = jokes;

    if (filterType) {
      filtered = filtered.filter(j => j.joke_types.includes(filterType as never));
    }

    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      filtered = filtered.filter(j =>
        j.text.toLowerCase().includes(q) ||
        j.characters.some(c => c.toLowerCase().includes(q)) ||
        j.explanation?.toLowerCase().includes(q) ||
        j.showName.toLowerCase().includes(q) ||
        j.episodeTitle.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'craft') {
      filtered = [...filtered].sort((a, b) => b.craft_total - a.craft_total);
    } else if (sortBy === 'impact') {
      filtered = [...filtered].sort((a, b) => b.impact_score - a.impact_score);
    }

    return filtered.slice(0, 50);
  }, [jokes, activeQuery, filterType, sortBy]);

  return (
    <div>
      {/* Search input */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="Search jokes, characters, episodes..."
            className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors"
            aria-label="Search jokes"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-lg">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.label}-${i}`}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => selectSuggestion(s.label)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-surface transition-colors flex items-center justify-between"
                >
                  <span className="text-brand-text-primary truncate">{s.label}</span>
                  <span className="text-[10px] uppercase tracking-widest text-brand-text-muted shrink-0 ml-2">
                    {s.type === 'character' ? `${s.count} jokes` : s.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Sort */}
          <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-lg">
            {(['relevance', 'craft', 'impact'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  sortBy === s
                    ? 'bg-brand-gold text-black font-medium'
                    : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5 text-brand-text-secondary focus:outline-none focus:border-brand-gold"
            aria-label="Filter by joke type"
          >
            <option value="">All types</option>
            {allTypes.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {activeQuery || filterType ? (
        <div>
          <p className="text-xs text-brand-text-muted mb-4">
            {results.length === 50 ? '50+ results' : `${results.length} results`}
            {results.length === 50 && ' (showing first 50)'}
          </p>
          <div className="space-y-3">
            {results.map((joke) => (
              <Link
                key={`${joke.showSlug}-${joke.season}-${joke.episodeNumber}-${joke.id}`}
                href={`/shows/${joke.showSlug}/${joke.season}/${joke.episodeNumber}`}
                className="block bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/40 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-brand-text-muted group-hover:text-brand-gold transition-colors">
                    {joke.showName} · S{joke.season}E{String(joke.episodeNumber).padStart(2, '0')} {'\u201C'}{joke.episodeTitle}{'\u201D'}
                  </span>
                  <div className="flex gap-2 font-mono text-xs">
                    <span className="text-brand-blue">C:{joke.craft_total.toFixed(1)}</span>
                    <span className="text-brand-teal">I:{joke.impact_score.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-brand-text-primary leading-relaxed mb-2">
                  {joke.text}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {joke.characters.map(c => (
                    <span key={c} className="text-xs text-brand-text-muted">{c}</span>
                  ))}
                  <span className="text-brand-border">·</span>
                  {joke.joke_types.map(t => (
                    <span key={t} className="text-xs text-brand-text-muted bg-brand-surface rounded-full px-2 py-0.5">
                      {t.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-brand-text-muted text-sm">
            Start typing to search across {jokes.length.toLocaleString()} analyzed jokes
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Michael Scott', 'that\'s what she said', 'cringe', 'callback', 'sarcasm'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => { setQuery(suggestion); setCommitted(suggestion); }}
                className="text-xs border border-brand-border rounded-full px-3 py-1.5 text-brand-text-muted hover:text-brand-gold hover:border-brand-gold transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

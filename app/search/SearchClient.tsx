'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { JokeType } from '@/lib/types';
import SurpriseButton from '@/components/ui/SurpriseButton';

interface SearchableJoke {
  index: number;
  text: string;
  characters: string[];
  joke_types: JokeType[];
  craft_total: number;
  impact_score: number;
  showName: string;
  showSlug: string;
  season: number;
  episodeNumber: number;
  episodeTitle: string;
}

// On-disk shape uses short keys to keep /data/search-index.json small.
interface CompactJoke {
  i: number;
  t: string;
  c: string[];
  jt: JokeType[];
  cr: number;
  im: number;
  sn: string;
  ss: string;
  s: number;
  e: number;
  et: string;
}

function expand(j: CompactJoke): SearchableJoke {
  return {
    index: j.i,
    text: j.t,
    characters: j.c,
    joke_types: j.jt,
    craft_total: j.cr,
    impact_score: j.im,
    showName: j.sn,
    showSlug: j.ss,
    season: j.s,
    episodeNumber: j.e,
    episodeTitle: j.et,
  };
}

// search-rev: relevance ranking + token filter (v3) — bump forces fresh chunk/build
export default function SearchClient() {
  const [jokes, setJokes] = useState<SearchableJoke[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'craft' | 'impact'>('relevance');
  const [filterType, setFilterType] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch the joke index once on mount. Browser cache handles repeat visits.
  useEffect(() => {
    let cancelled = false;
    fetch('/data/search-index.json')
      .then(r => r.json())
      .then((data: CompactJoke[]) => {
        if (cancelled) return;
        setJokes(data.map(expand));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    jokes.forEach(j => j.joke_types.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [jokes]);

  // Build suggestion index: characters, episode titles, show names
  const suggestionIndex = useMemo(() => {
    const items = new Map<string, { label: string; type: 'character' | 'episode' | 'show'; count: number; slug?: string }>();
    jokes.forEach(j => {
      j.characters.forEach(c => {
        const key = `${c.toLowerCase()}-${j.showSlug}`;
        const existing = items.get(key);
        if (existing) existing.count++;
        else items.set(key, { label: c, type: 'character', count: 1, slug: j.showSlug });
      });
      const epKey = `${j.showName} S${j.season}E${String(j.episodeNumber).padStart(2, '0')} ${j.episodeTitle}`;
      if (!items.has(epKey.toLowerCase())) {
        items.set(epKey.toLowerCase(), { label: epKey, type: 'episode', count: 1, slug: j.showSlug });
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

  // Live search — update committed as user types (debounced by query length)
  const activeQuery = query.length >= 3 ? query : committed || '';

  const results = useMemo(() => {
    if (!activeQuery && !filterType) return [];

    let filtered = jokes;

    if (filterType) {
      filtered = filtered.filter(j => j.joke_types.includes(filterType as never));
    }

    if (activeQuery) {
      const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const nq = norm(activeQuery);
      const tokens = nq.split(" ").filter(Boolean);
      const tokenRes = tokens.map(t => new RegExp(`\\b${t}\\b`));
      filtered = filtered.filter(j => {
        const hay = norm(`${j.text} ${j.characters.join(" ")} ${j.showName} ${j.episodeTitle}`);
        return tokens.every(t => hay.includes(t));
      });
      // Relevance: exact-phrase match ranks far above scattered token hits,
      // and whole-word matches beat substring noise (e.g. "lie" inside "believe").
      if (sortBy !== 'craft' && sortBy !== 'impact') {
        const rel = new WeakMap<object, number>();
        for (const j of filtered) {
          const hay = norm(`${j.text} ${j.characters.join(" ")} ${j.showName} ${j.episodeTitle}`);
          let s = hay.includes(nq) ? 1000 : 0;
          for (const re of tokenRes) if (re.test(hay)) s += 1;
          rel.set(j as object, s);
        }
        filtered = [...filtered].sort((a, b) =>
          (rel.get(b as object) ?? 0) - (rel.get(a as object) ?? 0) ||
          (b.craft_total + b.impact_score) - (a.craft_total + a.impact_score)
        );
      }
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
            placeholder={loading ? 'Loading joke index…' : 'Search jokes, characters, episodes...'}
            disabled={loading}
            className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-60"
            aria-label="Search jokes"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-lg">
              {suggestions.map((s, i) => (
                s.type === 'character' && s.slug ? (
                  <Link
                    key={`${s.label}-${i}`}
                    href={`/shows/${s.slug}/characters/${encodeURIComponent(s.label)}`}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-surface transition-colors flex items-center justify-between"
                  >
                    <span className="text-brand-text-primary truncate">{s.label}</span>
                    <span className="text-[10px] uppercase tracking-widest text-brand-text-muted shrink-0 ml-2">
                      {s.count} jokes · character
                    </span>
                  </Link>
                ) : (
                  <button
                    key={`${s.label}-${i}`}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectSuggestion(s.label)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-surface transition-colors flex items-center justify-between"
                  >
                    <span className="text-brand-text-primary truncate">{s.label}</span>
                    <span className="text-[10px] uppercase tracking-widest text-brand-text-muted shrink-0 ml-2">
                      {s.type}
                    </span>
                  </button>
                )
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
                key={`${joke.showSlug}-${joke.season}-${joke.episodeNumber}-${joke.index}`}
                href={`/shows/${joke.showSlug}/${joke.season}/${joke.episodeNumber}`}
                className="block bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/40 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-brand-text-muted group-hover:text-brand-gold transition-colors">
                    {joke.showName} · S{joke.season}E{String(joke.episodeNumber).padStart(2, '0')} {'“'}{joke.episodeTitle}{'”'}
                  </span>
                  <div className="flex gap-2 font-mono text-xs">
                    <span className="text-brand-blue">C:{joke.craft_total.toFixed(1)}</span>
                    <span className="text-brand-teal">I:{joke.impact_score.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-brand-text-primary leading-relaxed mb-2">
                  {joke.characters && joke.characters.length > 0 && (
                    <span className="font-medium mr-1.5">
                      {joke.characters.map((c, i) => (
                        <span key={c}>
                          {i > 0 && <span className="text-brand-text-muted"> · </span>}
                          <Link
                            href={`/shows/${joke.showSlug}/characters/${encodeURIComponent(c)}`}
                            className="text-brand-gold hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            {c}
                          </Link>
                        </span>
                      ))}
                      <span className="text-brand-gold">:</span>
                    </span>
                  )}
                  {joke.text}
                </p>
                <div className="flex gap-1.5 flex-wrap items-center" onClick={e => e.preventDefault()}>
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
            {loading
              ? 'Loading joke index…'
              : `Start typing to search across ${jokes.length.toLocaleString()} analyzed jokes`}
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
          <div className="mt-6">
            <SurpriseButton />
          </div>
        </div>
      )}
    </div>
  );
}

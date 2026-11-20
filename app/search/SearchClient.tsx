'use client';
import { useState, useRef, useEffect } from 'react';
import { characterHref } from '@/lib/characterPages';
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

// search-rev: server-side search (v4). The 33 MB index stays on the server; this
// page asks /api/search for the top 50 matches as you type.
export default function SearchClient() {
  const [results, setResults] = useState<SearchableJoke[]>([]);
  const [suggestions, setSuggestions] = useState<{ label: string; type: 'character' | 'episode' | 'show'; count: number; slug?: string }[]>([]);
  const [meta, setMeta] = useState<{ total: number; types: string[] }>({ total: 0, types: [] });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [committed, setCommitted] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'craft' | 'impact'>('relevance');
  const [filterType, setFilterType] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/search/?meta=1').then(r => r.json()).then(setMeta).catch(() => { /* counts are cosmetic */ });
  }, []);

  const allTypes = meta.types;
  const jokes = { length: meta.total };

  // Live search: from 3 characters as you type, or whatever was submitted.
  const activeQuery = query.length >= 3 ? query : committed || '';

  useEffect(() => {
    if (!activeQuery && !filterType) { setResults([]); return; }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ q: activeQuery, type: filterType, sort: sortBy });
      fetch(`/api/search/?${params}`, { signal: ctl.signal })
        .then(r => r.json())
        .then((d: { results: CompactJoke[] }) => { setResults(d.results.map(expand)); setLoading(false); })
        .catch(() => setLoading(false));
    }, 180);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [activeQuery, filterType, sortBy]);

  useEffect(() => {
    if (!showSuggestions || query.length < 2) { setSuggestions([]); return; }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search/?${new URLSearchParams({ q: query, suggest: '1', type: '__none__' })}`, { signal: ctl.signal })
        .then(r => r.json()).then(d => setSuggestions(d.suggestions ?? [])).catch(() => { /* ignore */ });
    }, 150);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [query, showSuggestions]);

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
            className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors disabled:opacity-60"
            aria-label="Search jokes"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-lg">
              {suggestions.map((s, i) => (
                s.type === 'character' && s.slug && characterHref(s.slug, s.label) ? (
                  <Link
                    key={`${s.label}-${i}`}
                    href={characterHref(s.slug, s.label)!}
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
                          {characterHref(joke.showSlug, c) ? (
                            <Link
                              href={characterHref(joke.showSlug, c)!}
                              className="text-brand-gold hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              {c}
                            </Link>
                          ) : (
                            <span className="text-brand-gold">{c}</span>
                          )}
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

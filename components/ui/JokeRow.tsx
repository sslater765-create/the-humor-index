'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Joke } from '@/lib/types';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';

interface Props {
  joke: Joke;
  isStandout?: boolean;
  showSlug?: string;
}

export default function JokeRow({ joke, isStandout, showSlug }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isStandout
          ? 'border-brand-gold/30 bg-brand-gold/5'
          : 'border-brand-border bg-brand-card'
      }`}
    >
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className="font-mono text-xs text-brand-text-muted shrink-0 pt-0.5">
              {joke.timestamp_estimate}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-text-primary leading-relaxed">{joke.text}</p>
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {joke.characters.map(c => (
                  showSlug ? (
                    <Link
                      key={c}
                      href={`/shows/${showSlug}/characters/${encodeURIComponent(c)}`}
                      className="text-[11px] text-brand-text-muted border border-brand-border rounded px-1.5 py-0.5 hover:text-brand-gold hover:border-brand-gold/50 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      {c}
                    </Link>
                  ) : (
                    <span key={c} className="text-[11px] text-brand-text-muted border border-brand-border rounded px-1.5 py-0.5">
                      {c}
                    </span>
                  )
                ))}
                {joke.joke_types.map(t => (
                  <span key={t} className="text-[11px] text-brand-blue border border-brand-blue/30 rounded px-1.5 py-0.5">
                    {JOKE_TYPE_LABELS[t]}
                  </span>
                ))}
                {!!joke.rewatch_bonus && (
                  <span className="text-[11px] text-brand-gold border border-brand-gold/30 rounded px-1.5 py-0.5">
                    ★ Rewatch
                  </span>
                )}
                {!!joke.is_callback && (
                  <span className="text-[11px] text-brand-purple border border-brand-purple/30 rounded px-1.5 py-0.5">
                    Callback
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
            <div className="text-center sm:text-right">
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Craft</p>
              <p className="font-mono text-sm text-brand-text-secondary">{joke.craft_total.toFixed(1)}</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Impact</p>
              <p className="font-mono text-sm text-brand-gold">{joke.impact_score.toFixed(1)}</p>
            </div>
            <span className="text-brand-text-muted text-xs">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-brand-border space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Setup</p>
            <p className="text-sm text-brand-text-secondary">{joke.setup}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Punchline</p>
            <p className="text-sm text-brand-text-primary">{joke.punchline}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Why it works</p>
            <p className="text-sm text-brand-text-secondary">{joke.explanation}</p>
          </div>
          {!!joke.is_callback && joke.callback_reference && (
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Callback to</p>
              <p className="text-sm text-brand-purple">{joke.callback_reference}</p>
            </div>
          )}
          <div className="flex gap-4 pt-1">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-text-muted">Quotability</p>
              <p className="font-mono text-sm text-brand-text-secondary">{joke.quotability.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

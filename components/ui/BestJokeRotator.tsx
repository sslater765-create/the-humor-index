"use client";

/**
 * Rotating "Single Best Joke We've Scored" hero for /rankings (the
 * lower "MORE FROM THE INDEX" block).
 *
 * SSR renders index 0 (the actual #1 by combined craft+impact) so SEO,
 * og-tags, and the initial paint are honest about "the single best joke".
 * On mount, a random joke from the top-25 pool is selected — so every
 * page-load feels fresh. The "↻ New joke" button re-rolls on demand.
 *
 * Data: public/data/top-jokes.json (built by build_top_jokes.py).
 */

import { useEffect, useState } from "react";
import Link from "next/link";

type TopJoke = {
  show: string;
  show_slug: string;
  season: number;
  episode_number: number;
  episode_title: string;
  characters: string[];
  text: string;
  craft: number;
  impact: number;
  combined: number;
};

interface Props {
  topJokes: TopJoke[];
}

function pickRandomIndex(len: number, exclude: number): number {
  if (len <= 1) return 0;
  let i = Math.floor(Math.random() * len);
  if (i === exclude) i = (i + 1) % len;
  return i;
}

export default function BestJokeRotator({ topJokes }: Props) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIndex(pickRandomIndex(topJokes.length, -1));
  }, [topJokes.length]);

  const joke = topJokes[index] ?? topJokes[0];
  if (!joke) return null;

  const character = joke.characters?.[0] || "";
  const heading = mounted
    ? "ONE OF OUR TOP 25 FUNNIEST JOKES"
    : "THE SINGLE BEST JOKE WE'VE SCORED";

  return (
    <div className="block bg-brand-card border border-brand-border rounded-xl p-6 sm:p-10 group transition-colors">
      <div className="flex items-center justify-between mb-6 gap-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-medium">
          {heading}
        </p>
        <button
          type="button"
          onClick={() => setIndex(pickRandomIndex(topJokes.length, index))}
          className="text-[11px] uppercase tracking-widest text-brand-text-muted hover:text-brand-gold transition-colors flex items-center gap-1 px-2 py-1 rounded border border-brand-border hover:border-brand-gold shrink-0"
          aria-label="Show a different top joke"
          title="Show me another"
        >
          <span aria-hidden>&#8635;</span>
          <span className="hidden sm:inline ml-1">New joke</span>
        </button>
      </div>

      <div className="flex items-start gap-4 sm:gap-6">
        <span
          className="text-brand-gold/40 text-5xl sm:text-6xl leading-none font-serif select-none shrink-0"
          aria-hidden
        >
          &ldquo;
        </span>

        <blockquote className="flex-1">
          <p className="font-serif italic text-xl sm:text-2xl md:text-3xl leading-snug text-brand-text-primary">
            {joke.text}
          </p>
          <p className="text-sm mt-6">
            {character && (
              <span className="text-brand-gold font-medium">{character}</span>
            )}
            {character && <span className="text-brand-text-muted"> &middot; </span>}
            <span className="text-brand-text-secondary">{joke.show}</span>
            <span className="text-brand-text-muted"> &middot; </span>
            <span className="text-brand-text-muted italic">
              &ldquo;{joke.episode_title}&rdquo;
            </span>
          </p>
        </blockquote>

        <div className="hidden sm:flex items-center gap-6 text-sm shrink-0">
          <div>
            <p className="font-mono text-2xl text-brand-gold">
              {joke.craft.toFixed(1)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">
              Craft
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl text-emerald-400">
              {joke.impact.toFixed(1)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">
              Impact
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/rankings/best-jokes"
        className="text-xs text-brand-text-muted mt-6 hover:text-brand-gold transition-colors block group-hover:text-brand-gold"
      >
        Read the top 100 jokes ever scored &rarr;
      </Link>
    </div>
  );
}

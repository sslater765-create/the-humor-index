'use client';
import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function CopyQuote({ text, slug }: { text: string; slug: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        trackEvent('movie_quote_copy', { movie: slug });
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${done ? 'text-brand-gold border-brand-gold' : 'text-brand-text-muted border-brand-border hover:text-brand-gold hover:border-brand-gold/50'}`}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}

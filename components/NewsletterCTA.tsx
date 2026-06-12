'use client';
import { useState } from 'react';
import { trackNewsletterSignup } from '@/lib/analytics';

/**
 * Drop-in subscriber-capture block. Lead-magnet-forward.
 * Place inline mid-scroll on every show/episode ranking page, at the end of
 * blog posts, and (as variant="banner") near the top of the homepage.
 *
 * Posts to the existing /api/subscribe endpoint (same one the Footer uses).
 * `source` is passed through for attribution in analytics + Beehiiv.
 */
export default function NewsletterCTA({
  source = 'inline',
  variant = 'card',
  headline = 'Get the 50 funniest episodes of all time — ranked.',
  sub = 'Plus a new show breakdown and ranking every Friday. Free, no spam.',
}: {
  source?: string;
  variant?: 'card' | 'banner';
  headline?: string;
  sub?: string;
}) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      if (r.ok) {
        setDone(true);
        setEmail('');
        trackNewsletterSignup(source);
      }
    } catch {
      /* fail quietly */
    }
    setLoading(false);
  };

  return (
    <section
      className={
        variant === 'banner'
          ? 'my-8 rounded-2xl border border-brand-gold/30 bg-brand-gold/5 px-5 py-6 sm:px-8 sm:py-7'
          : 'my-10 rounded-2xl border border-brand-border bg-brand-surface px-5 py-7 sm:px-8 sm:py-9'
      }
    >
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-gold">
        The Humor Index Weekly
      </p>
      <h3 className="mb-1 text-xl font-semibold text-brand-text-primary sm:text-2xl">
        {headline}
      </h3>
      <p className="mb-5 max-w-prose text-sm text-brand-text-secondary">{sub}</p>

      {done ? (
        <p className="font-medium text-brand-gold">
          You&apos;re in — check your inbox for the 50 funniest episodes. 🎬
        </p>
      ) : (
        <form onSubmit={submit} className="flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            className="flex-1 rounded-lg border border-brand-border bg-brand-card px-3 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:border-brand-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="whitespace-nowrap rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-gold-dim disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send me the list'}
          </button>
        </form>
      )}
    </section>
  );
}

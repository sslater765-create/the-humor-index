'use client';
import { useState } from 'react';
import { trackNewsletterSignup } from '@/lib/analytics';

export default function InlineNewsletterCTA() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const resp = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (resp.ok) {
        setSubscribed(true);
        setEmail('');
        trackNewsletterSignup('inline');
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  };

  if (subscribed) {
    return (
      <div className="my-10 bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-6 text-center">
        <p className="text-base font-medium text-brand-gold">You&apos;re in.</p>
        <p className="text-sm text-brand-text-secondary mt-1">First issue drops this Friday.</p>
      </div>
    );
  }

  return (
    <div className="my-10 bg-brand-surface border border-brand-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-base font-medium text-brand-text-primary">
            Get weekly comedy rankings
          </p>
          <p className="text-sm text-brand-text-muted mt-0.5">
            Join comedy fans getting new analyses, score drops, and the funniest moments each week. Free, no spam.
          </p>
        </div>
        <form onSubmit={handleSubscribe} className="flex gap-2 sm:min-w-[280px]">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            aria-label="Email address for newsletter"
            className="flex-1 bg-brand-card border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-gold text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-gold-dim transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? '...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { trackNewsletterSignup } from '@/lib/analytics';

export default function EndOfArticleCTA() {
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
        trackNewsletterSignup('end_of_article');
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (subscribed) {
    return (
      <div className="my-10 bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-6 text-center">
        <p className="text-base font-medium text-brand-gold">You&apos;re in!</p>
        <p className="text-sm text-brand-text-secondary mt-1">Next issue drops Friday.</p>
      </div>
    );
  }

  return (
    <div className="my-10 bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Liked this analysis?</p>
      <h3 className="text-lg font-medium text-brand-text-primary mb-1">
        We publish one deep dive every week.
      </h3>
      <p className="text-sm text-brand-text-secondary mb-4">
        Join comedy fans getting weekly rankings, new show analyses, and the funniest moments we found. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          aria-label="Email address for newsletter"
          className="flex-1 bg-brand-card border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-gold transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-gold text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-gold-dim transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {loading ? '...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}

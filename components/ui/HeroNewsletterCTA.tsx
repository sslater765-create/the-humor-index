'use client';
import { useState } from 'react';

export default function HeroNewsletterCTA() {
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
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  };

  if (subscribed) {
    return (
      <div className="mt-6 flex items-center gap-2 text-sm text-brand-gold">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        You&apos;re in. First issue drops this Friday.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@email.com"
        required
        aria-label="Email for weekly rankings"
        className="flex-1 bg-brand-card border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-gold transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-gold/20 transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {loading ? 'Joining...' : 'Get weekly rankings'}
      </button>
    </form>
  );
}

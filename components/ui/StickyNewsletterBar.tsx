'use client';
import { useState, useEffect } from 'react';
import { trackNewsletterSignup } from '@/lib/analytics';

const DISMISS_KEY = 'humor_index_sticky_dismissed';

export default function StickyNewsletterBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const d = localStorage.getItem(DISMISS_KEY);
      if (d && Date.now() - parseInt(d, 10) < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    } catch { /* ignore */ }

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.35);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  };

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
        trackNewsletterSignup('sticky_bar');
        setTimeout(handleDismiss, 3000);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-card/95 backdrop-blur-md border-t border-brand-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {subscribed ? (
          <p className="text-sm text-brand-gold flex-1">Subscribed! First issue drops Friday.</p>
        ) : (
          <>
            <p className="text-sm text-brand-text-secondary hidden sm:block whitespace-nowrap">
              <span className="text-brand-gold font-medium">Weekly comedy rankings</span> — free, no spam
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 flex-1 sm:flex-none sm:min-w-[320px]">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                aria-label="Email for newsletter"
                className="flex-1 bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-gold transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-gold text-black text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-brand-gold-dim transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
          </>
        )}
        <button
          onClick={handleDismiss}
          className="text-brand-text-muted hover:text-brand-text-primary transition-colors p-1 shrink-0"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { trackNewsletterSignup } from '@/lib/analytics';

const DISMISS_KEY = 'humor_index_popup_dismissed';
const DISMISS_DAYS = 30;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10);
        if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch { /* ignore */ }

    // Trigger on scroll depth (60%)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.6) {
        setVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Trigger on exit intent (desktop only)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setVisible(true);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Delay listeners so popup doesn't fire immediately
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
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
        trackNewsletterSignup('popup');
        setTimeout(dismiss, 3000);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-brand-text-muted hover:text-brand-text-primary transition-colors p-1"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {subscribed ? (
          <div className="text-center py-4">
            <p className="text-lg font-medium text-brand-gold mb-1">You&apos;re in!</p>
            <p className="text-sm text-brand-text-secondary">First issue drops this Friday.</p>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Before you go</p>
            <h3 className="text-lg font-medium text-brand-text-primary mb-1">
              Don&apos;t miss the weekly rankings drop
            </h3>
            <p className="text-sm text-brand-text-secondary mb-5">
              Join comedy fans getting new show analyses, score updates, and the funniest moments we found each week. Free, no spam.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoFocus
                aria-label="Email address"
                className="flex-1 bg-brand-surface border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-gold transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-gold text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-gold-dim transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
            <p className="text-[10px] text-brand-text-muted mt-3 text-center">
              Unsubscribe anytime. We respect your inbox.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

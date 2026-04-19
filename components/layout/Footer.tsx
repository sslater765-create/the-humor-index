'use client';
import Link from 'next/link';
import { useState } from 'react';
import { trackNewsletterSignup } from '@/lib/analytics';

export default function Footer() {
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
        trackNewsletterSignup('footer');
      }
    } catch {
      // Silently fail — better than showing an error for newsletter
    }
    setLoading(false);
  };

  return (
    <footer className="border-t border-brand-border mt-16">
      {/* Newsletter signup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-brand-border">
        <div className="max-w-md">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Stay Updated</p>
          <h3 className="text-lg font-medium text-brand-text-primary mb-1">
            Weekly comedy rankings
          </h3>
          <p className="text-sm text-brand-text-secondary mb-4">
            Join comedy fans getting weekly rankings, new show analyses, and the funniest moments we found each week. Free, no spam, unsubscribe anytime.
          </p>
          {subscribed ? (
            <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-5">
              <p className="text-base font-medium text-brand-gold mb-2">You&apos;re subscribed!</p>
              <p className="text-sm text-brand-text-secondary mb-4">Next issue drops Friday. In the meantime, follow us:</p>
              <div className="flex items-center gap-4">
                <a href="https://x.com/thehumorindex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  X
                </a>
                <a href="https://instagram.com/thehumorindex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  Instagram
                </a>
                <a href="https://tiktok.com/@thehumorindex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                  TikTok
                </a>
                <a href="https://www.reddit.com/user/thehumorindex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
                  Reddit
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                aria-label="Email address for newsletter"
                className="flex-1 bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-gold transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-gold text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-gold-dim transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="text-sm text-brand-text-secondary font-medium">
            THE HUMOR INDEX — comedy analytics, not corporate sponsorship
          </span>
          <span className="text-xs text-brand-text-muted">
            Episode ratings courtesy of <a href="https://www.imdb.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-text-secondary transition-colors underline">IMDb</a>
          </span>
          <span className="text-xs text-brand-text-muted">
            Show data from <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="hover:text-brand-text-secondary transition-colors underline">TMDB</a>
          </span>
          <div className="flex items-center gap-3">
            <a href="https://x.com/thehumorindex" target="_blank" rel="noopener noreferrer" className="text-brand-text-muted hover:text-brand-text-secondary transition-colors" aria-label="Follow on X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://instagram.com/thehumorindex" target="_blank" rel="noopener noreferrer" className="text-brand-text-muted hover:text-brand-text-secondary transition-colors" aria-label="Follow on Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
            <a href="https://tiktok.com/@thehumorindex" target="_blank" rel="noopener noreferrer" className="text-brand-text-muted hover:text-brand-text-secondary transition-colors" aria-label="Follow on TikTok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
            </a>
            <a href="https://www.reddit.com/user/thehumorindex" target="_blank" rel="noopener noreferrer" className="text-brand-text-muted hover:text-brand-text-secondary transition-colors" aria-label="Follow on Reddit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
            </a>
          </div>
        </div>
        <div className="flex gap-6">
          <Link href="/shows" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Shows
          </Link>
          <Link href="/methodology" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Methodology
          </Link>
          <Link href="/compare" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Compare Shows
          </Link>
          <Link href="/faq" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            FAQ
          </Link>
          <Link href="/about" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            About
          </Link>
          <Link href="/privacy" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Terms
          </Link>
          <a href="mailto:sam@thehumorindex.com" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

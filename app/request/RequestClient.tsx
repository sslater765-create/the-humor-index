'use client';
import { useState, useEffect } from 'react';

const SUGGESTED_SHOWS = [
  { name: 'Curb Your Enthusiasm', slug: 'curb-your-enthusiasm' },
  { name: 'Community', slug: 'community' },
  { name: 'Frasier', slug: 'frasier' },
  { name: 'How I Met Your Mother', slug: 'how-i-met-your-mother' },
  { name: 'Veep', slug: 'veep' },
  { name: 'Ted Lasso', slug: 'ted-lasso' },
  { name: 'Fleabag', slug: 'fleabag' },
  { name: 'The Good Place', slug: 'the-good-place' },
  { name: 'Modern Family', slug: 'modern-family' },
  { name: 'Everybody Loves Raymond', slug: 'everybody-loves-raymond' },
  { name: 'New Girl', slug: 'new-girl' },
  { name: 'Scrubs', slug: 'scrubs' },
  { name: 'Malcolm in the Middle', slug: 'malcolm-in-the-middle' },
  { name: 'Superstore', slug: 'superstore' },
  { name: 'Abbott Elementary', slug: 'abbott-elementary' },
];

export default function RequestClient() {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const [customShow, setCustomShow] = useState('');
  const [customSubmitted, setCustomSubmitted] = useState(false);

  // Load votes on mount
  useEffect(() => {
    fetch('/api/vote')
      .then(r => r.json())
      .then(data => {
        setVotes(data.votes || {});
        try {
          const prev = JSON.parse(localStorage.getItem('humor_index_votes2') || '[]');
          setVoted(new Set(prev));
          const savedEmail = localStorage.getItem('humor_index_email');
          if (savedEmail) setEmail(savedEmail);
        } catch { /* ignore */ }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (slug: string) => {
    const isUnvoting = voted.has(slug);

    // Optimistic update
    if (isUnvoting) {
      setVotes(prev => ({ ...prev, [slug]: Math.max((prev[slug] || 1) - 1, 0) }));
      const newVoted = new Set(voted);
      newVoted.delete(slug);
      setVoted(newVoted);
      try { localStorage.setItem('humor_index_votes2', JSON.stringify(Array.from(newVoted))); } catch {}

      try {
        await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, unvote: true }),
        });
      } catch {
        setVotes(prev => ({ ...prev, [slug]: (prev[slug] || 0) + 1 }));
        setVoted(new Set(voted).add(slug));
      }
    } else {
      setVotes(prev => ({ ...prev, [slug]: (prev[slug] || 0) + 1 }));
      const newVoted = new Set(voted).add(slug);
      setVoted(newVoted);

      setJustVoted(slug);
      setTimeout(() => setJustVoted(null), 1500);

      try {
        localStorage.setItem('humor_index_votes2', JSON.stringify(Array.from(newVoted)));
        if (email) localStorage.setItem('humor_index_email', email);
      } catch {}

      try {
        await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, email: email || undefined }),
        });
      } catch {
        setVotes(prev => ({ ...prev, [slug]: Math.max((prev[slug] || 1) - 1, 0) }));
        newVoted.delete(slug);
        setVoted(new Set(newVoted));
      }
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customShow.trim()) return;

    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customShow: customShow.trim(), email: email || undefined }),
      });
      setCustomSubmitted(true);
      setCustomShow('');
    } catch { /* silent */ }
  };

  const sorted = [...SUGGESTED_SHOWS].sort(
    (a, b) => (votes[b.slug] || 0) - (votes[a.slug] || 0)
  );

  return (
    <div className="space-y-8">
      {/* Email — optional, shown at top */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">
          Get notified when we analyze your pick
        </p>
        {emailSaved ? (
          <p className="text-sm text-brand-gold">Saved! We&apos;ll email you when your pick is analyzed.</p>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com (optional)"
                className="flex-1 bg-brand-card border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors"
                aria-label="Email for vote notifications"
              />
              <button
                onClick={() => {
                  if (email && email.includes('@')) {
                    try { localStorage.setItem('humor_index_email', email); } catch {}
                    setEmailSaved(true);
                  }
                }}
                className="text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap bg-brand-surface border border-brand-border text-brand-text-secondary hover:border-brand-gold hover:text-brand-gold"
              >
                Save
              </button>
            </div>
            <p className="text-[10px] text-brand-text-muted mt-2">Only visible to you — stored locally on your device.</p>
          </>
        )}
      </div>

      {/* Already queued */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Analysis Pipeline</p>
        <p className="text-sm text-brand-text-secondary mb-3">Shows currently being analyzed or in the queue.</p>
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between p-2 bg-brand-surface rounded-lg">
            <span className="text-sm text-brand-text-primary">Friends</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">In Progress</span>
          </div>
        </div>
        <p className="text-xs text-brand-text-muted mb-2">Up next:</p>
        <div className="flex flex-wrap gap-2">
          {['Parks and Recreation', 'Arrested Development', 'Brooklyn Nine-Nine',
            "It's Always Sunny", "Schitt's Creek", 'Big Bang Theory', 'Two and a Half Men', '30 Rock'].map(name => (
            <span key={name} className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-3 py-1">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Voting grid */}
      <div className="space-y-2">
        {sorted.map(show => {
          const count = votes[show.slug] || 0;
          const hasVoted = voted.has(show.slug);
          const isJustVoted = justVoted === show.slug;
          return (
            <div
              key={show.slug}
              className={`flex items-center justify-between p-4 bg-brand-card border rounded-xl transition-all duration-300 ${
                isJustVoted
                  ? 'border-brand-gold bg-brand-gold/5'
                  : 'border-brand-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-brand-text-primary font-medium">{show.name}</span>
                {count > 0 && (
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full transition-all ${
                    isJustVoted
                      ? 'text-black bg-brand-gold scale-110'
                      : 'text-brand-gold bg-brand-gold/10'
                  }`}>
                    {count} vote{count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleVote(show.slug)}
                disabled={loading}
                className={`text-xs px-4 py-2 rounded-lg transition-all ${
                  isJustVoted
                    ? 'bg-brand-gold text-black font-medium border border-brand-gold'
                    : hasVoted
                    ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30'
                    : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                {isJustVoted ? 'Voted!' : hasVoted ? 'Voted ✓' : 'Vote'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom suggestion */}
      <div className="border-t border-brand-border pt-8">
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
          Don&apos;t see your show?
        </p>
        {customSubmitted ? (
          <p className="text-sm text-brand-gold">Thanks! We&apos;ll add it to the list.</p>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customShow}
              onChange={e => setCustomShow(e.target.value)}
              placeholder="Suggest a show..."
              className="flex-1 bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors"
              aria-label="Suggest a show for analysis"
            />
            <button
              type="submit"
              className="bg-brand-gold text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-gold-dim transition-colors"
            >
              Submit
            </button>
          </form>
        )}
      </div>

      {/* Context */}
      <div className="text-xs text-brand-text-muted leading-relaxed">
        <p>
          Each show requires downloading transcripts and running every episode through our
          AI comedy analyst. A full show (150+ episodes) takes several hours to process.
          We prioritize shows based on community demand and cultural impact.
        </p>
      </div>
    </div>
  );
}

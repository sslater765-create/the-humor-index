'use client';
import { useState, useEffect } from 'react';

const SUGGESTED_SHOWS = [
  { name: 'Curb Your Enthusiasm', slug: 'curb-your-enthusiasm' },
  { name: 'Frasier', slug: 'frasier' },
  { name: 'How I Met Your Mother', slug: 'how-i-met-your-mother' },
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

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const topShow = sorted.find(s => (votes[s.slug] || 0) > 0);
  const completed = ['The Office', 'Seinfeld', 'Friends', 'Parks and Recreation', "Schitt's Creek", 'Arrested Development', '30 Rock', 'Taxi', 'Community', 'The Simpsons', 'Veep', "It's Always Sunny in Philadelphia"];
  const upNext = ['Brooklyn Nine-Nine', 'All in the Family', 'M*A*S*H', 'The Jeffersons',
    'The Mary Tyler Moore Show', 'WKRP in Cincinnati',
    'Sanford and Son', 'Barney Miller', 'Two and a Half Men', 'The Big Bang Theory'];

  return (
    <div className="space-y-10">
      {/* Vote section — the main act */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">Cast Your Vote</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary">The Ballot</h2>
          </div>
          {totalVotes > 0 && (
            <div className="text-right shrink-0">
              <p className="font-serif italic text-2xl text-brand-gold leading-none">{totalVotes.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">votes cast</p>
            </div>
          )}
        </div>

        {topShow && (votes[topShow.slug] || 0) > 0 && (
          <div className="bg-gradient-to-r from-brand-gold/10 via-brand-gold/5 to-transparent border-l-2 border-brand-gold rounded-r-lg px-4 py-3 mb-5">
            <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-0.5">Leading the field</p>
            <p className="font-serif italic text-lg text-brand-text-primary">
              {topShow.name} <span className="text-brand-text-muted not-italic font-mono text-sm">— {votes[topShow.slug]} {votes[topShow.slug] === 1 ? 'vote' : 'votes'}</span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          {sorted.map((show, idx) => {
            const count = votes[show.slug] || 0;
            const hasVoted = voted.has(show.slug);
            const isJustVoted = justVoted === show.slug;
            const isTop = idx === 0 && count > 0;
            return (
              <div
                key={show.slug}
                className={`flex items-center justify-between p-4 bg-brand-card border rounded-xl transition-all duration-300 ${
                  isJustVoted
                    ? 'border-brand-gold bg-brand-gold/5'
                    : isTop
                    ? 'border-brand-gold/30'
                    : 'border-brand-border'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-brand-text-muted w-5 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                  <span className={`font-serif italic text-lg truncate ${isTop ? 'text-brand-gold' : 'text-brand-text-primary'}`}>
                    {show.name}
                  </span>
                  {count > 0 && (
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-full transition-all shrink-0 ${
                      isJustVoted
                        ? 'text-black bg-brand-gold scale-110'
                        : 'text-brand-gold bg-brand-gold/10'
                    }`}>
                      {count}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleVote(show.slug)}
                  disabled={loading}
                  className={`text-xs px-4 py-2 rounded-lg transition-all shrink-0 ${
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
      </section>

      {/* Custom suggestion — framed as a write-in */}
      <section className="bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-7">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-text-muted mb-1">Write-In Candidate</p>
        <h3 className="font-serif italic text-xl text-brand-text-primary mb-4">Don&apos;t see your show?</h3>
        {customSubmitted ? (
          <p className="text-sm text-brand-gold">Thanks — we&apos;ll add it to the next ballot.</p>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customShow}
              onChange={e => setCustomShow(e.target.value)}
              placeholder="Suggest a show…"
              className="flex-1 bg-brand-surface border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors"
              aria-label="Suggest a show for analysis"
            />
            <button
              type="submit"
              className="bg-brand-gold text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-gold-dim transition-colors"
            >
              Submit
            </button>
          </form>
        )}
      </section>

      {/* Email — newsletter signup */}
      <section className="relative bg-gradient-to-br from-brand-surface to-brand-card border border-brand-border rounded-2xl p-6 sm:p-7 overflow-hidden">
        <div className="absolute top-3 left-5 font-serif italic text-brand-gold/15 text-6xl leading-none select-none">&ldquo;</div>
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-text-muted mb-1">Get the Verdict First</p>
          <h3 className="font-serif italic text-xl text-brand-text-primary mb-4">
            Find out the moment we score your pick.
          </h3>
          {emailSaved ? (
            <p className="text-sm text-brand-gold">Saved! We&apos;ll email you when your pick is analyzed.</p>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 bg-brand-card border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:border-brand-gold transition-colors"
                  aria-label="Email for vote notifications"
                />
                <button
                  onClick={async () => {
                    if (email && email.includes('@')) {
                      try { localStorage.setItem('humor_index_email', email); } catch {}
                      setEmailSaved(true);
                      try {
                        await fetch('/api/subscribe', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                        });
                      } catch { /* silent */ }
                    }
                  }}
                  className="text-sm font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap bg-brand-gold text-black hover:bg-brand-gold-dim"
                >
                  Save
                </button>
              </div>
              <p className="text-[10px] text-brand-text-muted mt-3">
                You&apos;ll also get our weekly comedy rankings newsletter. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </section>

      {/* The Roster */}
      <section className="bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-7">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-text-muted mb-1">The Roster</p>
            <h2 className="font-serif italic text-2xl text-brand-text-primary">What we&apos;ve scored. What&apos;s coming.</h2>
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="font-serif italic text-3xl text-brand-gold leading-none">{completed.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">shows live</p>
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-widest text-emerald-400/80 mb-3">Completed</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-7">
          {completed.map(name => (
            <div key={name} className="flex items-center gap-2 px-3 py-2 bg-brand-surface rounded-lg">
              <span className="text-emerald-400 text-sm leading-none">✓</span>
              <span className="text-sm text-brand-text-primary truncate">{name}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-widest text-brand-gold/80 mb-3">Up Next on the Slate</p>
        <div className="flex flex-wrap gap-2">
          {upNext.map(name => (
            <span key={name} className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-3 py-1.5">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Footnote */}
      <p className="text-xs text-brand-text-muted leading-relaxed text-center max-w-xl mx-auto pt-2">
        Each show takes several hours to process — every episode runs through our AI comedy analyst three times.
        We prioritize by community demand and cultural impact.
      </p>
    </div>
  );
}

import Link from 'next/link';
import { SITE_URL } from '@/lib/site';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const metadata = {
  title: 'Comedy Analytics Blog — Data-Driven Insights on TV Humor',
  description: 'Deep dives into sitcom comedy using data. Which shows are actually the funniest? What makes a joke work? We break it down with numbers.',
  alternates: {
    canonical: `${SITE_URL}/blog/`,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  'Data Science': 'from-blue-900/40 to-brand-card',
  'Deep Dive': 'from-amber-900/40 to-brand-card',
  'Methodology': 'from-emerald-900/40 to-brand-card',
  'Analysis': 'from-purple-900/40 to-brand-card',
};

const CATEGORY_ACCENTS: Record<string, string> = {
  'Data Science': 'text-blue-400',
  'Deep Dive': 'text-brand-gold',
  'Methodology': 'text-emerald-400',
  'Analysis': 'text-purple-400',
};

// Blog posts are defined here — add new posts as objects
// In the future, this could pull from a CMS or markdown files
const POSTS = [
  {
    slug: 'density-vs-craft',
    title: "Two Shows Tell Exactly the Same Number of Jokes Per Minute. One Scores 16 Points Higher.",
    description: "Fleabag and The Simpsons both average 3.46 jokes per minute \u2014 and sit 16.8 Humor Index points apart. Across our canonically-scored shows craft predicts 91% of the score, density 8%, and the two barely correlate. Volume is the cheap lever.",
    date: '2026-08-19',
    category: 'Data Science',
    readTime: '6 min read',
    stat: "16.8",
    statLabel: "HI gap at identical joke density",
  },
  {
    slug: 'futurama-launch',
    title: "Futurama Out-Scores the Show It Roasted",
    description: "137 episodes, 1999–2025, 8,900 jokes. Futurama lands at 77.8 (#18 of 21) — and the Hulu revival nearly held its per-joke quality (craft 6.80 vs 6.85). It has the highest joke density on the board and still finishes lower-table, which tells you what the index actually rewards.",
    date: '2026-06-14',
    category: 'Show Launch',
    readTime: '4 min read',
    stat: "77.8",
    statLabel: "Futurama Humor Index (#18)",
  },
  {
    slug: 'the-simpsons-all-20-seasons',
    title: "We Scored All 20 Seasons of The Simpsons. The Golden Age Is Real — and the Decline Is Smaller Than You Think.",
    description: "All 441 episodes and 28,170 jokes, scored. The golden age is statistically real — Season 6 peaks at 82.5 — but the post-classic decline is gentler than the memes: seasons 11–20 never drop below 77.6, and the single highest-scoring episode is from Season 16.",
    date: '2026-06-09',
    category: 'Analysis',
    readTime: '7 min read',
    stat: "82.5",
    statLabel: "Season 6 — the peak season",
  },
  {
    slug: 'fresh-prince-geoffrey-butler',
    title: "The Funniest Person in the Fresh Prince Mansion Is the Butler",
    description: "We scored all 148 episodes of The Fresh Prince of Bel-Air. Will Smith leads the cast in total Comedy WAR — but only because he says three times as many jokes as anyone else. Per joke, the funniest Banks-household voice is Geoffrey, the butler with under four lines an episode and the sharpest one in the room.",
    date: '2026-06-07',
    category: 'Analysis',
    readTime: '8 min read',
    stat: "+0.30",
    statLabel: "Geoffrey's vs-castmates edge (best in cast)",
  },
  {
    slug: 'sunny-renaissance',
    title: "It's Always Sunny Is Better Now Than It Was in 2010 — the Data Says So",
    description: "Fan consensus says peak Sunny is the original FX run. The Humor Index disagrees. We scored all 177 episodes across 17 seasons; the last five (S13–S17) outscore the first seven (S1–S7) by 3.1 points. Sunny didn't decline. It got meaner — and the dialogue craft followed.",
    date: '2026-05-31',
    category: 'Analysis',
    readTime: '8 min read',
    stat: '+3.1',
    statLabel: 'S13–S17 vs S1–S7 (HI points)',
  },
  {
    slug: 'character-comedy-spectrum',
    title: "Modern Sitcoms Are More Character-Driven Than the Classics",
    description: "Across the 18 shows we've tagged by joke type, character_comedy is the most variable axis in our taxonomy — a 47-point spread. Schitt's Creek tells more character-driven jokes than Seinfeld. By a factor of nearly three.",
    date: '2026-05-03',
    category: 'Data Science',
    readTime: '7 min read',
    stat: "69.1%",
    statLabel: "Schitt's character comedy share",
  },
  {
    slug: 'scorer-noise-floor',
    title: 'We Rescored 30 Episodes Twice. Our Single-Run Humor Index Has an ICC of 0.28.',
    description: 'A test-retest study on 30 episodes. Show-identity bias is tiny (not significant). But the scorer is noisier than we thought — individual episode Humor Indexes are only 28% signal, 72% run-to-run variance. Here\'s what we\'re doing about it.',
    date: '2026-04-17',
    category: 'Data Science',
    readTime: '9 min read',
    stat: 'ICC 0.28',
    statLabel: 'Single-run reliability',
  },
  {
    slug: 'bayesian-credible-intervals',
    title: 'We Fitted a Bayesian Model to 15,000 Jokes. Format Explains Nothing.',
    description: 'A hierarchical Bayesian model of joke impact on 15,000 jokes. Format effect: indistinguishable from zero — which is why the multi-cam penalty is gone. 64% of joke-level variance is unexplained noise, and show identity explains only 7.9%.',
    date: '2026-04-17',
    category: 'Data Science',
    readTime: '8 min read',
    stat: '7.9%',
    statLabel: 'Variance between shows',
  },
  {
    slug: 'imdb-vs-humor-index',
    title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?',
    description: 'We compared 2,649 episodes across all 21 scored shows against IMDb. Within-show correlation: r = +0.18 — audience ratings explain about 3% of the variance in comedy craft.',
    date: '2026-04-12',
    category: 'Data Science',
    readTime: '7 min read',
    stat: 'r = +0.18',
    statLabel: 'Within-show correlation',
  },
  {
    slug: 'is-the-office-actually-funny',
    title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.',
    description: 'We ran all 183 episodes of The Office through our AI comedy analyst. Season 4 averages 83.8 and "Dinner Party" tops the series at 98.0 — the fan consensus holds up.',
    date: '2026-04-10',
    category: 'Deep Dive',
    readTime: '8 min read',
    stat: '183',
    statLabel: 'Episodes Analyzed',
  },
  {
    slug: 'how-we-score-comedy',
    title: 'How We Score Comedy: The Math Behind the Humor Index',
    description: 'Peak density, effective craft, memorability bonus — here\'s the complete breakdown of how we turn thousands of joke scores into a single number.',
    date: '2026-04-10',
    category: 'Methodology',
    readTime: '6 min read',
    stat: '5',
    statLabel: 'Dimensions',
  },
  {
    slug: 'laugh-track-penalty',
    title: 'Should Laugh Tracks Be Penalized? Our Data Says Yes.',
    description: 'Our original April 10 argument for a laugh-track penalty — and why we removed it a week later when a Bayesian audit showed the effect was indistinguishable from zero.',
    date: '2026-04-10',
    category: 'Analysis',
    readTime: '5 min read',
    stat: 'Retracted',
    statLabel: 'See update note in post',
  },
];

export default function BlogPage() {
  const [hero, ...rest] = POSTS;
  return (
    <div>
      {/* Editorial hero */}
      <section className="relative border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold mb-4">Comedy Analytics, Read Out Loud</p>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-brand-text-primary leading-[1.05] mb-5 max-w-3xl">
            The dispatches.
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary max-w-2xl leading-relaxed">
            Deep dives, methodology updates, fan-theory autopsies, and show-launch analyses —
            every post backed by the same data that powers the index.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Above-the-fold lead story */}
        {hero && (
          <Link
            href={`/blog/${hero.slug}`}
            className="block group"
          >
            <article className={`relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0 rounded-2xl overflow-hidden border border-brand-border hover:border-brand-gold/40 transition-colors`}>
              <div className={`relative min-h-[260px] sm:min-h-[320px] bg-gradient-to-br ${CATEGORY_COLORS[hero.category] || 'from-brand-surface to-brand-card'} flex items-center justify-center p-8`}>
                <div className="text-center">
                  <p className={`font-serif italic text-6xl sm:text-7xl ${CATEGORY_ACCENTS[hero.category] || 'text-brand-gold'} leading-none`}>
                    {hero.stat}
                  </p>
                  <p className="text-[10px] text-brand-text-muted mt-3 uppercase tracking-[0.25em]">
                    {hero.statLabel}
                  </p>
                </div>
                <span className="absolute top-4 left-5 text-[10px] uppercase tracking-[0.25em] text-brand-gold">
                  The Latest
                </span>
              </div>
              <div className="p-7 sm:p-9 bg-brand-card flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-brand-text-muted mb-4">
                  <span className={`${CATEGORY_ACCENTS[hero.category] || 'text-brand-gold'}`}>{hero.category}</span>
                  <span>·</span>
                  <span>{formatDate(hero.date)}</span>
                  <span>·</span>
                  <span>{hero.readTime}</span>
                </div>
                <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary group-hover:text-brand-gold transition-colors leading-tight mb-4">
                  {hero.title}
                </h2>
                <p className="text-sm text-brand-text-secondary leading-relaxed line-clamp-4">
                  {hero.description}
                </p>
                <p className="text-xs uppercase tracking-widest text-brand-gold mt-5">Read the piece →</p>
              </div>
            </article>
          </Link>
        )}

        {/* Section header */}
        <div className="border-t border-brand-border pt-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">The Archive</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight mb-2">
            Every post on the index.
          </h2>
          <p className="text-sm text-brand-text-secondary max-w-xl mb-8">
            {rest.length} more dispatches — show launches, methodology audits, leaderboards, retractions, the lot.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, postIndex) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/40 transition-colors group"
              >
                <div className={`relative h-40 w-full bg-gradient-to-b ${CATEGORY_COLORS[post.category] || 'from-brand-surface to-brand-card'} flex items-center justify-center`}>
                  <div className="text-center px-4">
                    <p className={`font-serif italic text-3xl sm:text-4xl ${CATEGORY_ACCENTS[post.category] || 'text-brand-gold'} leading-none`}>
                      {post.stat}
                    </p>
                    <p className="text-[10px] text-brand-text-muted mt-2 uppercase tracking-widest leading-tight">
                      {post.statLabel}
                    </p>
                  </div>
                  <span className={`absolute bottom-3 left-4 text-[10px] uppercase tracking-widest ${CATEGORY_ACCENTS[post.category] || 'text-brand-gold'}`}>
                    {post.category}
                  </span>
                  <span className="absolute bottom-3 right-4 font-mono text-[10px] text-brand-text-muted">
                    №{String(postIndex + 2).padStart(2, '0')}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-2">{formatDate(post.date)} · {post.readTime}</p>
                  <h3 className="font-serif italic text-lg text-brand-text-primary group-hover:text-brand-gold transition-colors mb-2 line-clamp-3 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-brand-text-secondary line-clamp-2 leading-relaxed">{post.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

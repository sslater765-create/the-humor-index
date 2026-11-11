import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { POSTS as POST_DATA } from './posts';

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

// Title, description, date and category come from posts.ts, so the index
// cannot drift from the posts themselves. Only the card extras live here.
// A post missing from CARDS still renders, with default extras.
const CARDS: Record<string, { readTime: string; stat: string; statLabel: string }> = {
  'chappelles-show-sketch-advantage': { readTime: '3 min read', stat: '7.70', statLabel: "Chappelle's Show per-joke impact" },
  'most-quotable-show': { readTime: '3 min read', stat: '37.5%', statLabel: '30 Rock jokes rated 8+ for quotability' },
  'most-consistent-show': { readTime: '3 min read', stat: '83.8', statLabel: 'Parks and Rec lowest episode of 122' },
  'pilots-score-below-their-show': { readTime: '3 min read', stat: '8 of 13', statLabel: 'Pilots below their show average' },
  'callbacks-score-higher': { readTime: '4 min read', stat: '22%', statLabel: 'Of all jokes are callbacks' },
  'which-joke-types-score-highest': { readTime: '4 min read', stat: '7.75', statLabel: 'Impact of dark and subversive jokes' },
  'after-the-creator-left': { readTime: '3 min read', stat: '+3.1', statLabel: 'Veep after Iannucci (HI points)' },
  'the-office-after-michael': { readTime: '3 min read', stat: '87.0', statLabel: 'The Office without Michael' },
  'what-the-rescore-changed': { readTime: '3 min read', stat: '+37%', statLabel: 'More jokes found on The Office' },
  'first-season-is-the-worst': { readTime: '3 min read', stat: '7 of 10', statLabel: 'Shows whose first season is the lowest' },
  'parks-improved-every-season': { readTime: '3 min read', stat: '7 for 7', statLabel: 'Seasons that beat the one before' },
  'arrested-development-netflix-seasons': { readTime: '3 min read', stat: '−21%', statLabel: 'Jokes per minute, Netflix vs Fox' },
  'density-vs-craft': { readTime: '5 min read', stat: '10.6', statLabel: 'HI gap at the same joke density' },
  'scorer-noise-floor': { readTime: '9 min read', stat: 'ICC 0.28', statLabel: 'Single-run reliability' },
  'bayesian-credible-intervals': { readTime: '8 min read', stat: '7.9%', statLabel: 'Variance between shows' },
  'imdb-vs-humor-index': { readTime: '7 min read', stat: 'r = +0.27', statLabel: 'Within-show correlation' },
  'is-the-office-actually-funny': { readTime: '5 min read', stat: '183', statLabel: 'Episodes Analyzed' },
  'how-we-score-comedy': { readTime: '3 min read', stat: '5', statLabel: 'Dimensions' },
  'laugh-track-penalty': { readTime: '3 min read', stat: 'Retracted', statLabel: 'See update note in post' },
};

const POSTS = Object.entries(POST_DATA)
  .map(([slug, post]) => ({
    slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    readTime: CARDS[slug]?.readTime ?? '5 min read',
    stat: CARDS[slug]?.stat ?? '',
    statLabel: CARDS[slug]?.statLabel ?? '',
  }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

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
            Deep dives and methodology audits, every post backed by the same data that powers the index.
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
            {rest.length} more dispatches: deep dives, methodology audits and one retraction.
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

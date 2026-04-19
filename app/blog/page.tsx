import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const metadata = {
  title: 'Comedy Analytics Blog — Data-Driven Insights on TV Humor',
  description: 'Deep dives into sitcom comedy using data. Which shows are actually the funniest? What makes a joke work? We break it down with numbers.',
  alternates: {
    canonical: 'https://thehumorindex.com/blog',
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
    title: 'We Fitted a Bayesian Model to 15,000 Jokes. Every Show Ranking Is Within Noise.',
    description: 'A hierarchical Bayesian model of joke impact. Format effect: statistically zero. The three scored shows\' credible intervals all overlap. 64% of joke-level variance is unexplained within-joke noise.',
    date: '2026-04-17',
    category: 'Data Science',
    readTime: '8 min read',
    stat: '7.9%',
    statLabel: 'Variance between shows',
  },
  {
    slug: 'comedy-war',
    title: 'Jerry Seinfeld Is the Most Valuable Comedy Character in Television History',
    description: 'Our April 16 analysis of Comedy WAR. Post includes an April 19 update: after fixing a standup-weighting bug, George Costanza overtook Jerry for #1.',
    date: '2026-04-16',
    category: 'Data Science',
    readTime: '7 min read',
    stat: '1,181.9',
    statLabel: 'George\'s current WAR (#1)',
  },
  {
    slug: 'seinfeld-vs-the-office',
    title: 'Seinfeld Just Passed The Office on Our Humor Index. Here\'s Why.',
    description: 'Our April 16 analysis of removing the multi-cam penalty. Post includes an April 19 update: after a standup-aware rescore, Office retook the top spot at 80.2 vs Seinfeld 79.1.',
    date: '2026-04-16',
    category: 'Methodology',
    readTime: '6 min read',
    stat: '80.2 vs 79.1',
    statLabel: 'Office vs Seinfeld (current)',
  },
  {
    slug: 'imdb-vs-humor-index',
    title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?',
    description: 'We compared 591 episodes across The Office, Seinfeld, and Friends against IMDb. Pooled correlation: r = −0.005. Audience ratings and comedy craft are essentially unrelated.',
    date: '2026-04-12',
    category: 'Data Science',
    readTime: '7 min read',
    stat: 'r = −0.005',
    statLabel: 'Pooled correlation',
  },
  {
    slug: 'is-the-office-actually-funny',
    title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.',
    description: 'We ran all 186 episodes of The Office through our AI comedy analyst. The results surprised us — some "classic" episodes aren\'t as funny as you think.',
    date: '2026-04-10',
    category: 'Deep Dive',
    readTime: '8 min read',
    stat: '186',
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
  return (
    <div>
      <PageHeader
        label="Blog"
        title="Comedy Analytics"
        subtitle="Deep dives into what makes TV comedy work — backed by data, not opinions."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {POSTS.map((post, postIndex) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/40 transition-colors group"
            >
              <div className={`relative h-36 w-full bg-gradient-to-b ${CATEGORY_COLORS[post.category] || 'from-brand-surface to-brand-card'} flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`font-mono text-3xl font-medium ${CATEGORY_ACCENTS[post.category] || 'text-brand-gold'}`}>
                    {post.stat}
                  </p>
                  <p className="text-xs text-brand-text-muted mt-1 uppercase tracking-widest">
                    {post.statLabel}
                  </p>
                </div>
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className="text-xs bg-brand-card/70 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-4">
                  <span className="text-xs text-brand-text-muted">#{postIndex + 1}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-brand-text-muted mb-2">{formatDate(post.date)} · {post.readTime}</p>
                <h2 className="text-base font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-brand-text-secondary line-clamp-2">{post.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Comedy Analytics Blog — Data-Driven Insights on TV Humor',
  description: 'Deep dives into sitcom comedy using data. Which shows are actually the funniest? What makes a joke work? We break it down with numbers.',
  alternates: {
    canonical: 'https://thehumorindex.com/blog',
  },
};

// Blog posts are defined here — add new posts as objects
// In the future, this could pull from a CMS or markdown files
const POSTS = [
  {
    slug: 'seinfeld-vs-the-office',
    title: 'Seinfeld Has Better Jokes. The Office Is Funnier. Here\'s Why.',
    description: 'Seinfeld wins on craft, impact, AND joke density. But The Office scores higher on our Humor Index. The math explains a fundamental truth about comedy.',
    date: '2026-04-12',
    category: 'Deep Dive',
    readTime: '6 min read',
  },
  {
    slug: 'imdb-vs-humor-index',
    title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?',
    description: 'We compared 186 episodes of The Office against IMDb audience ratings. The correlation? Almost zero. Here\'s what that means.',
    date: '2026-04-12',
    category: 'Data Science',
    readTime: '7 min read',
  },
  {
    slug: 'is-the-office-actually-funny',
    title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.',
    description: 'We ran all 186 episodes of The Office through our AI comedy analyst. The results surprised us — some "classic" episodes aren\'t as funny as you think.',
    date: '2026-04-10',
    category: 'Deep Dive',
    readTime: '8 min read',
  },
  {
    slug: 'how-we-score-comedy',
    title: 'How We Score Comedy: The Math Behind the Humor Index',
    description: 'Peak density, effective craft, memorability bonus — here\'s the complete breakdown of how we turn thousands of joke scores into a single number.',
    date: '2026-04-10',
    category: 'Methodology',
    readTime: '6 min read',
  },
  {
    slug: 'laugh-track-penalty',
    title: 'Should Laugh Tracks Be Penalized? Our Data Says Yes.',
    description: 'Multi-camera sitcoms with sweetened laugh tracks score 25% lower on our Impact metric. Here\'s why that\'s fair — and why some fans disagree.',
    date: '2026-04-10',
    category: 'Analysis',
    readTime: '5 min read',
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-6">
          {POSTS.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5">
                  {post.category}
                </span>
                <span className="text-xs text-brand-text-muted">{post.date}</span>
                <span className="text-xs text-brand-text-muted">{post.readTime}</span>
              </div>
              <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-brand-text-secondary">{post.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

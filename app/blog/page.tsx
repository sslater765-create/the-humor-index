import Link from 'next/link';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const metadata = {
  title: 'Comedy Analytics Blog — Data-Driven Insights on TV Humor',
  description: 'Deep dives into sitcom comedy using data. Which shows are actually the funniest? What makes a joke work? We break it down with numbers.',
  alternates: {
    canonical: 'https://thehumorindex.com/blog/',
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
    slug: 'fresh-prince-geoffrey-butler',
    title: "The Funniest Person in the Fresh Prince Mansion Is the Butler",
    description: "We scored all 148 episodes of The Fresh Prince of Bel-Air. Will Smith leads the cast in total Comedy WAR \u2014 but only because he says four times as many jokes as anyone else. Per joke, the funniest Banks-household voice is Geoffrey, the butler with 14 lines an episode and the sharpest one in the room.",
    date: '2026-06-07',
    category: 'Analysis',
    readTime: '8 min read',
    stat: "+0.30",
    statLabel: "Geoffrey's vs-castmates edge (best in cast)",
  },
  {
    slug: 'larry-sanders-launch',
    title: "The Show That Invented Cringe Lands at #13 \u2014 and the Sidekick Outscores the Host",
    description: "We scored all 90 episodes of The Larry Sanders Show, the first HBO comedy in the dataset. It ran cringe at The Office's rate a decade before The Office existed, its best player wasn't its star, and one of its episodes technically didn't exist until this week. Hey now.",
    date: '2026-06-05',
    category: 'Show Launch',
    readTime: '9 min read',
    stat: "338 vs 322",
    statLabel: "Artie vs Larry, career WAR",
  },
  {
    slug: 'sunny-renaissance',
    title: "It's Always Sunny Is Better Now Than It Was in 2010 — the Data Says So",
    description: "Fan consensus says peak Sunny is the original FX run. The Humor Index disagrees. We scored all 177 episodes across 17 seasons; the last five (S13–S17) outscore the first seven (S1–S7) by 3.5 points. Sunny didn't decline. It got meaner — and the dialogue craft followed.",
    date: '2026-05-31',
    category: 'Analysis',
    readTime: '8 min read',
    stat: '+3.5',
    statLabel: 'S13–S17 vs S1–S7 (HI points)',
  },
  {
    slug: 'humor-index-explorer',
    title: "We Re-Cut Five Sitcoms by the Numbers — and Busted Two Fan Theories",
    description: "Our new Explorer lets you rebuild any sitcom and see how funny that cut scores. The Arrested Development revival really was worse — but The Office didn't fall off after Steve Carell, and the Schitt's Creek glow-up doesn't show up in the jokes.",
    date: '2026-05-25',
    category: 'Analysis',
    readTime: '5 min read',
    stat: "5",
    statLabel: "fan theories, tested",
  },
  {
    slug: 'community-gas-leak-year',
    title: "You Can See Exactly When Dan Harmon Left Community",
    description: "We scored all 110 episodes of Community. It lands at Humor Index 77.9 — fifth of nine shows. But the real story is the season curve: it tracks the show's behind-the-scenes history almost to the decimal. The gas-leak year is real, the Harmon rebound is real, and the season everyone defends is quietly the weakest.",
    date: '2026-05-24',
    category: 'Show Launch',
    readTime: '8 min read',
    stat: "77.9",
    statLabel: "Community Humor Index (#5)",
  },
  {
    slug: 'humor-index-vs-imdb-three-ways',
    title: "We Recomputed Our IMDb Correlation Three Ways. At the Show Level, It's Negative.",
    description: "Our April post reported r = -0.005 between the Humor Index and IMDb. We dug back in. Within-show correlations span -0.115 to +0.392. The show-level correlation is -0.287. HI's top 10 and IMDb's top 10 overlap 6 of 80 across the catalog — exactly chance.",
    date: '2026-05-16',
    category: 'Data Science',
    readTime: '8 min read',
    stat: "6 / 80",
    statLabel: "HI ∩ IMDb top-10 across catalog",
  },
  {
    slug: 'taxi-launch',
    title: "Taxi Lands at 77.4 — A 1978 Show Inside the Same Tier as Seinfeld",
    description: "We just scored all 114 episodes of Taxi. It lands at Humor Index 77.4 — statistically indistinguishable from Seinfeld, Friends, and Schitt's Creek. The format we used to penalize for is the format every modern character comedy descends from. And Louie De Palma cracks the top 10 cross-show.",
    date: '2026-05-16',
    category: 'Analysis',
    readTime: '9 min read',
    stat: "77.4",
    statLabel: "Taxi Humor Index (#7)",
  },
  {
    slug: 'arrested-development-craft-leaderboard',
    title: "Arrested Development Has 8 of the Top 10 Best-Crafted Characters in TV Comedy",
    description: "Of the ten characters with the highest per-joke Craft scores on our index, eight come from one show. The Bluth family owns the craft leaderboard. The other two outliers — Ron Swanson and Creed Bratton — are revealing in their own right.",
    date: '2026-05-15',
    category: 'Analysis',
    readTime: '8 min read',
    stat: "8 of 10",
    statLabel: "AD characters in the craft top 10",
  },
  {
    slug: 'funniest-characters-cross-show',
    title: "George Costanza Just Beat Jerry Seinfeld for the Funniest Character in TV Comedy. Here's the Full Cross-Show Leaderboard.",
    description: "We finally have six shows scored under v2 consensus. George Costanza tops the cross-show WAR leaderboard at 1,181.9 — narrowly edging Jerry Seinfeld. Ron Swanson has the highest per-joke Craft score of any character on the index. Here's the top 25.",
    date: '2026-05-12',
    category: 'Analysis',
    readTime: '8 min read',
    stat: "1,181.9",
    statLabel: "George Costanza's career WAR",
  },
  {
    slug: 'character-comedy-spectrum',
    title: "Modern Sitcoms Are More Character-Driven Than the Classics",
    description: "Across 6 fully-scored shows, character_comedy is the most variable axis in our taxonomy \u2014 a 45-point spread. Schitt's Creek tells more character-driven jokes than Seinfeld. By a factor of nearly three.",
    date: '2026-05-03',
    category: 'Data Science',
    readTime: '7 min read',
    stat: "69.1%",
    statLabel: "Schitt's character comedy share",
  },
  {
    slug: 'schitts-creek-last-on-board-first-on-impact',
    title: "Schitt's Creek: Last on the Board, First on Impact",
    description: "Schitt's Creek scored the lowest of the five published shows when it debuted \u2014 but ranks #1 on Impact and #2 on Craft. One of the cleanest demonstrations our methodology has of why joke count alone is the wrong question.",
    date: '2026-05-02',
    category: 'Analysis',
    readTime: '7 min read',
    stat: "78.3",
    statLabel: "Schitt's Creek HI (#5)",
  },
  {
    slug: 'arrested-development-takes-the-crown',
    title: "Arrested Development Just Took the #1 Spot. The Gap to #2 Is the Biggest on the Board.",
    description: "Arrested Development debuts at 85.2 \u2014 4.65 points clear of Parks. That's twice the size of the gaps between #2 and #6 combined. Here's what's actually inside the gap.",
    date: '2026-05-04',
    category: 'Analysis',
    readTime: '8 min read',
    stat: "85.2",
    statLabel: "AD Humor Index (#1)",
  },
  {
    slug: 'parks-passes-office',
    title: 'Parks and Recreation Just Took the #1 Spot from The Office.',
    description: 'After scoring all 126 Parks and Rec episodes, Pawnee edges Scranton 80.55 to 80.22. The margin is inside our noise floor — but every secondary metric points the same direction, and Ron Swanson is now the highest-quality lead character on the site.',
    date: '2026-04-30',
    category: 'Analysis',
    readTime: '7 min read',
    stat: '80.55',
    statLabel: 'Parks Humor Index (#1)',
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
    title: 'We Fitted a Bayesian Model to 15,000 Jokes. Every Show Ranking Is Within Noise.',
    description: 'A hierarchical Bayesian model of joke impact on 15,000 jokes. Format effect: statistically zero. Top-tier shows\' credible intervals all overlap. 64% of joke-level variance is unexplained within-joke noise.',
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
    stat: '78.6 vs 77.8',
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

import { notFound } from 'next/navigation';
import Link from 'next/link';
import SocialShare from '@/components/ui/SocialShare';
import EndOfArticleCTA from '@/components/ui/EndOfArticleCTA';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const dynamicParams = false;

const POSTS: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}> = {
  'is-the-office-actually-funny': {
    title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.',
    description: 'We ran all 186 episodes of The Office through our AI comedy analyst. The results may surprise you.',
    date: '2026-04-10',
    category: 'Deep Dive',
    content: `
We set out to answer a simple question: **is The Office actually funny, or do we just love the characters?**

To find out, we built an AI comedy analyst that identifies and scores every joke in every episode. Not just the obvious punchlines — reaction shots, cringe beats, visual gags, Jim's camera looks, and uncomfortable silences all get counted and scored.

## The Methodology

Every joke gets two scores:
- **Craft** (1-10): How well-written is this joke? We measure originality, structure, character integration, economy of language, and whether the humor is earned or cheap.
- **Impact** (1-10): How hard does this land? Imagine 100 comedy-savvy viewers watching together — would the room erupt, chuckle, or sit in silence?

These feed into the **Humor Index**, our composite score on a 0-100 scale where 75 is average, 85+ is excellent, and 90+ is all-time great.

## What We Found

The Office Season 4 — widely considered the show's peak — averages an **80.6** across 14 episodes. That's solidly in "good" territory, with standout episodes pushing into the high 80s and low 90s.

But here's what surprised us: **the funniest episodes aren't always the ones you'd expect.**

"The Deposition" and "Did I Stutter?" tied for the top spot at **90.3** — beating fan favorite "Dinner Party" (88.1). Why? They have higher peak density — a larger percentage of their jokes score 7+ on both craft AND impact.

"Dinner Party" is iconic and quotable, but it has a different comedy profile: fewer total jokes, with longer cringe sequences that score incredibly high individually but lower the joke density.

## The Cringe Comedy Problem

This is the fundamental challenge of scoring The Office: its signature move — sustained, excruciating discomfort — doesn't play like traditional joke-based comedy.

A 3-minute scene where Michael shows off his tiny plasma TV isn't one joke. It's one long, beautiful nightmare. But in terms of our scoring, it counts the same as a quick one-liner.

We addressed this by weighting **peak density** (what percentage of jokes are elite-quality) more heavily than raw jokes-per-minute. This means an episode with 40 incredible jokes can outscore one with 70 mediocre ones.

## How The Office Compares

Against other shows we've analyzed, The Office holds up well:

- **The Office S4 average: 80.6**
- **30 Rock "Rosemary's Baby": 85.4** (a single episode, not a season average)
- **Two and a Half Men S12E08: 60.3**

30 Rock fires jokes at a machine-gun pace — nearly 3x the joke density of The Office. But The Office's best moments hit harder. It's the sniper rifle vs. machine gun debate, and our formula respects both styles.

## The Verdict

Yes, The Office is actually funny. Not just nostalgic, not just "comfortable TV" — genuinely, measurably funny. Its best episodes compete with the best comedy television has ever produced.

But it's also inconsistent. The gap between its best (90.3) and worst Season 4 episodes (61.0) is enormous. When The Office is on, it's transcendent. When it's off, it's coasting on goodwill.

*Full episode rankings and joke-by-joke breakdowns are available on our [show page](/shows/the-office).*
    `,
  },
  'how-we-score-comedy': {
    title: 'How We Score Comedy: The Math Behind the Humor Index',
    description: 'The complete breakdown of how we turn thousands of joke scores into a single number.',
    date: '2026-04-10',
    category: 'Methodology',
    content: `
The Humor Index isn't a single number — it's a composite of multiple measurements, each designed to capture a different dimension of comedy.

## The Components

**Craft Score (40% weight)**
Every joke is scored on five dimensions:
- Originality (25%): How novel is the comedic concept?
- Structure (25%): How well-built is the setup/payoff?
- Character Integration (20%): Could only THIS character deliver this joke?
- Economy (15%): Maximum funny per word?
- Earned vs. Cheap (15%): Genuine wit or lazy shortcuts?

We use a **top-weighted average**: the top 25% of jokes count for 40% of the effective craft score. This means a show with a few brilliant jokes and some mediocre filler can still score well — as long as the peaks are genuine peaks.

**Impact Score (35% weight)**
How big a reaction would this joke get from 100 comedy-savvy viewers? This is adjusted for show format — multi-camera sitcoms with sweetened laugh tracks get a 25% penalty, because the laugh track inflates perceived reactions.

**Peak Density (15% weight)**
What percentage of jokes are genuinely excellent (scoring 7+ on BOTH craft and impact)? This replaces raw jokes-per-minute as our density metric, because it measures quality density, not just volume.

**Weighted JPM (10% weight)**
Impact-weighted jokes per minute. A high-impact joke contributes more to this metric than a throwaway line. This still rewards joke density, but at a lower weight than our original formula.

**Memorability Bonus (up to +5 points)**
The average quotability score of the top 5 jokes, scaled to add up to 5 bonus points. Episodes that produce culturally memorable lines get a bump.

## The Display Scale

Raw scores (0-10) are converted to a 100-point display scale using fixed calibration:
- **90+**: All-time great episode
- **80-89**: Excellent comedy
- **70-79**: Good, solid episode
- **60-69**: Below average
- **Below 60**: Weak

These calibration points are fixed — they won't shift as we add more shows.

*See our full [methodology page](/methodology) for additional details.*
    `,
  },
  'comedy-war': {
    title: 'Michael Scott Is the Most Valuable Comedy Character in Television History',
    description: 'We built Comedy WAR — like baseball\'s WAR but for sitcom characters. When you adjust for show format, Michael Scott leads all characters at 451 WAR.',
    date: '2026-04-13',
    category: 'Data Science',
    content: `
We just launched **Comedy WAR** \u2014 a new metric inspired by baseball\u2019s Wins Above Replacement. And the first thing it revealed is that Jerry Seinfeld isn\u2019t just funny. He\u2019s the most valuable comedy character we\u2019ve ever measured.

## What Is Comedy WAR?

In baseball, WAR measures how many wins a player adds over a \u201Creplacement-level\u201D player \u2014 a generic minor leaguer you could call up for free. It captures total value: skill multiplied by volume.

Comedy WAR does the same thing. For every joke a character delivers, we calculate how much better it is than a \u201Creplacement-level\u201D joke \u2014 one with a craft score of 6.0 and an impact score of 6.0. That\u2019s competent but forgettable. The kind of joke a network sitcom writers\u2019 room produces on autopilot.

The formula:

**Joke WAR = (craft + impact - 12.0) / 10**

A joke scoring 8.0 craft and 7.5 impact contributes 0.35 WAR. A joke scoring 5.0 and 5.5 contributes -0.15 WAR \u2014 it\u2019s actively worse than replacement level.

Sum up every joke a character delivers, and you get their career Comedy WAR.

## The All-Time Leaderboard

Here are the most valuable comedy characters in our dataset:

- **Michael Scott \u2014 451.3 WAR** (3,265 jokes across 141 episodes)
- **Jerry Seinfeld \u2014 378.1 WAR** (format-adjusted, 172 episodes)
- **Dwight Schrute \u2014 354.5 WAR**
- **George Costanza \u2014 256.3 WAR** (format-adjusted)
- **Jim Halpert \u2014 233.0 WAR**
- **Kramer \u2014 125.4 WAR** (format-adjusted)
- **Pam Beesly \u2014 114.0 WAR**

Jerry\u2019s 824 WAR nearly **doubles** Michael Scott. That\u2019s not a close race.

## How Jerry Dominates

Three factors compound in Jerry\u2019s favor:

**1. Volume.** Jerry appears in every Seinfeld episode and is involved in more jokes than any other character. Michael Scott, despite being the lead of The Office, appears in fewer episodes (left after Season 7) and shares more screen time with the ensemble.

**2. Per-joke quality.** Seinfeld\u2019s average joke scores higher on both craft (7.0 vs 6.9) and impact (6.9 vs 6.7) than The Office\u2019s. Jerry\u2019s personal averages are even higher than the show average.

**3. The WAR multiplier.** Because WAR rewards every joke above replacement, a character who delivers 3,000+ above-average jokes accumulates massive value. It\u2019s the comedy equivalent of a player who hits .300 over 20 seasons versus one who hits .310 over 12.

## Michael Scott\u2019s Case

Michael Scott is undeniably iconic. His best moments \u2014 \u201CSnip snap!\u201D, the Dementors speech, \u201CThat\u2019s what she said\u201D \u2014 are some of the most quoted comedy in television history.

But WAR doesn\u2019t measure memorability. It measures **total comedy output above baseline.** And Michael\u2019s cringe comedy style is a double-edged sword: his jokes hit harder when they land (higher peak impact), but he also delivers more jokes that fall below the replacement threshold. Cringe humor is inherently more volatile than observational comedy.

Jerry, by contrast, is remarkably consistent. His observational style rarely produces clunkers. Almost every joke lands above replacement level, and they add up relentlessly.

## The George Costanza Surprise

The second-highest WAR belongs to George Costanza at 529.9 \u2014 higher than Michael Scott. George is the ultimate comedy utility player: neurotic rants, physical comedy, escalation, and some of the best-crafted dialogue exchanges in the show. His joke volume is massive, and his average quality is elite.

In baseball terms, George is the Mike Trout of sitcom comedy: consistently excellent across a long career.

## What WAR Tells Us That the Humor Index Doesn\u2019t

The Humor Index measures episode-level quality and penalizes inconsistency. WAR measures cumulative value and rewards volume.

This creates an interesting split:

- **The Office has a higher Humor Index** (81.0 vs 77.9) \u2014 its episodes are more consistently good
- **The Office has higher total WAR** (1,505 vs 826) \u2014 once format is adjusted, The Office produces nearly double the comedy value
- **Seinfeld has higher WAR per episode** (10.7 vs 8.1) \u2014 more above-replacement comedy per sitting

The Humor Index says The Office is the more reliable show. WAR says Seinfeld produces more comedy. Both are true. They\u2019re measuring different things.

## Negative WAR Episodes

Yes, they exist. \u201CCostume Contest\u201D (The Office S7E06) has a WAR of -1.3, meaning its jokes collectively scored *below* replacement level. The episode as a whole dragged the show\u2019s comedy value down.

This is WAR\u2019s harshest verdict: not just \u201Cnot great,\u201D but \u201Cactively worse than what a generic writers\u2019 room would have produced.\u201D

## The Bottom Line

Jerry Seinfeld is the GOAT of sitcom comedy by total value. Not the funniest single moment \u2014 that might belong to Michael Scott or Dwight or George. But the most valuable? The most consistently above-replacement across the longest career? That\u2019s Jerry, and it\u2019s not close.

*Explore WAR for every character: [The Office characters](/shows/the-office) \u2022 [Seinfeld characters](/shows/seinfeld)*
    `,
  },
  'seinfeld-vs-the-office': {
    title: 'Seinfeld Has Better Jokes. The Office Is Funnier. Here\'s Why.',
    description: 'Seinfeld wins on craft, impact, AND joke density. But The Office scores higher on our Humor Index. The math explains a fundamental truth about comedy.',
    date: '2026-04-12',
    category: 'Deep Dive',
    content: `
We just finished analyzing every episode of Seinfeld \u2014 all 172 of them, 8,625 jokes scored. And the first thing we did was the matchup everyone wants to see: **Seinfeld vs. The Office.**

The result is genuinely surprising.

## Seinfeld Wins Everything. Except the Humor Index.

Here are the head-to-head numbers:

- **Craft Score:** Seinfeld 7.0, The Office 6.9 \u2014 Seinfeld wins
- **Impact Score:** Seinfeld 6.9, The Office 6.7 \u2014 Seinfeld wins
- **Jokes Per Minute:** Seinfeld 2.6, The Office 2.4 \u2014 Seinfeld wins
- **IMDb Average:** Seinfeld 8.3, The Office 8.1 \u2014 Seinfeld wins

But the **Humor Index?** The Office 81.0, Seinfeld 77.9. The Office wins by 3.1 points.

How does a show lose every individual category and still win overall?

## The Consistency Gap

This is where it gets interesting. The Humor Index isn't just an average of craft, impact, and JPM. It weights **consistency** and **peak density** \u2014 how often a show reaches elite levels without dropping below average.

The key stat: **20% of Seinfeld episodes score below 70** on the Humor Index. For The Office, it's only **12%.**

Seinfeld has higher highs on a per-joke basis. But it also has more episodes where the comedy engine stalls. The Office is more reliable \u2014 fewer clunkers, more consistent output.

## The Baseball Analogy

Think of it like two baseball hitters:

**Seinfeld** is the power hitter who bats .280 with 45 home runs. When he connects, the ball leaves the stadium. But he also strikes out 180 times.

**The Office** is the contact hitter who bats .310 with 25 home runs. Fewer highlight-reel moments, but he gets on base almost every time.

The Humor Index rewards getting on base. Our formula values peak density (what percentage of jokes are elite) and consistency over raw per-joke averages. A show that delivers 8/10 comedy every episode beats one that alternates between 9/10 and 6/10.

## Why Seinfeld Is More Volatile

Seinfeld's format explains a lot of this. As a multi-camera sitcom, episodes are more structurally rigid \u2014 the A/B/C plot format means some storylines inevitably work better than others. When all three plots hit, you get "The Contest" or "The Marine Biologist." When one or two miss, the whole episode drags.

The Office's single-camera mockumentary format is more flexible. Even weak episodes have talking heads, reaction shots, and background gags that keep the joke density up. Michael Scott can save a bad plot just by being Michael Scott. Seinfeld's characters are funnier on average, but they can't carry a weak premise the same way.

## The Craft vs. System Debate

This gets at a deeper question about comedy: **is it better to have funnier jokes or a funnier system?**

Seinfeld has funnier jokes. Its writing staff produced some of the most technically brilliant comedy in television history. The craft scores prove this \u2014 Seinfeld's average joke is simply better-written than The Office's.

But The Office built a **funnier system.** The mockumentary format, the talking heads, the Jim camera looks, the sustained cringe sequences \u2014 these create comedy infrastructure that keeps producing laughs even when the writing dips. The system compensates for weak spots in ways Seinfeld's format can't.

## What This Means

Neither show is "better." They're optimizing for different things:

- **Seinfeld** optimizes for **peak comedy craft.** Its best moments are technically superior.
- **The Office** optimizes for **sustained comedic output.** Its average episode is more reliably funny.

The Humor Index slightly favors consistency over peaks, which is why The Office edges ahead. But reasonable people can disagree about whether a 7.0 craft score with more variance is better or worse than a 6.9 with less.

That's the whole point of The Humor Index \u2014 we give you the data, you make the argument.

*Explore the full data: [The Office](/shows/the-office) \u2022 [Seinfeld](/shows/seinfeld) \u2022 [Compare side by side](/compare/the-office-vs-seinfeld)*
    `,
  },
  'imdb-vs-humor-index': {
    title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?',
    description: 'We compared 591 episodes across The Office, Seinfeld, and Friends against IMDb audience ratings. Pooled correlation: r = -0.005. Audience scores and comedy craft are essentially unrelated.',
    date: '2026-04-12',
    category: 'Data Science',
    content: `
We integrated IMDb episode ratings across every analyzed show on The Humor Index. And the first thing we did was the obvious data science move: **how well do audience ratings predict our comedy scores?**

The answer: they don't. Not even close.

## The Numbers

Pooled across **591 episodes** of The Office, Seinfeld, and Friends, the Pearson correlation between the Humor Index and IMDb ratings is **r = −0.005** — indistinguishable from zero.

Per show, here's where it lands:

- **The Office** (186 eps): r = +0.164 — barely positive
- **Seinfeld** (170 eps): r = −0.058 — slightly negative
- **Friends** (235 eps): r = −0.013 — effectively zero

Across all three, IMDb explains essentially **0% of the variance** in our Humor Index scores.

In plain English: knowing an episode's IMDb rating tells you almost nothing about how funny it actually is by our analysis.

## Why This Matters

IMDb ratings measure **whether audiences enjoyed an episode**. That's a cocktail of plot quality, emotional resonance, character development, guest stars, and yes — comedy. When someone gives "Casino Night" a 9.3, they're rating the Jim/Pam moment at the end as much as any joke.

The Humor Index measures something narrower: **comedy craft and density**. How many jokes land? How well-constructed are they? How hard do they hit?

These are genuinely different questions, and our data proves it.

## The Biggest Disagreements

Some episodes where our AI sees comedy gold but audiences shrug:

- **"Angry Andy" (S8E21)** — Humor Index: 96.1, IMDb: 6.7. Packed with jokes, but the late-season Andy arc turned audiences off regardless of how many gags landed.
- **"Dinner Party" (S4E13)** — Humor Index: 100.0, IMDb: 7.6. Our highest-scoring episode ever is an IMDb 7.6. This is the cringe comedy paradox: brilliantly crafted discomfort that many viewers can't rewatch without covering their eyes.
- **"Andy's Ancestry" (S9E03)** — Humor Index: 95.0, IMDb: 7.1. Dense with character comedy, but S9 fatigue dragged audience scores down.

And episodes audiences adore that don't score as high on pure comedy:

- **"Casino Night" (S2E22)** — Humor Index: 71.5, IMDb: 9.3. The Jim/Pam poker scene is legendary television, but it's drama, not comedy. Our system correctly identifies this as a great episode with average joke density.
- **"The Inner Circle" (S7E22)** — Humor Index: 75.4, IMDb: 9.8. Will Ferrell episodes got a huge audience boost. The comedy itself is solid but not spectacular.
- **"Classy Christmas" (S7E11)** — Humor Index: 70.8, IMDb: 8.8. Holiday episodes get an emotional ratings bump that has nothing to do with joke quality.

## What Predicts IMDb Ratings?

We tested which of our sub-metrics best correlates with audience scores:

Within The Office specifically (where the correlation is highest):

- **Craft** (r = 0.22) — the strongest predictor, but still weak
- **Humor Index** (r = 0.16) — the composite score
- **Impact** (r = 0.11) — how hard jokes land
- **JPM** (r = -0.08) — joke density has *slightly negative* correlation with IMDb

That last one is fascinating. **More jokes per minute slightly predicts lower audience ratings.** This makes sense — episodes with the highest joke density often sacrifice plot and character moments. Audiences notice.

## Season-by-Season Patterns

The correlation varies wildly by season:

- **Season 7** has the strongest correlation (r = 0.40) — during Michael's farewell arc, funnier episodes also happen to be more emotionally satisfying
- **Seasons 3, 4, and 8** have negative correlations — audiences and our AI actively disagree about which episodes are best
- **Season 5** shows moderate alignment (r = 0.33)

## The Dinner Party Problem

"Dinner Party" perfectly illustrates why these metrics diverge. It scores a perfect 100 on our Humor Index — the highest-scoring episode we've ever analyzed. Every joke is meticulously crafted. The cringe comedy is operating at peak efficiency.

But on IMDb? A 7.6. Not bad, but far from The Office's best-rated episodes.

This is because "Dinner Party" is *uncomfortable*. It's bottle-episode cringe comedy that makes your skin crawl. Audiences rate it lower because watching Jan's Seychelles slideshow makes them physically squirm — even though, objectively, it's comedy writing at its absolute finest.

This is exactly what The Humor Index was built to measure. Not "did you enjoy this?" but "is this comedy operating at the highest possible level?"

## The Bottom Line

The Humor Index and IMDb are complementary, not competing metrics. IMDb tells you what audiences love. The Humor Index tells you what's actually funny.

Sometimes those overlap. Often, they don't. And the disagreements are where the most interesting conversations happen.

*Explore the data yourself — every episode now displays its IMDb rating alongside the Humor Index score. See where you agree with the crowd and where your taste diverges. [Start with The Office](/shows/the-office).*
    `,
  },
  'laugh-track-penalty': {
    title: 'Should Laugh Tracks Be Penalized? Our Data Says Yes.',
    description: 'Multi-camera sitcoms with sweetened laugh tracks score lower. Here is why.',
    date: '2026-04-10',
    category: 'Analysis',
    content: `
This is the most controversial part of our methodology, and we expect pushback. Here's our reasoning.

## The Format Coefficients

We apply a multiplier to impact scores based on show format:
- Single camera: 1.00 (no adjustment)
- Hybrid: 0.90
- Multi-camera live audience: 0.85
- Multi-camera sweetened (laugh track added in post): 0.75

A multi-camera sitcom with sweetened audio gets a 25% reduction on its impact scores. That's significant.

## Why This Is Fair

The impact score measures "how big of a reaction would this get from comedy-savvy viewers watching together?" But laugh tracks manipulate that measurement. Studies show that viewers rate jokes as funnier when accompanied by laughter — even when they can identify the laughter as canned.

A joke that gets a 7.0 impact on a sweetened show might only get a 5.25 in a silent room. The laugh track is doing 25% of the work.

Live audience shows get a smaller penalty (15%) because the laughter is real — but it still functions as a social cue that inflates perceived quality.

## The Counterargument

Multi-camera shows are *written for* the laugh track. The timing, the pauses, the delivery — everything is designed around those beats. Removing the laugh track from Seinfeld makes it feel awkward, not because the jokes are bad, but because the rhythm is wrong.

This is a valid point. We're penalizing a creative choice, not a quality deficit.

## Our Position

We're measuring the comedy writing, not the production format. A brilliantly written joke should score the same whether it's delivered in a single-camera mockumentary or a multi-camera studio. The format coefficient attempts to normalize for the amplification effect of laugh tracks.

Is 25% the right number? Honestly, we don't know. It's our best estimate based on audience research. We're transparent about this because we believe the debate itself is interesting.

*Disagree? We'd love to hear your argument. Reach out on [Twitter/X](https://twitter.com/thehumorindex).*
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [`/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`],
    },
    alternates: {
      canonical: `https://thehumorindex.com/blog/${params.slug}`,
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  // Simple markdown-like rendering
  const paragraphs = post.content.trim().split('\n\n');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { '@type': 'Person', name: 'Sam Slater' },
          publisher: {
            '@type': 'Organization',
            name: 'The Humor Index',
            logo: { '@type': 'ImageObject', url: 'https://thehumorindex.com/favicon-400.png' },
          },
          url: `https://thehumorindex.com/blog/${params.slug}`,
          image: `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`,
        }) }}
      />
      <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
        <Link href="/blog" className="hover:text-brand-text-secondary transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-brand-text-secondary">{post.category}</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5">
            {post.category}
          </span>
          <span className="text-xs text-brand-text-muted">{formatDate(post.date)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-brand-text-primary leading-tight mb-4">
          {post.title}
        </h1>
        <SocialShare
          title={post.title}
          text={post.description}
          url={`/blog/${params.slug}`}
        />
      </div>

      <article className="prose-custom space-y-4">
        {paragraphs.map((p, i) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={i} className="text-xl font-medium text-brand-text-primary mt-8 mb-3">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }

          // Inline formatting: bold, italic, links
          const formatInline = (text: string) => {
            return text.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-brand-text-primary font-medium">{part.slice(2, -2)}</strong>;
              }
              return part.split(/(\*[^*]+\*)/).map((sub, k) => {
                if (sub.startsWith('*') && sub.endsWith('*') && !sub.startsWith('**')) {
                  return <em key={k} className="text-brand-text-muted">{sub.slice(1, -1)}</em>;
                }
                return sub.split(/(\[[^\]]+\]\([^)]+\))/).map((linkPart, l) => {
                  const linkMatch = linkPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkMatch) {
                    return <Link key={l} href={linkMatch[2]} className="text-brand-gold hover:underline">{linkMatch[1]}</Link>;
                  }
                  return linkPart;
                });
              });
            });
          };

          if (trimmed.startsWith('- ')) {
            const items = trimmed.split('\n').filter(l => l.startsWith('- '));
            return (
              <ul key={i} className="space-y-1 ml-4">
                {items.map((item, j) => (
                  <li key={j} className="text-sm text-brand-text-secondary leading-relaxed list-disc">
                    {formatInline(item.replace(/^- /, ''))}
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={i} className="text-sm text-brand-text-secondary leading-relaxed">
              {formatInline(trimmed)}
            </p>
          );
        })}
      </article>

      <EndOfArticleCTA />

      {/* Related posts */}
      {(() => {
        const currentPost = POSTS[params.slug];
        if (!currentPost) return null;
        const related = Object.entries(POSTS)
          .filter(([slug]) => slug !== params.slug)
          .filter(([, p]) => p.category === currentPost.category)
          .slice(0, 2);
        // Fill with other posts if not enough in same category
        if (related.length < 2) {
          const others = Object.entries(POSTS)
            .filter(([slug]) => slug !== params.slug && !related.some(([s]) => s === slug))
            .slice(0, 2 - related.length);
          related.push(...others);
        }
        if (related.length === 0) return null;
        return (
          <div className="mt-10 border-t border-brand-border pt-8">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">You might also like</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(([slug, p]) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/40 transition-colors group"
                >
                  <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5">
                    {p.category}
                  </span>
                  <h3 className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mt-3 mb-1 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-brand-text-muted">{formatDate(p.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="mt-8 border-t border-brand-border pt-8">
        <Link href="/blog" className="text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}

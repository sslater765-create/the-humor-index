import { NextResponse } from 'next/server';

const POSTS = [
  { slug: 'arrested-development-craft-leaderboard', title: "Arrested Development Has 8 of the Top 10 Best-Crafted Characters in TV Comedy", description: "Eight of the ten characters with the highest per-joke Craft scores on our index come from one show. The Bluth family owns the craft leaderboard.", date: '2026-05-15' },
  { slug: 'funniest-characters-cross-show', title: "George Costanza Just Beat Jerry Seinfeld for the Funniest Character in TV Comedy. Here's the Full Cross-Show Leaderboard.", description: "Six shows fully scored. George Costanza tops cross-show WAR at 1,181.9, edging Jerry Seinfeld. Ron Swanson has the highest per-joke craft on the index.", date: '2026-05-12' },
  { slug: 'arrested-development-takes-the-crown', title: 'Arrested Development Just Took the #1 Spot. The Gap to #2 Is the Biggest on the Board.', description: "Arrested Development opens at 85.2 — a 4.7-point lead over Parks and Rec, larger than the entire 80.55–78.30 gap between #2 and #5.", date: '2026-05-04' },
  { slug: 'character-comedy-spectrum', title: 'Modern Sitcoms Are More Character-Driven Than the Classics', description: "Across six fully-scored shows, character-driven jokes account for 35–55% of every laugh. The newer the show, the higher that share runs.", date: '2026-05-03' },
  { slug: 'schitts-creek-last-on-board-first-on-impact', title: "Schitt's Creek: Last on the Board, First on Impact", description: "Schitt's Creek lands at #5 on the Humor Index, but on per-joke Impact it's tied for #1. Density vs. depth, explained.", date: '2026-05-02' },
  { slug: 'parks-passes-office', title: 'Parks and Recreation Just Took the #1 Spot from The Office.', description: "Parks passes The Office at 80.55 to 80.22 — but the gap is well inside both shows' 95% credible intervals.", date: '2026-04-30' },
  { slug: 'scorer-noise-floor', title: 'We Rescored 30 Episodes Twice. Our Single-Run Humor Index Has an ICC of 0.28.', description: "How we measured scorer noise, what it means for the rankings, and why we now run three independent passes per episode.", date: '2026-04-17' },
  { slug: 'bayesian-credible-intervals', title: 'We Fitted a Bayesian Model to 15,000 Jokes. Every Show Ranking Is Within Noise.', description: "A hierarchical model on 15,000 jokes (5,000 per scored show) finds all show-level differences sit inside their 95% credible intervals.", date: '2026-04-17' },
  { slug: 'comedy-war', title: 'Jerry Seinfeld Is the Most Valuable Comedy Character in Television History', description: "We built Comedy WAR — like baseball's WAR but for sitcom characters. (Updated April 19: George Costanza now leads after rescoring.)", date: '2026-04-16' },
  { slug: 'seinfeld-vs-the-office', title: "Seinfeld Just Passed The Office on Our Humor Index. Here's Why.", description: "Removing the multi-camera format coefficient lifted Seinfeld above The Office — and forced us to reconsider whether we should have applied the penalty at all.", date: '2026-04-16' },
  { slug: 'imdb-vs-humor-index', title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?', description: "We compared 591 episodes against IMDb ratings. The correlation? r = -0.005 — essentially zero.", date: '2026-04-12' },
  { slug: 'is-the-office-actually-funny', title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.', description: 'We ran every episode of The Office through our AI comedy analyst.', date: '2026-04-10' },
  { slug: 'how-we-score-comedy', title: 'How We Score Comedy: The Math Behind the Humor Index', description: "The complete breakdown of how we turn thousands of joke scores into a single number.", date: '2026-04-10' },
  { slug: 'laugh-track-penalty', title: 'Should Laugh Tracks Be Penalized? Our Data Says Yes. [Retracted]', description: "Originally argued for a multi-cam Impact penalty. Retracted — see the Seinfeld vs. The Office post for the reasoning behind removing it.", date: '2026-04-10' },
];

export async function GET() {
  const items = POSTS.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://thehumorindex.com/blog/${post.slug}/</link>
      <guid>https://thehumorindex.com/blog/${post.slug}/</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate>
    </item>`).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Humor Index</title>
    <link>https://thehumorindex.com</link>
    <description>AI-powered comedy analytics ranking every joke in television history.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://thehumorindex.com/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

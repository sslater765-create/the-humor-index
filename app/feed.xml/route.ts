import { NextResponse } from 'next/server';

const POSTS = [
  { slug: 'comedy-war', title: 'Michael Scott Is the Most Valuable Comedy Character in Television History', description: "We built Comedy WAR — like baseball's WAR but for sitcom characters.", date: '2026-04-13' },
  { slug: 'seinfeld-vs-the-office', title: "Seinfeld Has Better Jokes. The Office Is Funnier. Here's Why.", description: 'Seinfeld wins on craft, impact, AND joke density. But The Office scores higher.', date: '2026-04-12' },
  { slug: 'imdb-vs-humor-index', title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?', description: 'We compared 186 episodes against IMDb ratings. The correlation? Almost zero.', date: '2026-04-12' },
  { slug: 'is-the-office-actually-funny', title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.', description: 'We ran all 186 episodes through our AI comedy analyst.', date: '2026-04-10' },
  { slug: 'how-we-score-comedy', title: 'How We Score Comedy: The Math Behind the Humor Index', description: "The complete breakdown of how we turn thousands of joke scores into a single number.", date: '2026-04-10' },
  { slug: 'laugh-track-penalty', title: 'Should Laugh Tracks Be Penalized? Our Data Says Yes.', description: "Multi-camera sitcoms with sweetened laugh tracks score 25% lower.", date: '2026-04-10' },
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

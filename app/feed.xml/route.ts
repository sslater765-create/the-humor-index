import { NextResponse } from 'next/server';
import { POSTS as POST_DATA } from '@/app/blog/posts';

// Built from posts.ts so retired posts drop out of the feed automatically.
const POSTS = Object.entries(POST_DATA)
  .map(([slug, post]) => ({ slug, title: post.title, description: post.description, date: post.date }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export async function GET() {
  const items = POSTS.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://www.thehumorindex.com/blog/${post.slug}/</link>
      <guid>https://www.thehumorindex.com/blog/${post.slug}/</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate>
    </item>`).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Humor Index</title>
    <link>https://www.thehumorindex.com</link>
    <description>AI-powered comedy analytics ranking every joke in television history.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://www.thehumorindex.com/feed.xml" rel="self" type="application/rss+xml"/>
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

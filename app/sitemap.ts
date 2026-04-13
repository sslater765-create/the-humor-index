import type { MetadataRoute } from 'next';
import { getAllShows, getEpisodes, getCharacters } from '@/lib/data';

// Blog post slugs — keep in sync with app/blog/[slug]/page.tsx
const BLOG_SLUGS = [
  'comedy-war',
  'seinfeld-vs-the-office',
  'imdb-vs-humor-index',
  'is-the-office-actually-funny',
  'how-we-score-comedy',
  'laugh-track-penalty',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thehumorindex.com';
  const shows = await getAllShows();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/shows`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/rankings/funniest-episodes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/rankings/best-jokes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/rankings/funniest-characters`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/request`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Show pages
  const showPages: MetadataRoute.Sitemap = shows.map(show => ({
    url: `${baseUrl}/shows/${show.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Episode pages + character pages
  const episodePages: MetadataRoute.Sitemap = [];
  const characterPages: MetadataRoute.Sitemap = [];

  for (const show of shows) {
    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        episodePages.push({
          url: `${baseUrl}/shows/${show.slug}/${ep.season}/${ep.episode_number}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        });
      }
    } catch { /* No episode data */ }

    try {
      const characters = await getCharacters(show.slug);
      for (const ch of characters.slice(0, 20)) {
        characterPages.push({
          url: `${baseUrl}/shows/${show.slug}/characters/${encodeURIComponent(ch.name)}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        });
      }
    } catch { /* No character data */ }
  }

  // Compare matchups for analyzed shows
  const analyzed = shows.filter(s => s.humor_index > 0);
  const comparePages: MetadataRoute.Sitemap = [];
  for (const a of analyzed) {
    for (const b of analyzed) {
      if (a.slug !== b.slug) {
        comparePages.push({
          url: `${baseUrl}/compare/${a.slug}-vs-${b.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        });
      }
    }
  }

  return [...staticPages, ...blogPages, ...showPages, ...episodePages, ...characterPages, ...comparePages];
}

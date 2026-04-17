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

  // Canonicals use trailing slash; keep sitemap consistent with canonical tags.
  const url = (path: string) => `${baseUrl}${path}${path.endsWith('/') ? '' : '/'}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 1.0 },
    { url: url('/shows'), lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/rankings'), lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/funniest-episodes'), lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/best-jokes'), lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/funniest-characters'), lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/compare'), lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/blog'), lastModified: new Date('2026-04-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/search'), lastModified: new Date('2026-04-16'), changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/methodology'), lastModified: new Date('2026-04-16'), changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/request'), lastModified: new Date('2026-04-16'), changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/faq'), lastModified: new Date('2026-04-16'), changeFrequency: 'monthly', priority: 0.5 },
    { url: url('/about'), lastModified: new Date('2026-04-16'), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Blog posts
  const blogDates: Record<string, string> = {
    'comedy-war': '2026-04-13',
    'seinfeld-vs-the-office': '2026-04-12',
    'imdb-vs-humor-index': '2026-04-12',
    'is-the-office-actually-funny': '2026-04-10',
    'how-we-score-comedy': '2026-04-10',
    'laugh-track-penalty': '2026-04-10',
  };

  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map(slug => ({
    url: url(`/blog/${slug}`),
    lastModified: new Date(blogDates[slug] || '2026-04-16'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Show pages + per-show sub-pages
  const showPages: MetadataRoute.Sitemap = [];
  const episodePages: MetadataRoute.Sitemap = [];
  const characterPages: MetadataRoute.Sitemap = [];
  const arcPages: MetadataRoute.Sitemap = [];

  for (const show of shows) {
    showPages.push({
      url: url(`/shows/${show.slug}`),
      lastModified: new Date('2026-04-16'),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Arc page only exists for shows with data
    if (show.humor_index > 0) {
      arcPages.push({
        url: url(`/shows/${show.slug}/arc`),
        lastModified: new Date('2026-04-16'),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        episodePages.push({
          url: url(`/shows/${show.slug}/${ep.season}/${ep.episode_number}`),
          lastModified: new Date('2026-04-16'),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    } catch { /* no episode data */ }

    try {
      const characters = await getCharacters(show.slug);
      for (const ch of characters) {
        characterPages.push({
          url: url(`/shows/${show.slug}/characters/${encodeURIComponent(ch.name)}`),
          lastModified: new Date('2026-04-16'),
          changeFrequency: 'monthly',
          priority: 0.5,
        });
      }
    } catch { /* no character data */ }
  }

  // Compare matchups — ONE PER UNORDERED PAIR (alpha-first); matches canonical
  const analyzed = shows.filter(s => s.humor_index > 0).map(s => s.slug).sort();
  const comparePages: MetadataRoute.Sitemap = [];
  for (let i = 0; i < analyzed.length; i++) {
    for (let j = i + 1; j < analyzed.length; j++) {
      comparePages.push({
        url: url(`/compare/${analyzed[i]}-vs-${analyzed[j]}`),
        lastModified: new Date('2026-04-16'),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return [...staticPages, ...blogPages, ...showPages, ...arcPages, ...episodePages, ...characterPages, ...comparePages];
}

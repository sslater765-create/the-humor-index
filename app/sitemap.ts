import type { MetadataRoute } from 'next';
import { getAllShows, getEpisodes, getCharacters } from '@/lib/data';
import { ARCHES } from '@/lib/comedyDna';
import { POSTS } from '@/app/blog/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.thehumorindex.com';
  const shows = await getAllShows();

  // Canonicals use trailing slash; keep sitemap consistent with canonical tags.
  const url = (path: string) => `${baseUrl}${path}${path.endsWith('/') ? '' : '/'}`;

  // Use a single rolling "freshness" date for pages that are refreshed every
  // time the underlying data is. Update this when major changes ship.
  const SITE_REFRESHED = new Date('2026-06-09');
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 1.0 },
    { url: url('/shows'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/explore'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/funniest-episodes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/jokes-per-minute'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/worst-episodes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/best-jokes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/funniest-characters'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/least-funny-characters'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/compare'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/comedy-dna'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.8 },
    ...ARCHES.map(a => ({ url: url(`/comedy-dna/${a.slug}`), lastModified: SITE_REFRESHED, changeFrequency: 'monthly' as const, priority: 0.6 })),
    { url: url('/blog'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/search'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/methodology'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/request'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/faq'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.5 },
    { url: url('/about'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Blog posts — derived from the POSTS source of truth (no parallel slug/date list).
  const blogPages: MetadataRoute.Sitemap = Object.entries(POSTS).map(([slug, post]) => ({
    url: url(`/blog/${slug}`),
    lastModified: new Date(post.date || '2026-04-16'),
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
      lastModified: SITE_REFRESHED,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Arc + episodes-ranked pages only exist for shows with data
    if (show.humor_index > 0) {
      arcPages.push({
        url: url(`/shows/${show.slug}/arc`),
        lastModified: SITE_REFRESHED,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
      arcPages.push({
        url: url(`/shows/${show.slug}/episodes-ranked`),
        lastModified: SITE_REFRESHED,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
      arcPages.push({
        url: url(`/shows/${show.slug}/explore`),
        lastModified: SITE_REFRESHED,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        episodePages.push({
          url: url(`/shows/${show.slug}/${ep.season}/${ep.episode_number}`),
          lastModified: SITE_REFRESHED,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    } catch { /* no episode data */ }

    try {
      const characters = await getCharacters(show.slug);
      for (const ch of characters) {
        // Skip thin/bit-part character pages (e.g. "Warehouse worker", one-liners)
        // — they dilute crawl budget and read as thin content at scale.
        if ((ch.total_jokes ?? 0) < 20 || (ch.episodes_appeared ?? 0) < 3) continue;
        characterPages.push({
          url: url(`/shows/${show.slug}/characters/${encodeURIComponent(ch.name)}`),
          lastModified: SITE_REFRESHED,
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
        lastModified: SITE_REFRESHED,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return [...staticPages, ...blogPages, ...showPages, ...arcPages, ...episodePages, ...characterPages, ...comparePages];
}

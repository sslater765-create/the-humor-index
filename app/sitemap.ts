import type { MetadataRoute } from 'next';
import { getAllShows, getEpisodes, getCharacters } from '@/lib/data';
import { ARCHES } from '@/lib/comedyDna';
import { POSTS } from '@/app/blog/posts';
import { SITE_URL } from '@/lib/site';
import { isAwaitingRescore } from '@/lib/scale';
import { getMovies } from '@/lib/movies';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = `${SITE_URL}`;
  const shows = await getAllShows();

  // Canonicals use trailing slash; keep sitemap consistent with canonical tags.
  const url = (path: string) => `${baseUrl}${path}${path.endsWith('/') ? '' : '/'}`;

  // Use a single rolling "freshness" date for pages that are refreshed every
  // time the underlying data is. Update this when major changes ship.
  const SITE_REFRESHED = new Date('2026-11-17');
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 1.0 },
    { url: url('/shows'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/50-funniest-episodes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/explore'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/funniest-episodes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/jokes-per-minute'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/worst-episodes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/index-vs-imdb'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/running-gags'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/why'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/rankings/running-gags/bracket'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.6 },
    { url: url('/draft'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/rankings/most-rewatchable'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/study'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.5 },
    { url: url('/people'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/changelog'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.5 },
    { url: url('/rankings/best-jokes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/funniest-characters'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/best-christmas-episodes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/rankings/best-thanksgiving-episodes'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rankings/least-funny-characters'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/movies'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.9 },
    ...(await getMovies()).flatMap(m => [
      { url: url(`/movies/${m.slug}`), lastModified: SITE_REFRESHED, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: url(`/movies/${m.slug}/quotes`), lastModified: SITE_REFRESHED, changeFrequency: 'monthly' as const, priority: 0.8 },
    ]),
    { url: url('/compare'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/comedy-dna'), lastModified: SITE_REFRESHED, changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/agree'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/cards'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.6 },
    { url: url('/data'), lastModified: SITE_REFRESHED, changeFrequency: 'weekly', priority: 0.7 },
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

  // Only pages with real data go in the sitemap. In May, Search Console had
  // ~76 of ~1,736 submitted URLs indexed, so every thin URL listed here costs
  // crawl time the strong pages need. Queued shows are noindexed and left out.
  for (const show of shows) {
    if (!show.humor_index || show.humor_index <= 0) continue;
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
        url: url(`/shows/${show.slug}/best-jokes`),
        lastModified: SITE_REFRESHED,
        changeFrequency: 'weekly',
        priority: 0.8,
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
        // Same bar as the page's own noindex rule. Recurring guests (Janice,
        // Judy Geller, Steinbrenner, Dr. Drew) fall under 50 jokes but draw
        // real name searches, so a stricter sitemap cut costs traffic.
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
  // Same-scale pairs only: cross-scale pairs are noindexed on the page.
  const analyzed = shows.filter(s => s.humor_index > 0 && !isAwaitingRescore(s.slug)).map(s => s.slug).sort();
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

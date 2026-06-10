import type { Metadata } from 'next';
import { SITE_URL, canonical, absUrl } from './site';

/**
 * Build a full Next `Metadata` object (canonical + OpenGraph + Twitter together)
 * from one set of inputs, so pages stop hand-repeating the three-block shape and
 * can never set OG without Twitter again.
 */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;            // e.g. '/shows/the-office'
  ogTitle?: string;
  ogImage?: string;        // path or absolute URL
  noindex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const { title, description, path, ogTitle = title, ogImage, noindex, type = 'website' } = opts;
  const images = ogImage ? [ogImage] : undefined;
  return {
    title,
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: canonical(path) },
    openGraph: { title: ogTitle, description, type, url: canonical(path), images },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images },
  };
}

// ---- JSON-LD builders (return plain objects; render with JSON.stringify) ----

export const breadcrumbJsonLd = (crumbs: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: canonical(c.path),
  })),
});

export const tvSeriesJsonLd = (show: {
  name: string; slug: string; description: string; backdrop_path?: string;
  total_seasons: number; total_episodes: number; humor_index: number;
}, ratingCount: number) => ({
  '@context': 'https://schema.org',
  '@type': 'TVSeries',
  name: show.name,
  url: canonical(`/shows/${show.slug}`),
  description: show.description,
  image: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : undefined,
  numberOfSeasons: show.total_seasons,
  numberOfEpisodes: show.total_episodes,
  aggregateRating: show.humor_index > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: show.humor_index,
    bestRating: 100,
    worstRating: 0,
    ratingCount: ratingCount || show.total_seasons,
  } : undefined,
});

export { SITE_URL, canonical, absUrl };

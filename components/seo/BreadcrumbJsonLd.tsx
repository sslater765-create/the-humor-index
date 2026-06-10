import { SITE_URL } from '@/lib/site';
interface Crumb {
  name: string;
  /** Absolute or root-relative path; will be normalized to an absolute URL with a trailing slash. */
  path: string;
}

const SITE = `${SITE_URL}`;

function toUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`;
  return `${SITE}${withSlash}`;
}

/**
 * Emits BreadcrumbList JSON-LD for breadcrumb rich results in search.
 * Use on rankings sub-pages and blog posts (show/episode/character pages
 * already emit their own breadcrumbs inline).
 */
export default function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: toUrl(c.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

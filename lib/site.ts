// Single source of truth for the site's origin and URL construction.
// Centralizing this is what makes a host change (e.g. www vs non-www) a
// one-line edit instead of a 90-file find-and-replace.

export const SITE_URL = 'https://www.thehumorindex.com';

/** Absolute URL for a path, no trailing-slash normalization. */
export const absUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Canonical URL for a path — adds a trailing slash to match next.config
 * `trailingSlash: true`, so canonical tags never disagree with the served URL.
 */
export const canonical = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p.endsWith('/') ? p : `${p}/`}`;
};

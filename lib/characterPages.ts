import pages from './character-pages.json';

const BY_SHOW: Record<string, Map<string, string>> = {};
for (const [slug, names] of Object.entries(pages as Record<string, string[]>)) {
  BY_SHOW[slug] = new Map(names.map(n => [n.toLowerCase(), n]));
}

/**
 * Link to a character's page, or null when that character has no page (bit
 * parts, "Announcer", combined speakers like "Mac/Charlie"). Render plain text
 * for null: a link there is a 404.
 */
export function characterHref(showSlug: string | undefined | null, name: string | undefined | null): string | null {
  if (!showSlug || !name) return null;
  const canonical = BY_SHOW[showSlug]?.get(name.trim().toLowerCase());
  return canonical ? `/shows/${showSlug}/characters/${encodeURIComponent(canonical)}/` : null;
}

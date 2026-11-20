/**
 * Corrections to character names and actors from the scoring export. Searchers
 * use the full name ("janice hosenstein", "craig middlebrooks"), so the page
 * title needs it. Keyed by `${showSlug}:${character.name}`.
 */
export const CHARACTER_OVERRIDES: Record<string, { full?: string; actor?: string }> = {
  'friends:Janice': { full: 'Janice Hosenstein' },
  'friends:Ursula': { full: 'Ursula Buffay', actor: 'Lisa Kudrow' },
  'parks-and-recreation:Craig': { full: 'Craig Middlebrooks' },
  'its-always-sunny:Artemis': { full: 'Artemis Dubois' },
  'its-always-sunny:The Waitress': { full: 'The Waitress' },
  'its-always-sunny:Bonnie': { full: 'Bonnie Kelly' },
  'the-office:Robert': { full: 'Robert California', actor: 'James Spader' },
  'community:Leonard': { full: 'Leonard Rodriguez' },
  'seinfeld:Peterman': { full: 'J. Peterman', actor: "John O'Hurley" },
  'seinfeld:Steinbrenner': { full: 'George Steinbrenner', actor: 'Larry David (voice)' },
  '30-rock:Criss': { full: 'Criss Chros' },
};

export function applyCharacterOverride<T extends { name: string; character_full_name?: string | null; actor?: string | null }>(slug: string, c: T): T {
  const o = CHARACTER_OVERRIDES[`${slug}:${c.name}`];
  if (!o) return c;
  return { ...c, character_full_name: o.full ?? c.character_full_name, actor: o.actor ?? c.actor };
}

import type { ShowScore } from './types';

// Which show a blog post is about, for its cover image. Most posts name the show
// in the title; the rest are listed by hand. Methodology posts have no show and
// keep the plain gradient.
const BY_SLUG: Record<string, string> = {
  'friends-most-jokes-ranked-eleventh': 'friends',
  'chappelles-show-sketch-advantage': 'chappelles-show',
  'most-quotable-show': '30-rock',
  'most-consistent-show': 'parks-and-recreation',
  'pilots-score-below-their-show': 'seinfeld',
  'callbacks-score-higher': 'arrested-development',
  'which-joke-types-score-highest': 'its-always-sunny',
  'after-the-creator-left': 'veep',
  'the-office-after-michael': 'the-office',
  'what-the-rescore-changed': 'the-office',
  'first-season-is-the-worst': 'parks-and-recreation',
  'parks-improved-every-season': 'parks-and-recreation',
  'arrested-development-netflix-seasons': 'arrested-development',
  'density-vs-craft': 'broad-city',
  'is-the-office-actually-funny': 'the-office',
  'always-sunny-fewer-jokes-better-with-age': 'its-always-sunny',
  'index-is-wrong-about-the-banana-stand': 'arrested-development',
};

export function coverFor(slug: string, title: string, shows: ShowScore[]): { slug: string; name: string; backdrop: string } | null {
  let showSlug = BY_SLUG[slug];
  if (!showSlug) {
    const t = title.toLowerCase();
    const hit = [...shows].sort((a, b) => b.name.length - a.name.length).find(s => t.includes(s.name.toLowerCase()));
    showSlug = hit?.slug ?? '';
  }
  const s = shows.find(x => x.slug === showSlug);
  return s?.backdrop_path ? { slug: s.slug, name: s.name, backdrop: s.backdrop_path } : null;
}

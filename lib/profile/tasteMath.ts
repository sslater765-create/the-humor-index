// Pure helpers shared by the client diary and the server-rendered public profile.

/** Pearson r between the user's stars and the Humor Index of what they logged. */
export function tasteVsIndex(logs: { stars: number | null; hi?: number | null }[]): { r: number; n: number } | null {
  const pts = logs.filter((l) => l.stars !== null && l.hi !== null && l.hi !== undefined) as { stars: number; hi: number }[];
  if (pts.length < 5) return null;
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.stars, 0) / n;
  const my = pts.reduce((s, p) => s + p.hi, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of pts) {
    sxy += (p.stars - mx) * (p.hi - my);
    sxx += (p.stars - mx) ** 2;
    syy += (p.hi - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return { r: sxy / Math.sqrt(sxx * syy), n };
}

export function starText(stars: number | null): string {
  if (stars === null) return '';
  const full = Math.floor(stars);
  return '★'.repeat(full) + (stars - full >= 0.5 ? '½' : '');
}

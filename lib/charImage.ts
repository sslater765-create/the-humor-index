// Resolve a character portrait <img> src.
//
// Most character photos come from TMDB, where `profile_path` is a bare suffix
// like "/abc123.jpg" that needs the TMDB CDN prefix. But some characters have
// no TMDB headshot (e.g. Mocha Joe / Saverio Guerra), so we host a local
// override under /public/characters/. Those — and any absolute URL — pass
// through untouched.
export function charImageSrc(profilePath?: string | null): string | undefined {
  if (!profilePath) return undefined;
  if (profilePath.startsWith('http') || profilePath.startsWith('/characters/')) {
    return profilePath;
  }
  return `https://image.tmdb.org/t/p/w185${profilePath}`;
}

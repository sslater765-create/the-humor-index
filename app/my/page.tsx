import { getSiteStats } from '@/lib/siteStats';
import { getComedyDnaFingerprints, getEpisodes, getAllShows } from '@/lib/data';
import { normalizeFingerprints, meanFingerprint, buildWeights } from '@/lib/comedyDna';
import { pageMeta } from '@/lib/seo';
import MyIndex from '@/components/my/MyIndex';
import MySocial from '@/components/my/MySocial';
import { getMovies } from '@/lib/movies';

export const dynamic = 'force-static';

export const metadata = pageMeta({
  title: 'My Humor Index: Your Comedy Taste Profile',
  description:
    'Rate the sitcoms you’ve seen and get a personalized comedy taste profile: your archetype, shows ranked for you, and a watchlist of what to watch next. Keep a diary, make lists, share a profile.',
  path: '/my',
  noindex: true, // personal, per-device — nothing for crawlers to index
});

export interface MyShow {
  slug: string; name: string; hi: number; poster: string | null; eps: number; network: string;
}

export default async function MyPage() {
  const [stats, allFps] = await Promise.all([getSiteStats(), getComedyDnaFingerprints()]);
  // My Index rates shows you've watched; movies aren't in it yet.
  const rawFps = allFps.filter(f => !f.href);

  // "eps" = episodes we scored (clip shows dropped, hour-longs counted once),
  // so it matches the show page rather than the aired total.
  const shows: MyShow[] = await Promise.all(stats.leaderboard.map(async s => ({
    slug: s.slug,
    name: s.name,
    hi: s.humor_index,
    poster: s.poster_path ?? null,
    eps: await getEpisodes(s.slug).then(e => e.length).catch(() => s.total_episodes ?? 0),
    network: s.network ?? '',
  })));

  // Posters for diary rows: shows by slug, movies by slug.
  const posters: Record<string, string> = {};
  for (const s of shows) if (s.poster) posters[`show:${s.slug}`] = s.poster;
  for (const s of await getAllShows()) if (s.poster_path && !posters[`show:${s.slug}`]) posters[`show:${s.slug}`] = s.poster_path;
  for (const m of await getMovies()) if (m.poster_path) posters[`movie:${m.slug}`] = m.poster_path;

  const fps = normalizeFingerprints(rawFps);
  const meanFp = meanFingerprint(fps);
  const weights = buildWeights(meanFp);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-2">Your Profile</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary mb-3">My Humor Index</h1>
        <p className="text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
          Rate the shows you’ve seen and we’ll read your taste off the joke-type fingerprints behind
          the Index, then rank every other show <em>for you</em>. Sign in to keep a diary of what you
          watch, make lists, and share a public profile if you want one.
        </p>
      </header>

      {/* Diary first: for signed-in readers it's the part that changes visit to visit.
          Signed out it collapses to a one-line prompt. */}
      <div className="mb-14">
        <MySocial posters={posters} />
      </div>

      <MyIndex
        shows={shows}
        fps={fps.map(f => ({ slug: f.slug, fp: f.fp, n: f.n }))}
        meanFp={meanFp}
        weights={weights}
      />
    </main>
  );
}

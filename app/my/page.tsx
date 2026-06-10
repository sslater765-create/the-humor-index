import { getSiteStats } from '@/lib/siteStats';
import { getComedyDnaFingerprints } from '@/lib/data';
import { normalizeFingerprints, meanFingerprint, buildWeights } from '@/lib/comedyDna';
import { pageMeta } from '@/lib/seo';
import MyIndex from '@/components/my/MyIndex';

export const dynamic = 'force-static';

export const metadata = pageMeta({
  title: 'My Humor Index — Your Comedy Taste Profile',
  description:
    'Rate the sitcoms you’ve seen and get a personalized comedy taste profile: your archetype, shows ranked for you, and a watchlist of what to watch next. Saved privately on your device.',
  path: '/my',
  noindex: true, // personal, per-device — nothing for crawlers to index
});

export interface MyShow {
  slug: string; name: string; hi: number; poster: string | null; eps: number; network: string;
}

export default async function MyPage() {
  const [stats, rawFps] = await Promise.all([getSiteStats(), getComedyDnaFingerprints()]);

  const shows: MyShow[] = stats.leaderboard.map(s => ({
    slug: s.slug,
    name: s.name,
    hi: s.humor_index,
    poster: s.poster_path ?? null,
    eps: s.total_episodes ?? 0,
    network: s.network ?? '',
  }));

  const fps = normalizeFingerprints(rawFps);
  const meanFp = meanFingerprint(fps);
  const weights = buildWeights(meanFp);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-2">Your Profile</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary mb-3">My Humor Index</h1>
        <p className="text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
          Rate the shows you’ve seen — we’ll read your taste off the joke-type fingerprints behind
          the Index and rank every other show <em>for you</em>. Everything here is stored privately on
          this device; no account, no sign-in.
        </p>
      </header>

      <MyIndex
        shows={shows}
        fps={fps.map(f => ({ slug: f.slug, fp: f.fp, n: f.n }))}
        meanFp={meanFp}
        weights={weights}
      />
    </main>
  );
}

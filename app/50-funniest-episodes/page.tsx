import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SITE_URL } from '@/lib/site';
import NewsletterCTA from '@/components/NewsletterCTA';

export const dynamic = 'force-static';

const TITLE = 'The 50 Funniest TV Episodes of All Time, Ranked';
const DESC =
  'We scored every joke in 2,000+ comedy episodes across 40+ shows. These are the 50 highest-rated episodes ever made on the Humor Index — capped at four per show, so it is a canon, not one sitcom’s highlight reel.';

export async function generateMetadata() {
  const canonical = `${SITE_URL}/50-funniest-episodes/`;
  const ogImg = `/api/og?title=${encodeURIComponent('50 Funniest Episodes of All Time')}&score=${encodeURIComponent('Ranked')}&subtitle=${encodeURIComponent('Every joke scored')}`;
  return {
    title: `${TITLE} | The Humor Index`,
    description: DESC,
    alternates: { canonical },
    openGraph: { title: TITLE, description: DESC, images: [ogImg] },
    twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: [ogImg] },
  };
}

type Row = {
  show: string;
  slug: string;
  season: number;
  episode: number;
  title: string;
  humor_index: number;
  total_jokes: number;
};

export default async function FunniestEpisodesPage() {
  const shows = (await getAllShows()).filter(s => s.humor_index > 0);

  const all: Row[] = [];
  for (const s of shows) {
    try {
      const eps = await getEpisodes(s.slug);
      for (const e of eps) {
        if (e.humor_index > 0) {
          all.push({
            show: s.name,
            slug: s.slug,
            season: e.season,
            episode: e.episode_number,
            title: e.title,
            humor_index: e.humor_index,
            total_jokes: e.total_jokes,
          });
        }
      }
    } catch {
      /* show has no episode data yet */
    }
  }

  all.sort((a, b) => b.humor_index - a.humor_index);

  // Cap at 4 per show so the list spans the comedy canon instead of one sitcom.
  const perShow: Record<string, number> = {};
  const top: Row[] = [];
  for (const r of all) {
    if ((perShow[r.show] ?? 0) < 4) {
      top.push(r);
      perShow[r.show] = (perShow[r.show] ?? 0) + 1;
    }
    if (top.length === 50) break;
  }

  const showCount = new Set(top.map(r => r.show)).size;
  const no1 = top[0];

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: TITLE,
    description: DESC,
    numberOfItems: top.length,
    itemListElement: top.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${r.show} — ${r.title} (S${r.season}E${r.episode})`,
      url: `${SITE_URL}/shows/${r.slug}/${r.season}/${r.episode}`,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-brand-gold mb-4">
        Special Report
      </p>
      <h1 className="font-serif italic text-4xl sm:text-6xl text-brand-text-primary leading-[1.05] mb-5">
        The 50 Funniest TV Episodes<br className="hidden sm:block" /> of All Time, Ranked
      </h1>
      <p className="text-base sm:text-lg text-brand-text-secondary leading-relaxed max-w-2xl mb-8">
        We scored every joke in 2,000+ comedy episodes across 40+ shows — each rated on density,
        craft, and impact — to settle the argument with data instead of nostalgia. Here are the 50
        highest-rated episodes ever made, capped at four per show so it&apos;s a canon, not one
        sitcom&apos;s highlight reel.
      </p>

      {no1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-brand-card border border-brand-border rounded-xl p-4">
            <p className="font-serif italic text-2xl sm:text-3xl text-brand-gold leading-none">
              {formatIndex(no1.humor_index)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-2">
              Top score — {no1.show}
            </p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-xl p-4">
            <p className="font-serif italic text-2xl sm:text-3xl text-brand-gold leading-none">
              {showCount}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-2">
              Shows in the top 50
            </p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="font-serif italic text-2xl sm:text-3xl text-brand-gold leading-none">
              {shows.length}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-2">
              Shows fully scored
            </p>
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {top.map((r, i) => (
          <li key={`${r.slug}-${r.season}-${r.episode}`}>
            <Link
              href={`/shows/${r.slug}/${r.season}/${r.episode}`}
              className="flex items-center gap-4 p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
            >
              <span
                className={`font-mono text-sm w-7 text-right shrink-0 ${
                  i === 0 ? 'text-brand-gold' : 'text-brand-text-muted'
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                  <span className="font-medium">{r.show}</span>{' '}
                  <span className="text-brand-text-muted">— {r.title}</span>
                </p>
                <p className="text-xs text-brand-text-muted mt-0.5 font-mono">
                  S{r.season}E{String(r.episode).padStart(2, '0')} · {r.total_jokes} jokes
                </p>
              </div>
              <span className="font-serif italic text-xl sm:text-2xl text-brand-gold shrink-0">
                {formatIndex(r.humor_index)}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <NewsletterCTA
          variant="banner"
          source="50_funniest_page"
          headline="Want the next ranking before anyone else?"
          sub="Join the weekly Humor Index — new show breakdowns and rankings every Friday. Free, no spam."
        />
      </div>

      <p className="mt-8 text-sm text-brand-text-muted leading-relaxed">
        <span className="text-brand-text-secondary">How we score:</span> every episode transcript is
        graded joke-by-joke on craft and impact, then combined with joke density into a single Humor
        Index — so a 1990 sitcom and a 2023 one can finally be compared head-to-head.{' '}
        <Link href="/methodology" className="text-brand-gold hover:underline">
          Full methodology →
        </Link>
      </p>
    </div>
  );
}

import Link from 'next/link';
import { getSiteStats } from '@/lib/siteStats';
import { getEpisodes, getTopJokes, type TopJoke } from '@/lib/data';
import { getTier } from '@/lib/tiers';
import { formatIndex } from '@/lib/scoring';
import { pageMeta, breadcrumbJsonLd } from '@/lib/seo';
import SocialShare from '@/components/ui/SocialShare';

export const dynamic = 'force-static';

export const metadata = pageMeta({
  title: 'Share Cards — The Humor Index',
  description:
    'Ready-to-share scorecards for the funniest sitcom episodes and lines we’ve scored. Download the image or share the page — every card is generated live from the data.',
  path: '/cards',
});

const q = (params: Record<string, string | number | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');

export default async function CardsPage() {
  const stats = await getSiteStats();

  // Top episode scorecards across all scored shows.
  const eps: Array<{ show: string; slug: string; season: number; ep: number; title: string; hi: number; craft: number; impact: number; jokes: number }> = [];
  for (const s of stats.leaderboard) {
    const list = await getEpisodes(s.slug);
    for (const e of list) {
      eps.push({ show: s.name, slug: s.slug, season: e.season, ep: e.episode_number, title: e.title, hi: e.humor_index, craft: e.avg_craft, impact: e.avg_impact, jokes: e.total_jokes });
    }
  }
  const topEpisodes = eps.sort((a, b) => b.hi - a.hi).slice(0, 9);

  // Funniest lines.
  const topJokes: TopJoke[] = (await getTopJokes()).slice(0, 9);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Share Cards', path: '/cards' }])) }}
      />

      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-2">Made to Share</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary mb-3">Score cards</h1>
        <p className="text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
          Every card below is generated live from the data — download the image for a post or story,
          or share the page it links to. The highest-scoring episodes and lines from{' '}
          {stats.showCount} fully scored shows.
        </p>
      </header>

      {/* Episode scorecards */}
      <section className="mb-12">
        <h2 className="font-serif italic text-2xl text-brand-text-primary mb-4">Top episode scorecards</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {topEpisodes.map(e => {
            const tier = getTier(e.hi).label;
            const url = `/api/og/episode?${q({ show: e.show, title: e.title, season: e.season, episode: e.ep, score: formatIndex(e.hi), tier, craft: e.craft?.toFixed(1), impact: e.impact?.toFixed(1), jokes: e.jokes })}`;
            const fname = `humor-index-${e.slug}-s${String(e.season).padStart(2, '0')}e${String(e.ep).padStart(2, '0')}.png`;
            const pagePath = `/shows/${e.slug}/${e.season}/${e.ep}`;
            return (
              <figure key={`${e.slug}-${e.season}-${e.ep}`} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${e.show} — "${e.title}" Humor Index scorecard`} width={1200} height={630} loading="lazy" className="w-full block" />
                <figcaption className="flex items-center justify-between gap-3 p-3 border-t border-brand-border">
                  <Link href={pagePath} className="text-sm text-brand-text-secondary hover:text-brand-gold truncate">
                    <span className="italic">{e.show}</span> · “{e.title}”
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={url} download={fname} className="text-xs text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold rounded-lg px-3 py-1.5 transition-all">Download</a>
                    <SocialShare title={`${e.show}: "${e.title}" scored ${formatIndex(e.hi)} on the Humor Index`} text={`"${e.title}" (${e.show}) scored ${formatIndex(e.hi)}/100 on the Humor Index`} url={pagePath} />
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* Funniest lines */}
      {topJokes.length > 0 && (
        <section>
          <h2 className="font-serif italic text-2xl text-brand-text-primary mb-4">Funniest lines</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {topJokes.map((j, i) => {
              const url = `/api/og/joke?${q({ text: j.text, craft: j.craft?.toFixed(1), impact: j.impact?.toFixed(1), show: j.show, episode: j.episode_title, types: (j.joke_types || []).join(',') })}`;
              const fname = `humor-index-line-${j.show_slug}-${i + 1}.png`;
              const pagePath = `/shows/${j.show_slug}/${j.season}/${j.episode_number}`;
              return (
                <figure key={i} className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${j.show} line scorecard`} width={1200} height={630} loading="lazy" className="w-full block" />
                  <figcaption className="flex items-center justify-between gap-3 p-3 border-t border-brand-border">
                    <Link href={pagePath} className="text-sm text-brand-text-secondary hover:text-brand-gold truncate">
                      {j.characters?.[0]} · <span className="italic">{j.show}</span>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={url} download={fname} className="text-xs text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold rounded-lg px-3 py-1.5 transition-all">Download</a>
                      <SocialShare title={`A top-scoring ${j.show} line`} text={`"${j.text}" — ${j.show}, scored on the Humor Index`} url={pagePath} />
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      <p className="text-xs text-brand-text-muted text-center mt-12">
        Want a card for a specific episode? Every episode page has its own share button. <Link href="/shows" className="text-brand-gold hover:underline">Browse all shows →</Link>
      </p>
    </main>
  );
}

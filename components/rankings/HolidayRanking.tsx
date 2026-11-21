import Link from 'next/link';
import { formatIndex, byHumorIndexDesc } from '@/lib/scoring';
import type { HolidayEpisode } from '@/lib/holidays';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';

interface Props {
  holiday: string; // "Christmas"
  path: string; // "/rankings/best-christmas-episodes"
  episodes: HolidayEpisode[];
  intro: React.ReactNode;
  sibling?: { label: string; href: string };
}

const epCode = (s: number, e: number) => `S${s}E${String(e).padStart(2, '0')}`;
const epHref = (x: HolidayEpisode) => `/shows/${x.showSlug}/${x.season}/${x.episode}`;

function firstSentence(s: string) {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}

function standing(x: HolidayEpisode) {
  if (x.rankInShow <= 10) return `#${x.rankInShow} of ${x.showEpisodes} ${x.showName} episodes`;
  return `Better than ${x.beatsPct}% of ${x.showName} episodes`;
}

function Card({ x, rank }: { x: HolidayEpisode; rank?: number }) {
  return (
    <li className="p-4 sm:p-5 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors">
      <div className="flex gap-4">
        {rank !== undefined && (
          <span className={`font-mono text-sm w-7 shrink-0 text-right pt-1 ${rank <= 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
            {rank}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-brand-text-muted">
            <Link href={`/shows/${x.showSlug}`} className="hover:text-brand-gold transition-colors">{x.showName}</Link>{' '}
            · <span className="font-mono">{epCode(x.season, x.episode)}</span>
          </p>
          <h3 className="mt-1 text-base text-brand-text-primary font-medium">
            <Link href={epHref(x)} className="hover:text-brand-gold transition-colors">{x.title}</Link>
          </h3>
          {x.overview && <p className="mt-1 text-sm text-brand-text-secondary leading-relaxed">{firstSentence(x.overview)}</p>}
          {x.bestJoke && (
            <blockquote className="mt-3 pl-3 border-l-2 border-brand-gold/40 text-sm text-brand-text-secondary italic leading-relaxed">
              &ldquo;{x.bestJoke.text}&rdquo;
              {x.bestJoke.characters.length > 0 && (
                <span className="not-italic text-brand-text-muted"> · {x.bestJoke.characters.slice(0, 2).join(', ')}</span>
              )}
            </blockquote>
          )}
          <p className="mt-3 text-xs text-brand-text-muted">
            {standing(x)} · {x.totalJokes} jokes · {x.jpm.toFixed(1)} per minute
          </p>
        </div>
        {!x.awaitingRescore && (
          <div className="text-right shrink-0">
            <span className="font-mono text-lg text-brand-gold font-medium">{formatIndex(x.humorIndex)}</span>
            <div className="text-[11px] text-brand-text-muted uppercase tracking-widest">HI</div>
          </div>
        )}
      </div>
    </li>
  );
}

export default function HolidayRanking({ holiday, path, episodes, intro, sibling }: Props) {
  const ranked = episodes
    .filter(e => !e.awaitingRescore)
    .map(e => ({ ...e, humor_index: e.humorIndex, avg_craft: e.avgCraft, avg_impact: e.avgImpact }))
    .sort(byHumorIndexDesc);
  const pending = episodes
    .filter(e => e.awaitingRescore)
    .sort((a, b) => b.beatsPct - a.beatsPct || a.showName.localeCompare(b.showName));
  const top = ranked[0];
  const title = `The Best ${holiday} Sitcom Episodes, Ranked`;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: ranked.length,
    itemListElement: ranked.map((x, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TVEpisode',
        name: x.title,
        episodeNumber: x.episode,
        partOfSeason: { '@type': 'TVSeason', seasonNumber: x.season },
        partOfSeries: { '@type': 'TVSeries', name: x.showName },
        url: `${SITE_URL}${epHref(x)}/`,
      },
    })),
  };

  const bestPerShow = new Map<string, HolidayEpisode>();
  for (const x of ranked) if (!bestPerShow.has(x.showSlug)) bestPerShow.set(x.showSlug, x);

  const faqLd = top
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the funniest ${holiday} sitcom episode?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `By Humor Index score, it is ${top.showName}'s "${top.title}" (${epCode(top.season, top.episode)}), at ${formatIndex(top.humorIndex)}. ${ranked[1] ? `${ranked[1].showName}'s "${ranked[1].title}" is second.` : ''}`.trim(),
            },
          },
          ...Array.from(bestPerShow.values()).slice(0, 6).map(x => ({
            '@type': 'Question',
            name: `What is the best ${x.showName} ${holiday} episode?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `"${x.title}" (${epCode(x.season, x.episode)}) scores highest of the ${x.showName} ${holiday} episodes, at ${formatIndex(x.humorIndex)}.`,
            },
          })),
        ],
      }
    : null;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Rankings', path: '/rankings' },
          { name: `Best ${holiday} Episodes`, path },
        ]}
      />
      <PageHeader
        label="Holiday Rankings"
        title={title}
        subtitle={`${episodes.length} ${holiday} episodes from ${new Set(episodes.map(e => e.showSlug)).size} shows, scored joke by joke.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title={title}
            text={top ? `We scored every joke in ${episodes.length} ${holiday} sitcom episodes. #1: ${top.showName}, "${top.title}".` : title}
            url={path}
          />
        </div>

        {top && (
          <section className="mb-8 p-5 sm:p-6 bg-brand-card border border-brand-gold/30 rounded-xl">
            <p className="text-[11px] uppercase tracking-widest text-brand-gold mb-2">The funniest {holiday} episode</p>
            <p className="text-xl text-brand-text-primary">
              <Link href={epHref(top)} className="hover:text-brand-gold transition-colors">{top.showName}, &ldquo;{top.title}&rdquo;</Link>
            </p>
            <p className="mt-1 text-sm text-brand-text-secondary">
              Humor Index {formatIndex(top.humorIndex)} · {standing(top)}
            </p>
          </section>
        )}

        <div className="text-sm text-brand-text-secondary leading-relaxed mb-8 max-w-2xl space-y-3">{intro}</div>

        <ol className="space-y-3">
          {ranked.map((x, i) => <Card key={`${x.showSlug}-${x.season}-${x.episode}`} x={x} rank={i + 1} />)}
        </ol>

        {pending.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg text-brand-text-primary font-medium">More {holiday} episodes, ranked within their own show</h2>
            <p className="mt-2 mb-5 text-sm text-brand-text-muted leading-relaxed max-w-2xl">
              These shows are scored on our earlier model and get a place in the ranking above once they are
              rescored. Until then, each episode is placed against the rest of its own series, which the change of
              model does not affect.{' '}
              <Link href="/methodology" className="text-brand-gold hover:underline">How we score →</Link>
            </p>
            <ul className="space-y-3">
              {pending.map(x => <Card key={`${x.showSlug}-${x.season}-${x.episode}`} x={x} />)}
            </ul>
          </section>
        )}

        <div className="mt-10 border-t border-brand-border pt-6 text-sm text-brand-text-muted leading-relaxed">
          {sibling && (
            <>
              Also see the{' '}
              <Link href={sibling.href} className="text-brand-gold hover:underline">{sibling.label}</Link>,{' '}
            </>
          )}
          the{' '}
          <Link href="/rankings/funniest-episodes" className="text-brand-gold hover:underline">funniest sitcom episodes of all time</Link>
          , and the{' '}
          <Link href="/rankings/best-jokes" className="text-brand-gold hover:underline">best jokes ever written</Link>.
        </div>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getShow, getEpisodes } from '@/lib/data';
import { SHOW_SLUGS } from '@/lib/constants';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
import { getShowQuotes } from '@/lib/quotes';
import { isAwaitingRescore } from '@/lib/scale';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';
import { Fragment } from 'react';
import AdSlot from '@/components/ads/AdSlot';
import RankedRail from '@/components/ads/RankedRail';
import type { JokeType } from '@/lib/types';

export const dynamic = 'force-static';

const LIMIT = 50;

export async function generateStaticParams() {
  const out: { slug: string }[] = [];
  for (const slug of SHOW_SLUGS) {
    const eps = await getEpisodes(slug);
    if (eps.length > 0) out.push({ slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) return {};
  const { quotes, totalJokes } = await getShowQuotes(params.slug, LIMIT);
  const top = quotes[0];
  const title = `The ${quotes.length} Funniest ${show.name} Quotes, Ranked`;
  const description = `The funniest ${show.name} quotes and jokes, picked from ${totalJokes.toLocaleString()} scored jokes${top ? `. #1 is from "${top.episodeTitle}"` : ''}. Every line ranked on craft and impact, with why it lands.`;
  const ogImg = `/api/og?title=${encodeURIComponent(`Funniest ${show.name} Quotes`)}&score=${quotes.length}&subtitle=${encodeURIComponent(`Ranked from ${totalJokes.toLocaleString()} scored jokes`)}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/shows/${params.slug}/best-jokes/` },
    openGraph: { title, description, images: [ogImg] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImg] },
  };
}

function epCode(s: number, e: number) {
  return `S${s}E${String(e).padStart(2, '0')}`;
}

/** Jokes store speaker turns separated by " / "; show each turn on its own line. */
function Turns({ text }: { text: string }) {
  const turns = text.split(/\s+\/\s+/).filter(Boolean);
  if (turns.length === 1) return <>&ldquo;{text}&rdquo;</>;
  return (
    <>
      {turns.map((t, i) => (
        <span key={i} className="block">
          {i === 0 ? '\u201C' : ''}{t}{i === turns.length - 1 ? '\u201D' : ''}
        </span>
      ))}
    </>
  );
}

function typeLabel(t: string) {
  return JOKE_TYPE_LABELS[t as JokeType] ?? t.replace(/_/g, ' ');
}

export default async function ShowBestJokesPage({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) notFound();
  const data = await getShowQuotes(params.slug, LIMIT);
  if (data.quotes.length === 0) notFound();

  const { quotes, totalJokes, totalEpisodes, topSpeakers, topEpisode, characterPages } = data;
  const pageSet = new Set(characterPages);
  const charHref = (name: string) => `/shows/${params.slug}/characters/${encodeURIComponent(name)}`;
  const epHref = (s: number, e: number) => `/shows/${params.slug}/${s}/${e}`;
  const top = quotes[0];
  const leader = topSpeakers[0];
  const awaiting = isAwaitingRescore(params.slug);

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `The Funniest ${show.name} Quotes, Ranked`,
    numberOfItems: quotes.length,
    itemListElement: quotes.map(q => ({
      '@type': 'ListItem',
      position: q.rank,
      item: {
        '@type': 'Quotation',
        text: q.text,
        ...(q.characters[0] ? { spokenByCharacter: { '@type': 'Person', name: q.characters[0] } } : {}),
        isPartOf: {
          '@type': 'TVEpisode',
          name: q.episodeTitle,
          episodeNumber: q.episode,
          partOfSeason: { '@type': 'TVSeason', seasonNumber: q.season },
          partOfSeries: { '@type': 'TVSeries', name: show.name },
          url: `${SITE_URL}${epHref(q.season, q.episode)}/`,
        },
      },
    })),
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the funniest ${show.name} quote?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `By the Humor Index's scoring, the funniest ${show.name} joke is from "${top.episodeTitle}" (${epCode(top.season, top.episode)}): ${top.text} It scored ${top.craft.toFixed(1)} for craft and ${top.impact.toFixed(1)} for impact out of 10.`,
        },
      },
      ...(leader
        ? [{
            '@type': 'Question',
            name: `Who has the funniest lines on ${show.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${leader.name} has the most lines in the top ${quotes.length}, with ${leader.count}.${topSpeakers[1] ? ` ${topSpeakers[1].name} is next with ${topSpeakers[1].count}.` : ''}`,
            },
          }]
        : []),
      ...(topEpisode
        ? [{
            '@type': 'Question',
            name: `Which ${show.name} episode has the most great jokes?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `"${topEpisode.title}" (${epCode(topEpisode.season, topEpisode.episode)}) has ${topEpisode.count} of the show's 150 highest-scoring jokes, more than any other episode.`,
            },
          }]
        : []),
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Shows', path: '/shows' },
          { name: show.name, path: `/shows/${params.slug}` },
          { name: 'Funniest Quotes', path: `/shows/${params.slug}/best-jokes` },
        ]}
      />
      <PageHeader
        label="Funniest Quotes"
        title={`The ${quotes.length} Funniest ${show.name} Quotes, Ranked`}
        subtitle={`Picked from ${totalJokes.toLocaleString()} jokes across ${totalEpisodes} episodes, each one scored for craft and impact.`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
          <Link href="/shows" className="hover:text-brand-text-secondary transition-colors">Shows</Link>
          <span>/</span>
          <Link href={`/shows/${params.slug}`} className="hover:text-brand-text-secondary transition-colors">{show.name}</Link>
          <span>/</span>
          <span className="text-brand-text-secondary">Funniest Quotes</span>
        </div>

        <div className="mb-6">
          <SocialShare
            title={`The ${quotes.length} Funniest ${show.name} Quotes, Ranked`}
            text={`We scored all ${totalJokes.toLocaleString()} jokes in ${show.name}. The #1 is from "${top.episodeTitle}".`}
            url={`/shows/${params.slug}/best-jokes`}
          />
        </div>

        {/* Answer first: the one line a searcher came for. */}
        <section className="mb-8 p-5 sm:p-6 bg-brand-card border border-brand-gold/30 rounded-xl">
          <p className="text-[11px] uppercase tracking-widest text-brand-gold mb-3">The funniest {show.name} joke</p>
          <blockquote className="text-lg sm:text-xl text-brand-text-primary leading-snug">
            <Turns text={top.text} />
          </blockquote>
          <p className="mt-3 text-sm text-brand-text-secondary">
            {top.characters.length > 0 && <>{top.characters.join(', ')} · </>}
            <Link href={epHref(top.season, top.episode)} className="text-brand-gold hover:underline">
              {top.episodeTitle}
            </Link>{' '}
            ({epCode(top.season, top.episode)}) · craft {top.craft.toFixed(1)}, impact {top.impact.toFixed(1)}
          </p>
        </section>

        <p className="text-sm text-brand-text-secondary leading-relaxed mb-6 max-w-2xl">
          We ran every episode of {show.name} through the Humor Index and scored each of its{' '}
          {totalJokes.toLocaleString()} jokes on craft (how well it is built) and impact (how hard it lands).
          This list keeps the {quotes.length} highest, with no more than three from any one episode so a single
          classic cannot crowd out the rest.
          {leader && <> {leader.name} has the most lines here ({leader.count}).</>}
          {topEpisode && topEpisode.count > 1 && (
            <> No episode is richer than{' '}
              <Link href={epHref(topEpisode.season, topEpisode.episode)} className="text-brand-gold hover:underline">
                &ldquo;{topEpisode.title}&rdquo;
              </Link>
              , which has {topEpisode.count} of the show&rsquo;s 150 best jokes.
            </>
          )}
        </p>

        {awaiting && (
          <p className="text-xs text-brand-text-muted border border-brand-border rounded-md px-4 py-3 mb-6">
            {show.name} is scored on our earlier model and will be rescored on the current one. The order of
            jokes within the show holds up; the numbers are not comparable with rescored shows.{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">How we score →</Link>
          </p>
        )}

        {topSpeakers.length > 1 && (
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-widest text-brand-text-muted mb-2">Most lines on the list</p>
            <div className="flex flex-wrap gap-2">
              {topSpeakers.map(sp =>
                sp.hasPage ? (
                  <Link
                    key={sp.name}
                    href={charHref(sp.name)}
                    className="text-xs px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand-text-secondary hover:border-brand-gold/50 hover:text-brand-gold transition-colors"
                  >
                    {sp.name} <span className="font-mono text-brand-text-muted">{sp.count}</span>
                  </Link>
                ) : (
                  <span
                    key={sp.name}
                    className="text-xs px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand-text-secondary"
                  >
                    {sp.name} <span className="font-mono text-brand-text-muted">{sp.count}</span>
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        <ol className="space-y-3">
          {quotes.map((q, qi) => (
            <Fragment key={`${q.season}-${q.episode}-${q.rank}`}>
            {/* One ad after the 10th quote, one after the 30th. */}
            {(qi === 10 || qi === 30) && <li className="list-none"><AdSlot placement="in-article" className="my-2" /></li>}
            <li
              key={`${q.season}-${q.episode}-${q.rank}`}
              id={`quote-${q.rank}`}
              className="p-4 sm:p-5 bg-brand-card border border-brand-border rounded-xl"
            >
              <div className="flex gap-4">
                <span
                  className={`font-mono text-sm w-7 shrink-0 text-right pt-0.5 ${q.rank <= 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}
                >
                  {q.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <blockquote className="text-[15px] text-brand-text-primary leading-relaxed">
                    <Turns text={q.text} />
                  </blockquote>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-text-muted">
                    {q.characters.slice(0, 3).map((name, i) => (
                      <span key={name}>
                        {pageSet.has(name) ? (
                          <Link href={charHref(name)} className="text-brand-text-secondary hover:text-brand-gold transition-colors">
                            {name}
                          </Link>
                        ) : (
                          <span className="text-brand-text-secondary">{name}</span>
                        )}
                        {i < Math.min(q.characters.length, 3) - 1 ? ',' : ''}
                      </span>
                    ))}
                    {q.characters.length > 0 && <span>·</span>}
                    <Link href={epHref(q.season, q.episode)} className="hover:text-brand-gold transition-colors">
                      {q.episodeTitle} <span className="font-mono">{epCode(q.season, q.episode)}</span>
                    </Link>
                  </div>
                  {q.why && (
                    <p className="mt-2 text-xs text-brand-text-muted leading-relaxed">
                      <span className="text-brand-text-secondary">Why it lands:</span> {q.why}
                    </p>
                  )}
                  {q.jokeTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {q.jokeTypes.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-brand-surface text-brand-text-muted">
                          {typeLabel(t)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-lg text-brand-gold font-medium">{q.score.toFixed(1)}</span>
                  <div className="text-[10px] text-brand-text-muted uppercase tracking-widest">/ 10</div>
                </div>
              </div>
            </li>
            </Fragment>
          ))}
        </ol>

        <div className="mt-10 border-t border-brand-border pt-6 text-sm text-brand-text-muted leading-relaxed">
          More on {show.name}:{' '}
          <Link href={`/shows/${params.slug}/episodes-ranked`} className="text-brand-gold hover:underline">every episode ranked</Link>,{' '}
          <Link href={`/shows/${params.slug}/arc`} className="text-brand-gold hover:underline">the best season</Link>, and the{' '}
          <Link href={`/shows/${params.slug}`} className="text-brand-gold hover:underline">full show breakdown</Link>.
          Across every show, see the{' '}
          <Link href="/rankings/best-jokes" className="text-brand-gold hover:underline">best sitcom jokes ever written</Link>.
        </div>
      </div>
      <RankedRail exclude={params.slug} />
      </div>
    </div>
  );
}

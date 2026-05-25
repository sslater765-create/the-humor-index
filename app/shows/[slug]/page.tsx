import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getShow, getSeasons, getEpisodes, getCharacters, getRecommendations, getAllShows, getComedyDna } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SHOW_SLUGS } from '@/lib/constants';
import ScoreCard from '@/components/ui/ScoreCard';
import ScoreGauge from '@/components/ui/ScoreGauge';
import FormatBadge from '@/components/ui/FormatBadge';
import InlineNewsletterCTA from '@/components/ui/InlineNewsletterCTA';
import ShowPageClient from './ShowPageClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return SHOW_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) return {};
  return {
    title: `Is ${show.name} Funny? Humor Index ${formatIndex(show.humor_index)}/100 — Every Joke Scored`,
    description: `Is ${show.name} actually funny? We analyzed ${show.total_jokes_analyzed.toLocaleString()} jokes across ${show.total_seasons} seasons. Humor Index: ${formatIndex(show.humor_index)}. ${show.description}`,
    openGraph: {
      title: `${show.name} — Humor Index: ${formatIndex(show.humor_index)}`,
      description: `${show.total_jokes_analyzed.toLocaleString()} jokes analyzed across ${show.total_seasons} seasons. See the data.`,
      images: [`/api/og?title=${encodeURIComponent(show.name)}&score=${formatIndex(show.humor_index)}&subtitle=${encodeURIComponent(`${show.total_jokes_analyzed.toLocaleString()} jokes analyzed`)}`],
    },
    alternates: {
      canonical: `https://thehumorindex.com/shows/${params.slug}/`,
    },
  };
}

export default async function ShowPage({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) notFound();

  const [seasons, episodes, realCharacters, recommendations, allShows, comedyDna] = await Promise.all([
    getSeasons(params.slug),
    getEpisodes(params.slug),
    getCharacters(params.slug),
    getRecommendations(params.slug),
    getAllShows(),
    getComedyDna(params.slug),
  ]);

  // Map real character data to CharacterStats format for charts. We deliberately
  // omit `jpm` here — per-character JPM isn't computed by the pipeline, and the
  // previous stand-in (avg_impact masquerading as JPM) was a footgun. The type
  // marks `jpm` optional; consumers handle its absence.
  const characters = realCharacters.slice(0, 15).map(c => ({
    name: c.name,
    total_jokes: c.total_jokes,
    avg_craft: c.avg_craft,
    avg_impact: c.avg_impact,
    screen_time_minutes: Math.round(Math.sqrt(c.total_jokes) * 5),
    dominant_types: c.dominant_types,
  }));

  // AEO: top-level rank for the answer-first "quick answer" block (scored shows only).
  const scoredRankList = allShows
    .filter(s => s.humor_index > 0)
    .sort((a, b) => b.humor_index - a.humor_index);
  const showRank = scoredRankList.findIndex(s => s.slug === show.slug) + 1;
  const scoredShowCount = scoredRankList.length;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TVSeries',
      name: show.name,
      url: `https://thehumorindex.com/shows/${params.slug}/`,
      description: show.description,
      image: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : undefined,
      numberOfSeasons: show.total_seasons,
      numberOfEpisodes: show.total_episodes,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: show.humor_index,
        bestRating: 100,
        worstRating: 0,
        ratingCount: show.total_jokes_analyzed,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Shows', item: 'https://thehumorindex.com/shows/' },
        { '@type': 'ListItem', position: 2, name: show.name, item: `https://thehumorindex.com/shows/${params.slug}/` },
      ],
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero section with backdrop */}
      <div className="relative w-full h-[340px] sm:h-[500px] overflow-hidden">
        {show.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={`${show.name} backdrop`}
            fill
            className="object-cover object-[50%_20%]"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-surface" />
        )}
        {/* Gradient overlay — keeps text readable, lets image breathe */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(15,15,15) 10%, rgba(15,15,15,0.6) 25%, rgba(15,15,15,0.1) 40%, transparent 60%)' }} />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <nav className="flex items-center gap-1 text-xs text-brand-text-muted mb-3" aria-label="Breadcrumb">
            <Link href="/shows" className="hover:text-brand-text-secondary transition-colors">Shows</Link>
            <span>/</span>
            <span className="text-brand-text-secondary truncate max-w-[200px]">{show.name}</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Show Analysis</p>
          <h1 className={`font-medium text-brand-text-primary mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${
            show.name.length > 22
              ? 'text-2xl sm:text-3xl md:text-4xl'
              : show.name.length > 14
                ? 'text-3xl sm:text-4xl'
                : 'text-3xl sm:text-4xl md:text-5xl'
          }`}>
            <span>{show.name}</span>
            {show.humor_index > 0 && (
              <span className="text-brand-gold font-mono text-xl sm:text-2xl md:text-3xl">
                {formatIndex(show.humor_index)}
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <FormatBadge format={show.format} />
            {show.network && (
              <span className="text-xs bg-brand-surface/80 border border-brand-border rounded-full px-2.5 py-0.5 text-brand-text-secondary">
                {show.network}
              </span>
            )}
            {show.aired && (
              <span className="text-xs text-brand-text-muted">{show.aired}</span>
            )}
            {show.genres?.map(g => (
              <span key={g} className="text-xs text-brand-text-muted bg-brand-surface/60 rounded px-1.5 py-0.5">
                {g}
              </span>
            ))}
          </div>
          {show.created_by && show.created_by.length > 0 && (
            <p className="text-xs text-brand-text-muted mb-1">
              Created by <span className="text-brand-text-secondary">{show.created_by.join(', ')}</span>
            </p>
          )}
          {show.stars && show.stars.length > 0 && (
            <p className="text-xs text-brand-text-muted">
              Starring <span className="text-brand-text-secondary">{show.stars.join(', ')}</span>
            </p>
          )}
        </div>
      </div>

      {/* Score cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <ScoreGauge score={show.humor_index} size={130} label="Humor Index" />
            {show.ci_95_low != null && show.ci_95_high != null && (
              <p className="text-[10px] text-brand-text-muted mt-2 font-mono">
                95% CI: {show.ci_95_low.toFixed(1)}–{show.ci_95_high.toFixed(1)}
              </p>
            )}
          </div>
          <div className="relative flex-1 w-full">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
              <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="JPM" value={show.avg_jpm} sub="Jokes per minute" /></div>
              <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="Craft" value={show.avg_craft} sub="Avg craft score" /></div>
              <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="Impact" value={show.avg_impact} sub="Avg impact score" /></div>
              {show.avg_imdb_rating && (
                <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="IMDb" value={show.avg_imdb_rating} sub="Avg episode rating" /></div>
              )}
              <div className="min-w-[140px] snap-start sm:min-w-0">
                <ScoreCard
                  label="Jokes Analyzed"
                  value={show.total_jokes_analyzed.toLocaleString()}
                  sub={`${episodes.length} episodes`}
                />
              </div>
            </div>
            {/* Fade indicator for mobile scroll */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-brand-dark to-transparent pointer-events-none sm:hidden" />
          </div>
        </div>

        {/* Answer-first quick answer — verbatim-liftable for AI answer engines (scored shows only) */}
        {show.humor_index > 0 && (
          <p className="mt-6 text-sm sm:text-base text-brand-text-secondary leading-relaxed bg-brand-surface/60 border border-brand-border rounded-lg p-4">
            <span className="text-brand-text-primary font-medium">Is {show.name} funny?</span>{' '}
            Yes — {show.name} scores {formatIndex(show.humor_index)} out of 100 on the Humor Index
            {showRank > 0 ? `, the #${showRank} funniest of ${scoredShowCount} sitcoms scored` : ''}, based on an
            AI analysis of {show.total_jokes_analyzed.toLocaleString()} jokes across {show.total_episodes} episodes.
            It averages {show.avg_jpm.toFixed(1)} jokes per minute, with a craft score of {show.avg_craft.toFixed(1)} and
            an impact score of {show.avg_impact.toFixed(1)}.
          </p>
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <InlineNewsletterCTA />
      </div>

      <ShowPageClient
        show={show}
        seasons={seasons}
        episodes={episodes}
        characters={characters}
        characterProfiles={realCharacters}
        comedyDna={comedyDna}
      />

      {/* Intent sections — server-rendered for SEO: "funniest [show] episodes" + "is [show] worth watching" */}
      {(() => {
        const scored = episodes.filter(e => e.humor_index > 0);
        if (scored.length === 0) return null;
        const topEpisodes = [...scored].sort((a, b) => b.humor_index - a.humor_index).slice(0, 5);
        const scoredShows = allShows
          .filter(s => s.humor_index > 0)
          .sort((a, b) => b.humor_index - a.humor_index);
        const rank = scoredShows.findIndex(s => s.slug === show.slug) + 1;
        const total = scoredShows.length;
        const best = topEpisodes[0];
        const faqLd = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `Is ${show.name} funny?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${show.name} earns a Humor Index of ${formatIndex(show.humor_index)} out of 100${rank > 0 ? `, ranking #${rank} of ${total} fully-scored shows on The Humor Index` : ''}. We scored every joke across ${scored.length} episodes — it averages ${show.avg_jpm.toFixed(1)} jokes per minute with a craft score of ${show.avg_craft.toFixed(1)} and impact of ${show.avg_impact.toFixed(1)}.`,
              },
            },
            ...(best ? [{
              '@type': 'Question',
              name: `What is the funniest ${show.name} episode?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `"${best.title}" (S${best.season}E${String(best.episode_number).padStart(2, '0')}) is the funniest ${show.name} episode by Humor Index, scoring ${formatIndex(best.humor_index)} with ${best.total_jokes} scored jokes.`,
              },
            }] : []),
            {
              '@type': 'Question',
              name: `How many jokes per minute does ${show.name} have?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${show.name} averages ${show.avg_jpm.toFixed(1)} distinct scored jokes per minute across ${scored.length} analyzed episodes.`,
              },
            },
          ],
        };
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-brand-border">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
            <h2 className="text-xl font-medium text-brand-text-primary mb-2">
              The Funniest {show.name.replace(/^The /, '')} Episodes
            </h2>
            <p className="text-sm text-brand-text-secondary mb-5 max-w-2xl leading-relaxed">
              Of the {scored.length} {show.name} episode{scored.length !== 1 ? 's' : ''} we scored, these
              rate highest on the Humor Index — our blend of joke density, craft, and impact. Tap any
              episode for the full joke-by-joke breakdown.
            </p>
            <div className="space-y-2 mb-4">
              {topEpisodes.map((ep, i) => (
                <Link
                  key={`${ep.season}-${ep.episode_number}`}
                  href={`/shows/${show.slug}/${ep.season}/${ep.episode_number}`}
                  className="flex items-center gap-4 p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
                >
                  <span className={`font-mono text-sm w-6 text-right ${i === 0 ? 'text-brand-gold' : 'text-brand-text-muted'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                      {ep.title}
                    </p>
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      S{ep.season}E{String(ep.episode_number).padStart(2, '0')} · {ep.total_jokes} jokes
                    </p>
                  </div>
                  <span className="font-mono text-lg text-brand-gold shrink-0">{formatIndex(ep.humor_index)}</span>
                </Link>
              ))}
            </div>
            <div className="mb-8">
              <Link
                href={`/shows/${params.slug}/episodes-ranked`}
                className="text-sm text-brand-gold hover:underline"
              >
                See all {scored.length} {show.name} episodes ranked →
              </Link>
            </div>

            <Link
              href={`/shows/${params.slug}/explore`}
              className="block mb-12 bg-brand-card border border-brand-border rounded-2xl p-5 hover:border-brand-gold/40 transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase tracking-widest text-brand-text-muted">Humor Index Explorer</span>
                  <p className="text-base font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mt-0.5">
                    Build your own cut of {show.name}
                  </p>
                  <p className="text-sm text-brand-text-secondary mt-1 max-w-xl">
                    Pick any seasons or episodes and see how funny that slice scores — compare eras, isolate a hot streak, or drop a weak season.
                  </p>
                </div>
                <span className="text-brand-gold text-sm shrink-0">Explore →</span>
              </div>
            </Link>

            <h2 className="text-xl font-medium text-brand-text-primary mb-2">
              Is {show.name} Worth Watching?
            </h2>
            <p className="text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
              By the data: {show.name} earns a Humor Index of {formatIndex(show.humor_index)} out of 100
              {rank > 0 ? `, placing it #${rank} of ${total} fully-scored shows here` : ''}. Across{' '}
              {scored.length} analyzed episode{scored.length !== 1 ? 's' : ''} it averages{' '}
              {show.avg_jpm.toFixed(1)} jokes per minute, a craft score of {show.avg_craft.toFixed(1)}, and
              an impact score of {show.avg_impact.toFixed(1)}. Those numbers reflect one AI analyst&rsquo;s
              judgment applied consistently — and the top shows cluster closely enough that small gaps
              aren&rsquo;t meaningful rankings. Scroll up for the season-by-season trend and the characters
              carrying the comedy.
            </p>
          </section>
        );
      })()}

      {/* Head-to-head matchups — internal links for SEO + discovery */}
      {(() => {
        const otherScored = allShows.filter(s => s.slug !== show.slug && s.humor_index > 0);
        if (otherScored.length === 0) return null;
        // Two best peers: closest score + the #1 show overall
        const byScoreDistance = [...otherScored].sort(
          (a, b) => Math.abs(a.humor_index - show.humor_index) - Math.abs(b.humor_index - show.humor_index)
        );
        const topRanked = [...otherScored].sort((a, b) => b.humor_index - a.humor_index)[0];
        const closestPeer = byScoreDistance[0];
        const peers = closestPeer.slug === topRanked.slug
          ? [closestPeer, byScoreDistance[1]].filter(Boolean)
          : [closestPeer, topRanked];
        const matchups = peers.map(peer => {
          const [a, b] = [show.slug, peer.slug].sort();
          return { peer, slug: `${a}-vs-${b}` };
        });
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-brand-border">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Head-to-Head</p>
            <p className="text-lg font-medium text-brand-text-primary mb-5">
              How {show.name} stacks up
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchups.map(({ peer, slug }) => (
                <Link
                  key={slug}
                  href={`/compare/${slug}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/40 transition-colors group"
                >
                  <div>
                    <p className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors">
                      {show.name} vs {peer.name}
                    </p>
                    <p className="text-xs text-brand-text-muted mt-0.5">
                      {formatIndex(show.humor_index)} · {formatIndex(peer.humor_index)}
                    </p>
                  </div>
                  <span className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              ))}
            </div>
            <Link
              href="/compare"
              className="inline-block mt-4 text-xs text-brand-text-muted hover:text-brand-gold transition-colors"
            >
              See all matchups →
            </Link>
          </section>
        );
      })()}

      {/* If you liked this show */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-brand-border">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">If You Liked {show.name}</p>
          <p className="text-lg font-medium text-brand-text-primary mb-6">You might also enjoy</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendations.map(rec => {
              const recShow = allShows.find(s => s.slug === rec.slug);
              if (!recShow) return null;
              return (
                <Link
                  key={rec.slug}
                  href={`/shows/${rec.slug}`}
                  className="group block"
                >
                  <div className="relative bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/40 transition-colors">
                    {recShow.backdrop_path && (
                      <div className="relative h-32 w-full">
                        <Image
                          src={`https://image.tmdb.org/t/p/w1280${recShow.backdrop_path}`}
                          alt={recShow.name}
                          fill
                          className="object-cover opacity-40 group-hover:opacity-55 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-1">
                        {recShow.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-2">
                        {recShow.network && <span>{recShow.network}</span>}
                        {recShow.aired && <span>{recShow.aired}</span>}
                        <FormatBadge format={recShow.format} />
                      </div>
                      {recShow.humor_index > 0 ? (
                        <p className="font-mono text-sm text-brand-gold">
                          Humor Index: {formatIndex(recShow.humor_index)}
                        </p>
                      ) : recShow.avg_imdb_rating ? (
                        <p className="text-xs text-brand-text-muted">
                          <span className="bg-[#F5C518] text-black font-bold text-[10px] px-1.5 py-0.5 rounded mr-1">IMDb</span>
                          {recShow.avg_imdb_rating.toFixed(1)} avg
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

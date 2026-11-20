import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getShow, getCharacters, getCharacterJokes, getEpisodes } from '@/lib/data';
import { isStageDirection } from '@/lib/quotes';
import { cleanJokeText } from '@/lib/quotes';
import { SHOW_SLUGS } from '@/lib/constants';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
import { charImageSrc } from '@/lib/charImage';
import ScoreCard from '@/components/ui/ScoreCard';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const params: { slug: string; name: string }[] = [];
  for (const slug of SHOW_SLUGS) {
    try {
      const characters = await getCharacters(slug);
      for (const ch of characters) {
        // Skip thin/bit-part characters — don't pre-render thin pages.
        if ((ch.total_jokes ?? 0) < 20 || (ch.episodes_appeared ?? 0) < 3) continue;
        params.push({ slug, name: encodeURIComponent(ch.name) });
      }
    } catch {
      // No character data
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; name: string };
}) {
  const show = await getShow(params.slug);
  const name = decodeURIComponent(params.name);
  if (!show) return {};

  const characters = await getCharacters(params.slug);
  const character = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
  const jokeCount = character?.total_jokes ?? 0;
  const war = character?.war ?? 0;

  const display = (character?.character_full_name || character?.name || name).replace(/\s*\(voice\)/i, '');
  let scoredEpisodes = 0;
  try { scoredEpisodes = (await getEpisodes(params.slug)).length; } catch { /* none */ }
  const role = character && scoredEpisodes > 0 && character.episodes_appeared / scoredEpisodes >= 0.4
    ? 'a main character'
    : 'a recurring character';
  // Answer-first description: searches for these pages are mostly the bare
  // name plus the show ("janice friends", "dr drew 30 rock").
  let bestLine = '';
  if (character) {
    const { jokes: cj } = await getCharacterJokes(params.slug, character.name);
    const lead = cj
      .filter(it => ((it.joke.characters as string[] | undefined)?.[0] ?? '').toLowerCase() === character.name.toLowerCase())
      .map(it => ({ t: cleanJokeText(it.joke.text as string), v: (it.joke.craft_total as number) + (it.joke.impact_score as number) }))
      .filter(x => !isStageDirection(x.t) && x.t.length >= 15 && x.t.length <= 140 && !x.t.includes(' / ') && /^[A-Z0-9"\u201c]/.test(x.t))
      .sort((a, b) => b.v - a.v)[0];
    bestLine = lead ? lead.t : '';
  }
  const descBase = character
    ? `${bestLine ? `\u201c${bestLine}\u201d ` : ''}${display}${character.actor ? ` (${character.actor})` : ''} is ${role} on ${show.name}. The funniest ${character.name} quotes, ranked from ${jokeCount.toLocaleString()} scored jokes, plus every episode.`
    : `Every joke by ${name} on ${show.name}, scored and ranked. See craft scores, impact ratings, and comedy style breakdown.`;
  const pageTitle = `${display} Quotes: The Funniest ${show.name} Lines, Ranked`;

  // Thin/bit-part characters: keep reachable but noindex (avoid thin-content pages).
  const thin = jokeCount < 20 || (character?.episodes_appeared ?? 0) < 3;
  const ogImg = `/api/og?title=${encodeURIComponent(name)}&score=${war.toFixed(1)}&subtitle=${encodeURIComponent(`${show.name} · ${jokeCount.toLocaleString()} jokes · ${character?.episodes_appeared ?? 0} eps`)}`;

  return {
    title: pageTitle,
    description: descBase,
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      // Canonical spells the name the way the data does, so /MAC/ and /Mac/
      // count as one page instead of competing duplicates.
      canonical: `${SITE_URL}/shows/${params.slug}/characters/${encodeURIComponent(character?.name ?? name)}/`,
    },
    openGraph: {
      title: pageTitle,
      description: descBase,
      images: [ogImg],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: descBase,
      images: [ogImg],
    },
  };
}

function byEpisodeCount(jokes: Array<{ season: number; episode_number: number }>): number {
  return new Set(jokes.map(j => `${j.season}:${j.episode_number}`)).size;
}

export default async function CharacterPage({
  params,
}: {
  params: { slug: string; name: string };
}) {
  const characterName = decodeURIComponent(params.name);
  const show = await getShow(params.slug);
  if (!show) notFound();

  const { character, jokes } = await getCharacterJokes(params.slug, characterName);
  if (!character) notFound();

  const topJokes = [...jokes].sort((a, b) => {
    const aScore = (a.joke.craft_total as number) + (a.joke.impact_score as number);
    const bScore = (b.joke.craft_total as number) + (b.joke.impact_score as number);
    return bScore - aScore;
  });

  // Deduplicate jokes by text (same joke can appear in multiple episodes)
  const seenTexts = new Set<string>();
  const dedupedJokes = topJokes.filter(item => {
    if (isStageDirection(item.joke.text as string)) return false;
    const text = (item.joke.text as string).toLowerCase().trim();
    if (seenTexts.has(text)) return false;
    seenTexts.add(text);
    return true;
  });
  const standouts = dedupedJokes.slice(0, 5);
  // Main characters have thousands of lines (Homer: ~12,000). Rendering them all made
  // these pages 10-19 MB, past the 15 MB Google reads. List the best, in rank order.
  const JOKE_LIST_CAP = 150;
  const capped = dedupedJokes.length > JOKE_LIST_CAP;
  const jokeList = capped ? dedupedJokes.slice(standouts.length, JOKE_LIST_CAP) : jokes;

  // "Who is X" facts, all derived from the scored data.
  const display = (character.character_full_name || character.name).replace(/\s*\(voice\)/i, '');
  let scoredEpisodes = 0;
  try { scoredEpisodes = (await getEpisodes(params.slug)).length; } catch { /* none */ }
  const isMain = scoredEpisodes > 0 && Math.max(byEpisodeCount(jokes), Math.min(character.episodes_appeared, scoredEpisodes)) / scoredEpisodes >= 0.4;
  const byEpisode = new Map<string, { season: number; episode: number; title: string; n: number }>();
  for (const item of jokes) {
    const k = `${item.season}:${item.episode_number}`;
    const cur = byEpisode.get(k) ?? { season: item.season, episode: item.episode_number, title: item.episode, n: 0 };
    cur.n += 1;
    byEpisode.set(k, cur);
  }
  const chrono = Array.from(byEpisode.values()).sort((a, b) => a.season - b.season || a.episode - b.episode);
  const first = chrono.length >= 0.8 * Math.min(character.episodes_appeared, scoredEpisodes || character.episodes_appeared) ? chrono[0] : undefined;
  // Recurring characters: list every episode in order. Main cast: the twelve
  // episodes where they land the most jokes.
  const episodeList = isMain
    ? [...chrono].sort((a, b) => b.n - a.n).slice(0, 12)
    : chrono;
  // Funniest line: the best joke the character actually leads, not one
  // where they are only in the scene.
  const lname = character.name.toLowerCase();
  const best =
    dedupedJokes.find(it => ((it.joke.characters as string[] | undefined)?.[0] ?? '').toLowerCase() === lname) ??
    standouts[0];
  // Counted from the jokes themselves, so it never exceeds the episodes
  // actually on the site (the stored episodes_appeared can be stale).
  // The stored count can run slightly stale after clip shows were dropped,
  // and the joke scan can undercount when a character is credited under
  // another name in some episodes. Cap the stored count at the episodes on
  // the site; only claim a first episode and list episodes when the scan
  // found most of them.
  const storedCount = Math.min(character.episodes_appeared, scoredEpisodes || character.episodes_appeared);
  const scanComplete = chrono.length >= 0.8 * storedCount;
  const epCount = scanComplete ? chrono.length : storedCount;
  const bestText = best ? cleanJokeText(best.joke.text as string) : '';
  const epCode = (s: number, e: number) => `S${s}E${String(e).padStart(2, '0')}`;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Who is ${display} on ${show.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${display} is ${isMain ? 'a main character' : 'a recurring character'} on ${show.name}${character.actor ? `, played by ${character.actor}` : ''}. ${character.name} has scored jokes in ${epCount} episodes${first ? `, the earliest in "${first.title}" (${epCode(first.season, first.episode)})` : ''}.`,
        },
      },
      ...(character.actor
        ? [{
            '@type': 'Question',
            name: `Who plays ${display} on ${show.name}?`,
            acceptedAnswer: { '@type': 'Answer', text: `${character.actor} plays ${display} on ${show.name}.` },
          }]
        : []),
      ...(best
        ? [{
            '@type': 'Question',
            name: `What is ${character.name}'s funniest line on ${show.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `By the Humor Index's scoring, it is "${bestText}" from "${best.episode}" (${epCode(best.season, best.episode_number)}).`,
            },
          }]
        : []),
      ...(!isMain && scanComplete && chrono.length > 1
        ? [{
            '@type': 'Question',
            name: `What episodes of ${show.name} is ${character.name} in?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${character.name} has scored jokes in ${chrono.length} episodes: ${chrono.map(e => `"${e.title}" (${epCode(e.season, e.episode)})`).join(', ')}.`,
            },
          }]
        : []),
    ],
  };

  // JSON-LD: Person (fictional character) + BreadcrumbList
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: character.character_full_name || character.name,
      alternateName: character.name,
      description: `Fictional character on ${show.name}. ${character.total_jokes.toLocaleString()} analyzed jokes across ${epCount} episodes.`,
      url: `${SITE_URL}/shows/${params.slug}/characters/${encodeURIComponent(character.name)}/`,
      ...(character.actor && {
        performer: { '@type': 'Person', name: character.actor },
      }),
      ...(character.profile_path && {
        image: `https://image.tmdb.org/t/p/w500${character.profile_path}`,
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Shows', item: `${SITE_URL}/shows/` },
        { '@type': 'ListItem', position: 2, name: show.name, item: `${SITE_URL}/shows/${params.slug}/` },
        { '@type': 'ListItem', position: 3, name: 'Characters', item: `${SITE_URL}/shows/${params.slug}/` },
        { '@type': 'ListItem', position: 4, name: character.name, item: `${SITE_URL}/shows/${params.slug}/characters/${encodeURIComponent(character.name)}/` },
      ],
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      {/* Hero backdrop */}
      <div className="relative w-full h-[200px] sm:h-[260px] overflow-hidden">
        {show.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${show.backdrop_path}`}
            alt={`${show.name} backdrop`}
            fill
            className="object-cover object-[center_22%]"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-brand-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/30" />

        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 pb-5">
          <nav className="flex items-center gap-1 text-xs text-brand-text-muted mb-3" aria-label="Breadcrumb">
            <Link href="/shows" className="hover:text-brand-text-secondary transition-colors">Shows</Link>
            <span>/</span>
            <Link href={`/shows/${params.slug}`} className="hover:text-brand-text-secondary transition-colors truncate max-w-[120px]">
              {show.name}
            </Link>
            <span>/</span>
            <span className="text-brand-text-secondary">Characters</span>
            <span>/</span>
            <span className="text-brand-text-secondary truncate max-w-[150px]">{character.name}</span>
          </nav>

          <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Character Analysis</p>
          <div className="flex items-end gap-4">
            {character.profile_path && (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-brand-gold/30 shrink-0">
                <Image
                  src={charImageSrc(character.profile_path)!}
                  alt={character.actor || character.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-medium text-brand-text-primary">
                {character.character_full_name || character.name}
              </h1>
              {character.actor && (
                <p className="text-sm text-brand-text-secondary mt-0.5">
                  Played by <span className="text-brand-text-primary">{character.actor}</span>
                </p>
              )}
              <p className="text-xs text-brand-text-muted mt-1">
                {character.total_jokes} jokes across {epCount} episodes of {show.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-8">
        {/* Who is: the answer a name search is looking for, first. */}
        <section className="mb-8 p-5 sm:p-6 bg-brand-card border border-brand-gold/30 rounded-xl">
          <h2 className="text-[11px] uppercase tracking-widest text-brand-gold mb-3">
            Who is {display} on {show.name}?
          </h2>
          <p className="text-[15px] text-brand-text-primary leading-relaxed">
            {display} is {isMain ? 'a main character' : 'a recurring character'} on{' '}
            <Link href={`/shows/${params.slug}`} className="text-brand-gold hover:underline">{show.name}</Link>
            {character.actor ? <>, played by {character.actor}</> : null}.{' '}
            {character.name} has scored jokes in {epCount}
            {scoredEpisodes > 0 ? <> of the {scoredEpisodes}</> : null} episodes we analyzed
            {first ? (
              <>
                , starting with{' '}
                <Link href={`/shows/${params.slug}/${first.season}/${first.episode}`} className="text-brand-gold hover:underline">
                  &ldquo;{first.title}&rdquo;
                </Link>{' '}
                ({epCode(first.season, first.episode)})
              </>
            ) : null}
            .
          </p>
          {best && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-widest text-brand-text-muted mb-1.5">Funniest line</p>
              <blockquote className="text-lg text-brand-text-primary leading-snug">&ldquo;{bestText}&rdquo;</blockquote>
              <p className="mt-1.5 text-xs text-brand-text-muted">
                <Link href={`/shows/${params.slug}/${best.season}/${best.episode_number}`} className="hover:text-brand-gold transition-colors">
                  {best.episode} <span className="font-mono">{epCode(best.season, best.episode_number)}</span>
                </Link>
              </p>
            </div>
          )}
          {scanComplete && episodeList.length > 1 && (
            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-widest text-brand-text-muted mb-2">
                {isMain ? `Episodes with the most ${character.name} jokes` : `Every ${character.name} episode`}
              </p>
              <div className="flex flex-wrap gap-2">
                {episodeList.map(e => (
                  <Link
                    key={`${e.season}-${e.episode}`}
                    href={`/shows/${params.slug}/${e.season}/${e.episode}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand-text-secondary hover:border-brand-gold/50 hover:text-brand-gold transition-colors"
                  >
                    <span className="font-mono text-brand-text-muted mr-1.5">{epCode(e.season, e.episode)}</span>
                    {e.title}
                    {isMain && <span className="font-mono text-brand-text-muted ml-1.5">{e.n}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {character.war != null && (
            <ScoreCard label="WAR" value={character.war} sub="Wins Above Replacement" />
          )}
          <ScoreCard label="Total Jokes" value={character.total_jokes} sub={`${epCount} episodes`} />
          <ScoreCard label="Avg Craft" value={character.avg_craft} />
          <ScoreCard label="Avg Impact" value={character.avg_impact} />
          <ScoreCard
            label="Comedy Style"
            value={character.dominant_types[0] && JOKE_TYPE_LABELS[character.dominant_types[0]] ? JOKE_TYPE_LABELS[character.dominant_types[0]] : '—'}
            sub={character.dominant_types.slice(1, 3).map(t => JOKE_TYPE_LABELS[t] || t).join(', ')}
          />
        </div>

        {/* Data-driven summary — unique per character (SEO: "is X funny") */}
        <p className="text-sm text-brand-text-secondary leading-relaxed mb-8 max-w-2xl">
          {character.name} delivers <span className="text-brand-text-primary">{character.total_jokes} scored jokes</span> across{' '}
          {epCount} episodes of {show.name}, averaging {character.avg_craft.toFixed(1)} on craft and{' '}
          {character.avg_impact.toFixed(1)} on impact
          {character.war != null ? <> for a career WAR of <span className="text-brand-text-primary">{character.war.toFixed(1)}</span></> : ''}.
          {character.dominant_types[0] && JOKE_TYPE_LABELS[character.dominant_types[0]]
            ? <> Their comedy leans toward {JOKE_TYPE_LABELS[character.dominant_types[0]].toLowerCase()}.</>
            : ''}
          {standouts[0] ? <> The highest-scoring line is below.</> : ''}
        </p>

        {/* Standout jokes */}
        {standouts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
              Funniest {character.name} Lines
            </h2>
            <div className="space-y-3">
              {standouts.map((item, i) => (
                <Link
                  key={i}
                  href={`/shows/${params.slug}/${item.season}/${item.episode_number}`}
                  className="block"
                >
                  <div className="bg-brand-card border border-brand-gold/20 rounded-xl p-4 hover:border-brand-gold/50 transition-colors">
                    <p className="text-sm text-brand-text-primary mb-2 leading-relaxed">
                      {(() => {
                        const chars = (item.joke.characters as string[] | undefined) || [];
                        if (chars.length > 0) {
                          return (
                            <>
                              <span className="text-brand-gold font-medium mr-1.5">{chars.join(' · ')}:</span>
                              {cleanJokeText((item.joke.text as string).replace(new RegExp(`^${chars[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*`), ''))}
                            </>
                          );
                        }
                        return item.joke.text as string;
                      })()}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-brand-text-muted">
                      <span className="font-mono">S{item.season}E{String(item.episode_number).padStart(2, '0')}</span>
                      <span>{item.episode}</span>
                      <span className="ml-auto font-mono">
                        Craft <span className="text-brand-text-secondary">{(item.joke.craft_total as number).toFixed(1)}</span>
                        {' · '}
                        Impact <span className="text-brand-text-secondary">{(item.joke.impact_score as number).toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All jokes */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">
            {capped ? `More of the funniest ${character.name} lines, #${standouts.length + 1} to #${JOKE_LIST_CAP}` : `All jokes — ${jokes.length} total`}
          </p>
          {capped && (
            <p className="text-xs text-brand-text-muted mb-3">
              Ranked by craft and impact, from {jokes.length.toLocaleString()} scored lines. Every episode page lists the rest.
            </p>
          )}
          <div className="space-y-2">
            {jokeList.map((item, i) => (
              <Link
                key={i}
                href={`/shows/${params.slug}/${item.season}/${item.episode_number}`}
                className="block group"
              >
                <div className="flex items-start gap-3 px-3 py-3 hover:bg-brand-surface rounded-lg transition-colors">
                  <span className="font-mono text-xs text-brand-text-muted shrink-0 mt-0.5">
                    S{item.season}E{String(item.episode_number).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-brand-text-secondary flex-1 group-hover:text-brand-text-primary transition-colors leading-relaxed">
                    {(() => {
                      const chars = (item.joke.characters as string[] | undefined) || [];
                      if (chars.length > 0) {
                        return (
                          <>
                            <span className="text-brand-gold font-medium mr-1.5">{chars.join(' · ')}:</span>
                            {cleanJokeText((item.joke.text as string).replace(new RegExp(`^${chars[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*`), ''))}
                          </>
                        );
                      }
                      return item.joke.text as string;
                    })()}
                  </p>
                  <div className="flex gap-2 shrink-0 font-mono text-xs">
                    <span className="text-brand-text-muted">{(item.joke.craft_total as number).toFixed(1)}</span>
                    <span className="text-brand-text-muted">{(item.joke.impact_score as number).toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-10 border-t border-brand-border pt-6 text-sm text-brand-text-muted leading-relaxed">
          See where {character.name}&rsquo;s best lines land among the{' '}
          <Link href={`/shows/${params.slug}/best-jokes`} className="text-brand-gold hover:underline">
            50 funniest {show.name} quotes
          </Link>
          , or{' '}
          <Link href={`/shows/${params.slug}/episodes-ranked`} className="text-brand-gold hover:underline">
            every {show.name} episode ranked
          </Link>.
        </p>
      </div>
    </div>
  );
}

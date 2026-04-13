import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getShow, getCharacters, getCharacterJokes } from '@/lib/data';
import { SHOW_SLUGS } from '@/lib/constants';
import { JOKE_TYPE_LABELS } from '@/lib/scoring';
import ScoreCard from '@/components/ui/ScoreCard';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const params: { slug: string; name: string }[] = [];
  for (const slug of SHOW_SLUGS) {
    try {
      const characters = await getCharacters(slug);
      for (const ch of characters.slice(0, 20)) {
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
  return {
    title: `${name} — ${show.name} Character Analysis`,
    description: `Every joke by ${name} on ${show.name}, scored and ranked. See craft scores, impact ratings, and comedy style breakdown.`,
    alternates: {
      canonical: `https://thehumorindex.com/shows/${params.slug}/characters/${params.name}`,
    },
    openGraph: {
      title: `${name} — ${show.name} Character Analysis`,
      description: `Every joke by ${name} on ${show.name}, scored and ranked. See craft scores, impact ratings, and comedy style breakdown.`,
      images: ['/og-image.png'],
    },
  };
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

  const standouts = topJokes.slice(0, 5);

  return (
    <div>
      {/* Hero backdrop */}
      <div className="relative w-full h-[200px] sm:h-[260px] overflow-hidden">
        {show.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${show.backdrop_path}`}
            alt={`${show.name} backdrop`}
            fill
            className="object-cover"
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
                  src={`https://image.tmdb.org/t/p/w185${character.profile_path}`}
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
                {character.total_jokes} jokes across {character.episodes_appeared} episodes of {show.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {character.war != null && (
            <ScoreCard label="WAR" value={character.war} sub="Wins Above Replacement" />
          )}
          <ScoreCard label="Total Jokes" value={character.total_jokes} sub={`${character.episodes_appeared} episodes`} />
          <ScoreCard label="Avg Craft" value={character.avg_craft} />
          <ScoreCard label="Avg Impact" value={character.avg_impact} />
          <ScoreCard
            label="Comedy Style"
            value={character.dominant_types[0] && JOKE_TYPE_LABELS[character.dominant_types[0]] ? JOKE_TYPE_LABELS[character.dominant_types[0]] : '—'}
            sub={character.dominant_types.slice(1, 3).map(t => JOKE_TYPE_LABELS[t] || t).join(', ')}
          />
        </div>

        {/* Standout jokes */}
        {standouts.length > 0 && (
          <section className="mb-10">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
              Best Jokes by {character.name}
            </p>
            <div className="space-y-3">
              {standouts.map((item, i) => (
                <Link
                  key={i}
                  href={`/shows/${params.slug}/${item.season}/${item.episode_number}`}
                  className="block"
                >
                  <div className="bg-brand-card border border-brand-gold/20 rounded-xl p-4 hover:border-brand-gold/50 transition-colors">
                    <p className="text-sm text-brand-text-primary mb-2">{item.joke.text as string}</p>
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
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
            All Jokes — {jokes.length} total
          </p>
          <div className="space-y-2">
            {jokes.map((item, i) => (
              <Link
                key={i}
                href={`/shows/${params.slug}/${item.season}/${item.episode_number}`}
                className="block group"
              >
                <div className="flex items-start gap-3 px-3 py-3 hover:bg-brand-surface rounded-lg transition-colors">
                  <span className="font-mono text-xs text-brand-text-muted shrink-0 mt-0.5">
                    S{item.season}E{String(item.episode_number).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-brand-text-secondary flex-1 group-hover:text-brand-text-primary transition-colors">
                    {item.joke.text as string}
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
      </div>
    </div>
  );
}

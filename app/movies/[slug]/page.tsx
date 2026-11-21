import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMovies, getMovie, jokeLines, bestLine, lineParts, lineSpeaker, filmTime, shortTitle, laughMapNotes, TMDB_IMG, type MovieJoke } from '@/lib/movies';
import { formatIndex, JOKE_TYPE_LABELS } from '@/lib/scoring';
import ScoreGauge from '@/components/ui/ScoreGauge';
import ShareButton from '@/components/ui/ShareButton';
import AdSlot from '@/components/ads/AdSlot';
import LaughMap from '@/components/movies/LaughMap';
import MatchPill from '@/components/comedy-dna/MatchPill';
import CrossoverStrip from '@/components/movies/CrossoverStrip';
import InlineNewsletterCTA from '@/components/ui/InlineNewsletterCTA';
import { crossoversForMovie, showsLikeMovie } from '@/lib/crossover';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getMovies()).map(m => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const m = await getMovie(params.slug);
  if (!m) return {};
  const name = shortTitle(m.title);
  const top = [...m.jokes].sort((a, b) => b.score - a.score)[0];
  const title = `Is ${name} Funny? Humor Index ${formatIndex(m.humor_index)}/100, Every Joke Scored`;
  const description = `We scored all ${m.total_jokes} jokes in ${m.title} (${m.year}) and mapped where it's funniest. Best line: "${top ? bestLine(top).slice(0, 90) : ''}"`;
  const og = `/api/og?title=${encodeURIComponent(name)}&score=${formatIndex(m.humor_index)}&subtitle=${encodeURIComponent(`${m.total_jokes} jokes scored`)}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/movies/${m.slug}/` },
    openGraph: { title: `${name}: Humor Index ${formatIndex(m.humor_index)}`, description, images: [og] },
    twitter: { card: 'summary_large_image', title: `${name}: Humor Index ${formatIndex(m.humor_index)}`, description, images: [og] },
  };
}

function Spoken({ line }: { line: string }) {
  return (
    <>
      {lineParts(line).map((p, k) => p.direction
        ? <span key={k} className="italic text-brand-text-muted">{p.text}</span>
        : <span key={k}>{p.text}</span>)}
    </>
  );
}

function Quote({ j, rank }: { j: MovieJoke; rank?: number }) {
  const parsed = jokeLines(j.text, j.characters);
  // A joke the scorer logged only as a description: lead with the line it
  // describes, and keep the description underneath as context.
  const onlyNote = parsed.length > 0 && parsed.every(l => l.note);
  const lines = onlyNote ? [{ speaker: lineSpeaker(bestLine(j), j.characters), line: bestLine(j), note: false }] : parsed;
  const squash = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, '');
  const showNote = onlyNote && squash(j.text) !== squash(bestLine(j)) && squash(j.text).length > squash(bestLine(j)).length + 12;
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-4 flex gap-4">
      {rank != null && <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0 pt-0.5">#{rank}</span>}
      <div className="flex-1 min-w-0 space-y-1">
        {lines.map((l, i) => (
          <p key={i} className={`text-sm sm:text-[15px] leading-relaxed ${l.note ? 'italic text-brand-text-secondary' : 'text-brand-text-primary'}`}>
            {l.speaker && <span className="text-brand-gold font-medium mr-1.5">{l.speaker}:</span>}
            {l.note ? l.line : <Spoken line={l.line} />}
          </p>
        ))}
        {showNote && <p className="text-xs italic text-brand-text-muted leading-relaxed">{j.text}</p>}
        <p className="text-[11px] text-brand-text-muted pt-1">
          {filmTime(j.t)}
          {j.joke_types[0] && <> · {JOKE_TYPE_LABELS[j.joke_types[0] as keyof typeof JOKE_TYPE_LABELS] ?? j.joke_types[0].replace(/_/g, ' ')}</>}
        </p>
      </div>
      <span className="font-mono text-base text-brand-gold shrink-0">{j.score.toFixed(1)}</span>
    </div>
  );
}

export default async function MoviePage({ params }: { params: { slug: string } }) {
  const m = await getMovie(params.slug);
  if (!m) notFound();
  const movies = await getMovies();
  const name = shortTitle(m.title);
  const byId = new Map(m.jokes.map(j => [j.id, j]));
  const top = [...m.jokes].sort((a, b) => b.score - a.score);
  const notes = laughMapNotes(m.laugh_map, m.jokes);
  const peakJoke = notes.peak.best ? byId.get(notes.peak.best) : undefined;

  const bins = m.laugh_map.map(b => {
    const j = b.best ? byId.get(b.best) : undefined;
    const line = j ? jokeLines(j.text, j.characters).find(l => !l.note) : undefined;
    return { ...b, best: j ? { line: line?.line ?? j.text, speaker: line?.speaker, t: j.t, score: j.score } : null };
  });

  // Tie TV and film together: shows whose cast overlaps this film's.
  const crossovers = await crossoversForMovie(m.slug);
  const alike = await showsLikeMovie(m.slug, 3);
  const others = movies.filter(x => x.slug !== m.slug).slice(0, 3);

  const reelBest = m.reels.reduce((a, b) => (b.humor_index > a.humor_index ? b : a), m.reels[0]);
  const closer = notes.closer.delta;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: m.title,
    url: `${SITE_URL}/movies/${m.slug}/`,
    dateCreated: m.release_date ?? String(m.year),
    director: m.director ? { '@type': 'Person', name: m.director } : undefined,
    image: m.poster_path ? `${TMDB_IMG}/w500${m.poster_path}` : undefined,
    actor: m.cast.slice(0, 5).map(c => ({ '@type': 'Person', name: c.name })),
    review: {
      '@type': 'Review',
      author: { '@type': 'Organization', name: 'The Humor Index' },
      reviewRating: { '@type': 'Rating', ratingValue: formatIndex(m.humor_index), bestRating: 100, worstRating: 0 },
      reviewBody: `${m.total_jokes} jokes scored for craft and impact.`,
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-border">
        {m.backdrop_path ? (
          <Image src={`${TMDB_IMG}/w1280${m.backdrop_path}`} alt="" fill priority sizes="100vw"
            className="object-cover object-[center_30%] opacity-35" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,185,49,0.18),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-10 sm:pt-16 sm:pb-14">
          <nav className="text-xs text-brand-text-muted mb-6">
            <Link href="/movies" className="hover:text-brand-gold">Movies</Link> <span className="mx-1">/</span> {name}
          </nav>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-end">
            {m.poster_path && (
              <div className="relative w-28 sm:w-40 aspect-[2/3] rounded-lg overflow-hidden border border-brand-border shadow-2xl shrink-0">
                <Image src={`${TMDB_IMG}/w342${m.poster_path}`} alt={`${m.title} poster`} fill sizes="160px" className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {m.rank && (
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">
                    #{m.rank} of {movies.length} {movies.length === 1 ? 'movie' : 'movies'} scored
                  </p>
                )}
                <MatchPill slug={m.slug} />
              </div>
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-brand-text-primary">
                {m.title}
                <span className="sm:hidden ml-2 font-mono text-2xl text-brand-gold align-middle">{formatIndex(m.humor_index)}</span>
              </h1>
              <p className="mt-2 text-sm text-brand-text-secondary">
                {m.year} · {m.director} · {m.runtime_minutes} min
                {m.stars.length > 0 && <> · {m.stars.slice(0, 3).join(', ')}</>}
              </p>
              <p className="mt-4 max-w-2xl text-brand-text-secondary leading-relaxed">{m.overview || m.logline}</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <ScoreGauge score={m.humor_index} size={132} label="Humor Index" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {/* Answer first, the way the show pages do */}
        <p className="rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-sm sm:text-base text-brand-text-secondary leading-relaxed">
          <strong className="text-brand-text-primary">Is {name} funny?</strong>{' '}
          {m.humor_index >= 85 ? 'Yes. ' : m.humor_index >= 70 ? 'Mostly. ' : 'Not very. '}
          {name} scores {formatIndex(m.humor_index)} out of 100 on the Humor Index{m.rank ? `, #${m.rank} of the ${movies.length} ${movies.length === 1 ? 'movie' : 'movies'} we've scored` : ''},
          based on {m.total_jokes} jokes in {m.runtime_minutes} minutes ({m.avg_jpm.toFixed(1)} a minute) with an average craft of {m.avg_craft.toFixed(1)} and impact of {m.avg_impact.toFixed(1)}.
          {peakJoke && <> Its funniest stretch is {filmTime(notes.peak.start)} to {filmTime(notes.peak.end)}.</>}
        </p>

        {/* Laugh Map */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">The Laugh Map</h2>
              <p className="text-sm text-brand-text-secondary mt-1">
                Every joke in {name}, plotted across the runtime.
                {peakJoke && <> The funniest stretch is {filmTime(notes.peak.start)} to {filmTime(notes.peak.end)}.</>}
              </p>
            </div>
            <ShareButton targetId="laugh-map-card" filename={`${m.slug}-laugh-map`} />
          </div>
          <div id="laugh-map-card" className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-medium text-brand-text-primary">{name} ({m.year})</span>
              <span className="font-mono text-sm text-brand-gold">Humor Index {formatIndex(m.humor_index)}</span>
            </div>
            <LaughMap slug={m.slug} bins={bins} peakStart={notes.peak.start} slump={notes.slump} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-brand-border bg-brand-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-brand-text-muted">Funniest five minutes</p>
              <p className="mt-1 text-brand-text-primary font-medium">{filmTime(notes.peak.start)} to {filmTime(notes.peak.end)}</p>
              <p className="text-xs text-brand-text-secondary mt-1">{notes.peak.count} jokes in five minutes</p>
            </div>
            <div className="rounded-xl border border-brand-border bg-brand-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-brand-text-muted">The slump</p>
              <p className="mt-1 text-brand-text-primary font-medium">
                {notes.slump ? `${filmTime(notes.slump.start)} to ${filmTime(notes.slump.end)}` : 'None to speak of'}
              </p>
              <p className="text-xs text-brand-text-secondary mt-1">
                {notes.slump ? 'The longest quiet stretch, usually where the plot does its work' : 'No long quiet stretch anywhere in the film'}
              </p>
            </div>
            <div className="rounded-xl border border-brand-border bg-brand-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-brand-text-muted">The closer</p>
              <p className="mt-1 text-brand-text-primary font-medium">
                {Math.abs(closer) < 0.1 ? 'Holds steady' : closer > 0 ? 'Sticks the landing' : 'Runs out of gas'}
              </p>
              <p className="text-xs text-brand-text-secondary mt-1">
                Last 10 minutes average {notes.closer.avg10.toFixed(2)} per joke vs {notes.closer.avgAll.toFixed(2)} overall
              </p>
            </div>
          </div>
        </section>

        {/* Top 10 */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">The 10 funniest jokes in {name}</h2>
            <Link href={`/movies/${m.slug}/quotes`} className="text-sm text-brand-gold hover:underline shrink-0">
              All {m.total_jokes} ranked →
            </Link>
          </div>
          <div className="space-y-2.5">
            {top.slice(0, 10).map((j, i) => <Quote key={j.id} j={j} rank={i + 1} />)}
          </div>
        </section>

        <AdSlot placement="in-article" />

        {/* Characters */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary mb-4">Who&rsquo;s funniest in {name}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {m.characters.slice(0, 6).map((c, i) => {
              // Their own best line: a joke they lead, not one they are only in.
              const b = top.find(j => j.characters[0] === c.name) ?? byId.get(c.best);
              const line = b ? bestLine(b) : '';
              return (
                <div key={c.name} className="rounded-xl border border-brand-border bg-brand-card p-4 flex gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-brand-surface border border-brand-border shrink-0">
                    {c.profile_path ? (
                      <Image src={`${TMDB_IMG}/w185${c.profile_path}`} alt={c.actor ?? c.name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-brand-text-muted text-lg">{c.name[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-brand-text-primary font-medium">
                      <span className="text-brand-text-muted font-mono text-xs mr-2">#{i + 1}</span>{c.name}
                    </p>
                    <p className="text-xs text-brand-text-muted">{c.actor ? `${c.actor} · ` : ''}{c.jokes} jokes</p>
                    {line && <p className="text-sm text-brand-text-secondary mt-1.5 line-clamp-2">&ldquo;{line}&rdquo;</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Score breakdown */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary mb-4">How the score breaks down</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Jokes per minute', value: m.avg_jpm.toFixed(2), note: `${m.total_jokes} jokes in ${m.runtime_minutes} minutes` },
              { label: 'Craft', value: m.avg_craft.toFixed(2), note: 'How well built the average joke is, out of 10' },
              { label: 'Impact', value: m.avg_impact.toFixed(2), note: 'How hard the average joke lands, out of 10' },
            ].map(x => (
              <div key={x.label} className="rounded-xl border border-brand-border bg-brand-card p-4">
                <p className="text-[11px] uppercase tracking-wider text-brand-text-muted">{x.label}</p>
                <p className="mt-1 font-mono text-2xl text-brand-text-primary">{x.value}</p>
                <p className="text-xs text-brand-text-secondary mt-1">{x.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-brand-border bg-brand-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-brand-text-muted mb-3">Act by act</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {m.reels.map(r => (
                <div key={r.n} className={`rounded-lg p-3 border ${r.n === reelBest.n ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-brand-border'}`}>
                  <p className="text-xs text-brand-text-muted">{filmTime(r.start)} to {filmTime(r.end)}</p>
                  <p className="font-mono text-lg text-brand-text-primary">{formatIndex(r.humor_index)}</p>
                  <p className="text-[11px] text-brand-text-muted">{r.jokes} jokes</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-brand-text-muted">
            Movies are ranked against movies only. A film spends time on plot that a sitcom doesn&rsquo;t, so a movie&rsquo;s score and a TV show&rsquo;s score aren&rsquo;t directly comparable. <Link href="/methodology#movies" className="text-brand-gold hover:underline">How scoring works</Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/compare?show=${m.slug}`} className="text-xs px-3.5 py-2 rounded-full border border-brand-border text-brand-text-secondary hover:text-brand-gold hover:border-brand-gold/50">
              Compare {name} with any show or movie →
            </Link>
            <Link href="/comedy-dna" className="text-xs px-3.5 py-2 rounded-full border border-brand-border text-brand-text-secondary hover:text-brand-gold hover:border-brand-gold/50">
              Is {name} your kind of funny? Take Comedy DNA →
            </Link>
          </div>
        </section>

        <CrossoverStrip items={crossovers} side="movie" title="Same cast on TV"
          subtitle={`${name} actors in the shows we've scored`} />

        {/* Cross-links: TV shows with the closest comedy style, then other movies */}
        {(alike.length > 0 || others.length > 0) && (
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">If you liked {name}</h2>
            <p className="text-sm text-brand-text-secondary mt-1 mb-4">Shows and movies with the closest mix of joke types</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {others.slice(0, 3).map(x => (
                <Link key={x.slug} href={`/movies/${x.slug}`} className="group relative rounded-xl overflow-hidden border border-brand-border bg-brand-card aspect-[16/9]">
                  {x.backdrop_path && <Image src={`${TMDB_IMG}/w780${x.backdrop_path}`} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover opacity-40 group-hover:opacity-55 transition-opacity" />}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-brand-dark/90 to-transparent">
                    <p className="text-[11px] uppercase tracking-wider text-brand-gold">Movie</p>
                    <p className="text-brand-text-primary font-medium">{shortTitle(x.title)}</p>
                    <p className="font-mono text-xs text-brand-text-secondary">{formatIndex(x.humor_index)}</p>
                  </div>
                </Link>
              ))}
              {alike.slice(0, Math.max(0, 3 - others.length)).map(({ show: s, match }) => (
                <Link key={s.slug} href={`/shows/${s.slug}`} className="group relative rounded-xl overflow-hidden border border-brand-border bg-brand-card aspect-[16/9]">
                  {s.backdrop_path && <Image src={`${TMDB_IMG}/w780${s.backdrop_path}`} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover opacity-40 group-hover:opacity-55 transition-opacity" />}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-brand-dark/90 to-transparent">
                    <p className="text-[11px] uppercase tracking-wider text-brand-gold">TV · {match}% style match</p>
                    <p className="text-brand-text-primary font-medium">{s.name}</p>
                    <p className="font-mono text-xs text-brand-text-secondary">{formatIndex(s.humor_index)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <InlineNewsletterCTA />

        {/* Where to watch */}
        {Object.keys(m.watch).length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary mb-4">Where to watch {name}</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(m.watch).flatMap(([kind, ps]) => ps.map(p => (
                <a key={`${kind}-${p.name}`} href={m.watch_link ?? '#'} target="_blank" rel="noopener nofollow"
                  className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text-secondary hover:border-brand-gold/50">
                  {p.logo_path && <Image src={`${TMDB_IMG}/w92${p.logo_path}`} alt="" width={22} height={22} className="rounded" />}
                  {p.name}
                  <span className="text-[10px] uppercase text-brand-text-muted">{kind === 'flatrate' ? 'stream' : kind}</span>
                </a>
              )))}
            </div>
            <p className="mt-2 text-[11px] text-brand-text-muted">US availability from JustWatch via TMDB.</p>
          </section>
        )}
      </div>
    </div>
  );
}

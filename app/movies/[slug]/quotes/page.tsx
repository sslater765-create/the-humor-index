import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMovies, getMovie, jokeLines, bestLine, filmTime, shortTitle } from '@/lib/movies';
import AdSlot from '@/components/ads/AdSlot';
import CopyQuote from '@/components/movies/CopyQuote';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getMovies()).map(m => ({ slug: m.slug }));
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const m = await getMovie(params.slug);
  if (!m) return {};
  const name = shortTitle(m.title);
  const best = [...m.jokes].sort((a, b) => b.score - a.score)[0];
  const n = Math.min(m.total_jokes, 50);
  return {
    title: `${name} Quotes: The ${n} Funniest Lines, Ranked`,
    description: `"${best ? bestLine(best).slice(0, 110) : ''}" Every line in ${m.title} (${m.year}) scored for craft and impact and ranked, from the funniest down.`,
    alternates: { canonical: `${SITE_URL}/movies/${m.slug}/quotes/` },
  };
}

export default async function MovieQuotesPage({ params }: { params: { slug: string } }) {
  const m = await getMovie(params.slug);
  if (!m) notFound();
  const name = shortTitle(m.title);
  // Lines that are only a description of action read badly in a quote list.
  const ranked = [...m.jokes]
    .filter(j => jokeLines(j.text, j.characters).some(l => !l.note))
    .sort((a, b) => b.score - a.score);
  const characters = m.characters.filter(c => c.jokes >= 5).slice(0, 8);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${name} quotes ranked`,
    itemListElement: ranked.slice(0, 20).map((j, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Quotation', text: bestLine(j), spokenByCharacter: j.characters[0] ? { '@type': 'Person', name: j.characters[0] } : undefined },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-brand-text-muted mb-6">
        <Link href="/movies" className="hover:text-brand-gold">Movies</Link>
        <span className="mx-1">/</span>
        <Link href={`/movies/${m.slug}`} className="hover:text-brand-gold">{name}</Link>
        <span className="mx-1">/</span> Quotes
      </nav>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-brand-text-primary">{name} quotes, ranked</h1>
      <p className="mt-3 text-brand-text-secondary leading-relaxed">
        Every line in {m.title} ({m.year}), scored for how well it&rsquo;s built and how hard it lands, from the funniest down.
        Timestamps are film time. <Link href={`/movies/${m.slug}`} className="text-brand-gold hover:underline">See the Laugh Map</Link>.
      </p>

      {characters.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {characters.map(c => (
            <a key={c.name} href={`#${slugify(c.name)}`}
              className="text-xs rounded-full border border-brand-border px-3 py-1 text-brand-text-secondary hover:border-brand-gold/50 hover:text-brand-gold">
              {c.name}
            </a>
          ))}
        </div>
      )}

      <ol className="mt-8 space-y-3">
        {ranked.map((j, i) => {
          const lines = jokeLines(j.text, j.characters);
          return (
            <li key={j.id}>
              {i === 10 && <AdSlot placement="in-article" className="my-6" />}
              <div className="rounded-xl border border-brand-border bg-brand-card p-4 flex gap-4">
                <span className="font-mono text-sm text-brand-text-muted w-8 shrink-0 pt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0 space-y-1">
                  {lines.map((l, k) => (
                    <p key={k} className={`text-sm sm:text-[15px] leading-relaxed ${l.note ? 'italic text-brand-text-secondary' : 'text-brand-text-primary'}`}>
                      {l.speaker && <span className="text-brand-gold font-medium mr-1.5">{l.speaker}:</span>}
                      {l.line}
                    </p>
                  ))}
                  <p className="text-[11px] text-brand-text-muted pt-1">{filmTime(j.t)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-mono text-base text-brand-gold">{j.score.toFixed(1)}</span>
                  {i < 50 && <CopyQuote text={`"${bestLine(j)}" (${name}, ${m.year})`} slug={m.slug} />}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {characters.length > 1 && (
        <section className="mt-14 space-y-10">
          <h2 className="text-xl font-semibold text-brand-text-primary">Best lines by character</h2>
          {characters.map(c => {
            const own = ranked.filter(j => j.characters[0] === c.name).slice(0, 5);
            if (!own.length) return null;
            return (
              <div key={c.name} id={slugify(c.name)} className="scroll-mt-20">
                <h3 className="text-lg text-brand-text-primary font-medium">
                  {c.name} quotes{c.actor && <span className="text-sm text-brand-text-muted font-normal"> · {c.actor}</span>}
                </h3>
                <ul className="mt-3 space-y-2">
                  {own.map(j => (
                    <li key={j.id} className="text-sm text-brand-text-secondary leading-relaxed border-l-2 border-brand-gold/40 pl-3">
                      &ldquo;{bestLine(j)}&rdquo; <span className="text-[11px] text-brand-text-muted font-mono ml-1">{filmTime(j.t)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

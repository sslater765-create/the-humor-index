import Link from 'next/link';
import { getMovies, getMovie, jokeLines, filmTime, shortTitle } from '@/lib/movies';

/**
 * The best lines across every scored movie, for rankings pages that otherwise
 * list TV. Renders nothing until a movie is published.
 */
export default async function MovieLines({ limit = 25, title = 'The best movie lines', subtitle }: { limit?: number; title?: string; subtitle?: string }) {
  const movies = await getMovies();
  if (!movies.length) return null;
  const all = [];
  for (const s of movies) {
    const d = await getMovie(s.slug);
    if (!d) continue;
    for (const j of d.jokes) {
      const lines = jokeLines(j.text, j.characters).filter(l => !l.note);
      if (!lines.length) continue;
      all.push({ j, lines, slug: s.slug, name: shortTitle(s.title), year: s.year });
    }
  }
  const top = all.sort((a, b) => b.j.score - a.j.score).slice(0, limit);
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">Movies</p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-brand-text-secondary mt-1">{subtitle}</p>}
        </div>
        <Link href="/movies" className="text-xs text-brand-gold hover:underline shrink-0">All movies →</Link>
      </div>
      <ol className="space-y-2.5">
        {top.map((x, i) => (
          <li key={`${x.slug}-${x.j.id}`}>
            <Link href={`/movies/${x.slug}/quotes/`} className="flex gap-4 rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-gold/40 transition-colors">
              <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0">{i + 1}</span>
              <span className="flex-1 min-w-0 space-y-1">
                {x.lines.map((l, k) => (
                  <span key={k} className="block text-sm text-brand-text-primary leading-relaxed">
                    {l.speaker && <span className="text-brand-gold font-medium mr-1.5">{l.speaker}:</span>}{l.line}
                  </span>
                ))}
                <span className="block text-[11px] text-brand-text-muted">{x.name} ({x.year}) · {filmTime(x.j.t)}</span>
              </span>
              <span className="font-mono text-base text-brand-gold shrink-0">{x.j.score.toFixed(1)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

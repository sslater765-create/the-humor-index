import Link from 'next/link';
import Image from 'next/image';
import { getMovies, getMovie, shortTitle, bestLine, TMDB_IMG } from '@/lib/movies';

/**
 * Funniest movie characters across every scored film: total joke score, at
 * least 10 jokes. TV characters are ranked by WAR on their own list; this sits
 * beside it, not inside it.
 */
export default async function MovieCharacters({ limit = 12 }: { limit?: number }) {
  const movies = await getMovies();
  if (!movies.length) return null;
  const rows = [];
  for (const s of movies) {
    const d = await getMovie(s.slug);
    if (!d) continue;
    const top = [...d.jokes].sort((a, b) => b.score - a.score);
    for (const c of d.characters.filter(c => c.jokes >= 10)) {
      const own = top.find(j => j.characters[0] === c.name);
      rows.push({ ...c, slug: s.slug, movie: shortTitle(s.title), year: s.year, line: own ? bestLine(own) : '' });
    }
  }
  rows.sort((a, b) => b.total - a.total);
  return (
    <section className="mt-14">
      <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-1">Movies</p>
      <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary">The funniest movie characters</h2>
      <p className="text-sm text-brand-text-secondary mt-1 mb-4">Total score of every joke they lead, in the comedy movies we&rsquo;ve scored.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {rows.slice(0, limit).map((c, i) => (
          <Link key={`${c.slug}-${c.name}`} href={`/movies/${c.slug}/quotes/`}
            className="flex gap-3 rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-gold/40 transition-colors">
            <span className="relative w-12 h-12 rounded-full overflow-hidden bg-brand-surface border border-brand-border shrink-0">
              {c.profile_path
                ? <Image src={`${TMDB_IMG}/w185${c.profile_path}`} alt={c.actor ?? c.name} fill sizes="48px" className="object-cover" />
                : <span className="absolute inset-0 flex items-center justify-center text-brand-text-muted">{c.name[0]}</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-brand-text-primary font-medium truncate"><span className="font-mono text-xs text-brand-text-muted mr-2">#{i + 1}</span>{c.name}</span>
              <span className="block text-xs text-brand-text-muted truncate">{c.movie} ({c.year}){c.actor ? ` · ${c.actor}` : ''} · {c.jokes} jokes</span>
              {c.line && <span className="text-sm text-brand-text-secondary mt-1 line-clamp-2">&ldquo;{c.line}&rdquo;</span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface Row {
  label: string; found: boolean; of: number; attached?: boolean;
  rank?: number; pct?: number; score?: number; season?: number; episode?: number; title?: string; who?: string; text?: string;
}

export type FanFavorite = Row;

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Fan-favorite lines whose best-ranked use is this episode, keyed by normalized joke text. */
export function fanFavoritesForEpisode(slug: string, season: number, episode: number): Map<string, Row> {
  const out = new Map<string, Row>();
  for (const r of load(slug)) {
    if (r.found && r.season === season && r.episode === episode && r.text) out.set(norm(r.text), r);
  }
  return out;
}

export function normJokeText(t: string): string {
  return norm(t);
}

function load(slug: string): Row[] {
  try {
    const all = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'signature-lines.json'), 'utf-8')) as Record<string, Row[]>;
    return all[slug] ?? [];
  } catch {
    return [];
  }
}

/**
 * Fan favorites vs the Index: the lines everyone quotes, and where the scorer
 * put them. Most famous lines live in one episode, so they never count as
 * running gags; this is where they show up. Built by signature_lines.py.
 */
export default function FanFavoritesPanel({ slug, name }: { slug: string; name: string }) {
  const rows = load(slug);
  if (rows.length === 0) return null;
  const missing = rows.filter((r) => !r.found).length;
  return (
    <section id="fan-favorites" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">Fan favorites vs the Index</h2>
      <p className="text-sm text-brand-text-secondary mt-1 mb-4">
        The {name} lines people quote, and where the scorer ranked them among all {rows[0].of.toLocaleString()} jokes.
        {' '}Each links to the line’s best-ranked use, which isn’t always the episode it started in.
        {missing > 0 && ` ${missing} ${missing === 1 ? 'wasn’t' : 'weren’t'} scored as a joke on its own.`}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.label} className="rounded-lg border border-brand-border bg-brand-card px-4 py-3">
            <p className="text-brand-text-primary">“{r.label}”</p>
            {r.found ? (
              <p className="mt-1 text-xs text-brand-text-muted">
                <span className="font-mono text-brand-gold">#{r.rank!.toLocaleString()}</span> of {r.of.toLocaleString()}
                {' '}(top {r.pct! < 1 ? '1' : Math.ceil(r.pct!)}%) ·{' '}
                <Link href={`/shows/${slug}/${r.season}/${r.episode}/`} className="hover:text-brand-gold">S{r.season}E{r.episode} {r.title}</Link>
              </p>
            ) : (
              <p className="mt-1 text-xs text-rose-400">
                {r.attached ? (
                  <>Not scored on its own: it shows up only as context for another joke in{' '}
                    <Link href={`/shows/${slug}/${r.season}/${r.episode}/`} className="underline hover:text-brand-gold">S{r.season}E{r.episode} {r.title}</Link>
                  </>
                ) : 'Not detected as a joke'}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-brand-text-muted">
        A line that ranks low or goes undetected usually lands on delivery or on repetition across the culture, which a transcript can’t show.
      </p>
    </section>
  );
}

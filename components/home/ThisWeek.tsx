import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { POSTS } from '@/app/blog/posts';
import { BRACKET_FIELD } from '@/lib/bracket';
import BracketCallout from './BracketCallout';

/**
 * The week at the Index: the bracket round that's open, the newest column, and
 * a pointer to where the scorer and the fans disagree. Signed, so the site has
 * a person behind it.
 */
export default function ThisWeek() {
  let top = "Dwight's beet farm", bottom = 'Pretty Pretty Pretty Good';
  try {
    const file = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'running-gags.json'), 'utf-8')) as {
      shows: Record<string, { gags: { name: string; lar: number }[] }>;
    };
    const seeded = Object.entries(BRACKET_FIELD)
      .map(([slug, name]) => file.shows[slug]?.gags.find((g) => g.name === name))
      .filter((g): g is { name: string; lar: number } => !!g)
      .sort((a, b) => b.lar - a.lar);
    if (seeded.length >= 16) { top = seeded[0].name; bottom = seeded[15].name; }
  } catch { /* fall back to the defaults */ }

  const columns = Object.entries(POSTS)
    .filter(([, p]) => p.category === 'Column')
    .map(([slug, p], i) => ({ slug, ...p, i }))
    .sort((a, b) => (a.date === b.date ? a.i - b.i : a.date < b.date ? 1 : -1));
  const latest = columns[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-brand-gold">This week at the Index</h2>
        <p className="text-xs text-brand-text-muted">Sam Slater, editor</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <BracketCallout top={top} bottom={bottom} />
        {latest && (
          <Link href={`/blog/${latest.slug}/`} className="group block rounded-xl border border-brand-border bg-brand-card p-5 hover:border-brand-gold/40 transition-colors">
            <p className="text-[11px] uppercase tracking-[0.25em] text-rose-400">Column · The Index is wrong about…</p>
            <p className="mt-1 text-lg text-brand-text-primary group-hover:text-brand-gold transition-colors">{latest.title}</p>
            <p className="mt-1 text-sm text-brand-text-secondary line-clamp-3">{latest.description}</p>
          </Link>
        )}
        <Link href="/shows/seinfeld/#fan-favorites" className="group block rounded-xl border border-brand-border bg-brand-card p-5 hover:border-brand-gold/40 transition-colors">
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold">Fan favorites vs the Index</p>
          <p className="mt-1 text-lg text-brand-text-primary group-hover:text-brand-gold transition-colors">Where the lines everyone quotes actually rank.</p>
          <p className="mt-1 text-sm text-brand-text-secondary">Every show page lists its famous lines and where the scorer put them, misses included. Start with Seinfeld.</p>
        </Link>
      </div>
    </section>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { getAllShows } from '@/lib/data';
import { rankable } from '@/lib/scale';
import { formatIndex, byHumorIndexDesc } from '@/lib/scoring';
import AdSlot from './AdSlot';

/**
 * Desktop right rail for reading pages (blog posts, episode pages, best-jokes):
 * the top of the leaderboard (a reason to click deeper) with a sticky ad under it.
 * Hidden below lg, where the column is the whole screen.
 */
export default async function RankedRail({ exclude }: { exclude?: string }) {
  const shows = rankable(await getAllShows()).sort(byHumorIndexDesc).filter(s => s.slug !== exclude).slice(0, 5);
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-6">
        <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.25em] text-brand-gold">Ranked right now</p>
          {shows.map((s, i) => (
            <Link key={s.slug} href={`/shows/${s.slug}`} className="group flex items-center gap-3 px-4 py-2.5 border-t border-brand-border/50 hover:bg-brand-surface transition-colors">
              <span className="font-mono text-xs text-brand-text-muted w-4">{i + 1}</span>
              <span className="relative w-12 h-7 rounded overflow-hidden bg-brand-surface shrink-0">
                {s.backdrop_path && <Image src={`https://image.tmdb.org/t/p/w185${s.backdrop_path}`} alt="" fill sizes="48px" className="object-cover" />}
              </span>
              <span className="flex-1 min-w-0 text-sm text-brand-text-primary truncate group-hover:text-brand-gold transition-colors">{s.name}</span>
              <span className="font-serif italic text-brand-gold">{formatIndex(s.humor_index)}</span>
            </Link>
          ))}
          <Link href="/shows" className="block px-4 py-3 border-t border-brand-border/50 text-xs text-brand-text-muted hover:text-brand-gold">All shows →</Link>
        </div>
        <AdSlot placement="sidebar" />
      </div>
    </aside>
  );
}

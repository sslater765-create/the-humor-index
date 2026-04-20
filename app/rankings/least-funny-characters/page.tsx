import Link from 'next/link';
import Image from 'next/image';
import { getAllShows, getCharacters } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Least Funny Sitcom Characters, Ranked by Data',
  description:
    "Every ensemble has one. The recurring and main-cast characters whose jokes scored lowest on craft and impact across our analyzed shows — ranked, unfiltered.",
  openGraph: {
    title: 'Least Funny Sitcom Characters, Ranked by AI',
    description: "The data has feelings. Here's who rates at the bottom.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/least-funny-characters',
  },
};

interface BottomCharacter {
  name: string;
  fullName: string;
  showName: string;
  showSlug: string;
  totalJokes: number;
  episodesAppeared: number;
  ratio: number;
  avgCraft: number;
  avgImpact: number;
  quality: number;
  actor?: string;
  profilePath?: string;
}

export default async function LeastFunnyCharactersPage() {
  const shows = await getAllShows();
  const all: BottomCharacter[] = [];

  for (const show of shows) {
    if (show.humor_index <= 0) continue;
    const totalEps = show.total_episodes || 0;
    if (!totalEps) continue;
    try {
      const chars = await getCharacters(show.slug);
      for (const c of chars) {
        if (c.total_jokes < 100) continue;
        const eps = c.episodes_appeared ?? 0;
        const ratio = eps / totalEps;
        if (ratio < 0.3) continue;
        const q = ((c.avg_craft ?? 0) + (c.avg_impact ?? 0)) / 2;
        all.push({
          name: c.name,
          fullName: c.character_full_name || c.name,
          showName: show.name,
          showSlug: show.slug,
          totalJokes: c.total_jokes,
          episodesAppeared: eps,
          ratio,
          avgCraft: c.avg_craft ?? 0,
          avgImpact: c.avg_impact ?? 0,
          quality: q,
          actor: c.actor,
          profilePath: c.profile_path,
        });
      }
    } catch { /* skip */ }
  }

  const ranked = all.sort((a, b) => a.quality - b.quality).slice(0, 50);

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="The Least Funny Sitcom Characters"
        subtitle="Ranked by average craft + impact score. Recurring and main-cast only (30%+ of a show's episodes, 100+ jokes analyzed) — so bit-part guests don't dominate the bottom."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Least Funny Sitcom Characters, Ranked"
            text="Every show has one. See who our AI rates at the bottom."
            url="/rankings/least-funny-characters"
          />
        </div>

        <div className="bg-brand-surface/60 border border-brand-border rounded-lg p-4 mb-8 text-sm text-brand-text-secondary leading-relaxed">
          <strong className="text-brand-text-secondary">A note on fairness:</strong> &ldquo;Least
          funny&rdquo; here means the character&rsquo;s jokes score lowest on craft and impact in
          our analysis — not that they&rsquo;re unlikable or bad. Some characters drive plot rather
          than jokes (the straight man, the romantic lead). Others anchor the show emotionally while
          teammates land the punchlines. This is what the data says, not a character verdict.
        </div>

        <div className="space-y-2">
          {ranked.map((c, i) => (
            <Link
              key={`${c.showSlug}-${c.name}`}
              href={`/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`}
              className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-lg px-4 py-3 hover:border-brand-gold/40 transition-colors group"
            >
              <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0">#{i + 1}</span>
              {c.profilePath ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-brand-surface">
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${c.profilePath}`}
                    alt={c.actor || c.fullName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                  <span className="text-sm text-brand-text-muted">{c.fullName[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                  {c.fullName}
                </p>
                <p className="text-xs text-brand-text-muted truncate">
                  {c.showName} &middot; {c.totalJokes.toLocaleString()} jokes &middot; {c.episodesAppeared} eps
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-sm text-rose-400">{c.quality.toFixed(2)}</p>
                <p className="text-[10px] text-brand-text-muted">craft+impact /2</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">Methodology</p>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl">
            Quality index = (average craft score + average impact score) / 2, averaged across
            every joke attributed to that character across our analyzed episodes. WAR would be
            the usual metric, but it floors at 0 for below-replacement characters — so several
            would tie at zero. Quality gives clean separation. See the{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">full methodology</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

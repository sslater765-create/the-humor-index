import Link from 'next/link';
import { getAllShows, getEpisodes, getEpisodeDetail } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Funniest Sitcom Characters of All Time, Ranked by Data',
  description:
    'We analyzed every joke to rank the funniest characters in sitcom history. Sorted by average craft score, impact, and total jokes delivered.',
  openGraph: {
    title: 'Funniest Sitcom Characters, Ranked by AI',
    description: 'Who delivers the best jokes? The data has the answer.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/funniest-characters',
  },
};

interface CharacterData {
  name: string;
  showName: string;
  showSlug: string;
  totalJokes: number;
  avgCraft: number;
  avgImpact: number;
  combined: number;
  topJoke: string;
}

export default async function FunniestCharactersPage() {
  const shows = await getAllShows();

  // Aggregate character data from joke-level analysis
  const charMap = new Map<string, {
    jokes: number;
    craftSum: number;
    impactSum: number;
    showName: string;
    showSlug: string;
    topJoke: { text: string; score: number };
  }>();

  for (const show of shows) {
    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        try {
          const detail = await getEpisodeDetail(show.slug, ep.season, ep.episode_number);
          if (!detail) continue;
          for (const joke of detail.jokes) {
            for (const char of joke.characters) {
              const key = `${char}|||${show.slug}`;
              const existing = charMap.get(key) || {
                jokes: 0,
                craftSum: 0,
                impactSum: 0,
                showName: show.name,
                showSlug: show.slug,
                topJoke: { text: '', score: 0 },
              };
              existing.jokes++;
              existing.craftSum += joke.craft_total;
              existing.impactSum += joke.impact_score;
              const combined = joke.craft_total + joke.impact_score;
              if (combined > existing.topJoke.score) {
                existing.topJoke = { text: joke.text, score: combined };
              }
              charMap.set(key, existing);
            }
          }
        } catch { /* no detail */ }
      }
    } catch { /* no episodes */ }
  }

  // Convert to array and sort
  const characters: CharacterData[] = [];
  charMap.forEach((data, key) => {
    const name = key.split('|||')[0];
    if (data.jokes < 5) return; // Min 5 jokes to qualify
    characters.push({
      name,
      showName: data.showName,
      showSlug: data.showSlug,
      totalJokes: data.jokes,
      avgCraft: data.craftSum / data.jokes,
      avgImpact: data.impactSum / data.jokes,
      combined: (data.craftSum + data.impactSum) / data.jokes,
      topJoke: data.topJoke.text,
    });
  });

  const ranked = characters.sort((a, b) => b.combined - a.combined).slice(0, 50);

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="The Funniest Characters in Sitcom History"
        subtitle="Ranked by average joke quality. Minimum 5 jokes to qualify."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Funniest Sitcom Characters Ranked by Data"
            text="We analyzed every joke to find the funniest sitcom characters of all time. #1 might surprise you."
            url="/rankings/funniest-characters"
          />
        </div>

        <div className="space-y-2">
          {ranked.map((char, i) => (
            <div
              key={`${char.name}-${char.showSlug}`}
              className="flex items-center justify-between p-4 bg-brand-card border border-brand-border rounded-xl"
            >
              <div className="flex items-center gap-4">
                <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                  {i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-text-primary font-medium">{char.name}</span>
                    <Link
                      href={`/shows/${char.showSlug}`}
                      className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors"
                    >
                      {char.showName}
                    </Link>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-brand-text-muted">
                    <span>{char.totalJokes} jokes</span>
                    <span>Craft {char.avgCraft.toFixed(1)}</span>
                    <span>Impact {char.avgImpact.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <span className="font-mono text-lg text-brand-gold font-medium">
                {char.combined.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {ranked.length === 0 && (
          <p className="text-brand-text-muted text-center py-12">
            No character data available yet. Check back once more episodes are analyzed.
          </p>
        )}
      </div>
    </div>
  );
}

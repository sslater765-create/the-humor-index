import Link from 'next/link';
import { getAllShows, getCharacters } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import CharactersClient, { type WarCharacter } from './CharactersClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Funniest Sitcom Characters of All Time, Ranked by Data',
  description:
    'We analyzed every joke to rank the funniest characters in sitcom history. Filter by show, tier, and sort by total career WAR or WAR per episode.',
  openGraph: {
    title: 'Funniest Sitcom Characters, Ranked by AI',
    description: 'Who delivers the best jokes? The data has the answer.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/funniest-characters',
  },
};

export default async function FunniestCharactersPage() {
  const shows = await getAllShows();

  // Pull characters from the canonical characters.json — pre-cleaned and de-duped at generation time
  const warChars: WarCharacter[] = [];
  for (const show of shows) {
    let chars: Awaited<ReturnType<typeof getCharacters>> = [];
    try {
      chars = await getCharacters(show.slug);
    } catch { continue; }

    for (const c of chars) {
      if (c.total_jokes < 10) continue;
      warChars.push({
        name: c.name,
        showName: show.name,
        showSlug: show.slug,
        war: c.war ?? 0,
        warPerEpisode: c.episodes_appeared ? (c.war ?? 0) / c.episodes_appeared : 0,
        totalJokes: c.total_jokes,
        episodesAppeared: c.episodes_appeared ?? 0,
        avgCraft: c.avg_craft ?? 0,
        avgImpact: c.avg_impact ?? 0,
      });
    }
  }

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="The Funniest Characters in Sitcom History"
        subtitle="Ranked by career WAR — total comedic value across every episode. Filter by show, tier, and sort by total or per-episode contribution."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Funniest Sitcom Characters Ranked by Data"
            text="We analyzed every joke to find the funniest sitcom characters of all time. #1 might surprise you."
            url="/rankings/funniest-characters"
          />
        </div>

        {warChars.length > 0 ? (
          <CharactersClient characters={warChars} />
        ) : (
          <p className="text-brand-text-muted text-center py-12">
            No character data available yet. Check back once more episodes are analyzed.
          </p>
        )}

        {/* JSON-LD ItemList for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Funniest Sitcom Characters of All Time',
              itemListElement: warChars
                .sort((a, b) => b.war - a.war)
                .slice(0, 25)
                .map((c, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: `${c.name} — ${c.showName}`,
                  url: `https://thehumorindex.com/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`,
                })),
            }),
          }}
        />
        <Link href="/rankings" className="text-xs text-brand-text-muted hover:text-brand-gold block text-center mt-8">
          ← Back to all rankings
        </Link>
      </div>
    </div>
  );
}

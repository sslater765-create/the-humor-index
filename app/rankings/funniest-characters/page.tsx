import Link from 'next/link';
import { getAllShows, getEpisodes, getEpisodeDetail, getCharacters } from '@/lib/data';
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
    if (data.jokes < 10) return; // Min 10 jokes to qualify
    // Skip generic non-character entries
    const skip = ['Unknown', 'Others', 'Multiple', 'Everyone', 'Employee', 'Man', 'Woman'];
    if (skip.includes(name)) return;
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

  // Build career WAR leaderboard from characters.json files
  const warChars: Array<{
    name: string;
    showName: string;
    showSlug: string;
    war: number;
    warPerEpisode: number;
    totalJokes: number;
    episodesAppeared: number;
  }> = [];

  for (const show of shows) {
    try {
      const chars = await getCharacters(show.slug);
      for (const c of chars) {
        if (c.war == null || c.war <= 0) continue;
        const skip = ['Unknown', 'Others', 'Multiple', 'Everyone', 'Employee', 'Man', 'Woman'];
        if (skip.includes(c.name)) continue;
        warChars.push({
          name: c.name,
          showName: show.name,
          showSlug: show.slug,
          war: c.war,
          warPerEpisode: c.episodes_appeared ? c.war / c.episodes_appeared : 0,
          totalJokes: c.total_jokes,
          episodesAppeared: c.episodes_appeared ?? 0,
        });
      }
    } catch { /* no characters */ }
  }
  warChars.sort((a, b) => b.war - a.war);

  const mainChars = characters.filter(c => c.totalJokes >= 100).sort((a, b) => b.combined - a.combined);
  const recurringChars = characters.filter(c => c.totalJokes >= 25 && c.totalJokes < 100).sort((a, b) => b.combined - a.combined);
  const guestChars = characters.filter(c => c.totalJokes >= 10 && c.totalJokes < 25).sort((a, b) => b.combined - a.combined);

  const CharRow = ({ char, i }: { char: CharacterData; i: number }) => (
    <Link
      href={`/shows/${char.showSlug}/characters/${encodeURIComponent(char.name)}`}
      className="flex items-center justify-between p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
          {i + 1}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-brand-text-primary font-medium group-hover:text-brand-gold transition-colors">{char.name}</span>
            <span className="text-xs text-brand-text-muted">{char.showName}</span>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-brand-text-muted">
            <span>{char.totalJokes} jokes</span>
            <span>Craft {char.avgCraft.toFixed(1)}</span>
            <span>Impact {char.avgImpact.toFixed(1)}</span>
            {char.totalJokes < 20 && (
              <span className="text-amber-400 text-[10px]">small sample</span>
            )}
          </div>
        </div>
      </div>
      <span className="font-mono text-lg text-brand-gold font-medium">
        {char.combined.toFixed(1)}
      </span>
    </Link>
  );

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="The Funniest Characters in Sitcom History"
        subtitle="Ranked by average joke quality (craft + impact). Click any character to see all their jokes."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Funniest Sitcom Characters Ranked by Data"
            text="We analyzed every joke to find the funniest sitcom characters of all time. #1 might surprise you."
            url="/rankings/funniest-characters"
          />
        </div>

        {/* Career WAR leaderboard (total contribution across all episodes) */}
        {warChars.length > 0 && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Most Valuable Characters of All Time</p>
            <p className="text-sm text-brand-text-muted mb-4">
              Career WAR (Wins Above Replacement) — total comedic value across every episode.
            </p>
            <div className="space-y-2">
              {warChars.slice(0, 25).map((c, i) => (
                <Link
                  key={`war-${c.name}-${c.showSlug}`}
                  href={`/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`}
                  className="flex items-center justify-between p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-text-primary font-medium group-hover:text-brand-gold transition-colors">{c.name}</span>
                        <span className="text-xs text-brand-text-muted">{c.showName}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-brand-text-muted">
                        <span>{c.totalJokes.toLocaleString()} jokes</span>
                        <span>{c.episodesAppeared} eps</span>
                        <span>{c.warPerEpisode.toFixed(2)} WAR/ep</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg text-brand-gold font-medium">{c.war.toFixed(1)}</span>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-widest">WAR</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main characters (100+ jokes) */}
        {mainChars.length > 0 && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Highest Average Joke Quality</p>
            <p className="text-sm text-brand-text-muted mb-4">Main characters — ranked by per-joke quality (100+ jokes)</p>
            <div className="space-y-2">
              {mainChars.map((char, i) => <CharRow key={`${char.name}-${char.showSlug}`} char={char} i={i} />)}
            </div>
          </div>
        )}

        {/* Recurring characters (25-99 jokes) */}
        {recurringChars.length > 0 && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Recurring Characters</p>
            <p className="text-sm text-brand-text-muted mb-4">25–99 jokes analyzed</p>
            <div className="space-y-2">
              {recurringChars.map((char, i) => <CharRow key={`${char.name}-${char.showSlug}`} char={char} i={i} />)}
            </div>
          </div>
        )}

        {/* Guest / minor characters (10-24 jokes) */}
        {guestChars.length > 0 && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Guest &amp; Minor Characters</p>
            <p className="text-sm text-brand-text-muted mb-4">10–24 jokes analyzed</p>
            <div className="space-y-2">
              {guestChars.map((char, i) => <CharRow key={`${char.name}-${char.showSlug}`} char={char} i={i} />)}
            </div>
          </div>
        )}

        {characters.length === 0 && (
          <p className="text-brand-text-muted text-center py-12">
            No character data available yet. Check back once more episodes are analyzed.
          </p>
        )}
      </div>
    </div>
  );
}

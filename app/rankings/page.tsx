import Link from 'next/link';
import { getAllShows, getEpisodes, getEpisodeDetail } from '@/lib/data';
import { formatIndex, scoreToGrade, scoreToColor } from '@/lib/scoring';
import PageHeader from '@/components/layout/PageHeader';
import RankBadge from '@/components/ui/RankBadge';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Comedy Rankings — Funniest Episodes, Best Jokes, Show Comparisons',
  description:
    'Data-driven comedy rankings: the funniest sitcom episodes ever, the best jokes scored by AI, and head-to-head show comparisons. All based on our Humor Index methodology.',
  alternates: {
    canonical: 'https://thehumorindex.com/rankings',
  },
};

interface RankedEpisode {
  showName: string;
  showSlug: string;
  season: number;
  episode_number: number;
  title: string;
  humor_index: number;
  total_jokes: number;
}

interface TopJoke {
  text: string;
  characters: string[];
  craft_total: number;
  impact_score: number;
  showName: string;
  episodeTitle: string;
}

interface TopCharacter {
  name: string;
  showName: string;
  totalJokes: number;
  combined: number;
}

const EXCLUDED_CHARACTERS = new Set([
  'Unknown', 'Others', 'Multiple', 'Everyone', 'Employee',
  'Man', 'Woman', 'Narrator', 'All', 'Group', 'Various',
]);

export default async function RankingsPage() {
  const shows = await getAllShows();
  const analyzedShows = shows.filter(s => s.humor_index > 0);

  // Gather all episodes + find top joke + aggregate characters
  const allEpisodes: RankedEpisode[] = [];
  let topJoke: TopJoke | null = null;
  let topJokeScore = 0;
  const charMap = new Map<string, { name: string; showName: string; totalJokes: number; craftSum: number; impactSum: number }>();
  let totalJokesScored = 0;

  for (const show of analyzedShows) {
    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        if (ep.humor_index > 0) {
          allEpisodes.push({
            showName: show.name,
            showSlug: show.slug,
            season: ep.season,
            episode_number: ep.episode_number,
            title: ep.title,
            humor_index: ep.humor_index,
            total_jokes: ep.total_jokes,
          });
        }
      }

      // Get episode details for top joke + character aggregation
      for (const ep of episodes) {
        if (ep.humor_index <= 0) continue;
        try {
          const detail = await getEpisodeDetail(show.slug, ep.season, ep.episode_number);
          if (!detail?.jokes) continue;
          for (const joke of detail.jokes) {
            totalJokesScored++;
            const score = (joke.craft_total || 0) + (joke.impact_score || 0);
            if (score > topJokeScore && joke.text) {
              topJokeScore = score;
              topJoke = {
                text: joke.text,
                characters: joke.characters || [],
                craft_total: joke.craft_total,
                impact_score: joke.impact_score,
                showName: show.name,
                episodeTitle: ep.title,
              };
            }

            // Character aggregation
            for (const char of (joke.characters || [])) {
              if (EXCLUDED_CHARACTERS.has(char)) continue;
              const key = `${char}::${show.name}`;
              const existing = charMap.get(key);
              if (existing) {
                existing.totalJokes++;
                existing.craftSum += joke.craft_total || 0;
                existing.impactSum += joke.impact_score || 0;
              } else {
                charMap.set(key, {
                  name: char,
                  showName: show.name,
                  totalJokes: 1,
                  craftSum: joke.craft_total || 0,
                  impactSum: joke.impact_score || 0,
                });
              }
            }
          }
        } catch { /* skip episode */ }
      }
    } catch { /* skip show */ }
  }

  // Top 3 episodes
  const topEpisodes = allEpisodes
    .sort((a, b) => b.humor_index - a.humor_index)
    .slice(0, 3);

  // Top 3 characters (100+ jokes)
  // combined = avg craft + avg impact (same formula as funniest-characters page)
  const topCharacters: TopCharacter[] = Array.from(charMap.values())
    .filter(c => c.totalJokes >= 100)
    .map(c => ({
      name: c.name,
      showName: c.showName,
      totalJokes: c.totalJokes,
      combined: (c.craftSum + c.impactSum) / c.totalJokes,
    }))
    .sort((a, b) => b.combined - a.combined)
    .slice(0, 3);

  // Show matchup data
  const office = analyzedShows.find(s => s.slug === 'the-office');
  const seinfeld = analyzedShows.find(s => s.slug === 'seinfeld');

  const PODIUM_COLORS = ['text-brand-gold', 'text-gray-300', 'text-amber-600'];
  const PODIUM_LABELS = ['#1', '#2', '#3'];

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="Comedy Rankings"
        subtitle={`${allEpisodes.length} episodes analyzed. ${totalJokesScored.toLocaleString()} jokes scored. No opinions — just data.`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        {/* Hero: Top Episodes */}
        <Link
          href="/rankings/funniest-episodes"
          className="block bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/40 transition-colors group"
        >
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Episodes Ranked</p>
                <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors">
                  The Funniest Episodes of All Time
                </h2>
              </div>
              <span className="text-sm text-brand-text-muted group-hover:text-brand-gold transition-colors hidden sm:block">
                View all {allEpisodes.length} →
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topEpisodes.map((ep, i) => (
                <div
                  key={`${ep.showSlug}-${ep.season}-${ep.episode_number}`}
                  className={`bg-brand-surface rounded-lg p-4 ${i === 0 ? 'sm:ring-1 sm:ring-brand-gold/30' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-mono text-lg font-bold ${PODIUM_COLORS[i]}`}>{PODIUM_LABELS[i]}</span>
                    <span className="font-mono text-2xl font-medium" style={{ color: scoreToColor(ep.humor_index) }}>
                      {formatIndex(ep.humor_index)}
                    </span>
                    <span className="font-mono text-sm text-brand-text-muted ml-auto">{scoreToGrade(ep.humor_index)}</span>
                  </div>
                  <p className="text-sm font-medium text-brand-text-primary mb-0.5">{ep.title}</p>
                  <p className="text-xs text-brand-text-muted">
                    {ep.showName} &middot; S{ep.season}E{ep.episode_number} &middot; {ep.total_jokes} jokes
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Link>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Best Jokes */}
          <Link
            href="/rankings/best-jokes"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors group"
          >
            <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">Jokes Scored</p>
            <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-4">
              The Best Jokes Ever Written
            </h2>
            {topJoke && (
              <div className="bg-brand-surface rounded-lg p-4">
                <p className="text-sm text-brand-text-secondary italic leading-relaxed line-clamp-3 mb-3">
                  &ldquo;{topJoke.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-brand-text-muted">
                    {topJoke.characters[0] && <span className="text-brand-text-secondary">{topJoke.characters[0]}</span>}
                    {topJoke.characters[0] && ' — '}{topJoke.showName}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-brand-gold font-mono">{topJoke.craft_total.toFixed(1)}</span>
                    <span className="text-brand-text-muted">/</span>
                    <span className="text-emerald-400 font-mono">{topJoke.impact_score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-brand-text-muted mt-3 group-hover:text-brand-gold transition-colors">
              View top 100 jokes →
            </p>
          </Link>

          {/* Funniest Characters */}
          <Link
            href="/rankings/funniest-characters"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors group"
          >
            <p className="text-xs uppercase tracking-widest text-emerald-400 mb-1">Characters Ranked</p>
            <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-4">
              The Funniest Characters of All Time
            </h2>
            <div className="space-y-2.5">
              {topCharacters.map((char, i) => (
                <div key={char.name} className="flex items-center gap-3 bg-brand-surface rounded-lg px-3 py-2.5">
                  <RankBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-text-primary">{char.name}</p>
                    <p className="text-xs text-brand-text-muted">{char.showName} &middot; {char.totalJokes} jokes</p>
                  </div>
                  <span className="font-mono text-sm text-brand-gold">
                    {char.combined.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-3 group-hover:text-brand-gold transition-colors">
              View all characters →
            </p>
          </Link>

          {/* Head-to-Head */}
          <Link
            href="/compare/the-office-vs-seinfeld"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors group"
          >
            <p className="text-xs uppercase tracking-widest text-purple-400 mb-1">Head-to-Head</p>
            <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-4">
              The Office vs Seinfeld
            </h2>
            {office && seinfeld && (
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-brand-surface rounded-lg p-4 text-center">
                  <p className="font-mono text-2xl text-brand-gold">{formatIndex(office.humor_index)}</p>
                  <p className="text-xs text-brand-text-muted mt-1">The Office</p>
                </div>
                <span className="text-lg text-brand-text-muted font-medium">vs</span>
                <div className="flex-1 bg-brand-surface rounded-lg p-4 text-center">
                  <p className="font-mono text-2xl text-blue-400">{formatIndex(seinfeld.humor_index)}</p>
                  <p className="text-xs text-brand-text-muted mt-1">Seinfeld</p>
                </div>
              </div>
            )}
            <p className="text-xs text-brand-text-muted mt-3 group-hover:text-brand-gold transition-colors">
              See full comparison →
            </p>
          </Link>

          {/* Worst Episodes */}
          <Link
            href="/rankings/worst-episodes"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors group"
          >
            <p className="text-xs uppercase tracking-widest text-rose-400 mb-1">The Other End</p>
            <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-4">
              The Worst Episodes of All Time
            </h2>
            <div className="bg-brand-surface rounded-lg p-4">
              <p className="text-sm text-brand-text-secondary leading-relaxed">
                Every show has them. Pilots that haven&rsquo;t found the voice. Clip shows.
                Episodes where the plot forgot to include jokes. The 50 lowest-scoring episodes
                in our dataset &mdash; ranked.
              </p>
            </div>
            <p className="text-xs text-brand-text-muted mt-3 group-hover:text-brand-gold transition-colors">
              See the bottom 50 &rarr;
            </p>
          </Link>

          {/* Search */}
          <Link
            href="/search"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors group"
          >
            <p className="text-xs uppercase tracking-widest text-amber-400 mb-1">Search</p>
            <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-4">
              Search Every Joke
            </h2>
            <div className="bg-brand-surface rounded-lg p-4 text-center">
              <p className="font-mono text-3xl text-brand-gold">{totalJokesScored.toLocaleString()}</p>
              <p className="text-xs text-brand-text-muted mt-1 uppercase tracking-widest">Jokes Searchable</p>
            </div>
            <p className="text-xs text-brand-text-muted mt-3 group-hover:text-brand-gold transition-colors">
              Find any joke, character, or moment →
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}

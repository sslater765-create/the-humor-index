import Link from 'next/link';
import { getAllShows, getEpisodes, getEpisodeDetail, getCharacters, getSearchableJokeCount } from '@/lib/data';
import { formatIndex, scoreToGrade, scoreToColor } from '@/lib/scoring';
import PageHeader from '@/components/layout/PageHeader';
import RankBadge from '@/components/ui/RankBadge';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Comedy Rankings — Funniest Episodes, Best Jokes, Show Comparisons',
  description:
    'Data-driven comedy rankings: the funniest sitcom episodes ever, the best jokes scored by AI, and head-to-head show comparisons. All based on our Humor Index methodology.',
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/',
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
  showSlug: string;
  actorOrProfile?: string;
  profilePath?: string;
  totalJokes: number;
  war: number;
  quality: number;
  vsCastmates: number | null;
  episodesAppeared: number;
  showTotalEpisodes: number;
}

export default async function RankingsPage() {
  const shows = await getAllShows();
  const analyzedShows = shows.filter(s => s.humor_index > 0);
  const searchableJokes = await getSearchableJokeCount();
  const topJpmShows = [...analyzedShows].sort((a, b) => (b.avg_jpm || 0) - (a.avg_jpm || 0)).slice(0, 3);

  // Gather all episodes + find top joke + aggregate characters
  const allEpisodes: RankedEpisode[] = [];
  let topJoke: TopJoke | null = null;
  let topJokeScore = 0;
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

            // (character aggregation moved below — uses canonical characters.json instead of raw joke strings)
          }
        } catch { /* skip episode */ }
      }
    } catch { /* skip show */ }
  }

  // Top 3 episodes
  const topEpisodes = allEpisodes
    .sort((a, b) => b.humor_index - a.humor_index)
    .slice(0, 3);

  // Hero data: the #1 episode's backdrop + its single best joke (for pull quote).
  // We already loaded episode detail above to build the global top joke; do the
  // same for #1 specifically so the hero quote is FROM the headlining episode
  // rather than just the global craft+impact leader.
  const heroEp = topEpisodes[0];
  const heroShow = heroEp ? analyzedShows.find(s => s.slug === heroEp.showSlug) : null;
  let heroTopJoke: TopJoke | null = null;
  if (heroEp) {
    try {
      const detail = await getEpisodeDetail(heroEp.showSlug, heroEp.season, heroEp.episode_number);
      if (detail?.jokes?.length) {
        let bestScore = 0;
        for (const j of detail.jokes) {
          const s = (j.craft_total || 0) + (j.impact_score || 0);
          if (s > bestScore && j.text) {
            bestScore = s;
            heroTopJoke = {
              text: j.text,
              characters: j.characters || [],
              craft_total: j.craft_total,
              impact_score: j.impact_score,
              showName: heroEp.showName,
              episodeTitle: heroEp.title,
            };
          }
        }
      }
    } catch { /* fall back to no pull quote */ }
  }

  // Top + bottom characters — pull from canonical characters.json per show (already de-duped + merged)
  const allCharacters: TopCharacter[] = [];
  for (const show of analyzedShows) {
    try {
      const chars = await getCharacters(show.slug);
      for (const c of chars) {
        if (c.total_jokes < 100) continue;
        allCharacters.push({
          name: c.character_full_name || c.name,
          showName: show.name,
          showSlug: show.slug,
          actorOrProfile: (c as any).actor,
          profilePath: (c as any).profile_path,
          totalJokes: c.total_jokes,
          war: c.war ?? 0,
          quality: ((c.avg_craft ?? 0) + (c.avg_impact ?? 0)) / 2,
          vsCastmates: c.vs_castmates_delta ?? null,
          episodesAppeared: c.episodes_appeared ?? 0,
          showTotalEpisodes: show.total_episodes || 0,
        });
      }
    } catch { /* skip show without characters.json */ }
  }
  const topCharacters: TopCharacter[] = [...allCharacters]
    .sort((a, b) => b.war - a.war)
    .slice(0, 3);
  // Least-funny: same-episode head-to-head against the rest of the cast.
  // Negative vsCastmates = rates lower than teammates in episodes they share.
  // This is the cleanest signal (controlled comparison) vs. global quality cuts.
  const bottomCharacters: TopCharacter[] = allCharacters
    .filter(c =>
      c.showTotalEpisodes > 0 &&
      c.episodesAppeared / c.showTotalEpisodes >= 0.3 &&
      c.vsCastmates !== null &&
      c.vsCastmates < 0
    )
    .sort((a, b) => (a.vsCastmates ?? 0) - (b.vsCastmates ?? 0))
    .slice(0, 3);

  // Show matchup data — dynamic top-2 of the current leaderboard.
  // (Was hardcoded AD vs Parks; Parks isn't scored yet, so the card rendered empty.)
  const sortedByHI = [...analyzedShows].sort((a, b) => b.humor_index - a.humor_index);
  const topShow = sortedByHI[0];
  const runnerUp = sortedByHI[1];
  const topGap = topShow && runnerUp
    ? Math.round((topShow.humor_index - runnerUp.humor_index) * 10) / 10
    : 0;

  // Worst episodes — bottom 3 from the same allEpisodes list, ascending HI.
  const worstEpisodes = [...allEpisodes]
    .sort((a, b) => a.humor_index - b.humor_index)
    .slice(0, 3);

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

        {/* HERO — magazine-cover treatment for the #1 episode of all time. */}
        {heroEp && (
          <Link
            href={`/shows/${heroEp.showSlug}/${heroEp.season}/${heroEp.episode_number}`}
            className="relative block rounded-2xl overflow-hidden border border-brand-border hover:border-brand-gold/50 transition-colors group min-h-[440px] sm:min-h-[520px]"
          >
            {/* Backdrop image (the host show's TMDB backdrop, dark + zoomed for editorial feel) */}
            {heroShow?.backdrop_path && (
              <div
                className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-700"
                style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${heroShow.backdrop_path})` }}
              />
            )}
            {/* Triple-stack overlay: solid bottom, dark gradient up, gold tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/70 via-transparent to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-medium">#1 Episode of All Time</span>
                <span className="h-px flex-1 bg-gradient-to-r from-brand-gold/40 to-transparent" />
              </div>

              <p className="text-xs sm:text-sm text-brand-text-muted uppercase tracking-widest mb-2">
                {heroEp.showName} · S{heroEp.season}E{heroEp.episode_number}
              </p>

              <h2 className="font-serif italic text-4xl sm:text-6xl text-white mb-6 max-w-3xl leading-[1.05] group-hover:text-brand-gold transition-colors">
                {heroEp.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 sm:gap-10 items-end">
                {heroTopJoke && (
                  <blockquote className="border-l-2 border-brand-gold/70 pl-4 max-w-2xl">
                    <p className="text-sm sm:text-base text-white/85 italic leading-relaxed line-clamp-3">
                      &ldquo;{heroTopJoke.text}&rdquo;
                    </p>
                    <footer className="mt-2 text-[11px] text-brand-text-muted uppercase tracking-widest">
                      {heroTopJoke.characters[0] || 'Top joke'} · craft {heroTopJoke.craft_total.toFixed(1)} · impact {heroTopJoke.impact_score.toFixed(1)}
                    </footer>
                  </blockquote>
                )}

                <div className="text-right">
                  <p className="font-mono font-bold text-6xl sm:text-7xl leading-none" style={{ color: scoreToColor(heroEp.humor_index) }}>
                    {formatIndex(heroEp.humor_index)}
                  </p>
                  <p className="text-[11px] text-brand-text-muted uppercase tracking-[0.25em] mt-2">Humor Index · {scoreToGrade(heroEp.humor_index)} · {heroEp.total_jokes} jokes</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Runners-up — #2 and #3 in a sleek 2-column row that feels like editorial sidebars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {topEpisodes.slice(1, 3).map((ep, idx) => {
            const i = idx + 1;
            return (
              <Link
                key={`${ep.showSlug}-${ep.season}-${ep.episode_number}`}
                href={`/shows/${ep.showSlug}/${ep.season}/${ep.episode_number}`}
                className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] uppercase tracking-[0.3em] font-medium ${PODIUM_COLORS[i]}`}>{PODIUM_LABELS[i]} Episode</span>
                  <span className="h-px flex-1 bg-brand-border" />
                </div>
                <p className="text-xs text-brand-text-muted uppercase tracking-widest mb-1">
                  {ep.showName} · S{ep.season}E{ep.episode_number}
                </p>
                <h3 className="font-serif italic text-2xl text-brand-text-primary group-hover:text-brand-gold transition-colors mb-4 leading-tight">
                  {ep.title}
                </h3>
                <div className="flex items-end justify-between">
                  <p className="text-xs text-brand-text-muted">{ep.total_jokes} jokes scored</p>
                  <p className="font-mono font-bold text-4xl" style={{ color: scoreToColor(ep.humor_index) }}>
                    {formatIndex(ep.humor_index)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/rankings/funniest-episodes"
          className="block text-center text-sm text-brand-text-muted hover:text-brand-gold transition-colors py-2"
        >
          View the full episode leaderboard — all {allEpisodes.length} ranked →
        </Link>

        {/* SECTION DIVIDER — magazine-y page break */}
        <div className="flex items-center gap-4 pt-4">
          <span className="h-px flex-1 bg-brand-border" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-text-muted">More from the index</span>
          <span className="h-px flex-1 bg-brand-border" />
        </div>

        {/* BEST JOKE EVER — full-width pull-quote treatment, the page's editorial centerpiece */}
        {topJoke && (
          <Link
            href="/rankings/best-jokes"
            className="block relative bg-brand-card border border-brand-border rounded-xl p-8 sm:p-12 hover:border-brand-gold/40 transition-colors group overflow-hidden"
          >
            <div className="absolute top-6 left-6 sm:top-10 sm:left-10 font-serif text-7xl sm:text-9xl text-brand-gold/15 leading-none select-none pointer-events-none">&ldquo;</div>
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-medium mb-4">The Single Best Joke We&rsquo;ve Scored</p>
              <blockquote className="font-serif italic text-2xl sm:text-3xl text-white leading-snug mb-6 max-w-3xl">
                {topJoke.text}
              </blockquote>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-brand-text-primary">
                    {topJoke.characters[0] && <span className="text-brand-gold font-medium">{topJoke.characters[0]}</span>}
                    {topJoke.characters[0] && <span className="text-brand-text-muted"> · </span>}
                    <span className="text-brand-text-secondary">{topJoke.showName}</span>
                    <span className="text-brand-text-muted"> · </span>
                    <span className="text-brand-text-muted italic">&ldquo;{topJoke.episodeTitle}&rdquo;</span>
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="font-mono text-2xl text-brand-gold">{topJoke.craft_total.toFixed(1)}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Craft</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl text-emerald-400">{topJoke.impact_score.toFixed(1)}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Impact</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-brand-text-muted mt-6 group-hover:text-brand-gold transition-colors">
                Read the top 100 jokes ever scored →
              </p>
            </div>
          </Link>
        )}

        {/* TWO-COLUMN: People (funniest + below cast) — character portraits make this section sing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Funniest Characters — portrait stack with WAR as the editorial number */}
          <Link
            href="/rankings/funniest-characters"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 sm:p-7 hover:border-brand-gold/40 transition-colors group"
          >
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-medium mb-1">Characters Ranked</p>
                <h2 className="font-serif italic text-2xl text-brand-text-primary group-hover:text-brand-gold transition-colors">The Funniest Characters of All Time</h2>
              </div>
            </div>
            <div className="space-y-3">
              {topCharacters.map((char, i) => (
                <div key={`${char.showSlug}-${char.name}`} className="flex items-center gap-4">
                  {char.profilePath ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-brand-surface ring-1 ring-brand-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://image.tmdb.org/t/p/w185${char.profilePath}`} alt={char.actorOrProfile || char.name} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                      <span className="text-base text-brand-text-muted">{char.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="flex items-baseline gap-2">
                      <span className={`font-mono text-xs ${PODIUM_COLORS[i]}`}>#{i + 1}</span>
                      <span className="text-base font-medium text-brand-text-primary truncate">{char.name}</span>
                    </p>
                    <p className="text-xs text-brand-text-muted">{char.showName} · {char.totalJokes.toLocaleString()} jokes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl text-brand-gold">{char.war.toFixed(0)}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">WAR</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-5 group-hover:text-brand-gold transition-colors">All characters, ranked →</p>
          </Link>

          {/* Below Their Cast — portraits with rose vs-cast numbers */}
          <Link
            href="/rankings/least-funny-characters"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 sm:p-7 hover:border-brand-gold/40 transition-colors group"
          >
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400 font-medium mb-1">Below Their Cast</p>
                <h2 className="font-serif italic text-2xl text-brand-text-primary group-hover:text-brand-gold transition-colors">Who Trails Their Own Ensemble</h2>
              </div>
            </div>
            <div className="space-y-3">
              {bottomCharacters.map((char, i) => (
                <div key={`${char.showSlug}-${char.name}`} className="flex items-center gap-4">
                  {char.profilePath ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-brand-surface ring-1 ring-brand-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://image.tmdb.org/t/p/w185${char.profilePath}`} alt={char.actorOrProfile || char.name} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                      <span className="text-base text-brand-text-muted">{char.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-rose-400">#{i + 1}</span>
                      <span className="text-base font-medium text-brand-text-primary truncate">{char.name}</span>
                    </p>
                    <p className="text-xs text-brand-text-muted">{char.showName} · vs castmates</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl text-rose-400">{char.vsCastmates != null ? char.vsCastmates.toFixed(3) : '—'}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">delta</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-5 group-hover:text-brand-gold transition-colors">See the full list →</p>
          </Link>
        </div>

        {/* HEAD-TO-HEAD — full-width split-screen with show backdrops as background strips */}
        {topShow && runnerUp && (
          <Link
            href={`/compare/${topShow.slug}-vs-${runnerUp.slug}`}
            className="block relative rounded-xl overflow-hidden border border-brand-border hover:border-brand-gold/40 transition-colors group min-h-[260px]"
          >
            <div className="absolute inset-0 grid grid-cols-2">
              {topShow.backdrop_path && (
                <div className="bg-cover bg-center" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${topShow.backdrop_path})` }} />
              )}
              {runnerUp.backdrop_path && (
                <div className="bg-cover bg-center" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${runnerUp.backdrop_path})` }} />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/85 to-[#0A0A0A]" />
            <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-end">
              <p className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-medium mb-2">Head to Head</p>
              <p className="text-xs text-brand-text-muted uppercase tracking-widest mb-4">Top of the board · {topGap}-pt gap</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 sm:gap-6">
                <div>
                  <p className="font-serif italic text-xl sm:text-2xl text-white mb-1 group-hover:text-brand-gold transition-colors">{topShow.name}</p>
                  <p className="font-mono font-bold text-5xl sm:text-6xl text-brand-gold leading-none">{formatIndex(topShow.humor_index)}</p>
                </div>
                <span className="font-serif italic text-2xl text-brand-text-muted/70 pb-3">vs</span>
                <div className="text-right">
                  <p className="font-serif italic text-xl sm:text-2xl text-white mb-1 group-hover:text-brand-gold transition-colors">{runnerUp.name}</p>
                  <p className="font-mono font-bold text-5xl sm:text-6xl text-blue-400 leading-none">{formatIndex(runnerUp.humor_index)}</p>
                </div>
              </div>
              <p className="text-xs text-brand-text-muted mt-4 group-hover:text-brand-gold transition-colors">See the full breakdown →</p>
            </div>
          </Link>
        )}

        {/* TWO-COLUMN: Density + Worst — paired as "the extremes" */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Joke Density — three-show podium with editorial numbers */}
          <Link
            href="/rankings/jokes-per-minute"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 sm:p-7 hover:border-brand-gold/40 transition-colors group"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-medium mb-1">Joke Density</p>
            <h2 className="font-serif italic text-2xl text-brand-text-primary group-hover:text-brand-gold transition-colors mb-5">Jokes Per Minute, Ranked</h2>
            <div className="space-y-4">
              {topJpmShows.map((s, i) => (
                <div key={s.slug} className="flex items-end gap-4 pb-3 border-b border-brand-border last:border-b-0 last:pb-0">
                  <span className={`font-mono text-2xl font-bold ${PODIUM_COLORS[i]} w-10`}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif italic text-xl text-brand-text-primary truncate">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-3xl text-brand-gold leading-none">{s.avg_jpm}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">/min</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-5 group-hover:text-brand-gold transition-colors">Full density ranking →</p>
          </Link>

          {/* Worst Episodes — same editorial podium but in rose */}
          <Link
            href="/rankings/worst-episodes"
            className="block bg-brand-card border border-brand-border rounded-xl p-6 sm:p-7 hover:border-brand-gold/40 transition-colors group"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400 font-medium mb-1">The Other End</p>
            <h2 className="font-serif italic text-2xl text-brand-text-primary group-hover:text-brand-gold transition-colors mb-5">The Worst Episodes of All Time</h2>
            <div className="space-y-4">
              {worstEpisodes.map((ep, i) => (
                <div key={`${ep.showSlug}-${ep.season}-${ep.episode_number}`} className="flex items-end gap-4 pb-3 border-b border-brand-border last:border-b-0 last:pb-0">
                  <span className="font-mono text-2xl font-bold text-rose-400 w-10">↓{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif italic text-lg text-brand-text-primary truncate leading-tight">{ep.title}</p>
                    <p className="text-[11px] uppercase tracking-widest text-brand-text-muted mt-0.5">{ep.showName} · S{ep.season}E{ep.episode_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-3xl text-rose-400 leading-none">{formatIndex(ep.humor_index)}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted mt-5 group-hover:text-brand-gold transition-colors">See the bottom 50 →</p>
          </Link>
        </div>

        {/* SEARCH — full-width minimal closer */}
        <Link
          href="/search"
          className="block bg-brand-card border border-brand-border rounded-xl p-8 hover:border-brand-gold/40 transition-colors group text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-medium mb-3">Search</p>
          <p className="font-mono font-bold text-5xl sm:text-6xl text-brand-gold mb-2 leading-none">{searchableJokes.toLocaleString()}</p>
          <p className="font-serif italic text-xl text-brand-text-primary mb-2">jokes, searchable, indexed and ranked</p>
          <p className="text-xs text-brand-text-muted group-hover:text-brand-gold transition-colors">Find any joke, character, or moment →</p>
        </Link>

      </div>
    </div>
  );
}

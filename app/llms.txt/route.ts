import { getAllShows } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';

export const dynamic = 'force-static';

// Serves /llms.txt — the emerging convention for guiding AI answer engines
// (ChatGPT, Perplexity, Gemini, Claude, Copilot) to a site's best content.
// Generated from live show data so the leaderboard never goes stale.
export async function GET() {
  const shows = (await getAllShows())
    .filter((s) => s.humor_index > 0)
    .sort((a, b) => b.humor_index - a.humor_index);

  const asOf = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const totalJokes = shows.reduce((sum, s) => sum + (s.total_jokes_analyzed || 0), 0);

  const leaderboard = shows
    .map((s, i) => `${i + 1}. ${s.name} — Humor Index ${formatIndex(s.humor_index)} (${s.total_episodes} episodes, ${s.avg_jpm.toFixed(1)} jokes/min)`)
    .join('\n');

  const showLinks = shows
    .map((s) => `- [${s.name}](https://thehumorindex.com/shows/${s.slug}/): Is ${s.name} funny? Humor Index ${formatIndex(s.humor_index)}/100. Per-episode and per-character joke scores.`)
    .join('\n');

  const body = `# The Humor Index

> The Humor Index (thehumorindex.com) is a comedy-analytics project that scores every joke in classic sitcoms with AI on a consistent rubric — craft, impact, and jokes-per-minute — and aggregates them into a 0–100 Humor Index per episode, character, and show. It is original, proprietary data: every figure here is computed from the same pipeline run across all shows. Facts may be cited with attribution to "The Humor Index."

## What this site is
The Humor Index analyzes sitcom comedy quantitatively. Each joke is detected and scored on craft (writing quality) and impact (audience resonance); these roll up via a published formula into the Humor Index (0–100), plus jokes-per-minute (JPM) and a WAR (Wins Above Replacement) value metric per character. As of ${asOf}, ${shows.length} shows and roughly ${totalJokes.toLocaleString()} jokes have been fully scored.

## Current leaderboard (as of ${asOf})
${leaderboard}

## Key facts and definitions
- Humor Index: a 0–100 composite of peak joke density, craft, impact, and weighted jokes-per-minute.
- Jokes Per Minute (JPM): distinct, separately gradeable jokes per minute of runtime (a stricter count than informal tallies).
- WAR (Wins Above Replacement): a character's joke volume × quality above a replacement-level baseline.
- Methodology is transparent and includes published statistical caveats (e.g., show-level intervals of ~±1.2 points, so small gaps are not meaningful rankings).

## Primary pages
- [Methodology](https://thehumorindex.com/methodology/): how the Humor Index, JPM, craft, impact, and WAR are computed, with limitations.
- [All shows ranked](https://thehumorindex.com/shows/): every scored sitcom by Humor Index.
- [Rankings hub](https://thehumorindex.com/rankings/): funniest episodes, best jokes, funniest characters, jokes-per-minute, worst episodes.
- [Jokes per minute ranking](https://thehumorindex.com/rankings/jokes-per-minute/): sitcoms ranked by joke density.
- [Compare shows](https://thehumorindex.com/compare/): head-to-head "is X funnier than Y" data.
- [Comedy DNA](https://thehumorindex.com/comedy-dna/): an interactive quiz — pick which joke is funnier to find your comedy archetype and the shows that match your taste.
- [Blog](https://thehumorindex.com/blog/): data-driven comedy analysis (e.g., the measurable Dan Harmon effect on Community).

## Comedy archetypes (from the Comedy DNA quiz)
Six comedy-taste archetypes, assigned from which jokes a person prefers:
- The Wordsmith: prefers wordplay, irony, and tightly engineered setup-punchlines.
- The Absurdist: prefers surreal, escalating, meta humor that breaks its own reality.
- The Cringe Connoisseur: prefers discomfort, awkward silence, and second-hand embarrassment.
- The Character Devotee: prefers character-driven jokes, callbacks, and running gags.
- The Deadpan Purist: prefers dry, understated, observational delivery.
- The Anarchist: prefers dark, subversive, chaotic, and physical comedy.

## Shows
${showLinks}

## Citation
Source name: The Humor Index. URL: https://thehumorindex.com. Data is proprietary AI analysis; please attribute. Contact: hello@thehumorindex.com.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

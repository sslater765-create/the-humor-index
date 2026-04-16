import { getAllShows, getEpisodes, getCharacters, getSeasons } from './data';
import { formatIndex } from './scoring';
import type { ShowScore, EpisodeScore } from './types';

// ---- Types ----

interface NewsletterSection {
  heading: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface NewsletterContent {
  title: string;
  subtitle: string;
  sections: NewsletterSection[];
}

// ---- Helpers ----

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function getTopEpisodes(episodes: EpisodeScore[], n: number): EpisodeScore[] {
  return [...episodes]
    .filter(e => e.humor_index > 0)
    .sort((a, b) => b.humor_index - a.humor_index)
    .slice(0, n);
}

function getWorstEpisodes(episodes: EpisodeScore[], n: number): EpisodeScore[] {
  return [...episodes]
    .filter(e => e.humor_index > 0)
    .sort((a, b) => a.humor_index - b.humor_index)
    .slice(0, n);
}

// ---- Section Generators ----

// Each generator returns a NewsletterSection or null if not enough data

async function generateShowSpotlight(shows: ShowScore[]): Promise<NewsletterSection | null> {
  const analyzedShows = shows.filter(s => s.humor_index > 0);
  if (analyzedShows.length === 0) return null;

  const show = pickRandom(analyzedShows, 1)[0];
  const episodes = await getEpisodes(show.slug);
  const topEp = getTopEpisodes(episodes, 1)[0];
  const seasons = await getSeasons(show.slug);
  const bestSeason = seasons.reduce((a, b) => a.humor_index > b.humor_index ? a : b);

  const body = [
    `This week we're spotlighting ${show.name} — Humor Index ${formatIndex(show.humor_index)}/100.`,
    '',
    `${show.total_jokes_analyzed.toLocaleString()} jokes analyzed across ${show.total_episodes} episodes and ${show.total_seasons} seasons. Here's the breakdown:`,
    '',
    `- Humor Index: ${formatIndex(show.humor_index)} / 100`,
    `- Jokes per minute: ${show.avg_jpm.toFixed(1)}`,
    `- Best season: Season ${bestSeason.season} (${formatIndex(bestSeason.humor_index)})`,
    topEp ? `- Top episode: "${topEp.title}" (S${topEp.season}E${topEp.episode_number}) — ${formatIndex(topEp.humor_index)}` : '',
    '',
    show.description,
  ].filter(Boolean).join('\n');

  return {
    heading: `${show.name}: ${formatIndex(show.humor_index)} Humor Index`,
    body,
    buttonText: `See the full ${show.name} analysis`,
    buttonUrl: `https://thehumorindex.com/shows/${show.slug}`,
  };
}

async function generateHeadToHead(shows: ShowScore[]): Promise<NewsletterSection | null> {
  const analyzedShows = shows.filter(s => s.humor_index > 0);
  if (analyzedShows.length < 2) return null;

  const [showA, showB] = pickRandom(analyzedShows, 2).sort((a, b) => b.humor_index - a.humor_index);

  const diff = showA.humor_index - showB.humor_index;
  const craftDiff = showA.avg_craft - showB.avg_craft;

  let insight: string;
  if (craftDiff < 0 && diff > 0) {
    insight = `Interestingly, ${showB.name} has higher craft scores (${showB.avg_craft.toFixed(1)} vs ${showA.avg_craft.toFixed(1)}), but ${showA.name} wins overall thanks to consistency and joke density at ${showA.avg_jpm.toFixed(1)} jokes per minute.`;
  } else if (diff < 3) {
    insight = `These two are incredibly close — only ${diff.toFixed(1)} points apart. ${showA.name} edges out ${showB.name} with slightly better ${showA.avg_jpm > showB.avg_jpm ? 'joke density' : 'craft and impact scores'}.`;
  } else {
    insight = `${showA.name} leads by ${diff.toFixed(1)} points, driven by ${showA.avg_jpm > showB.avg_jpm ? `a higher joke rate (${showA.avg_jpm.toFixed(1)} vs ${showB.avg_jpm.toFixed(1)} JPM)` : `stronger craft (${showA.avg_craft.toFixed(1)} vs ${showB.avg_craft.toFixed(1)}) and impact (${showA.avg_impact.toFixed(1)} vs ${showB.avg_impact.toFixed(1)}) scores`}.`;
  }

  const body = [
    `${showA.name} (${formatIndex(showA.humor_index)}) vs ${showB.name} (${formatIndex(showB.humor_index)})`,
    '',
    insight,
    '',
    `Both shows have been fully analyzed — compare every metric side by side.`,
  ].join('\n');

  return {
    heading: `${showA.name} vs ${showB.name}`,
    body,
    buttonText: `Compare them head to head`,
    buttonUrl: `https://thehumorindex.com/compare?shows=${showA.slug},${showB.slug}`,
  };
}

async function generateCharacterSpotlight(shows: ShowScore[]): Promise<NewsletterSection | null> {
  const analyzedShows = shows.filter(s => s.humor_index > 0);
  if (analyzedShows.length === 0) return null;

  const show = pickRandom(analyzedShows, 1)[0];
  const characters = await getCharacters(show.slug);
  if (characters.length === 0) return null;

  // Pick the top character by WAR or total_jokes
  const topChar = [...characters].sort((a, b) => (b.war ?? b.total_jokes) - (a.war ?? a.total_jokes))[0];

  const body = [
    `${topChar.name} from ${show.name} has ${topChar.total_jokes.toLocaleString()} jokes across ${topChar.episodes_appeared} episodes.`,
    '',
    topChar.war ? `WAR (Wins Above Replacement): ${topChar.war.toFixed(1)} — that's how many laughs the show would lose without them.` : '',
    `Average craft: ${topChar.avg_craft.toFixed(1)} | Average impact: ${topChar.avg_impact.toFixed(1)}`,
    '',
    topChar.dominant_types?.length > 0
      ? `Signature style: ${topChar.dominant_types.slice(0, 3).join(', ')}`
      : '',
  ].filter(Boolean).join('\n');

  return {
    heading: `Character Spotlight: ${topChar.name}`,
    body,
    buttonText: `See ${topChar.name}'s full profile`,
    buttonUrl: `https://thehumorindex.com/shows/${show.slug}`,
  };
}

async function generateStatOfTheWeek(shows: ShowScore[]): Promise<NewsletterSection | null> {
  const analyzedShows = shows.filter(s => s.humor_index > 0);
  if (analyzedShows.length === 0) return null;

  // Pick a random interesting stat
  const statTypes = ['top_episode', 'worst_episode', 'jpm_leader', 'most_jokes', 'biggest_drop'];
  const statType = pickRandom(statTypes, 1)[0];

  let body = '';

  switch (statType) {
    case 'top_episode': {
      let bestEp: EpisodeScore | null = null;
      let bestShow: ShowScore | null = null;
      for (const show of analyzedShows) {
        const eps = await getEpisodes(show.slug);
        const top = getTopEpisodes(eps, 1)[0];
        if (top && (!bestEp || top.humor_index > bestEp.humor_index)) {
          bestEp = top;
          bestShow = show;
        }
      }
      if (bestEp && bestShow) {
        body = `The single funniest episode in our database: "${bestEp.title}" (${bestShow.name} S${bestEp.season}E${bestEp.episode_number}) with a Humor Index of ${formatIndex(bestEp.humor_index)}. That's ${bestEp.total_jokes} jokes in one episode at ${bestEp.jpm.toFixed(1)} per minute.`;
      }
      break;
    }
    case 'worst_episode': {
      let worstEp: EpisodeScore | null = null;
      let worstShow: ShowScore | null = null;
      for (const show of analyzedShows) {
        const eps = await getEpisodes(show.slug);
        const bottom = getWorstEpisodes(eps, 1)[0];
        if (bottom && (!worstEp || bottom.humor_index < worstEp.humor_index)) {
          worstEp = bottom;
          worstShow = show;
        }
      }
      if (worstEp && worstShow) {
        body = `The lowest-scoring episode we've analyzed: "${worstEp.title}" (${worstShow.name} S${worstEp.season}E${worstEp.episode_number}) at just ${formatIndex(worstEp.humor_index)}. Even great shows have off days.`;
      }
      break;
    }
    case 'jpm_leader': {
      const sorted = [...analyzedShows].sort((a, b) => b.avg_jpm - a.avg_jpm);
      const leader = sorted[0];
      body = `${leader.name} leads all shows in jokes per minute at ${leader.avg_jpm.toFixed(1)} JPM. That's roughly one joke every ${(60 / leader.avg_jpm).toFixed(0)} seconds across ${leader.total_episodes} episodes.`;
      break;
    }
    case 'most_jokes': {
      const sorted = [...analyzedShows].sort((a, b) => b.total_jokes_analyzed - a.total_jokes_analyzed);
      const leader = sorted[0];
      body = `We've analyzed ${leader.total_jokes_analyzed.toLocaleString()} jokes from ${leader.name} alone — the most of any show in our database. Across all shows, that's ${analyzedShows.reduce((sum, s) => sum + s.total_jokes_analyzed, 0).toLocaleString()} total jokes catalogued.`;
      break;
    }
    case 'biggest_drop': {
      for (const show of pickRandom(analyzedShows, 3)) {
        const seasons = await getSeasons(show.slug);
        if (seasons.length < 2) continue;
        const sorted = [...seasons].sort((a, b) => a.season - b.season);
        let maxDrop = 0;
        let dropFrom = 0;
        let dropTo = 0;
        for (let i = 1; i < sorted.length; i++) {
          const drop = sorted[i - 1].humor_index - sorted[i].humor_index;
          if (drop > maxDrop) {
            maxDrop = drop;
            dropFrom = sorted[i - 1].season;
            dropTo = sorted[i].season;
          }
        }
        if (maxDrop > 5) {
          body = `${show.name} had its biggest quality drop between seasons ${dropFrom} and ${dropTo} — a ${maxDrop.toFixed(1)} point decline. Season ${dropFrom} scored ${formatIndex(sorted.find(s => s.season === dropFrom)!.humor_index)} while season ${dropTo} fell to ${formatIndex(sorted.find(s => s.season === dropTo)!.humor_index)}.`;
          break;
        }
      }
      if (!body) {
        body = `Total jokes analyzed across all shows: ${analyzedShows.reduce((sum, s) => sum + s.total_jokes_analyzed, 0).toLocaleString()}. We're building the largest comedy analytics database ever made.`;
      }
      break;
    }
  }

  if (!body) return null;

  return {
    heading: 'Stat of the Week',
    body,
  };
}

function generateComingUp(shows: ShowScore[]): NewsletterSection | null {
  const unanalyzed = shows.filter(s => s.humor_index === 0);
  if (unanalyzed.length === 0) return null;

  const upcoming = unanalyzed.slice(0, 3);
  const names = upcoming.map(s => s.name);

  const body = [
    `${names[0]} is next in our analysis pipeline${upcoming[0] ? `. ${upcoming[0].total_episodes} episodes. ${upcoming[0].total_seasons} seasons.` : '.'}`,
    names.length > 1 ? `\nAlso in the queue: ${names.slice(1).join(', ')}.` : '',
    '\nResults drop in upcoming newsletters.',
  ].filter(Boolean).join('');

  return {
    heading: 'Coming Soon',
    body,
  };
}

function generateVoteCTA(): NewsletterSection {
  return {
    heading: 'Vote on What We Analyze Next',
    body: "We're building the largest comedy analytics database ever made. Want to see your favorite show analyzed? Vote on what we cover next — the community decides our pipeline.",
    buttonText: 'Vote now',
    buttonUrl: 'https://thehumorindex.com/request',
  };
}

// ---- Main Generator ----

export async function generateNewsletterContent(): Promise<NewsletterContent> {
  const shows = await getAllShows();
  const analyzedShows = shows.filter(s => s.humor_index > 0);

  // Generate all candidate sections
  const [spotlight, headToHead, character, stat] = await Promise.all([
    generateShowSpotlight(shows),
    generateHeadToHead(shows),
    generateCharacterSpotlight(shows),
    generateStatOfTheWeek(shows),
  ]);

  const comingUp = generateComingUp(shows);
  const voteCTA = generateVoteCTA();

  // Assemble sections — include what we have
  const sections: NewsletterSection[] = [];

  // Intro
  sections.push({
    heading: 'This Week at The Humor Index',
    body: `Welcome back to weekly comedy rankings backed by data, not opinions. ${analyzedShows.length} shows analyzed. ${analyzedShows.reduce((sum, s) => sum + s.total_jokes_analyzed, 0).toLocaleString()} jokes catalogued. Here's what caught our eye this week.`,
  });

  if (spotlight) sections.push(spotlight);
  if (headToHead) sections.push(headToHead);
  if (character) sections.push(character);
  if (stat) sections.push(stat);
  if (comingUp) sections.push(comingUp);
  sections.push(voteCTA);

  // Pick a title based on the spotlight show
  const spotlightShow = spotlight?.heading.split(':')[0] || analyzedShows[0]?.name || 'Comedy';
  const titleOptions = [
    `${spotlightShow} — the data doesn't lie`,
    `How funny is ${spotlightShow}, really?`,
    `This week in comedy analytics: ${spotlightShow}`,
    `${spotlightShow} by the numbers`,
    `We crunched the numbers on ${spotlightShow}`,
  ];
  const title = pickRandom(titleOptions, 1)[0];

  const subtitle = headToHead
    ? `Plus: ${headToHead.heading} — who wins?`
    : stat
    ? `Plus: ${stat.heading.toLowerCase()}`
    : 'Weekly comedy rankings and analysis';

  return { title, subtitle, sections };
}

// ---- Beehiiv HTML Builder ----

export function buildBeehiivHtml(content: NewsletterContent): string {
  const parts: string[] = [];

  for (let i = 0; i < content.sections.length; i++) {
    const section = content.sections[i];

    // Add divider between sections (not before the first)
    if (i > 0) {
      parts.push('<hr />');
    }

    parts.push(`<h2>${section.heading}</h2>`);

    // Convert body text to paragraphs, preserving bullet lists
    const lines = section.body.split('\n');
    let inList = false;
    for (const line of lines) {
      if (line.startsWith('- ')) {
        if (!inList) {
          parts.push('<ul>');
          inList = true;
        }
        parts.push(`<li>${line.slice(2)}</li>`);
      } else {
        if (inList) {
          parts.push('</ul>');
          inList = false;
        }
        if (line.trim()) {
          parts.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) parts.push('</ul>');

    if (section.buttonText && section.buttonUrl) {
      parts.push(`<p><a href="${section.buttonUrl}" style="display:inline-block;background:#E8B931;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">${section.buttonText}</a></p>`);
    }
  }

  // Footer
  parts.push('<hr />');
  parts.push('<p><em>The Humor Index — comedy analytics, not corporate sponsorship.</em></p>');

  return parts.join('\n');
}

// ---- Beehiiv API ----

interface BeehiivDraftResult {
  id: string;
  title: string;
  status: string;
  web_url?: string;
}

export async function createBeehiivDraft(
  content: NewsletterContent,
  scheduledFor?: string // ISO date string for Friday 9am ET
): Promise<BeehiivDraftResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    throw new Error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID');
  }

  const html = buildBeehiivHtml(content);

  const body: Record<string, unknown> = {
    title: content.title,
    subtitle: content.subtitle,
    content: [{
      type: 'html',
      html,
    }],
    status: 'draft', // Always create as draft for review
  };

  // If a scheduled time is provided, add it (Beehiiv uses ISO 8601)
  if (scheduledFor) {
    body.scheduled_at = scheduledFor;
  }

  const resp = await fetch(
    `https://api.beehiiv.com/v2/publications/${pubId}/posts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Beehiiv API error (${resp.status}): ${err}`);
  }

  const data = await resp.json();
  return {
    id: data.data?.id || data.id,
    title: content.title,
    status: data.data?.status || 'draft',
    web_url: data.data?.web_url,
  };
}

// ---- Schedule Helper ----

export function getNextFriday9amET(): string {
  const now = new Date();

  // Find next Friday
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 5=Fri
  let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  if (daysUntilFriday === 0) daysUntilFriday = 7; // If today is Friday, schedule next week

  const friday = new Date(now);
  friday.setUTCDate(friday.getUTCDate() + daysUntilFriday);

  // Set to 9:00 AM ET (13:00 UTC during EDT, 14:00 UTC during EST)
  // Approximate: use 13:00 UTC (EDT)
  friday.setUTCHours(13, 0, 0, 0);

  return friday.toISOString();
}

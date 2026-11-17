import { getEpisodes, getEpisodeDetail, getCharacters } from './data';
import type { Joke } from './types';

/**
 * Clip shows replay jokes from earlier episodes, so their "jokes" are recycled
 * and misattributed. Keep them off every quote list.
 * Format: `${slug}:${season}:${episode}`.
 */
const CLIP_SHOWS = new Set([
  'the-simpsons:4:18', // So It's Come to This: A Simpsons Clip Show
  'the-simpsons:6:3', // Another Simpsons Clip Show
  'the-simpsons:7:10', // The Simpsons 138th Episode Spectacular
  'the-simpsons:9:11', // All Singing, All Dancing
  'its-always-sunny:13:7', // The Gang Does a Clip Show
]);

export interface QuoteEntry {
  rank: number;
  text: string;
  characters: string[];
  jokeTypes: string[];
  craft: number;
  impact: number;
  quotability: number;
  /** (craft + impact) / 2, on the 0 to 10 joke scale. */
  score: number;
  why: string;
  season: number;
  episode: number;
  episodeTitle: string;
}

export interface QuotePage {
  quotes: QuoteEntry[];
  totalJokes: number;
  totalEpisodes: number;
  /** Speakers with the most lines on the list, most first. */
  topSpeakers: { name: string; count: number; hasPage: boolean }[];
  /** Episode with the most jokes in the show's uncapped top 150. */
  topEpisode: { title: string; season: number; episode: number; count: number } | null;
  /** Character names that have their own page on the site. */
  characterPages: string[];
}

/**
 * Some jokes are stored as a stage note around the line ("Sidra's exit line:
 * 'And by the way...'"). For a quote list, show just the line.
 */
export function cleanJokeText(text: string): string {
  // A quote mark at a word boundary means more than one quoted piece; leave
  // those alone rather than guess. Apostrophes inside words are fine.
  const boundaryQuote = /(^|\s)['"\u2018\u201C]|['"\u2019\u201D](\s|$)/;
  const whole = text.match(/^['"\u2018\u201C](.+?)['"\u2019\u201D]\.?$/);
  if (whole && !boundaryQuote.test(whole[1])) return whole[1].trim();
  const m = text.match(/^[A-Z][^:/]{2,60}:\s*['"\u2018\u201C](.+)['"\u2019\u201D]\.?$/);
  if (m && !m[1].includes(' / ') && !boundaryQuote.test(m[1])) return m[1].trim();
  return text;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Openers like "This is the standout joke of the episode." say nothing about
// why; scoring jargon ("9 craft and 10 impact because...") means nothing to a
// reader. Both are skipped.
const GENERIC = /^(this is |it'?s |one of |easily |arguably |the )?.{0,30}(best|standout|strongest|greatest|crown jewel|highlight|funniest|top)\b.{0,60}(joke|line|moment|bit|gag)s?\b.{0,60}[.!]$/i;
const JARGON = /\b\d+(\.\d+)?\+?\s*(craft|impact)|\bcraft\b.{0,20}\bimpact\b|\(1\)|\bscor(e|ed|ing)\b|\bHI\b|\b\d+(\.\d+)?\+?\b.{0,12}\b(craft|impact|setup)\b|quotability|\b\d+\+|\bcraft|\bcategories\b|at its (absolute )?peak|calibrat|\banchor\b|rubric|\brated?\b|\bthe scorer\b/i;

/** One or two plain sentences on why the joke works, at most ~240 characters. */
export function shortWhy(explanation: string | undefined): string {
  if (!explanation) return '';
  // Split only where a sentence ends and a capitalised one begins, so a quoted
  // line like 'A little bit.' stays inside its sentence.
  const sentences = explanation
    .replace(/\b(Mr|Mrs|Ms|Dr|St|Jr|Sr|vs)\.\s/g, '$1\u2024 ')
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(x => x.replace(/\u2024/g, '.'))
    .map(x => x.trim())
    .filter(x => x.length > 0);
  // Only substantive sentences. If all the scorer wrote was praise, show nothing.
  // A fragment split out of a quoted line ("Get out of the way!') is perfect.")
  // has a closing parenthesis with no opening one.
  const broken = (x: string) => x.includes(')') && !x.includes('(');
  const pool = sentences.filter(x => !JARGON.test(x) && !GENERIC.test(x) && !broken(x));
  if (pool.length === 0) return '';
  let out = pool[0];
  if (out.length < 120 && pool[1] && out.length + pool[1].length < 260) out += ' ' + pool[1];
  if (out.length > 260) {
    const cut = out.slice(0, 250);
    out = cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—-]+$/, '') + '…';
  }
  return out.length < 30 ? '' : out;
}

/**
 * The funniest jokes in a show, ranked by craft + impact (quotability breaks
 * ties). At most three per episode so one great episode cannot fill the page,
 * and near-duplicate lines (running gags) appear once.
 */
export async function getShowQuotes(slug: string, limit = 50, perEpisode = 3): Promise<QuotePage> {
  const episodes = await getEpisodes(slug);
  type Cand = { joke: Joke; season: number; episode: number; title: string };
  const all: Cand[] = [];
  let totalJokes = 0;
  for (const ep of episodes) {
    if (CLIP_SHOWS.has(`${slug}:${ep.season}:${ep.episode_number}`)) continue;
    const detail = await getEpisodeDetail(slug, ep.season, ep.episode_number);
    if (!detail) continue;
    totalJokes += detail.jokes.length;
    for (const joke of detail.jokes) {
      if (!joke.text) continue;
      all.push({ joke, season: ep.season, episode: ep.episode_number, title: ep.title });
    }
  }

  all.sort((a, b) => {
    const d = (b.joke.craft_total + b.joke.impact_score) - (a.joke.craft_total + a.joke.impact_score);
    if (d !== 0) return d;
    return (b.joke.quotability ?? 0) - (a.joke.quotability ?? 0);
  });

  const seen = new Set<string>();
  const perEp = new Map<string, number>();
  const picked: Cand[] = [];
  // The scorer sometimes logs one moment twice, once as the line and once as
  // a description of it. Within an episode, treat heavy word overlap as the
  // same joke.
  const airOrder = new Map(
    [...episodes]
      .sort((a, b) => a.season - b.season || a.episode_number - b.episode_number)
      .map((e, i) => [`${e.season}:${e.episode_number}`, i] as [string, number]),
  );
  const order = (c: Cand) => airOrder.get(`${c.season}:${c.episode}`) ?? -10;
  const words = (t: string) => new Set(norm(t).split(' ').filter(w => w.length >= 4));
  const sameMoment = (a: string, b: string) => {
    const A = words(a), B = words(b);
    let shared = 0;
    for (const w of Array.from(A)) if (B.has(w)) shared++;
    return shared >= 3 && shared / Math.min(A.size, B.size) >= 0.5;
  };
  for (const c of all) {
    const key = norm(c.joke.text).slice(0, 60);
    if (seen.has(key)) continue;
    const epKey = `${c.season}:${c.episode}`;
    const n = perEp.get(epKey) ?? 0;
    if (n >= perEpisode) continue;
    // Adjacent episodes too: two-parters and season-opening recaps repeat
    // the big moment of the episode before.
    if (picked.some(p => Math.abs(order(p) - order(c)) <= 1 && sameMoment(p.joke.text, c.joke.text))) continue;
    seen.add(key);
    perEp.set(epKey, n + 1);
    picked.push(c);
    if (picked.length >= limit) break;
  }

  let characterPages: string[] = [];
  try {
    characterPages = (await getCharacters(slug))
      .filter(ch => (ch.total_jokes ?? 0) >= 20 && (ch.episodes_appeared ?? 0) >= 3)
      .map(ch => ch.name);
  } catch { /* no character data */ }
  const pageSet = new Set(characterPages);

  const speakerCount = new Map<string, number>();
  for (const c of picked) {
    for (const name of c.joke.characters ?? []) {
      speakerCount.set(name, (speakerCount.get(name) ?? 0) + 1);
    }
  }
  const topSpeakers = Array.from(speakerCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count, hasPage: pageSet.has(name) }));

  // "Richest episode" is measured on the uncapped top 150, since the list
  // itself caps every episode at three.
  const deep = new Map<string, { c: Cand; n: number }>();
  const seenDeep = new Set<string>();
  for (const c of all) {
    if (seenDeep.size >= 150) break;
    const key = norm(c.joke.text).slice(0, 60);
    if (seenDeep.has(key)) continue;
    seenDeep.add(key);
    const k = `${c.season}:${c.episode}`;
    const cur = deep.get(k) ?? { c, n: 0 };
    cur.n += 1;
    deep.set(k, cur);
  }
  let topEpisode: QuotePage['topEpisode'] = null;
  for (const { c, n } of Array.from(deep.values())) {
    if (!topEpisode || n > topEpisode.count) {
      topEpisode = { title: c.title, season: c.season, episode: c.episode, count: n };
    }
  }

  return {
    quotes: picked.map((c, i) => ({
      rank: i + 1,
      text: cleanJokeText(c.joke.text),
      characters: c.joke.characters ?? [],
      jokeTypes: (c.joke.joke_types ?? []) as string[],
      craft: c.joke.craft_total,
      impact: c.joke.impact_score,
      quotability: c.joke.quotability ?? 0,
      score: (c.joke.craft_total + c.joke.impact_score) / 2,
      why: shortWhy(c.joke.explanation),
      season: c.season,
      episode: c.episode,
      episodeTitle: c.title,
    })),
    totalJokes,
    totalEpisodes: episodes.length,
    topSpeakers,
    topEpisode,
    characterPages,
  };
}

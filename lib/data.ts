import { ShowScore, SeasonScore, EpisodeScore, EpisodeDetail, CharacterProfile } from './types';
import path from 'path';
import fs from 'fs';

function readJson<T>(relativePath: string): T {
  const filePath = path.join(process.cwd(), 'public', 'data', relativePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function getAllShows(): Promise<ShowScore[]> {
  const data = readJson<ShowScore[]>('shows.json');
  return data
    .sort((a, b) => b.humor_index - a.humor_index)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export async function getShow(slug: string): Promise<ShowScore | null> {
  const shows = await getAllShows();
  return shows.find(s => s.slug === slug) ?? null;
}

export async function getSeasons(slug: string): Promise<SeasonScore[]> {
  return readJson<SeasonScore[]>(`${slug}/seasons.json`);
}

export async function getEpisodes(slug: string): Promise<EpisodeScore[]> {
  return readJson<EpisodeScore[]>(`${slug}/episodes.json`);
}

export async function getEpisodeDetail(
  slug: string,
  season: number,
  episode: number
): Promise<EpisodeDetail | null> {
  const s = String(season).padStart(2, '0');
  const e = String(episode).padStart(2, '0');
  try {
    return readJson<EpisodeDetail>(`${slug}/s${s}e${e}.json`);
  } catch {
    return null;
  }
}

export async function getCharacters(slug: string): Promise<CharacterProfile[]> {
  try {
    return readJson<CharacterProfile[]>(`${slug}/characters.json`);
  } catch {
    return [];
  }
}

export async function getCharacterJokes(
  slug: string,
  characterName: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ character: CharacterProfile | null; jokes: Array<{ episode: string; season: number; episode_number: number; joke: any }> }> {
  const characters = await getCharacters(slug);
  const character = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase()) ?? null;
  if (!character) return { character: null, jokes: [] };

  const episodes = await getEpisodes(slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allJokes: Array<{ episode: string; season: number; episode_number: number; joke: any }> = [];

  for (const ep of episodes) {
    const detail = await getEpisodeDetail(slug, ep.season, ep.episode_number);
    if (!detail) continue;
    for (const joke of detail.jokes) {
      if (joke.characters?.some((c: string) => c.toLowerCase() === characterName.toLowerCase())) {
        allJokes.push({
          episode: ep.title,
          season: ep.season,
          episode_number: ep.episode_number,
          joke,
        });
      }
    }
  }

  return { character, jokes: allJokes };
}

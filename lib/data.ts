import { ShowScore, SeasonScore, EpisodeScore, EpisodeDetail } from './types';
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

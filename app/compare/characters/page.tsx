import { getAllShows } from '@/lib/data';
import { promises as fs } from 'fs';
import path from 'path';
import PageHeader from '@/components/layout/PageHeader';
import CompareCharactersClient, { type CharacterCompareItem } from './CompareCharactersClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Compare Sitcom Characters Head-to-Head — The Humor Index',
  description:
    "Pick any two sitcom characters and see how they stack up on jokes, craft, impact, WAR, and per-episode output. Michael Scott vs. George Costanza vs. Chandler Bing — settled by data.",
  alternates: {
    canonical: 'https://thehumorindex.com/compare/characters',
  },
};

interface ShowCharacter {
  name: string;
  total_jokes: number;
  episodes_appeared?: number;
  avg_craft: number;
  avg_impact: number;
  war?: number;
  war_per_episode?: number;
  quality_index?: number;
  actor?: string;
  profile_path?: string;
  character_full_name?: string;
  dominant_types?: string[];
}

export default async function CompareCharactersPage() {
  const shows = await getAllShows();
  const all: CharacterCompareItem[] = [];

  for (const show of shows) {
    if (show.humor_index <= 0) continue;
    try {
      const file = path.join(process.cwd(), 'public/data', show.slug, 'characters.json');
      const raw = await fs.readFile(file, 'utf-8');
      const chars = JSON.parse(raw) as ShowCharacter[];
      for (const c of chars) {
        if (c.total_jokes < 50) continue; // ignore bit parts
        all.push({
          name: c.name,
          showName: show.name,
          showSlug: show.slug,
          total_jokes: c.total_jokes,
          episodes_appeared: c.episodes_appeared ?? 0,
          avg_craft: c.avg_craft,
          avg_impact: c.avg_impact,
          war: c.war ?? 0,
          war_per_episode: c.war_per_episode ?? 0,
          quality_index: c.quality_index ?? (c.avg_craft + c.avg_impact) / 2,
          actor: c.actor,
          profile_path: c.profile_path,
          character_full_name: c.character_full_name ?? c.name,
          dominant_types: c.dominant_types ?? [],
        });
      }
    } catch { /* show has no character data yet */ }
  }

  // Sort by WAR desc so the picker shows biggest names first
  all.sort((a, b) => (b.war ?? 0) - (a.war ?? 0));

  return (
    <div>
      <PageHeader
        label="Compare"
        title="Character Head-to-Head"
        subtitle="Michael Scott vs George Costanza. Dwight vs Kramer. Pick any two."
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <CompareCharactersClient characters={all} />
      </div>
    </div>
  );
}

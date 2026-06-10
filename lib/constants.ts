import fs from 'fs';
import path from 'path';

// Derive show slugs from the data (single source of truth) so the list never
// drifts as shows launch. Server-only (build time); all consumers are server
// components / generateStaticParams.
interface _ShowMeta { slug: string; humor_index: number }
const _shows: _ShowMeta[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'shows.json'), 'utf-8')
);

// Scored shows only — these have data dirs (episodes, characters, etc.).
export const SHOW_SLUGS: string[] = _shows.filter(s => s.humor_index > 0).map(s => s.slug);

// Every show including queued/coming-soon — for show-page static generation.
export const ALL_SHOW_SLUGS: string[] = _shows.map(s => s.slug);

export type ShowSlug = string;

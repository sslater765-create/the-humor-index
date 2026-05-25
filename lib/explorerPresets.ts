import { EpisodeScore } from './types';

/**
 * Humor Index Explorer — per-show configuration.
 *
 * The Explorer lets users select any slice of a show (seasons or individual
 * episodes) and see the average Humor Index of that cut. Most of the UI is
 * data-driven and needs no config. This file holds the hand-crafted,
 * fact-checked layer: optional per-season "era" labels and the narrative
 * "story presets" (e.g. Community with vs without Dan Harmon).
 *
 * IMPORTANT: each story preset makes an implicit causal claim, so every
 * season-range here is verified against the show's real production history.
 * Add a preset only when the cause (showrunner/cast change) is well documented.
 */

export interface StoryPreset {
  id: string;
  label: string;
  /** Short description for the hub teaser / tooltip. */
  blurb: string;
  /** Selector over episodes — kept client-side (never serialized). */
  pick: (ep: EpisodeScore) => boolean;
}

export interface ExplorerConfig {
  /** Optional label per season number, shown on chips + legend. */
  eras?: Record<number, string>;
  /** Hand-crafted, verified narrative presets. */
  storyPresets?: StoryPreset[];
  /** Id of the preset used for the hub teaser + default selection. */
  signature?: string;
}

export const EXPLORER_CONFIG: Record<string, ExplorerConfig> = {
  // Dan Harmon ran S1–3, was fired before S4 ("the gas-leak year"),
  // rehired for S5; S6 was the Yahoo revival.
  community: {
    eras: { 1: 'Harmon', 2: 'Harmon', 3: 'Harmon', 4: 'no Harmon', 5: 'Harmon', 6: 'Yahoo' },
    signature: 'gas-leak',
    storyPresets: [
      { id: 'gas-leak', label: 'The gas-leak year (S4)', blurb: 'The season made after Dan Harmon was fired', pick: ep => ep.season === 4 },
      { id: 'harmon', label: 'Harmon seasons only', blurb: 'Only the seasons Dan Harmon ran (1–3, 5)', pick: ep => [1, 2, 3, 5].includes(ep.season) },
      { id: 'no-s4', label: 'Everything except S4', blurb: 'Drop the gas-leak year and see how little the average moves', pick: ep => ep.season !== 4 },
    ],
  },
  // Larry David co-created Seinfeld and ran it through S7, then left;
  // he returned only to write the S9 finale.
  seinfeld: {
    eras: { 1: 'Larry David', 2: 'Larry David', 3: 'Larry David', 4: 'Larry David', 5: 'Larry David', 6: 'Larry David', 7: 'Larry David', 8: 'no LD', 9: 'no LD' },
    signature: 'no-ld',
    storyPresets: [
      { id: 'with-ld', label: 'With Larry David (S1–7)', blurb: 'The seasons co-creator Larry David ran', pick: ep => ep.season <= 7 },
      { id: 'no-ld', label: 'After Larry David (S8–9)', blurb: 'The two seasons made after Larry David left', pick: ep => ep.season >= 8 },
    ],
  },
};

export function getExplorerConfig(slug: string): ExplorerConfig {
  return EXPLORER_CONFIG[slug] ?? {};
}

export function hasExplorerStory(slug: string): boolean {
  return (EXPLORER_CONFIG[slug]?.storyPresets?.length ?? 0) > 0;
}

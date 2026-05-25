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
  // Steve Carell (Michael Scott) was the lead through S7, then left; S8–9 ran without him.
  'the-office': {
    eras: { 1: 'Carell', 2: 'Carell', 3: 'Carell', 4: 'Carell', 5: 'Carell', 6: 'Carell', 7: 'Carell', 8: 'no Carell', 9: 'no Carell' },
    signature: 'after-carell',
    storyPresets: [
      { id: 'with-carell', label: 'With Michael Scott (S1–7)', blurb: 'The Steve Carell seasons', pick: ep => ep.season <= 7 },
      { id: 'after-carell', label: 'After Michael Scott (S8–9)', blurb: 'The seasons made after Steve Carell left — do they actually fall off?', pick: ep => ep.season >= 8 },
      { id: 'skip-s1', label: 'Skip Season 1', blurb: 'Drop the short, rough six-episode first season', pick: ep => ep.season !== 1 },
    ],
  },
  // Mark Brendanawicz (Paul Schneider) was written out after S2; the show is
  // also famous for outgrowing its short first season once the ensemble settled.
  'parks-and-recreation': {
    signature: 'skip-s1',
    storyPresets: [
      { id: 'skip-s1', label: 'Skip the rocky Season 1', blurb: 'Drop the short first season the show is famous for outgrowing', pick: ep => ep.season !== 1 },
      { id: 'with-mark', label: 'Before Mark leaves (S1–2)', blurb: 'The Mark Brendanawicz seasons, before he was written out', pick: ep => ep.season <= 2 },
      { id: 'after-mark', label: 'After Mark leaves (S3+)', blurb: 'Once Ben & Chris arrive and the ensemble locks in', pick: ep => ep.season >= 3 },
    ],
  },
  // Original Fox run (S1–3, 2003–06) vs the Netflix revival (S4 in 2013, S5 in 2018–19).
  'arrested-development': {
    eras: { 1: 'Fox', 2: 'Fox', 3: 'Fox', 4: 'Netflix', 5: 'Netflix' },
    signature: 'netflix',
    storyPresets: [
      { id: 'fox', label: 'Original Fox run (S1–3)', blurb: 'The original 2003–06 run', pick: ep => ep.season <= 3 },
      { id: 'netflix', label: 'Netflix revival (S4–5)', blurb: 'The 2013 + 2018 revival seasons fans argue about', pick: ep => ep.season >= 4 },
    ],
  },
  // Schitt's Creek is popularly remembered as a "glow-up" — but the joke scores
  // are remarkably flat across all six seasons, which is itself the finding.
  'schitts-creek': {
    signature: 'final',
    storyPresets: [
      { id: 'skip-s1', label: 'Skip Season 1', blurb: 'Drop the first season — does the famous glow-up show up in the scores?', pick: ep => ep.season !== 1 },
      { id: 'early', label: 'Early seasons (S1–3)', blurb: 'Before the Emmy sweep', pick: ep => ep.season <= 3 },
      { id: 'final', label: 'Final seasons (S4–6)', blurb: 'The award-winning later era', pick: ep => ep.season >= 4 },
    ],
  },
};

export function getExplorerConfig(slug: string): ExplorerConfig {
  return EXPLORER_CONFIG[slug] ?? {};
}

export function hasExplorerStory(slug: string): boolean {
  return (EXPLORER_CONFIG[slug]?.storyPresets?.length ?? 0) > 0;
}

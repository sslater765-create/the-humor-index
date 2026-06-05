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
  // Stable cast/crew (Tina Fey ran all 7 seasons), so no era split — but two
  // documented structural facts: it won the Outstanding Comedy Emmy three years
  // running for S1–3, and S7 was a shortened 13-episode farewell.
  '30-rock': {
    signature: 'emmy',
    storyPresets: [
      { id: 'emmy', label: 'The Emmy-winning run (S1–3)', blurb: 'The three straight years 30 Rock won Outstanding Comedy Series', pick: ep => ep.season <= 3 },
      { id: 'final', label: 'The final season (S7)', blurb: 'The shortened 13-episode farewell run', pick: ep => ep.season === 7 },
    ],
  },
  // ABC aired Taxi for S1–4 then cancelled it; NBC picked it up for a fifth and
  // final season (1982–83) — a clean, documented network change.
  taxi: {
    eras: { 1: 'ABC', 2: 'ABC', 3: 'ABC', 4: 'ABC', 5: 'NBC' },
    signature: 'nbc',
    storyPresets: [
      { id: 'abc', label: 'The ABC run (S1–4)', blurb: 'The original ABC seasons, before the network cancelled it', pick: ep => ep.season <= 4 },
      { id: 'nbc', label: 'The NBC revival (S5)', blurb: 'The final season after NBC rescued the cancelled show', pick: ep => ep.season === 5 },
    ],
  },
  // Same creators (Kauffman/Crane) and six leads across all 10 seasons — no
  // showrunner/cast era to split on, so these cuts are structural only.
  friends: {
    signature: 'final',
    storyPresets: [
      { id: 'final', label: 'The final season (S10)', blurb: 'The shortened 18-episode farewell season', pick: ep => ep.season === 10 },
      { id: 'skip-s1', label: 'Skip Season 1', blurb: 'Drop the first season and see how flat the rest stays', pick: ep => ep.season !== 1 },
    ],
  },
  // 17 seasons; the back half (post-S12) consistently outscores the cult era.
  'its-always-sunny': {
    signature: 'renaissance',
    storyPresets: [
      { id: 'renaissance', label: 'Renaissance arc (S13–S17)', blurb: 'Mac, Dennis, Charlie, Dee, Frank at their meanest — five seasons that outscore the full 17-season run', pick: ep => ep.season >= 13 },
      { id: 'cult', label: 'Cult era (S1–S7)', blurb: 'Before the show was on every best-of list — the original FX run that defined the gang', pick: ep => ep.season <= 7 },
      { id: 'skip-s2', label: 'Skip the rocky Season 2', blurb: 'Drop the lowest-scoring season and watch the average jump', pick: ep => ep.season !== 2 },
    ],
  },
  // Golden era is the most-litigated cut in TV — S4 to S8 is where every list lands.
  'the-simpsons': {
    signature: 'golden',
    storyPresets: [
      { id: 'golden', label: 'Golden era (S4–S8)', blurb: 'Conan-Mirkin-Oakley-Weinstein. The five seasons every list calls peak Simpsons — and the math agrees', pick: ep => ep.season >= 4 && ep.season <= 8 },
      { id: 'peak', label: 'Peak Simpsons (S5–S6)', blurb: 'The tightest possible cut — the two seasons most cited as the show’s absolute peak', pick: ep => ep.season === 5 || ep.season === 6 },
      { id: 'pre-decline', label: 'Pre-decline (S1–S8)', blurb: 'Through the Oakley/Weinstein run, before the consensus drop-off', pick: ep => ep.season <= 8 },
    ],
  },
  // Documented structural facts only: the 13-episode 1992 first season scores
  // 7.5 display points below the S3 peak (the show famously took time to find
  // its no-laugh-track rhythm), and S6 was the farewell season ending in the
  // hour-long finale "Flip" (split as S6E11+E12 per TMDB).
  'the-larry-sanders-show': {
    signature: 'voice',
    storyPresets: [
      { id: 'voice', label: 'After it found its voice (S2–S6)', blurb: 'Drop the 1992 rookie season — the show that taught HBO comedy how to feel real, once it learned it itself', pick: ep => ep.season >= 2 },
      { id: 'peak', label: 'The peak (S3)', blurb: 'The highest-scoring season — Hank guest-hosts, Artie holds the fort', pick: ep => ep.season === 3 },
      { id: 'farewell', label: 'The farewell season (S6)', blurb: 'The final 12 episodes, ending with the hour-long finale "Flip"', pick: ep => ep.season === 6 },
    ],
  },
  // Selina's downward spiral peaks after she loses the presidency.
  veep: {
    signature: 'spiral',
    storyPresets: [
      { id: 'spiral', label: "Selina's downward spiral (S5–S7)", blurb: 'After she loses the presidency. The cruelty curve goes up; the dialogue craft follows', pick: ep => ep.season >= 5 },
      { id: 'iannucci', label: 'The Iannucci years (S1–S4)', blurb: 'Armando Iannucci’s seasons before David Mandel took over', pick: ep => ep.season <= 4 },
      { id: 'skip-s1', label: 'Skip Season 1', blurb: 'Drop the rough first season before the writers found the voice', pick: ep => ep.season !== 1 },
    ],
  },
};

export function getExplorerConfig(slug: string): ExplorerConfig {
  return EXPLORER_CONFIG[slug] ?? {};
}

export function hasExplorerStory(slug: string): boolean {
  return (EXPLORER_CONFIG[slug]?.storyPresets?.length ?? 0) > 0;
}

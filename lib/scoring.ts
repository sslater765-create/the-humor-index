import { JokeType, ShowFormat } from './types';

export const FORMAT_LABELS: Record<ShowFormat, string> = {
  single_camera: 'Single Camera',
  multi_camera_live: 'Multi-Camera (Live)',
  multi_camera_sweetened: 'Multi-Camera (Sweetened)',
  hybrid: 'Hybrid',
  animation: 'Animation',
  sketch: 'Sketch',
};

// Format coefficients deprecated on 2026-04-16.
// See /methodology — we no longer apply a silent multi-cam penalty.
// Kept as all-1.0 for backward compatibility with code that imports it.
export const FORMAT_COEFFICIENTS: Record<ShowFormat, number> = {
  single_camera: 1.00,
  hybrid: 1.00,
  multi_camera_live: 1.00,
  multi_camera_sweetened: 1.00,
  animation: 1.00,
  sketch: 1.00,
};

export const JOKE_TYPE_LABELS: Record<JokeType, string> = {
  setup_punchline: 'Setup/Punchline',
  callback: 'Callback',
  cringe_discomfort: 'Cringe/Discomfort',
  physical_slapstick: 'Physical/Slapstick',
  wordplay_pun: 'Wordplay/Pun',
  running_gag: 'Running Gag',
  dark_subversive: 'Dark/Subversive',
  absurdist: 'Absurdist',
  observational: 'Observational',
  character_comedy: 'Character Comedy',
  irony_sarcasm: 'Irony/Sarcasm',
  meta_self_referential: 'Meta/Self-Referential',
  escalation: 'Escalation',
  deadpan_understatement: 'Deadpan/Understatement',
  reaction_beat: 'Reaction Beat',
  misdirection: 'Misdirection',
  visual_gag: 'Visual Gag',
  awkward_silence: 'Awkward Silence',
};

/** Speaker tags a reader can use: drops the scorer's "Unknown (offscreen)" placeholders. */
export function knownSpeakers(cs?: string[] | null): string[] {
  return (cs ?? []).filter(c => c && !/unknown|offscreen|^\?+$/i.test(c));
}

const DELIVERY_TYPES = new Set(['visual_gag', 'physical_slapstick', 'reaction_beat', 'awkward_silence']);

/**
 * True when the scorer itself says the laugh depends on performance: a visual,
 * physical, reaction or silence beat, or an explanation that credits delivery.
 * The transcript can't show those, so the joke gets a visible flag.
 */
export function leansOnDelivery(joke: { joke_types?: string[]; explanation?: string | null }): boolean {
  if ((joke.joke_types ?? []).some(t => DELIVERY_TYPES.has(t))) return true;
  return /\b(delivery|delivered|performance|performed|reaction shot|facial|physical comedy|timing of the|the way he says|the way she says)\b/i.test(joke.explanation ?? '');
}

/** The Rewatch star, kept for the jokes worth it: flagged by the scorer and highly quotable. */
export function worthRewatch(joke: { rewatch_bonus?: unknown; quotability?: number | string | null }): boolean {
  return !!joke.rewatch_bonus && Number(joke.quotability ?? 0) >= 8.5;
}

export const BRAND_COLORS = [
  '#E8B931',
  '#378ADD',
  '#1D9E75',
  '#D85A30',
  '#7F77DD',
  '#D4537E',
  '#E24B4A',
  '#A0A0A0',
];

export function scoreToColor(score: number): string {
  if (score >= 85) return '#E8B931';
  if (score >= 75) return '#BA7517';
  if (score >= 65) return '#378ADD';
  if (score >= 55) return '#888780';
  return '#5F5E5A';
}

// Scores near the top of the scale crowd together (most current-model episodes
// sit above 85), so fixed-threshold colors paint whole shows one color. These
// color a score by where it falls within its own set (fifths, ties placed at
// their middle rank), so a show's peaks and dips stay visible.
export const RELATIVE_SCALE = ['#5F5E5A', '#888780', '#378ADD', '#BA7517', '#E8B931'];
export const RELATIVE_LABELS = ['Bottom fifth', 'Lower', 'Middle', 'Upper', 'Top fifth'];
export function relativeColorFn(scores: number[]): (score: number) => string {
  const sorted = [...scores].sort((a, b) => a - b);
  const n = sorted.length;
  return (x: number) => {
    if (!n) return RELATIVE_SCALE[2];
    let lo = 0, hi = n;
    while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < x) lo = m + 1; else hi = m; }
    let up = lo;
    while (up < n && sorted[up] === x) up++;
    const pct = (lo + up) / 2 / n;
    return RELATIVE_SCALE[Math.min(4, Math.floor(pct * 5))];
  };
}

/** Lower bound for a score chart's y-axis: a little under the lowest value, on a multiple of 5. */
export function chartFloor(values: number[]): number {
  if (!values.length) return 40;
  return Math.max(0, Math.floor((Math.min(...values) - 3) / 5) * 5);
}

export function scoreToGrade(score: number): string {
  if (score >= 92) return 'S';
  if (score >= 85) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 77) return 'A-';
  if (score >= 74) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 67) return 'B-';
  if (score >= 64) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 56) return 'C-';
  return 'D';
}

export function formatJPM(jpm: number): string {
  return jpm.toFixed(1);
}

export function formatIndex(index: number): string {
  return index.toFixed(1);
}

/**
 * Sort comparator: Humor Index, highest first, with ties broken by average
 * craft plus impact, then jokes per minute.
 *
 * The display scale caps at 100 and dozens of current-model episodes sit on
 * the cap, so sorting on humor_index alone leaves their order arbitrary. The
 * tie-break orders them by the per-joke quality the index is built from. It
 * changes no published number. Remove once the display scale is recalibrated.
 */
export function byHumorIndexDesc(
  a: { humor_index: number; avg_craft?: number; avg_impact?: number; jpm?: number },
  b: { humor_index: number; avg_craft?: number; avg_impact?: number; jpm?: number },
): number {
  return (
    b.humor_index - a.humor_index ||
    ((b.avg_craft ?? 0) + (b.avg_impact ?? 0)) - ((a.avg_craft ?? 0) + (a.avg_impact ?? 0)) ||
    (b.jpm ?? 0) - (a.jpm ?? 0)
  );
}


/**
 * `dominant_joke_types` and `standout_joke_ids` are stored in the episode JSON
 * as JSON-encoded strings, not arrays. Indexing them directly yields characters
 * (or, for `.includes()`, a substring match), so always normalise first.
 */
export function parseJokeTypes(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === 'string');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function parseStandoutIds(raw: unknown): number[] {
  if (Array.isArray(raw)) return raw.filter((n): n is number => typeof n === 'number');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
    } catch {
      return [];
    }
  }
  return [];
}

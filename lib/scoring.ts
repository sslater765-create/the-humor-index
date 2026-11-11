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

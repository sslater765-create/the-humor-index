import { CharacterStats } from './types';

export const SHOW_SLUGS = [
  'the-office',
  'seinfeld',
  'friends',
  'arrested-development',
  'parks-and-recreation',
  '30-rock',
  'brooklyn-nine-nine',
  'its-always-sunny',
  'schitts-creek',
  'big-bang-theory',
  'two-and-a-half-men',
] as const;
export type ShowSlug = (typeof SHOW_SLUGS)[number];

export const MOCK_CHARACTER_DATA: Record<string, CharacterStats[]> = {
  'the-office': [
    { name: 'Michael Scott', total_jokes: 3267, avg_craft: 6.8, avg_impact: 6.6, jpm: 5.8, screen_time_minutes: 142, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Dwight Schrute', total_jokes: 1734, avg_craft: 7.1, avg_impact: 6.9, jpm: 4.6, screen_time_minutes: 118, dominant_types: ['character_comedy', 'absurdist'] },
    { name: 'Jim Halpert', total_jokes: 1501, avg_craft: 6.9, avg_impact: 6.6, jpm: 3.9, screen_time_minutes: 124, dominant_types: ['character_comedy', 'observational'] },
    { name: 'Andy Bernard', total_jokes: 893, avg_craft: 6.7, avg_impact: 6.4, jpm: 3.2, screen_time_minutes: 72, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Pam Beesly', total_jokes: 793, avg_craft: 6.8, avg_impact: 6.6, jpm: 2.8, screen_time_minutes: 108, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Kevin Malone', total_jokes: 506, avg_craft: 6.8, avg_impact: 6.7, jpm: 2.4, screen_time_minutes: 64, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Angela Martin', total_jokes: 336, avg_craft: 7.0, avg_impact: 6.8, jpm: 2.1, screen_time_minutes: 58, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Ryan Howard', total_jokes: 284, avg_craft: 6.8, avg_impact: 6.5, jpm: 2.0, screen_time_minutes: 52, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Erin Hannon', total_jokes: 238, avg_craft: 6.8, avg_impact: 6.5, jpm: 1.9, screen_time_minutes: 48, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Oscar Martinez', total_jokes: 229, avg_craft: 6.9, avg_impact: 6.6, jpm: 1.8, screen_time_minutes: 46, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Stanley Hudson', total_jokes: 217, avg_craft: 6.9, avg_impact: 6.7, jpm: 1.7, screen_time_minutes: 44, dominant_types: ['character_comedy', 'deadpan_understatement'] },
    { name: 'Darryl Philbin', total_jokes: 203, avg_craft: 6.8, avg_impact: 6.5, jpm: 1.8, screen_time_minutes: 42, dominant_types: ['character_comedy', 'deadpan_understatement'] },
  ],
  'seinfeld': [
    { name: 'Jerry Seinfeld', total_jokes: 1318, avg_craft: 7.7, avg_impact: 8.0, jpm: 5.4, screen_time_minutes: 138, dominant_types: ['observational', 'setup_punchline'] },
    { name: 'George Costanza', total_jokes: 1124, avg_craft: 7.5, avg_impact: 8.1, jpm: 5.0, screen_time_minutes: 122, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Cosmo Kramer', total_jokes: 987, avg_craft: 7.2, avg_impact: 8.3, jpm: 4.8, screen_time_minutes: 98, dominant_types: ['physical_slapstick', 'absurdist'] },
    { name: 'Elaine Benes', total_jokes: 774, avg_craft: 7.3, avg_impact: 7.7, jpm: 4.1, screen_time_minutes: 112, dominant_types: ['observational', 'irony_sarcasm'] },
  ],
};

export const MOCK_DNA_DATA: Record<string, Record<string, number>> = {
  'the-office': {
    character_comedy: 37,
    cringe_discomfort: 11,
    escalation: 8,
    absurdist: 8,
    observational: 6,
    deadpan_understatement: 4,
    setup_punchline: 4,
    irony_sarcasm: 4,
    wordplay_pun: 3,
    dark_subversive: 3,
    reaction_beat: 2,
    misdirection: 2,
    physical_slapstick: 2,
    callback: 2,
    visual_gag: 1,
    meta_self_referential: 1,
    running_gag: 1,
    awkward_silence: 1,
  },
  'seinfeld': {
    setup_punchline: 22,
    callback: 12,
    cringe_discomfort: 11,
    physical_slapstick: 8,
    wordplay_pun: 9,
    running_gag: 7,
    dark_subversive: 5,
    absurdist: 10,
    observational: 21,
    character_comedy: 14,
    irony_sarcasm: 15,
    meta_self_referential: 6,
  },
};

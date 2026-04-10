import { CharacterStats } from './types';

export const SHOW_SLUGS = ['the-office', 'seinfeld'] as const;
export type ShowSlug = (typeof SHOW_SLUGS)[number];

export const MOCK_CHARACTER_DATA: Record<string, CharacterStats[]> = {
  'the-office': [
    { name: 'Michael Scott', total_jokes: 1402, avg_craft: 7.9, avg_impact: 8.4, jpm: 5.8, screen_time_minutes: 142, dominant_types: ['cringe_discomfort', 'character_comedy'] },
    { name: 'Dwight Schrute', total_jokes: 1087, avg_craft: 7.4, avg_impact: 7.9, jpm: 4.6, screen_time_minutes: 118, dominant_types: ['absurdist', 'character_comedy'] },
    { name: 'Jim Halpert', total_jokes: 843, avg_craft: 7.1, avg_impact: 7.6, jpm: 3.9, screen_time_minutes: 124, dominant_types: ['irony_sarcasm', 'observational'] },
    { name: 'Pam Beesly', total_jokes: 512, avg_craft: 6.8, avg_impact: 7.2, jpm: 2.8, screen_time_minutes: 108, dominant_types: ['observational', 'character_comedy'] },
    { name: 'Andy Bernard', total_jokes: 398, avg_craft: 6.5, avg_impact: 7.0, jpm: 3.2, screen_time_minutes: 72, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Kevin Malone', total_jokes: 287, avg_craft: 6.2, avg_impact: 7.4, jpm: 2.4, screen_time_minutes: 64, dominant_types: ['observational', 'setup_punchline'] },
  ],
  'seinfeld': [
    { name: 'Jerry Seinfeld', total_jokes: 1318, avg_craft: 7.7, avg_impact: 8.0, jpm: 5.4, screen_time_minutes: 138, dominant_types: ['observational', 'setup_punchline'] },
    { name: 'George Costanza', total_jokes: 1124, avg_craft: 7.5, avg_impact: 8.1, jpm: 5.0, screen_time_minutes: 122, dominant_types: ['character_comedy', 'cringe_discomfort'] },
    { name: 'Cosmo Kramer', total_jokes: 987, avg_craft: 7.2, avg_impact: 8.3, jpm: 4.8, screen_time_minutes: 98, dominant_types: ['physical_slapstick', 'absurdist'] },
    { name: 'Elaine Benes', total_jokes: 774, avg_craft: 7.3, avg_impact: 7.7, jpm: 4.1, screen_time_minutes: 112, dominant_types: ['observational', 'irony_sarcasm'] },
  ],
};

export const MOCK_DNA_DATA = {
  'the-office': {
    setup_punchline: 14,
    callback: 8,
    cringe_discomfort: 22,
    physical_slapstick: 5,
    wordplay_pun: 4,
    running_gag: 10,
    dark_subversive: 6,
    absurdist: 9,
    observational: 11,
    character_comedy: 18,
    irony_sarcasm: 13,
    meta_self_referential: 7,
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

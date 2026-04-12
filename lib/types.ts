export type ShowFormat =
  | 'single_camera'
  | 'multi_camera_live'
  | 'multi_camera_sweetened'
  | 'hybrid';

export type JokeType =
  | 'setup_punchline'
  | 'callback'
  | 'cringe_discomfort'
  | 'physical_slapstick'
  | 'wordplay_pun'
  | 'running_gag'
  | 'dark_subversive'
  | 'absurdist'
  | 'observational'
  | 'character_comedy'
  | 'irony_sarcasm'
  | 'meta_self_referential'
  | 'escalation'
  | 'deadpan_understatement'
  | 'reaction_beat'
  | 'misdirection'
  | 'visual_gag'
  | 'awkward_silence';

export interface ShowScore {
  show_id: number;
  slug: string;
  name: string;
  format: ShowFormat;
  total_seasons: number;
  total_episodes: number;
  humor_index: number;
  best_season: number;
  avg_jpm: number;
  avg_craft: number;
  avg_impact: number;
  total_jokes_analyzed: number;
  description: string;
  rank?: number;
  avg_imdb_rating?: number;
  backdrop_path?: string;
  poster_path?: string;
  created_by?: string[];
  stars?: string[];
  network?: string;
  aired?: string;
  genres?: string[];
}

export interface SeasonScore {
  show_id: number;
  slug: string;
  season: number;
  humor_index: number;
  avg_jpm: number;
  avg_craft: number;
  avg_impact: number;
  consistency_score: number;
  total_jokes: number;
  best_episode_title: string;
  best_episode_index: number;
}

export interface EpisodeScore {
  episode_id: number;
  slug: string;
  season: number;
  episode_number: number;
  title: string;
  humor_index: number;
  jpm: number;
  avg_craft: number;
  avg_impact: number;
  total_jokes: number;
  dominant_joke_types: JokeType[];
  air_date?: string;
  imdb_rating?: number;
  imdb_votes?: number;
}

export interface Joke {
  id: number;
  joke_index: number;
  timestamp_estimate: string;
  text: string;
  characters: string[];
  joke_types: JokeType[];
  setup: string;
  punchline: string;
  craft_total: number;
  impact_score: number;
  quotability: number;
  rewatch_bonus: boolean;
  is_callback: boolean;
  callback_reference?: string;
  explanation: string;
}

export interface EpisodeDetail extends EpisodeScore {
  jokes: Joke[];
  weakest_section: string;
  standout_joke_ids: number[];
}

export interface CharacterStats {
  name: string;
  total_jokes: number;
  avg_craft: number;
  avg_impact: number;
  jpm: number;
  screen_time_minutes: number;
  dominant_types: JokeType[];
}

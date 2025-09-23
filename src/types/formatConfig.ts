export interface RoundRobinConfig {
  group_count: number;

  advances_per_group: number;
  use_point_system: boolean;
}

export interface KnockoutConfig {
  group_count: number;

  single_elim: boolean;
  seeding: string;
}

export interface DoubleEliminationConfig {
  group_count: number;
  progress_group: number;
  max_progress_group: number;
  max_loss: number;
  brackets: string[];
}

export interface BestOfConfig {
  group_count: number;
  advances_per_group: number;

  games: number;
}

export interface TwiceToBeatConfig {
  advantaged_team?: string;
  challenger_team?: string;
  max_games?: number;
}

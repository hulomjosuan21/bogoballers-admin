export interface RoundRobinConfig {
  group_count: number;

  advances_per_group: number;
  regeneration_count: number;
}

export interface KnockoutConfig {
  group_count: number;

  single_elim: boolean;
  seeding: string;
  regeneration_count: number;
}

export interface DoubleEliminationConfig {
  group_count: number;

  max_loss: number;
  brackets: string[];
  regeneration_count: number;
}

export interface BestOfConfig {
  group_count: number;

  games: number;
  regeneration_count: number;
}

export interface TwiceToBeatConfig {
  advantaged_team: string;
  challenger_team: string;
  max_games: number;
}

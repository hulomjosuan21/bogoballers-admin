export interface RoundRobinConfigObj {
  group_count: number;
  team_count: number;
  advances_per_group: number;
  regeneration_count: number;
}

export interface KnockoutConfigObj {
  group_count: number;
  team_count: number;
  single_elim: boolean;
  seeding: string;
  regeneration_count: number;
}

export interface DoubleEliminationConfigObj {
  group_count: number;
  team_count: number;
  max_loss: number;
  brackets: string[];
  regeneration_count: number;
}

export interface BestOfConfigObj {
  group_count: number;
  team_count: number;
  games: number;
  regeneration_count: number;
}

export interface TwiceToBeatConfigObj {
  advantaged_team: string;
  team_count: number;
  challenger_team: string;
  max_games: number;
}

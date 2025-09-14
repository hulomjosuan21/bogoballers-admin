export interface RoundRobinConfigObj {
  group_count: number;
  team_count: number;
  advances_per_group: number;
  use_point_system: boolean;
}

export interface KnockoutConfigObj {
  group_count: number;
  team_count: number;
  seeding: string;
}

export interface DoubleEliminationConfigObj {
  group_count: number;
  team_count: number;
  max_loss: number;
  brackets: string[];
}

export interface BestOfConfigObj {
  group_count: number;
  team_count: number;
  games: number;
}

export interface TwiceToBeatConfigObj {
  advantaged_team: string;
  team_count: number;
  challenger_team: string;
  max_games: number;
}

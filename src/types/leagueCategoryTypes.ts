import type { Category } from "./category";

export interface CreateLeagueCategory {
  category_name: string;
  max_team: number;
  team_entrance_fee_amount: number;
  individual_player_entrance_fee_amount: number;
}

export interface LeagueCategory extends Category {
  league_category_id: string;
  league_id: string;
  max_team: number;
  accept_teams: boolean;
  manage_automatic: boolean;
  league_category_status: string;
  league_category_created_at: string;
  league_category_updated_at: string;
  rounds: LeagueCategoryRound[];
}

export interface LeagueCategoryRound {
  round_id: string;
  public_round_id: string;
  league_category_id: string;
  round_name: string;
  round_order: number;
  round_status: string;
  total_stages: number;
  current_stage: number;
  matches_generated: boolean;
  format: RoundFormat | null;
  position: {
    x: number;
    y: number;
  };
  next_round_id: string | null;
}

export interface RoundFormat {
  format_id: string;
  round_id: string | null;
  format_name: string;
  format_type: string;
  format_obj: Record<string, any>;
  is_configured: boolean;
  position: {
    x: number;
    y: number;
  };
}

export enum RoundTypeEnum {
  Elimination = "Elimination",
  QuarterFinal = "Quarterfinal",
  SemiFinal = "Semifinal",
  Final = "Final",
}

export enum RoundStateEnum {
  Upcoming = "Upcoming",
  Ongoing = "Ongoing",
  Finished = "Finished",
}

export enum RoundFormatTypesEnum {
  RoundRobin = "RoundRobin",
  Knockout = "Knockout",
  DoubleElimination = "DoubleElimination",
  BestOf = "BestOf",
}

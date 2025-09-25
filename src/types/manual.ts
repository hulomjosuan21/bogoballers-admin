import { type Node } from "@xyflow/react";
enum RoundTypeEnum {
  Elimination = "Elimination",
  QuarterFinal = "Quarterfinal",
  SemiFinal = "Semifinal",
  Final = "Final",
}
type Category = {
  category_id: string;
  category_name: string;
  league_administrator_id: string;
  check_player_age: boolean;
  player_min_age: number | null;
  player_max_age: number | null;
  player_gender: string;
  check_address: boolean;
  allowed_address: string | null;
  allow_guest_team: boolean;
  allow_guest_player: boolean;
  guest_player_fee_amount: number;
  team_entrance_fee_amount: number;
  requires_valid_document: boolean;
  allowed_documents: string[] | null;
  document_valid_until: string | null;
};

interface LeagueCategory extends Category {
  league_category_id: string;
  league_id: string;
  max_team: number;
  accept_teams: boolean;
  league_category_created_at: string;
  league_category_updated_at: string;
  rounds: LeagueCategoryRound[];
}

export interface IGroup {
  group_id: string; // no relation just uuid this
  display_name: string;
  round_id?: string;
}

export interface LeagueCategoryRound {
  round_id: string;
  public_round_id: string;
  league_category_id: string;
  round_name: string;
  round_order: number;
  round_status: string;
  matches_generated: boolean;
  format_type: string | null;
  format_options: Record<string, any> | null;

  next_round_id: string | null;
}
export interface Team {
  team_id: string;
  public_team_id: string;
  user_id: string;
  team_name: string;
  team_address: string;
  team_category: string | null;
  contact_number: string;
  team_motto: string | null;
  team_logo_url: string;
  championships_won: number;
  coach_name: string;
  assistant_coach_name: string | null;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_points: number;
  is_recruiting: boolean;
}

export interface LeagueTeam extends Team {
  league_team_id: string;
  league_team_public_id: string;
  league_id: string;
  league_category_id: string;
  status: string;
  is_eliminated: boolean;
  amount_paid: number;
  payment_status: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  final_rank: number | null;
  is_champion: boolean;
  finalized_at: string | null;
  eliminated_in_round_id: string | null;
}

export interface LeagueMatch {
  league_match_id: string;
  public_league_match_id: string;
  league_id: string;
  league_category_id: string;
  round_id: string;
  home_team_id: string | null;
  home_team: LeagueTeam | null;
  away_team_id: string | null;
  away_team: LeagueTeam | null;
  home_team_score: number | null;
  away_team_score: number | null;
  winner_team_id: string | null;
  loser_team_id: string | null;
  scheduled_date: string | null;
  quarters: number;
  minutes_per_quarter: number;
  minutes_per_overtime: number;
  court: string;
  referees: string[];
  previous_match_ids: string[];
  next_match_id: string | null;
  next_match_slot: string | null;
  loser_next_match_id: string | null;
  loser_next_match_slot: string | null;
  round_number: number | null;
  bracket_side: string | null;
  bracket_position: string | null;
  pairing_method: string;
  is_final: boolean;
  is_third_place: boolean;
  is_exhibition: boolean;
  status: string;

  stage_number: number | null;
  depends_on_match_ids: string[];
  is_placeholder: boolean;
  bracket_stage_label: string | null;

  league_match_created_at: string;
  display_name: string | null;
  league_match_updated_at: string;
}

export type LeagueCategoryNodeData = {
  type: "league_category";
  league_category: LeagueCategory;
};
export type LeagueCategoryRoundNodeData = {
  type: "league_category_round";
  league_category_round: RoundTypeEnum;
  round: Partial<LeagueCategoryRound>;
};
export type LeagueMatchNodeData = {
  type: "league_match";
  league_match: Partial<LeagueMatch>;
};
export type GroupNodeData = { type: "group"; group: IGroup };

export type FlowNodeData =
  | LeagueCategoryNodeData
  | LeagueCategoryRoundNodeData
  | LeagueMatchNodeData
  | GroupNodeData;

export type FlowNode = Node<FlowNodeData>;

import type { LeaguePlayer, PlayerTeamModel } from "./player";
import type { User, UserType } from "./user";

export type Team = {
  team_id: string;
  user_id: string;
  team_name: string;
  team_address: string;
  contact_number: string;
  team_motto: string;
  team_logo_url: string;
  championships_won: number;
  coach_name: string;
  assistant_coach_name: string | null;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_points: number;
  is_recruiting: boolean;
};
export interface TeamType extends Team {}

export interface TeamModel extends TeamType {
  created_at: string;
  updated_at: string;
  user: UserType | User;
  accepted_players: PlayerTeamModel[];
}

export interface LeagueTeamModel extends TeamModel {
  league_team_id: string;
  league_id: string;
  league_category_id: string;
  status: string;
  amount_paid: number;
  payment_status: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}

export interface LeagueTeamForMatch {
  amount_paid: number;
  assistant_coach_name: string | null;
  championships_won: number;
  coach_name: string;
  contact_number: string;
  created_at: string;
  draws: number;
  is_recruiting: boolean;
  league_category_id: string;
  league_id: string;
  league_players: LeaguePlayer[];
  league_team_id: string;
  losses: number;
  payment_status: string;
  points: number;
  status: string;
  team_address: string;
  team_category: string | null;
  team_id: string;
  team_logo_url: string;
  team_motto: string;
  team_name: string;
  total_draws: number;
  total_losses: number;
  total_points: number;
  total_wins: number;
  updated_at: string;
  user: User;
  user_id: string;
  wins: number;
}

import type { LeagueTeam } from "./team";

export interface LeagueMatch {
  league_match_id: string;
  public_league_match_id: string;
  league_id: string;
  league_category_id: string;
  round_id: string;
  home_team_id: string;
  home_team: LeagueTeam;
  away_team_id: string;
  away_team: LeagueTeam;
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
  league_match_created_at: string;
  league_match_updated_at: string;
}

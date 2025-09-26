import type { LeagueTeam } from "./team";
import type { User } from "./user";

export interface Player {
  player_id: string;
  public_player_id: string;
  user_id: string;
  full_name: string;
  profile_image_url: string;
  gender: string;
  birth_date: string;
  player_address: string;
  jersey_name: string;
  jersey_number: number;
  position: string[];
  height_in: number;
  weight_kg: number;
  total_games_played: number;
  total_points_scored: number;
  total_assists: number;
  total_rebounds: number;
  total_steals: number;
  total_blocks: number;
  total_turnovers: number;
  total_fg2_made: number;
  total_fg2_attempts: number;
  total_fg3_made: number;
  total_fg3_attempts: number;
  total_ft_made: number;
  total_ft_attempts: number;
  total_join_league: number;
  platform_points: number;
  platform_points_per_game: number;
  is_ban: boolean;
  is_allowed: boolean;
  valid_documents: string[] | null;
  user: User;
  player_created_at: string;
  player_updated_at: string;
}

export interface PlayerTeam extends Player {
  player_team_id: string;
  team_id: string;
  is_team_captain: boolean;
  is_accepted: string;
  player_team_created_at: string;
  player_team_updated_at: string;
}

export interface LeaguePlayer extends PlayerTeam {
  league_player_id: string;
  league_id: string;
  league_category_id: string;
  league_team_id: string;
  total_points: number;
  is_ban_in_league: boolean;
  is_allowed_in_league: boolean;
  league_team: LeagueTeam;
  league_player_created_at: string;
  league_player_updated_at: string;
}

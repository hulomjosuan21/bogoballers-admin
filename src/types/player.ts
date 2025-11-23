import type { LeagueTeam } from "./team";
import type { User } from "./user";

type PlayerStatistics = {
  total_games_played: number;
  total_points_scored: number;
  total_assists: number;
  total_rebounds: number;
  total_steals: number;
  total_blocks: number;
  total_turnovers: number;
  fg2_percentage_per_game: number;
  fg3_percentage_per_game: number;
  ft_percentage_per_game: number;
  total_join_league: number;
  platform_points: number;
  platform_points_per_game: number;
};

export interface PlayerValidDocuments {
  doc_id: string;
  player_id: string;
  document_type: string;
  document_urls: string | string[];
  document_format: string;
  uploaded_at: string;
}

export interface Player extends PlayerStatistics {
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
  is_ban: boolean;
  is_allowed: boolean;
  valid_documents: PlayerValidDocuments[];
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
  include_first5: boolean;
  is_allowed_in_league: boolean;
  league_team: LeagueTeam | null;
  league_player_created_at: string;
  league_player_updated_at: string;
}

import type { LeagueCategoryModel } from "@/pages/league-administrator/league/category/types";
import type { UserType } from "./user";
import type { LeagueTeamModel } from "./team";

export type Player = {
  player_id: string;
  user_id: string;
  full_name: string;
  gender: string;
  birth_date: string;
  player_address: string;
  jersey_name: string;
  jersey_number: number;
  position: string[];
  height_in: number;
  weight_kg: number;
  valid_documents: string[];
  total_games_played: number;
  total_points_scored: number;
  total_assists: number;
  total_rebounds: number;
  total_join_league: number;
  profile_image_url: string;
};

export interface PlayerType extends Player {
  is_ban: boolean;
  is_allowed: boolean;
  user: UserType;
}

export interface PlayerModel extends PlayerType {
  created_at: string;
  updated_at: string;
}

export interface PlayerTeamModel extends PlayerModel {
  team_id: string;
  player_team_id: string;
  is_accepted: boolean;
  is_team_captain: boolean;
}

export interface LeaguePlayer extends PlayerTeamModel {
  league_player_id: string;
  league_id: string;
  league_category_id: string;
  league_team_id: string;
  league_category: LeagueCategoryModel;
  league_team: LeagueTeamModel;
}

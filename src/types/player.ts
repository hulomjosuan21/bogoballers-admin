import type { UserType } from "./user";

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
  is_ban: boolean;
  is_accepted: string;
  is_team_captain: string;
}

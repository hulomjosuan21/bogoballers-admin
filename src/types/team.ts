import type { PlayerTeamModel } from "./player";
import type { UserType } from "./user";

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
  user: UserType;
  accepted_players: PlayerTeamModel[];
}

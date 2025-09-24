import type { LeaguePlayer, PlayerTeam } from "./player";
import type { User } from "./user";

type PlayersType = {
  accepted_players: PlayerTeam[];
  pending_players: PlayerTeam[];
  rejected_players: PlayerTeam[];
  invited_players: PlayerTeam[];
  stanby_players: PlayerTeam[];
  guest_players: PlayerTeam[];
};

export interface Team extends PlayersType {
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
  creator: User;
  team_created_at: string;
  team_updated_at: string;
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
  league_team_created_at: string;
  league_team_updated_at: string;
  league_players: LeaguePlayer[];
}

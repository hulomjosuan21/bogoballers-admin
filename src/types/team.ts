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
  readonly team_id: string;
  readonly public_team_id: string;
  readonly user_id: string;
  readonly team_name: string;
  readonly team_address: string;
  readonly contact_number: string;
  readonly team_motto: string | null;
  readonly team_logo_url: string;
  readonly championships_won: number;
  readonly coach_name: string;
  readonly assistant_coach_name: string | null;
  readonly total_wins: number;
  readonly total_losses: number;
  readonly total_draws: number;
  readonly total_points: number;
  readonly is_recruiting: boolean;
  readonly creator: User;
  readonly team_created_at: string;
  readonly team_updated_at: string;
}

interface UpcomingOpponent {
  league_team_id: string;
  team_name: string;
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
  matches_remaining: number;
  upcoming_opponents: UpcomingOpponent[];
}

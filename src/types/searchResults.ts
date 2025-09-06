import type { League } from "./league";
import type { LeagueAdminModel } from "./leagueAdmin";
import type { Player, PlayerType } from "./player";
import type { Team } from "./team";
import type { User, UserType } from "./user";

type BaseResultWrapper = {
  relevance_score: number;
  type: "player" | "team" | "league_administrator" | "league";
};

export interface QueryPlayer extends PlayerType {
  created_at: string;
  updated_at: string;
}

export interface QueryPlayerTeam extends Player {
  player_team_id: string;
  team_id: string;
  is_ban: boolean;
  is_accepted: string;
  user: User;
}

export interface QueryTeam extends Team {
  user: UserType;
  team_category: string | null;
  accepted_players: QueryPlayerTeam[];
}

export interface QueryLeagueAdmin extends LeagueAdminModel {}

export interface QueryLeague extends League {
  creator: LeagueAdminModel;
}

export interface QueryResult extends BaseResultWrapper {
  data: QueryPlayer | QueryTeam | QueryLeagueAdmin | QueryLeague;
}

export interface QueryResultWrapper {
  results: QueryResult[];
  league_administrators_count: number;
  leagues_count: number;
  players_count: number;
  query: string;
  teams_count: number;
  total_results: number;
}

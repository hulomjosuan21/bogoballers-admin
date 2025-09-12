import type { League } from "./league";
import type { LeagueAdministator } from "./leagueAdmin";
import type { Player } from "./player";
import type { Team } from "./team";

type BaseResultWrapper = {
  relevance_score: number;
  type: "player" | "team" | "league_administrator" | "league";
};

export interface QueryResult extends BaseResultWrapper {
  data: LeagueAdministator | Player | Team | League;
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

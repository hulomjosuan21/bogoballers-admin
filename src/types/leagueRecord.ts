import type { League } from "./league";
import type { MatchBook } from "./scorebook";
import type { LeagueTeam } from "./team";
export interface LeagueRecord {
  record_id: string;
  league_id: string;
  home_team: string;
  away_team: string;
  league_match_id: string;
  record_name: string;
  schedule_date: string;
  record_json: MatchBook;
  record_created_at: string;
}

export type LeagueWithRecord = League & {
  teams: LeagueTeam[];
  league_match_records: LeagueRecord[];
};

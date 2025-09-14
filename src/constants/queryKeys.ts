import type { LeagueCategory } from "@/types/leagueCategoryTypes";

export const QUERY_KEYS = {
  ACTIVE_LEAGUE: ["active-league"] as const,
  AUTH_LEAGUE_ADMIN: ["auth", "league-admin"] as const,
  AUTH_LEAGUE_ADMIN_CATEGORIES: ["league-admin-categories"] as const,
  ACTIVE_LEAGUE_ANALYTICS: (leagueId?: string) =>
    ["active-league-analytics", leagueId] as const,

  PLAYER_LEADERBOARD: ["player-leaderboard"],

  PLAYERS_ALL: ["players-all"] as const,
  TEAMS_ALL: ["teams-all"] as const,

  LEAGUE_TEAM: (leagueCategoryId?: string, data?: Object) =>
    ["league-team", leagueCategoryId, JSON.stringify(data)] as const,

  LEAGUE_TEAM_FOR_MATCH: (leagueId?: string, leagueCategoryId?: string) =>
    ["league-team-for-match", leagueId, leagueCategoryId] as const,

  ACTIVE_LEAGUE_CATEGORIES: (
    leagueId?: string,
    data?: Partial<LeagueCategory>
  ) => ["league-categories", leagueId, JSON.stringify(data)] as const,

  ACTIVE_LEAGUE_CATEGORIES_METADATA: (leagueId?: string) =>
    ["league-categories", leagueId] as const,
};

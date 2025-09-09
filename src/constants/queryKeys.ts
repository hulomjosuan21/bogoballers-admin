export const QUERY_KEYS = {
  PLAYERS_ALL: ["players-all"] as const,
  TEAMS_ALL: ["teams-all"] as const,

  AUTH_LEAGUE_ADMIN: ["auth", "league-admin"] as const,
  AUTH_LEAGUE_ADMIN_CATEGORIES: ["league-admin-categories"] as const,

  PLAYER_LEADERBOARD: ["player-leaderboard"],

  LEAGUE_TEAM_SUBMISSION: (leagueId?: string, leagueCategoryId?: string) =>
    ["league-team-submission", leagueId, leagueCategoryId] as const,

  LEAGUE_TEAM_FOR_MATCH: (leagueId?: string, leagueCategoryId?: string) =>
    ["league-team-for-match", leagueId, leagueCategoryId] as const,

  ACTIVE_LEAGUE: ["active-league"] as const,
  ACTIVE_LEAGUE_RESOURCE: ["active-league-resource"] as const,
  ACTIVE_LEAGUE_ANALYTICS: (leagueId?: string) =>
    ["active-league-analytics", leagueId] as const,
  ACTIVE_LEAGUE_CATEGORIES: (leagueId?: string) =>
    ["active-league-categories", leagueId] as const,
  ACTIVE_LEAGUE_PLAYER_FOR_MATCH: (
    leagueId?: string,
    leagueCategoryId?: string
  ) => ["league-player-for-match", leagueId, leagueCategoryId] as const,
};

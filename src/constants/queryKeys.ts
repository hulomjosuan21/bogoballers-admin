export const QUERY_KEYS = {
  AUTH_LEAGUE_ADMIN: ["auth", "league-admin"] as const,
  AUTH_LEAGUE_ADMIN_CATEGORIES: ["league-admin-categories"] as const,

  PLAYER_LEADERBOARD: ["player-leaderboard"],

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

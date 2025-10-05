import type { League } from "@/types/league";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import type { LeagueMatch } from "@/types/leagueMatch";
import type { LeaguePlayer } from "@/types/player";
import type { LeagueTeam } from "@/types/team";

export const QUERY_KEYS = {
  AUTH_JWT: ["auth-jwt"] as const,
  ACTIVE_LEAGUE: ["active-league"] as const,
  AUTH_LEAGUE_ADMIN: ["auth", "league-admin"] as const,
  AUTH_LEAGUE_ADMIN_CATEGORIES: ["league-admin-categories"] as const,
  ACTIVE_LEAGUE_ANALYTICS: (leagueId?: string) =>
    ["active-league-analytics", leagueId] as const,

  PLAYER_LEADERBOARD: ["player-leaderboard"],

  PLAYERS_ALL: ["players-all"] as const,
  TEAMS_ALL: ["teams-all"] as const,
  LEAGUE_ADMINS: ["league-admins-all"] as const,
  LEAGUE_GUEST: (leagueId?: string) => ["league-guest", leagueId] as const,

  LEAGUE_PUBLIC_ID: (
    publicLeagueId?: string,
    data?: Partial<League> & { condition: string }
  ) => ["league-public-id", publicLeagueId, JSON.stringify(data)] as const,

  LEAGUE_PLAYER: (
    leagueCategoryId?: string,
    data?: Partial<LeaguePlayer> & { condition: string }
  ) => ["league-player", leagueCategoryId, JSON.stringify(data)] as const,

  LEAGUE_TEAM: (
    leagueCategoryId?: string,
    data?: Partial<LeagueTeam> & { condition: string }
  ) => ["league-team", leagueCategoryId, JSON.stringify(data)] as const,

  LEAGUE_TEAM_FOR_MATCH: (leagueId?: string, leagueCategoryId?: string) =>
    ["league-team-for-match", leagueId, leagueCategoryId] as const,

  ACTIVE_LEAGUE_CATEGORIES: (
    leagueId?: string,
    data?: Partial<LeagueCategory>
  ) => ["league-categories", leagueId, JSON.stringify(data)] as const,

  ACTIVE_LEAGUE_CATEGORIES_METADATA: (leagueId?: string) =>
    ["league-categories", leagueId] as const,

  LEAGUE_MATCH: (
    leagueCategoryId?: string,
    roundId?: string,
    data?: Partial<LeagueMatch> & { condition: string }
  ) =>
    ["league-match", leagueCategoryId, roundId, JSON.stringify(data)] as const,

  DYNAMIC_KEY_LEAGUE_TEAM_FOR_CHECKED: (
    leagueCategoryId?: string,
    roundId?: string
  ) => ["checked-league-team", leagueCategoryId, roundId],
};

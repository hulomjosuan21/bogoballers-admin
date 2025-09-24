import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueTeamService } from "@/service/leagueTeamService";
import type { LeagueTeam } from "@/types/team";
import { queryOptions } from "@tanstack/react-query";

export const getLeagueTeamQueryOptions = (
  leagueCategoryId?: string,
  data?: Partial<LeagueTeam> & { condition: string }
) =>
  queryOptions<LeagueTeam[] | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_TEAM(leagueCategoryId, data),
    queryFn: () => LeagueTeamService.getMany(leagueCategoryId!, data),
    enabled: !!leagueCategoryId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

export const makeLeagueTeamDynamicQueryOption = (
  queryKey: unknown[],
  queryFn: () => Promise<LeagueTeam[]>,
  extra?: Partial<ReturnType<typeof queryOptions<LeagueTeam[], Error>>>
) =>
  queryOptions<LeagueTeam[], Error>({
    queryKey,
    queryFn,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...extra,
  });

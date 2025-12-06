import type { League } from "@/types/league";
import { LeagueService } from "@/service/leagueService";
import { queryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const getActiveLeagueQueryOption = queryOptions<League, Error>({
  queryKey: QUERY_KEYS.ACTIVE_LEAGUE,
  queryFn: LeagueService.fetchActive,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export const getActiveLeagueByPublicIdQueryOption = (
  publicLeagueId?: string,
  data?: Partial<League> & { condition: string }
) =>
  queryOptions<League | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_PUBLIC_ID(publicLeagueId, data),
    queryFn: () => LeagueService.fetchGetOneByPublicId(publicLeagueId!, data),
    enabled: !!publicLeagueId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

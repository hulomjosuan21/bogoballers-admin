import type {
  LeagueType,
  LeagueResource,
  LeagueAnalytics,
} from "@/types/league";
import { LeagueService } from "@/service/leagueService";
import { queryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const getActiveLeagueQueryOption = queryOptions<
  LeagueType | null,
  Error
>({
  queryKey: QUERY_KEYS.ACTIVE_LEAGUE,
  queryFn: LeagueService.fetchActiveLeague,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export const getActiveLeagueResourceQueryOption = queryOptions<
  LeagueResource | null,
  Error
>({
  queryKey: QUERY_KEYS.ACTIVE_LEAGUE_RESOURCE,
  queryFn: LeagueService.fetchActiveLeagueResource,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export const getActiveLeagueAnalyticsQueryOption = (leagueId?: string) =>
  queryOptions<LeagueAnalytics | null, Error>({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_ANALYTICS(leagueId),
    queryFn: () => LeagueService.analytics(leagueId!),
    enabled: !!leagueId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

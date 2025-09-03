import type {
  LeagueType,
  LeagueResource,
  LeagueAnalytics,
} from "@/types/league";
import { LeagueService } from "@/service/league-service";
import { queryOptions } from "@tanstack/react-query";

export const getActiveLeagueQueryOption = queryOptions<
  LeagueType | null,
  Error
>({
  queryKey: ["active-league"],
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
  queryKey: ["active-league-resource"],
  queryFn: LeagueService.fetchActiveLeagueResource,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export const getActiveLeagueAnalyticsQueryOption = (leagueId?: string) =>
  queryOptions<LeagueAnalytics | null, Error>({
    queryKey: ["active-league-resource"],
    queryFn: () => LeagueService.analytics(leagueId!),
    enabled: !!leagueId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

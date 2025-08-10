import type { League, LeagueResource } from "@/types/league";
import LeagueService from "@/service/league-service";
import { queryOptions } from "@tanstack/react-query";

export const getActiveLeagueQueryOptions = queryOptions<League | null, Error>({
  queryKey: ["active-league"],
  queryFn: LeagueService.fetchActiveLeague,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export const getActiveLeagueResourceQueryOptions = queryOptions<
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

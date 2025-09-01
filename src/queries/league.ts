import type { LeagueType, LeagueResource } from "@/types/league";
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

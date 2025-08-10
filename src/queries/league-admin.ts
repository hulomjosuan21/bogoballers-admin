import { queryOptions } from "@tanstack/react-query";
import LeagueAdministratorService from "@/service/league-admin-service";
import type { LeagueAdminType } from "@/types/league-admin";

export const authLeagueAdminQueryOptions = queryOptions<LeagueAdminType, Error>(
  {
    queryKey: ["auth", "league-admin"],
    queryFn: LeagueAdministratorService.auth,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  }
);

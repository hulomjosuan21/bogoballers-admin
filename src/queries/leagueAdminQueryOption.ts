import { queryOptions } from "@tanstack/react-query";
import LeagueAdministratorService from "@/service/leagueAdminService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { JwtPayload, LeagueAdministator } from "@/types/leagueAdmin";
import type { Category } from "@/types/category";
import type { League } from "@/types/league";

export const authLeagueAdminQueryOption = ({
  enabled = true,
}: {
  enabled: boolean;
}) =>
  queryOptions<LeagueAdministator, Error>({
    queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN,
    queryFn: LeagueAdministratorService.auth,
    staleTime: Infinity,
    retry: false,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

export const leagueAdminCategoriesQueryOption = queryOptions<Category[], Error>(
  {
    queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN_CATEGORIES,
    queryFn: LeagueAdministratorService.fetchCategories,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  }
);

export const LeagueAdminAuthJwtQueryOption = queryOptions<JwtPayload, Error>({
  queryKey: QUERY_KEYS.AUTH_JWT,
  queryFn: LeagueAdministratorService.authJwt,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export const getAllLeagueAdminsQueryOption = queryOptions<
  (LeagueAdministator & { active_league: League | null })[],
  Error
>({
  queryKey: QUERY_KEYS.LEAGUE_ADMINS,
  queryFn: LeagueAdministratorService.getMany,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

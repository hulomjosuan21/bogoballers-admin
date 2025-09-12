import { queryOptions } from "@tanstack/react-query";
import LeagueAdministratorService from "@/service/leagueAdminService";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import type { Category } from "@/types/category";

export const authLeagueAdminQueryOption = queryOptions<
  LeagueAdministator,
  Error
>({
  queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN,
  queryFn: LeagueAdministratorService.auth,
  staleTime: Infinity,
  retry: false,
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

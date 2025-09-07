import { queryOptions } from "@tanstack/react-query";
import LeagueAdministratorService from "@/service/leagueAdminService";
import type { LeagueAdminModel } from "@/types/leagueAdmin";
import type { CategoryModel } from "@/pages/league-administrator/league/category/types";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const authLeagueAdminQueryOption = queryOptions<LeagueAdminModel, Error>(
  {
    queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN,
    queryFn: LeagueAdministratorService.auth,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  }
);

export const leagueAdminCategoriesQueryOption = queryOptions<
  CategoryModel[],
  Error
>({
  queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN_CATEGORIES,
  queryFn: LeagueAdministratorService.fetchCategories,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

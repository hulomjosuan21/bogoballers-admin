import { queryOptions } from "@tanstack/react-query";
import LeagueAdministratorService from "@/service/league-admin-service";
import type { LeagueAdminModel } from "@/types/league-admin";
import type { CategoryModel } from "@/pages/league-administrator/league/category/types";

export const authLeagueAdminQueryOption = queryOptions<LeagueAdminModel, Error>(
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

export const leagueAdminCategoriesQueryOption = queryOptions<
  CategoryModel[],
  Error
>({
  queryKey: ["league-admin-categories"],
  queryFn: LeagueAdministratorService.fetchCategories,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

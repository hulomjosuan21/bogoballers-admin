import { LeagueCategoryService } from "@/pages/league-administrator/league/category/service";
import type { LeagueCategory } from "@/pages/league-administrator/league/category/types";
import { queryOptions } from "@tanstack/react-query";

export const getActiveLeagueCategoriesQueryOptions = (league_id?: string) =>
  queryOptions<LeagueCategory[] | null, Error>({
    queryKey: ["active-league-categories", league_id],
    queryFn: () => LeagueCategoryService.fetchActiveCategories(league_id!),
    enabled: !!league_id,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

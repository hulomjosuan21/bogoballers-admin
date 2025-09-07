import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueCategoryService } from "@/service/leagueCategoryManagementService";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import { queryOptions } from "@tanstack/react-query";

export const getActiveLeagueCategoriesQueryOption = (league_id?: string) =>
  queryOptions<LeagueCategory[] | null, Error>({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_CATEGORIES(league_id),
    queryFn: () => LeagueCategoryService.fetchActiveCategories(league_id!),
    enabled: !!league_id,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

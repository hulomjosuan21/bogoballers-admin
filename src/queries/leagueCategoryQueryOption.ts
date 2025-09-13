import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueCategoryService } from "@/service/leagueCategory";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import { queryOptions } from "@tanstack/react-query";

export const getActiveLeagueCategoriesQueryOptions = (
  leagueId?: string,
  data?: Partial<LeagueCategory>
) =>
  queryOptions<LeagueCategory[] | null, Error>({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_CATEGORIES(leagueId),
    queryFn: () => LeagueCategoryService.getMany(leagueId!, data),
    enabled: !!leagueId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

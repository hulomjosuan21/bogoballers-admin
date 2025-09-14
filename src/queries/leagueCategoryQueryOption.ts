import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  LeagueCategoryService,
  type LeagueCategoryMetaData,
} from "@/service/leagueCategory";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import { queryOptions } from "@tanstack/react-query";

export const getActiveLeagueCategoriesQueryOptions = (
  leagueId?: string,
  data?: Partial<LeagueCategory> & { condition: string }
) =>
  queryOptions<LeagueCategory[] | null, Error>({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_CATEGORIES(leagueId),
    queryFn: () => LeagueCategoryService.getMany(leagueId!, data),
    enabled: !!leagueId,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

export const getActiveLeagueCategoriesMetaDataQueryOptions = (
  leagueId?: string
) =>
  queryOptions<LeagueCategoryMetaData[] | null, Error>({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_CATEGORIES_METADATA(leagueId),
    queryFn: () => LeagueCategoryService.getMetaData(leagueId!),
    enabled: !!leagueId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

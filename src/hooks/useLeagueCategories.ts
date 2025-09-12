import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { getActiveLeagueCategoriesQueryOptions } from "@/queries/leagueCategoryQueryOption";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import { useQuery } from "@tanstack/react-query";

export const useActiveLeagueCategories = (
  leagueId?: string,
  data?: Partial<LeagueCategory>
) => {
  const query = useQuery(getActiveLeagueCategoriesQueryOptions(leagueId, data));

  return {
    activeLeagueCategories: query.data,
    activeLeagueCategoriesLoading: query.isLoading,
    activeLeagueCategoriesError: query.error,
    refetchActiveLeagueCategories: query.refetch,
  };
};

export async function refetchActiveLeagueCategories(
  leagueId?: string,
  data?: Partial<LeagueCategory>
) {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_CATEGORIES(leagueId, data),
    exact: true,
  });
}

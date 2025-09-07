import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { getActiveLeagueCategoriesQueryOption } from "@/queries/leagueCategoryQueryOption";
import { useQuery } from "@tanstack/react-query";

export const useLeagueCategories = (leagueId?: string) => {
  const query = useQuery(getActiveLeagueCategoriesQueryOption(leagueId));

  return {
    leagueCategoriesData: query.data,
    leagueCategoriesLoading:
      query.isLoading || query.isFetching || query.isPending,
    refetchLeagueCategories: query.refetch,
    leagueCategoriesError: query.error,
  };
};

export async function refetchLeagueCategories(leagueId?: string) {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_CATEGORIES(leagueId),
    exact: true,
  });
}

import { queryClient } from "@/lib/queryClient";
import { getActiveLeagueCategoriesQueryOption } from "@/queries/league-category";
import { useQuery } from "@tanstack/react-query";

export const useLeagueCategories = (leagueId?: string) => {
  const query = useQuery(getActiveLeagueCategoriesQueryOption(leagueId));

  return {
    leagueCategoriesData: query.data,
    leagueCategoriesLoading:
      query.isLoading || query.isFetching || query.isPending,
    refetchLeagueCategories: query.refetch,
  };
};

export async function refetchLeagueCategories(leagueId?: string) {
  await queryClient.refetchQueries({
    queryKey: ["active-league-categories", leagueId],
    exact: true,
  });
}

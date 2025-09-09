import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { leagueAdminCategoriesQueryOption } from "@/queries/leagueAdminQueryOption";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () => {
  const query = useQuery(leagueAdminCategoriesQueryOption);

  return {
    categoriesData: query.data,
    categoriesLoading: query.isLoading || query.isPending || query.isFetching,
    categoriesError: query.error,
    refetchCategories: query.refetch,
  };
};

export async function refetchCategories() {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN_CATEGORIES,
    exact: true,
  });
}

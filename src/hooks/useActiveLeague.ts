import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import {
  getActiveLeagueAnalyticsQueryOption,
  getActiveLeagueQueryOption,
} from "@/queries/leagueQueryOption";
import { useQuery } from "@tanstack/react-query";

export const useActiveLeague = () => {
  const query = useQuery(getActiveLeagueQueryOption);

  return {
    activeLeagueId: query.data?.league_id,
    activeLeagueData: query.data,
    activeLeagueCategories: query.data?.league_categories,
    activeLeagueLoading: query.isLoading || query.isFetching || query.isPending,
    refetchActiveLeague: query.refetch,
    activeLeagueError: query.error,
  };
};

export async function refetchActiveLeague() {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE,
    exact: true,
  });
}

export const useActiveLeagueAnalytics = (leagueId?: string) => {
  const query = useQuery(getActiveLeagueAnalyticsQueryOption(leagueId));

  return {
    activeLeagueAnalyticsData: query.data,
    activeLeagueAnalyticsLoading:
      query.isLoading || query.isPending || query.isFetching,
    activeLeagueAnalyticsError: query.error,
    refetchActiveLeagueAnalytics: query.refetch,
  };
};

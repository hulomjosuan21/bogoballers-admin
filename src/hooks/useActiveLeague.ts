import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { getActiveLeagueAnalyticsQueryOption } from "@/queries/leagueQueryOption";
import { useQuery } from "@tanstack/react-query";

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

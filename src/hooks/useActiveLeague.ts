import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import {
  getActiveLeagueAnalyticsQueryOption,
  getActiveLeagueQueryOption,
  getActiveLeagueResourceQueryOption,
} from "@/queries/leagueQueryOption";
import { useQueries, useQuery } from "@tanstack/react-query";

export const useActiveLeague = () => {
  const query = useQuery(getActiveLeagueQueryOption);

  return {
    activeLeagueId: query.data?.league_id,
    activeLeagueData: query.data,
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

export const useActiveLeagueResource = () => {
  const [queryOne, queryTwo] = useQueries({
    queries: [getActiveLeagueQueryOption, getActiveLeagueResourceQueryOption],
  });

  return {
    activeLeagueData: queryOne.data,
    activeLeagueResourceData: queryTwo.data,
    activeLeagueResourceLoading:
      queryOne.isLoading || queryOne.isFetching || queryOne.isPending,
    activeLeagueResourceError: queryOne.error || queryTwo.error,
    refetchActiveLeagueResource: queryTwo.refetch,
  };
};

export const useLeagueResource = () => {
  const query = useQuery(getActiveLeagueResourceQueryOption);

  return {
    leagueResource: query.data,
    leagueResourceLoading:
      query.isLoading || query.isPending || query.isFetching,
    leagueResourceError: query.error,
    refetchLeagueResource: query.refetch,
  };
};

export async function refetchActiveLeagueResource() {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_RESOURCE,
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

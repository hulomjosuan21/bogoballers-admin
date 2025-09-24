import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import {
  getLeagueTeamQueryOptions,
  makeLeagueTeamDynamicQueryOption,
} from "@/queries/leagueTeamQueryOption";
import type { LeagueTeam } from "@/types/team";
import { useQuery } from "@tanstack/react-query";

export const useLeagueTeam = (
  leagueCategoryId?: string,
  data?: Partial<LeagueTeam> & { condition: string }
) => {
  const query = useQuery(getLeagueTeamQueryOptions(leagueCategoryId, data));

  return {
    leagueTeamData: query.data,
    leagueTeamLoading: query.isLoading || query.isFetching || query.isPending,
    leagueTeamError: query.error,
    refetchLeagueTeam: query.refetch,
  };
};

export async function refetchLeagueTeam(
  leagueCategoryId?: string,
  data?: Partial<LeagueTeam> & { condition: string }
) {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.LEAGUE_TEAM(leagueCategoryId, data),
    exact: true,
  });
}

export function useLeagueTeamDynamicQuery(
  queryKey: unknown[],
  queryFn: () => Promise<LeagueTeam[]>,
  extra?: Parameters<typeof makeLeagueTeamDynamicQueryOption>[2]
) {
  const query = useQuery(
    makeLeagueTeamDynamicQueryOption(queryKey, queryFn, extra)
  );

  return {
    dynamicLeagueTeamData: query.data ?? [], // always safe array
    dynamicLeagueTeamLoading: query.isLoading,
    dynamicLeagueTeamError: query.error,
    refetchDynamicLeagueTeam: query.refetch,
  };
}

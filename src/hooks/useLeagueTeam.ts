import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { getLeagueTeamQueryOptions } from "@/queries/leagueTeamQueryOption";
import type { LeagueTeam } from "@/types/team";
import { useQuery } from "@tanstack/react-query";

export const useLeagueTeam = (leagueCategoryId?: string, data?: Object) => {
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
  data?: Object
) {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.LEAGUE_TEAM(leagueCategoryId, data),
    exact: true,
  });
}

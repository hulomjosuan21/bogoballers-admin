import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { getLeagueMatchQueryOption } from "@/queries/leagueMatchQueryOption";
import type { LeagueMatch } from "@/types/leagueMatch";
import { useQuery } from "@tanstack/react-query";

export const useLeagueMatch = (
  leagueCategoryId?: string,
  roundId?: string,
  data?: Partial<LeagueMatch> & { condition: string; limit?: number }
) => {
  const query = useQuery(
    getLeagueMatchQueryOption(leagueCategoryId, roundId, data)
  );

  return {
    leagueMatchData: query.data,
    leagueMatchLoading: query.isLoading,
    leagueMatchError: query.error,
    refetchLeagueMatch: query.refetch,
  };
};

export async function refetchLeagueMatch(
  leagueCategoryId?: string,
  roundId?: string
) {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.LEAGUE_MATCH(leagueCategoryId, roundId),
    exact: true,
  });
}

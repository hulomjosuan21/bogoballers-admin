import { queryClient } from "@/lib/queryClient";
import { getActiveLeagueQueryOption } from "@/queries/league";
import { useQuery } from "@tanstack/react-query";

export const useActiveLeague = () => {
  const query = useQuery(getActiveLeagueQueryOption);

  return {
    activeLeagueId: query.data?.league_id,
    activeLeagueData: query.data,
    activeLeagueLoading: query.isLoading || query.isFetching || query.isPending,
    refetchActiveLeague: query.refetch,
  };
};

export async function refetchActiveLeague() {
  await queryClient.refetchQueries({
    queryKey: ["active-league"],
    exact: true,
  });
}

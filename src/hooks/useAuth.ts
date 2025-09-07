import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { authLeagueAdminQueryOption } from "@/queries/leagueAdminQueryOption";
import { useQuery } from "@tanstack/react-query";

export function useAuthLeagueAdmin() {
  const query = useQuery(authLeagueAdminQueryOption);

  return {
    leagueAdmin: query.data,
    leagueAdminLoading: query.isLoading || query.isPending || query.isFetching,
    refetchLeagueAdmin: query.refetch,
  };
}

export async function refetchLeagueAdmin() {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN,
    exact: true,
  });
}

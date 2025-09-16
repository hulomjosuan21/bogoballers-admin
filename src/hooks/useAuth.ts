import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import {
  authLeagueAdminQueryOption,
  LeagueAdminAuthJwtQueryOption,
} from "@/queries/leagueAdminQueryOption";
import { useQuery } from "@tanstack/react-query";

export function useAuthLeagueAdmin() {
  const query = useQuery(authLeagueAdminQueryOption);

  return {
    leagueAdmin: query.data,
    leagueAdminLoading: query.isLoading || query.isPending || query.isFetching,
    refetchLeagueAdmin: query.refetch,
    leagueAdminError: query.error,
  };
}

export async function refetchLeagueAdmin() {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.AUTH_LEAGUE_ADMIN,
    exact: true,
  });
}

export function useAuthJwt() {
  const query = useQuery(LeagueAdminAuthJwtQueryOption);

  return {
    jwtPayload: query.data,
    jwtLoading: query.isLoading,
    jwtError: query.error,
    refetchJwt: query.refetch,
  };
}

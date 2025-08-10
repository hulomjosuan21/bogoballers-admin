import { authLeagueAdminQueryOptions } from "@/queries/league-admin";
import { useQuery } from "@tanstack/react-query";

export function useAuthLeagueAdmin() {
  const { data, isLoading, isError, error, refetch } = useQuery(
    authLeagueAdminQueryOptions
  );

  return {
    leagueAdmin: data ?? null,
    leagueAdminLoading: isLoading,
    leagueAdminError: isError ? error : null,
    leagueAdminRefetch: refetch,
  };
}

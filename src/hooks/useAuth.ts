import LeagueAdministratorService from "@/service/league-admin-service";
import type { LeagueAdminType } from "@/types/league-admin";
import { useQuery, type QueryObserverResult } from "@tanstack/react-query";

type UseAuthAdmin = {
  leagueAdmin: LeagueAdminType | null;
  leagueAdminLoading: boolean;
  leagueAdminError: Error | null;
  leagueAdminRefetch: () => Promise<
    QueryObserverResult<LeagueAdminType, Error>
  >;
};

export function useAuthLeagueAdmin(): UseAuthAdmin {
  const { data, isLoading, isError, error, refetch } = useQuery<
    LeagueAdminType,
    Error
  >({
    queryKey: ["auth", "league-admin"],
    queryFn: LeagueAdministratorService.auth,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    leagueAdmin: data ?? null,
    leagueAdminLoading: isLoading,
    leagueAdminError: isError ? error : null,
    leagueAdminRefetch: refetch,
  };
}

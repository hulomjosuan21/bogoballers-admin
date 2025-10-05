import { getLeagueGuestRequestQueryOptions } from "@/queries/leagueGuestQueryOption";
import { useQuery } from "@tanstack/react-query";

export const useLeagueGuestRequest = (leagueId?: string) => {
  const query = useQuery(getLeagueGuestRequestQueryOptions(leagueId));

  return {
    leagueGuestRequestData: query.data ?? [],
    leagueGuestRequestLoading: query.isLoading,
    leagueGuestRequestError: query.error,
    refetchLeagueGuestRequest: query.refetch,
  };
};

import { getLeagueGuestRequestQueryOptions } from "@/queries/leagueGuestQueryOption";
import { useQuery } from "@tanstack/react-query";

export const useLeagueGuestRequest = (leagueCategoryId?: string) => {
  const query = useQuery(getLeagueGuestRequestQueryOptions(leagueCategoryId));

  return {
    leagueGuestRequestData: query.data ?? [],
    leagueGuestRequestLoading: query.isLoading,
    leagueGuestRequestError: query.error,
    refetchLeagueGuestRequest: query.refetch,
  };
};

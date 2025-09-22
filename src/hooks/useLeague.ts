import { getActiveLeagueByPublicIdQueryOption } from "@/queries/leagueQueryOption";
import type { League } from "@/types/league";
import { useQuery } from "@tanstack/react-query";

export const useLeaguePublic = (
  publicLeagueId?: string,
  data?: Partial<League> & { condition: string }
) => {
  const query = useQuery(
    getActiveLeagueByPublicIdQueryOption(publicLeagueId, data)
  );

  return {
    publicLeagueData: query.data,
    publicLeagueDataLoading: query.isLoading,
    publicLeagueDataError: query.error,
    refetchPublicLeagueData: query.refetch,
  };
};

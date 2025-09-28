import { getLeaguePlayerByConditionsQueryOption } from "@/queries/leaguePlayerQueryOption";
import type { LeaguePlayer } from "@/types/player";
import { useQuery } from "@tanstack/react-query";

export const useLeaguePlayerByCondition = (
  leagueId?: string,
  data?: Partial<LeaguePlayer> & { condition: string }
) => {
  const query = useQuery(
    getLeaguePlayerByConditionsQueryOption(leagueId, data)
  );

  return {
    leaguePlayer: query.data ?? [],
    leaguePlayerLoading: query.isLoading,
    leaguePlayerError: query.error,
    refetchLeaguePlayer: query.refetch,
  };
};

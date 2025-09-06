import { LeaguePlayerService } from "@/service/league-player-service";
import { queryOptions } from "@tanstack/react-query";

export const getAllLeaguePlayerForMatchQueryOption = ({
  leagueId,
  leagueCategoryId,
}: {
  leagueId?: string;
  leagueCategoryId?: string;
}) =>
  queryOptions<LeaguePlayerService[] | null, Error>({
    queryKey: ["league-player-for-match", leagueId, leagueCategoryId],
    enabled: Boolean(leagueId || leagueCategoryId),
    queryFn: () =>
      LeaguePlayerService.getAll({
        leagueId,
        leagueCategoryId,
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });

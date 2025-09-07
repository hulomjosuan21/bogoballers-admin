import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeaguePlayerService } from "@/service/leaguePlayerService";
import { queryOptions } from "@tanstack/react-query";

export const getAllLeaguePlayerForMatchQueryOption = ({
  leagueId,
  leagueCategoryId,
}: {
  leagueId?: string;
  leagueCategoryId?: string;
}) =>
  queryOptions<LeaguePlayerService[] | null, Error>({
    queryKey: QUERY_KEYS.ACTIVE_LEAGUE_PLAYER_FOR_MATCH(
      leagueId,
      leagueCategoryId
    ),
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

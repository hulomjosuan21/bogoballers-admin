import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeaguePlayerService } from "@/service/leaguePlayerService";
import type { LeaguePlayer } from "@/types/player";
import { queryOptions } from "@tanstack/react-query";

export const getLeaguePlayerByConditionsQueryOption = (
  leagueId?: string,
  data?: Partial<LeaguePlayer> & { condition: string }
) =>
  queryOptions<LeaguePlayer[] | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_PLAYER(leagueId, data),
    queryFn: () => LeaguePlayerService.getMany(leagueId!, data),
    enabled: !!leagueId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

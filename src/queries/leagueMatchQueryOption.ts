import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueMatchService } from "@/service/leagueMatchService";
import type { LeagueMatch } from "@/types/leagueMatch";
import { queryOptions } from "@tanstack/react-query";

export const getLeagueMatchQueryOption = (
  leagueCategoryId?: string,
  roundId?: string,
  data?: Partial<LeagueMatch> & { condition: string; limit?: number },
  forceEnable: boolean = false
) =>
  queryOptions<LeagueMatch[] | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_MATCH(leagueCategoryId, roundId, data),
    queryFn: () =>
      LeagueMatchService.getMany(leagueCategoryId!, roundId!, data),
    enabled: forceEnable || (!!leagueCategoryId && !!roundId),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

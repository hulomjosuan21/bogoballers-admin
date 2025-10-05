import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueGuestService } from "@/service/leagueQuestService";
import type { GuestRegistrationRequest } from "@/types/guest";
import { queryOptions } from "@tanstack/react-query";
export const getLeagueGuestRequestQueryOptions = (leagueId?: string) =>
  queryOptions<GuestRegistrationRequest[] | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_GUEST(leagueId),
    queryFn: () => LeagueGuestService.getMany(leagueId!),
    enabled: !!leagueId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

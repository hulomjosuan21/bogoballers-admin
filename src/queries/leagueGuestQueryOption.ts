import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueGuestService } from "@/service/leagueGuestService";
import type { GuestRegistrationRequest } from "@/types/guest";
import { queryOptions } from "@tanstack/react-query";
export const getLeagueGuestRequestQueryOptions = (leagueCategoryId?: string) =>
  queryOptions<GuestRegistrationRequest[] | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_GUEST(leagueCategoryId),
    queryFn: () => LeagueGuestService.getMany(leagueCategoryId!),
    enabled: !!leagueCategoryId,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

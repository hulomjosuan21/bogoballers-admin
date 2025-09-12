import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueTeamService } from "@/service/leagueTeamService";
import type { LeagueTeam } from "@/types/team";
import { queryOptions } from "@tanstack/react-query";

export const getAllLeagueTeamsSubmissionQueryOptions = ({
  leagueId,
  leagueCategoryId,
}: {
  leagueId?: string;
  leagueCategoryId?: string;
}) =>
  queryOptions<LeagueTeam[] | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_TEAM_SUBMISSION(leagueId, leagueCategoryId),
    enabled: Boolean(leagueId || leagueCategoryId),
    queryFn: () =>
      LeagueTeamService.getAllSubmission({
        leagueId,
        leagueCategoryId,
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });

export const getAllLeagueTeamForMatchQueryOption = ({
  leagueId,
  leagueCategoryId,
}: {
  leagueId?: string;
  leagueCategoryId?: string;
}) =>
  queryOptions<LeagueTeam[] | null, Error>({
    queryKey: QUERY_KEYS.LEAGUE_TEAM_FOR_MATCH(leagueId, leagueCategoryId),
    enabled: Boolean(leagueId || leagueCategoryId),
    queryFn: () =>
      LeagueTeamService.getAllForMatch({
        leagueId,
        leagueCategoryId,
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });

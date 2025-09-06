import { LeagueTeamService } from "@/service/league-team-service";
import type { LeagueTeamForMatch, LeagueTeamModel } from "@/types/team";
import { queryOptions } from "@tanstack/react-query";

export const getAllLeagueTeamsSubmissionQueryOptions = ({
  leagueId,
  leagueCategoryId,
}: {
  leagueId?: string;
  leagueCategoryId?: string;
}) =>
  queryOptions<LeagueTeamModel[] | null, Error>({
    queryKey: ["league-team-submission", leagueId, leagueCategoryId],
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
  queryOptions<LeagueTeamForMatch[] | null, Error>({
    queryKey: ["league-team-for-match", leagueId, leagueCategoryId],
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

import { LeagueTeamService } from "@/service/league-team-service";
import type { LeagueTeamModel } from "@/types/team";
import { queryOptions } from "@tanstack/react-query";

export const getAllLeagueTeamsSubmissionQueryOptions = ({
  leagueId,
  leagueCategoryId,
}: {
  leagueId?: string;
  leagueCategoryId?: string;
}) =>
  queryOptions<LeagueTeamModel[] | null, Error>({
    queryKey: ["active-league-resource", leagueId, leagueCategoryId],
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

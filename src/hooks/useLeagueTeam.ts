import { QUERY_KEYS } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
import {
  getAllLeagueTeamForMatchQueryOption,
  getAllLeagueTeamsSubmissionQueryOptions,
} from "@/queries/leagueTeamQueryOption";
import { useQuery } from "@tanstack/react-query";

export const useGetAllLeagueTeamsSubmission = (
  leagueId?: string,
  leagueCategoryId?: string
) => {
  const query = useQuery(
    getAllLeagueTeamsSubmissionQueryOptions({
      leagueId,
      leagueCategoryId,
    })
  );

  return {
    allLeagueTeamSubmissionData: query.data ?? [],
    allLeagueTeamSubmissionLoading:
      query.isLoading || query.isPending || query.isFetching,
    allLeagueTeamSubmissionError: query.error,
    refetchAllLeagueTeamSubmission: query.refetch,
  };
};

export async function refetchAllLeagueTeamSubmission(
  leagueId?: string,
  leagueCategoryId?: string
) {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.LEAGUE_TEAM_SUBMISSION(leagueId, leagueCategoryId),
    exact: true,
  });
}

export const useGetAllLeagueTeamsReadyForMatch = (
  leagueId?: string,
  leagueCategoryId?: string
) => {
  const query = useQuery(
    getAllLeagueTeamForMatchQueryOption({
      leagueId,
      leagueCategoryId,
    })
  );

  return {
    allLeagueTeamReadyForMatchData: query.data ?? [],
    allLeagueTeamReadyForMatchLoading:
      query.isLoading || query.isPending || query.isFetching,
    allLeagueTeamReadyForMatchError: query.error,
    refetchAllLeagueTeamReadyForMatch: query.refetch,
  };
};

export async function refetchAllLeagueReadyForMatch(
  leagueId?: string,
  leagueCategoryId?: string
) {
  await queryClient.refetchQueries({
    queryKey: QUERY_KEYS.LEAGUE_TEAM_FOR_MATCH(leagueId, leagueCategoryId),
    exact: true,
  });
}

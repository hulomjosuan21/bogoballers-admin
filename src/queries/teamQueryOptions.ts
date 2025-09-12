import { QUERY_KEYS } from "@/constants/queryKeys";
import { TeamService } from "@/service/teamService";
import type { Team } from "@/types/team";
import { queryOptions } from "@tanstack/react-query";

export const getAllTeamsQueryOptions = queryOptions<Team[] | null, Error>({
  queryKey: QUERY_KEYS.TEAMS_ALL,
  queryFn: TeamService.getAllTeams,
  staleTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: false,
});

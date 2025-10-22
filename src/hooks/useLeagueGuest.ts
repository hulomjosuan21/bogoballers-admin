import { LeagueGuestService } from "@/service/leagueGuestService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export function useLeagueGuestRequest(leagueCategoryId?: string) {
  const { data, ...rest } = useQuery({
    queryKey: ["guestRequests", leagueCategoryId],

    queryFn: () => LeagueGuestService.getMany(leagueCategoryId!),

    enabled: !!leagueCategoryId,
  });

  return { leagueGuestRequestData: data ?? [], ...rest };
}

export function useUpdateLeagueGuestRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: LeagueGuestService.updateRequest,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["guestRequests"],
      });

      if (variables.action === "Accepted") {
        queryClient.invalidateQueries({ queryKey: ["leagueTeams"] });
      }
    },
  });
}

export function useLeagueTeams(leagueCategoryId?: string) {
  return useQuery({
    queryKey: ["leagueTeams", leagueCategoryId],

    queryFn: () => LeagueGuestService.getLeagueTeams(leagueCategoryId!),

    enabled: !!leagueCategoryId,
  });
}

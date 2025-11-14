import axiosClient from "@/lib/axiosClient";
import { LeagueGuestService } from "@/service/leagueGuestService";
import { useMutation, useQuery } from "@tanstack/react-query";
export function useLeagueGuestRequest(leagueCategoryId?: string) {
  const { data, ...rest } = useQuery({
    queryKey: ["guestRequests", leagueCategoryId],

    queryFn: () => LeagueGuestService.getMany(leagueCategoryId!),

    enabled: !!leagueCategoryId,
  });

  return { leagueGuestRequestData: data ?? [], ...rest };
}

type UpdateGuestRequestArgs = {
  method: "PATCH" | "DELETE" | "POST";
  guest_request_id?: string;
  endpoint?: string;
  body?: any;
};

export function useGuestRequestMutation() {
  return useMutation<unknown, Error, UpdateGuestRequestArgs>({
    mutationFn: async ({ method, guest_request_id, endpoint = "", body }) => {
      if (method === "PATCH") {
        return axiosClient.patch(
          `/league-guest/submission/${guest_request_id}`,
          body
        );
      }

      if (method === "DELETE") {
        return axiosClient.delete(
          `/league-guest/submission/${guest_request_id}`
        );
      }

      if (method === "POST" && endpoint === "refund") {
        return axiosClient.post(`/league-guest/submission/refund`, body);
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

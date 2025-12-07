import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import type { GuestRegistrationRequest } from "@/types/guest";
import axiosClient from "@/lib/axiosClient";

export function useLeagueGuestOperations(leagueCategoryId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["guestRequests", leagueCategoryId];

  // 1. Fetch
  const {
    data: requests = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!leagueCategoryId) return [];
      const res = await axiosClient.get<GuestRegistrationRequest[]>(
        `/league-guest/submissions/league/${leagueCategoryId}`
      );
      return res.data;
    },
    enabled: !!leagueCategoryId,
  });

  // 2. Update Status (Accept) or Payment
  const updateMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      status?: string;
      payment_status?: string;
      assign_to_team_id?: string;
    }) => {
      const res = await axiosClient.patch(
        `/league-guest/submission/${payload.id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      const msg = variables.status
        ? "Request processed"
        : "Payment status updated";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // 3. Delete (Used for Rejecting)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosClient.delete(`/league-guest/submission/${id}`);
    },
    onSuccess: () => {
      toast.success("Request rejected and removed");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // 4. Refund
  const refundMutation = useMutation({
    mutationFn: async (payload: {
      guest_request_id: string;
      amount: number;
      remove: boolean;
    }) => {
      const res = await axiosClient.post(
        `/league-guest/submission/refund`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Refund processed");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return {
    requests,
    isLoading,
    refetch,
    updateMutation,
    deleteMutation,
    refundMutation,
  };
}

import { getErrorMessage } from "@/lib/error";
import type { LeagueStatus } from "@/service/leagueService";
import { manageLeagueAdministratorService } from "@/service/manageLeagueAdmins";
import type { League } from "@/types/league";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const adminQueryKeys = {
  all: ["leagueAdmins"] as const,
  lists: () => [...adminQueryKeys.all, "list"] as const,
};

export const leagueQueryKeys = {
  all: ["leagues"] as const,
  lists: () => [...leagueQueryKeys.all, "list"] as const,
};

export const useManageLeagueAdmins = () => {
  const queryClient = useQueryClient();

  const { data: admins, isLoading: isLoadingAdmins } = useQuery<
    LeagueAdministator[]
  >({
    queryKey: adminQueryKeys.lists(),
    queryFn: () => manageLeagueAdministratorService.getAllAdmins(),
  });

  const { data: leagues, isLoading: isLoadingLeagues } = useQuery<League[]>({
    queryKey: leagueQueryKeys.lists(),
    queryFn: () => manageLeagueAdministratorService.getAllLeagues(),
  });

  const { mutate: toggleAdminOperational } = useMutation<
    LeagueAdministator,
    Error,
    string
  >({
    mutationFn: (adminId) =>
      manageLeagueAdministratorService.toggleAdminOperational(adminId),
    onSuccess: (updatedAdmin) => {
      toast.success(
        `Admin ${updatedAdmin.organization_name} is now ${
          updatedAdmin.is_operational ? "operational" : "not operational"
        }.`
      );
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leagueQueryKeys.lists() });
    },
    onError: (error) => {
      toast.error("Failed to update admin status.", {
        description: error.message,
      });
    },
  });

  const { mutate: updateLeagueStatus } = useMutation<
    League,
    Error,
    { leagueId: string; status: LeagueStatus }
  >({
    mutationFn: ({ leagueId, status }) =>
      manageLeagueAdministratorService.updateLeagueStatus(leagueId, status),
    onSuccess: (updatedLeague) => {
      toast.success(
        `League ${updatedLeague.league_title} status updated to ${updatedLeague.status}.`
      );
      queryClient.invalidateQueries({ queryKey: leagueQueryKeys.lists() });
    },
    onError: (error) => {
      toast.error("Failed to update league status.", {
        description: getErrorMessage(error.message),
      });
    },
  });

  return {
    admins,
    isLoadingAdmins,
    leagues,
    isLoadingLeagues,
    toggleAdminOperational,
    updateLeagueStatus,
  };
};

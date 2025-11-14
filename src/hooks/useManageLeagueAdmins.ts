import {
  LeagueStatus,
  manageLeagueAdministratorService,
} from "@/service/manageLeagueAdmins";
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

  // === QUERIES ===

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

  // === MUTATIONS ===

  const { mutate: toggleAdminOperational } = useMutation<
    LeagueAdministator, // Type returned on success
    Error, // Type for error
    string // Type of variables passed to mutationFn (adminId)
  >({
    mutationFn: (adminId) =>
      manageLeagueAdministratorService.toggleAdminOperational(adminId),
    onSuccess: (updatedAdmin) => {
      toast.success(
        `Admin ${updatedAdmin.organization_name} is now ${
          updatedAdmin.is_operational ? "operational" : "not operational"
        }.`
      );
      // Refetch both admins and leagues, as league data embeds admin data
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
    League, // Type returned on success
    Error, // Type for error
    { leagueId: string; status: LeagueStatus } // Type of variables
  >({
    mutationFn: ({ leagueId, status }) =>
      manageLeagueAdministratorService.updateLeagueStatus(leagueId, status),
    onSuccess: (updatedLeague) => {
      toast.success(
        `League ${updatedLeague.league_title} status updated to ${updatedLeague.status}.`
      );
      // Only need to refetch leagues
      queryClient.invalidateQueries({ queryKey: leagueQueryKeys.lists() });
    },
    onError: (error) => {
      toast.error("Failed to update league status.", {
        description: error.message,
      });
    },
  });

  return {
    admins,
    isLoadingAdmins,
    leagues,
    isLoadingLeagues,
    toggleAdminOperational, // The mutate function
    updateLeagueStatus, // The mutate function
  };
};

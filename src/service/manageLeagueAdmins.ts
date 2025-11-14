import axiosClient from "@/lib/axiosClient";
import type { League } from "@/types/league";
import type { LeagueAdministator } from "@/types/leagueAdmin";
export enum LeagueStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Ongoing = "Ongoing",
  Completed = "Completed",
}

class ManageLeagueAdministratorService {
  async getAllAdmins(): Promise<LeagueAdministator[]> {
    const response = await axiosClient.get<LeagueAdministator[]>(
      "/manage-league-admins/all-admins"
    );
    return response.data;
  }

  async getAllLeagues(): Promise<League[]> {
    const response = await axiosClient.get<League[]>(
      "/manage-league-admins/all-leagues"
    );
    return response.data;
  }

  async toggleAdminOperational(
    leagueAdministratorId: string
  ): Promise<LeagueAdministator> {
    const response = await axiosClient.patch<LeagueAdministator>(
      `/manage-league-admins/admin/${leagueAdministratorId}/toggle-operational`
    );
    return response.data;
  }

  async updateLeagueStatus(
    leagueId: string,
    status: LeagueStatus
  ): Promise<League> {
    const response = await axiosClient.patch<League>(
      `/manage-league-admins/league/${leagueId}/update-status`,
      { status }
    );
    return response.data;
  }
}

export const manageLeagueAdministratorService =
  new ManageLeagueAdministratorService();

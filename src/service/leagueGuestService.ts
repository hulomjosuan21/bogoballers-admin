import axiosClient from "@/lib/axiosClient"; // Your configured axios instance
import type { GuestRegistrationRequest } from "@/types/guest";
import type { LeagueTeam } from "@/types/team";

export type UpdateRequestParams = {
  guestRequestId: string;
  action: "Accepted" | "Rejected";
  assignToTeamId?: string;
};

export class LeagueGuestService {
  static async getMany(
    leagueCategoryId: string
  ): Promise<GuestRegistrationRequest[]> {
    const response = await axiosClient.get<GuestRegistrationRequest[]>(
      `/league-guest/submissions/league/${leagueCategoryId}`
    );
    return response.data;
  }

  static async updateRequest(
    params: UpdateRequestParams
  ): Promise<GuestRegistrationRequest> {
    const { guestRequestId, action, assignToTeamId } = params;

    const response = await axiosClient.patch<GuestRegistrationRequest>(
      `/league-guest/submission/${guestRequestId}`,
      {
        status: action,
        assign_to_team_id: assignToTeamId,
      }
    );
    return response.data;
  }

  static async getLeagueTeams(leagueCategoryId: string): Promise<LeagueTeam[]> {
    const response = await axiosClient.get<LeagueTeam[]>(
      `/league-guest/league-team/all/${leagueCategoryId}`
    );
    return response.data;
  }
}

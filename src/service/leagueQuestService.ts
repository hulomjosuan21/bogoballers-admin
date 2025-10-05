import axiosClient from "@/lib/axiosClient";
import type { GuestRegistrationRequest } from "@/types/guest";

export class LeagueGuestService {
  static async getMany(leagueId: string) {
    const response = await axiosClient.get<GuestRegistrationRequest[]>(
      `/league-guest/submissions/league/${leagueId}`
    );

    return response.data;
  }

  static async processRequest(
    guestRequestId: string,
    action: "Accept" | "Reject",
    assignToTeamId?: string
  ): Promise<{ message: string }> {
    const response = await axiosClient.post<{ message: string }>(
      `/league-guest/process/${guestRequestId}`,
      { action, assign_to_team_id: assignToTeamId }
    );
    return response.data;
  }
}

import axiosClient from "@/lib/axiosClient";
import type { Refund } from "@/stores/refundStore";
import type { LeagueTeam } from "@/types/team";

export class LeagueTeamService {
  static async updateOne({
    id,
    data,
  }: {
    id: string;
    data: Partial<LeagueTeam>;
  }) {
    const response = await axiosClient.put<{ message: string }>(
      `/league-team/update/${id}`,
      data
    );
    return response.data.message;
  }

  static async deleteOne({ id }: { id: string }): Promise<string> {
    const response = await axiosClient.delete<{ message: string }>(
      `/league-team/delete/${id}`
    );
    return response.data.message;
  }

  static async getAllSubmission({
    leagueId,
    leagueCategoryId,
  }: {
    leagueId?: string;
    leagueCategoryId?: string;
  }) {
    const response = await axiosClient.get<LeagueTeam[]>(
      `/league-team/all/submission/${leagueId}/${leagueCategoryId}`
    );

    return response.data;
  }

  static async validateEntry(
    leagueId?: string,
    leagueCategoryId?: string,
    leagueTeamId?: string
  ) {
    if (!leagueId || !leagueCategoryId || !leagueTeamId) {
      throw new Error(
        "Please fill out all required fields before validating an entry."
      );
    }

    const response = await axiosClient.put<{ message: string }>(
      `/league-team/validate-entry/${leagueId}/${leagueCategoryId}/${leagueTeamId}`
    );

    return response.data;
  }

  static async getMany<T extends Partial<LeagueTeam> & { condition: string }>(
    leagueCategoryId: string,
    data?: T
  ) {
    const url = `/league-team/all/${leagueCategoryId}`;

    const response = await axiosClient.post<LeagueTeam[]>(
      url,
      data ?? undefined
    );

    return response.data;
  }

  static async getTeamsChecked(leagueCategoryId: string, roundId: string) {
    const url = `/league-team/all-checked/${leagueCategoryId}/${roundId}`;

    const response = await axiosClient.get<LeagueTeam[]>(url);

    return response.data;
  }

  static async refund(payload: Refund) {
    const response = await axiosClient.post<{ message: string }>(
      `/league-team/refund?remove=${payload.remove}`,
      payload.data
    );

    return response.data;
  }
}

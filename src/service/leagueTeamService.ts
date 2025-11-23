import axiosClient from "@/lib/axiosClient";
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

  static async getTeamsChecked(leagueCategoryId: string) {
    const url = `/league-team/all-checked/${leagueCategoryId}`;

    const response = await axiosClient.get<LeagueTeam[]>(url);

    return response.data;
  }

  static async getRemainingTeams(leagueCategoryId: string) {
    const url = `/league-team/remaining-teams/${leagueCategoryId}`;

    const response = await axiosClient.get<LeagueTeam[]>(url);

    return response.data;
  }
}

export class LeagueTeamSubmissionService {
  static async updateSubmission(
    leagueTeamId: string,
    data: Partial<LeagueTeam>
  ) {
    const response = await axiosClient.patch(
      `/league-team/submission/${leagueTeamId}`,
      data
    );
    return response.data;
  }

  static async removeSubmission(leagueTeamId: string) {
    const response = await axiosClient.delete<{ message: string }>(
      `/league-team/submission/${leagueTeamId}`
    );
    return response.data;
  }

  static async processRefund(payload: {
    league_team_id: string;
    amount: number;
    remove: boolean;
    reason?: string;
  }) {
    const response = await axiosClient.post<{ message: string }>(
      "/league-team/submission/refund",
      payload
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

  async fetchGenericData() {}
}

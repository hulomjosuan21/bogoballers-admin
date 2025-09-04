import axiosClient from "@/lib/axiosClient";
import type { LeagueTeamModel } from "@/types/team";

export class LeagueTeamService {
  static async updateOne({
    id,
    data,
  }: {
    id: string;
    data: Partial<LeagueTeamModel>;
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
    const response = await axiosClient.get<LeagueTeamModel[]>(
      `/league-team/all/submission/${leagueId}/${leagueCategoryId}`
    );

    return response.data;
  }
}

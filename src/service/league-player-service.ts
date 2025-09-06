import axiosClient from "@/lib/axiosClient";
import type { LeaguePlayer } from "@/types/player";

export class LeaguePlayerService {
  static async getAll({
    leagueId,
    leagueCategoryId,
  }: {
    leagueId?: string;
    leagueCategoryId?: string;
  }) {
    const response = await axiosClient.get<LeaguePlayer[]>(
      `/league-player/all/${leagueId}/${leagueCategoryId}`
    );

    return response.data;
  }
}

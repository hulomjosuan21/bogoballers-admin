import axiosClient from "@/lib/axiosClient";
import type { LeaguePlayer } from "@/types/player";

export class LeaguePlayerService {
  static async updateOne<T extends { condition: string }>(
    leaguePlayerId: string,
    data: T
  ) {
    const url = `/league-player/${leaguePlayerId}`;
    const response = await axiosClient.put<LeaguePlayer>(url, data);
    return response.data;
  }
  static async getMany<T extends Partial<LeaguePlayer> & { condition: string }>(
    leagueId: string,
    data?: T
  ) {
    const url = `/league-player/all/${leagueId}`;
    const response = await axiosClient.post<LeaguePlayer[]>(
      url,
      data ?? undefined
    );

    return response.data;
  }
}

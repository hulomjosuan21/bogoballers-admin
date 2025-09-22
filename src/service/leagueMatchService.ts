import axiosClient from "@/lib/axiosClient";
import type { LeagueMatch } from "@/types/leagueMatch";
import type { MatchBook } from "@/types/scorebook";

export class LeagueMatchService {
  static async getMany<T extends Partial<LeagueMatch> & { condition: string }>(
    leagueCategoryId: string,
    roundId: string,
    data?: T
  ) {
    const url = `/league-match/all/${leagueCategoryId}/${roundId}`;
    const response = await axiosClient.post<LeagueMatch[]>(
      url,
      data ?? undefined
    );

    return response.data;
  }

  static async updateOne<T extends Partial<LeagueMatch>>(
    leagueMatchId: string,
    data: T
  ) {
    const url = `/league-match/${leagueMatchId}`;

    const response = await axiosClient.put<{ message: string }>(url, data);

    return response.data;
  }

  static async finalizeOne(leagueMatchId: string, data: MatchBook) {
    const url = `/league-match/${leagueMatchId}/finalize`;

    const response = await axiosClient.put<{ message: string }>(url, data);

    return response.data;
  }
}

import axiosClient from "@/lib/axiosClient";

export class LeagueRoundService {
  static async genereteEliminationMatches(
    activeLeagueId: string,
    elimination_round_id: string
  ) {
    const response = await axiosClient.post<{ message: string }>(
      `/league-match/generate/elimination/${activeLeagueId}/${elimination_round_id}`
    );

    return response.data;
  }
}

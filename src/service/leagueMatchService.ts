import axiosClient from "@/lib/axiosClient";
import type { LeagueMatch } from "@/types/leagueMatch";
import type { MatchBook } from "@/types/scorebook";

export class LeagueMatchService {
  readonly base: string = "/league-match";
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

  static async progressNext(
    leagueId: string,
    currentLeagueCategoryId: string,
    auto_proceed: boolean
  ) {
    const url = `/league-match/progress-next/${leagueId}/${currentLeagueCategoryId}?auto_proceed=${auto_proceed}`;

    return (await axiosClient.put<{ message: string }>(url)).data;
  }

  static async finalizeOne(leagueMatchId: string, data: MatchBook) {
    const url = `/league-match/${leagueMatchId}/finalize`;

    const response = await axiosClient.put<{ message: string }>(url, data);

    return response.data;
  }

  static async updateScore(
    matchId: string,
    data: {
      home_score: number;
      away_score: number;
    }
  ) {
    const url = `/league-match/${matchId}/score`;

    const response = await axiosClient.patch<{ message: string }>(url, data);

    return response.data;
  }

  async fetchUnscheduled(leagueCategoryId: string, roundId: string) {
    const url = `${this.base}/${leagueCategoryId}/${roundId}/unscheduled`;

    const response = await axiosClient.get<LeagueMatch[]>(url);
    return response.data;
  }
  async fetchScheduled(leagueCategoryId: string, roundId: string) {
    const url = `${this.base}/${leagueCategoryId}/${roundId}/scheduled`;

    const response = await axiosClient.get<LeagueMatch[]>(url);
    return response.data;
  }
  async fetchCompleted(leagueCategoryId: string, roundId: string) {
    const url = `${this.base}/${leagueCategoryId}/${roundId}/completed`;

    const response = await axiosClient.get<LeagueMatch[]>(url);
    return response.data;
  }
}

export const leagueMatchService = new LeagueMatchService();

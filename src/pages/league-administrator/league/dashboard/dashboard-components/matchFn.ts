import axiosClient from "@/lib/axiosClient";
import type { CompletedMatch, UpcomingMatch } from "./matchTypes";

export const fetchUpcomingMatches = async (
  categoryId: string,
  roundId: string
) => {
  const response = await axiosClient.get<UpcomingMatch[]>(
    `/league-match/${categoryId}/${roundId}/scheduled/dashboard`,
    {
      params: { league_category_id: categoryId, round_id: roundId },
    }
  );
  return response.data;
};

export const fetchCompletedMatches = async (
  categoryId: string,
  roundId: string
) => {
  const response = await axiosClient.get<CompletedMatch[]>(
    `/league-match/${categoryId}/${roundId}/completed/dashboard`
  );
  return response.data;
};

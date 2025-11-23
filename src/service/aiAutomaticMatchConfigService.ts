import axiosClient from "@/lib/axiosClient";
import type { AICommissionerResponse } from "@/types/aiAutomaticMatchConfigTypes";

class AiAutoMatchConfigService {
  readonly base = "/ai-auto-match";

  async generateMatches(roundId: string): Promise<AICommissionerResponse> {
    const response = await axiosClient.post<AICommissionerResponse>(
      `${this.base}/generate`,
      {
        round_id: roundId,
      }
    );
    return response.data;
  }

  async progressRound(roundId: string): Promise<AICommissionerResponse> {
    const response = await axiosClient.post<AICommissionerResponse>(
      `${this.base}/progress`,
      {
        round_id: roundId,
      }
    );
    return response.data;
  }

  async resetRound(roundId: string): Promise<AICommissionerResponse> {
    const response = await axiosClient.post<AICommissionerResponse>(
      `${this.base}/reset`,
      {
        round_id: roundId,
      }
    );
    return response.data;
  }
}

export const aiAutoMatchConfigService = new AiAutoMatchConfigService();

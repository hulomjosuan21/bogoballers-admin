import axiosClient from "@/lib/axiosClient";
import type {
  LeagueCategoryRound,
  RoundFormat,
} from "@/types/leagueCategoryTypes";
import type { AutomaticMatchConfigFlowNode } from "@/types/automaticMatchConfigTypes";
import type { Edge } from "@xyflow/react";

interface FlowStateResponse {
  nodes: AutomaticMatchConfigFlowNode[];
  edges: Edge[];
}

export class AutoMatchConfigService {
  async getFlowState(leagueId: string) {
    const response = await axiosClient.get<FlowStateResponse>(
      `/auto-match-config/flow-state/${leagueId}`
    );
    return response.data;
  }

  async createRound(payload: {
    league_category_id: string;
    round_name: string;
    round_order: number;
    position: { x: number; y: number };
  }) {
    const response = await axiosClient.post<LeagueCategoryRound>(
      "/auto-match-config/rounds",
      payload
    );
    return response.data;
  }

  async createOrAttachFormat(payload: {
    format_name: string;
    round_id: string;
    format: Record<string, any>;
    position: { x: number; y: number };
  }) {
    const response = await axiosClient.post<RoundFormat>(
      "/auto-match-config/formats",
      payload
    );
    return response.data;
  }

  async attachFormatToRound(formatId: string, roundId: string) {
    const response = await axiosClient.put<RoundFormat>(
      `/auto-match-config/formats/${formatId}/attach/${roundId}`
    );
    return response.data;
  }

  async createEdge(payload: {
    league_id: string;
    league_category_id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }) {
    const response = await axiosClient.post<Edge>(
      "/auto-match-config/edges",
      payload
    );
    return response.data;
  }

  async deleteEdge(edgeId: string) {
    const response = await axiosClient.delete(
      `/auto-match-config/edges/${edgeId}`
    );
    return response.data;
  }

  async updateNodePosition(
    nodeType: string,
    nodeId: string,
    position: { x: number; y: number }
  ) {
    const response = await axiosClient.put(
      `/auto-match-config/nodes/${nodeType}/${nodeId}/position`,
      { position }
    );
    return response.data;
  }
}

export const autoMatchConfigService = new AutoMatchConfigService();

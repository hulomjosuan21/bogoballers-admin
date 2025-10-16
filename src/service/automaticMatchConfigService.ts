import axiosClient from "@/lib/axiosClient";
import type { AutomaticMatchConfigFlowNode } from "@/types/automaticMatchConfigTypes";
import type {
  LeagueCategoryRound,
  RoundFormat,
} from "@/types/leagueCategoryTypes";
import type { Edge } from "@xyflow/react";

interface FlowStateResponse {
  nodes: AutomaticMatchConfigFlowNode[];
  edges: Edge[];
}

export class AutoMatchConfigService {
  async getFlowState(leagueId: string) {
    const { data } = await axiosClient.get<FlowStateResponse>(
      `/auto-match-config/flow-state/${leagueId}`
    );
    return data;
  }

  async createRound(payload: {
    league_category_id: string;
    round_name: string;
    round_order: number;
    position: { x: number; y: number };
  }) {
    const { data } = await axiosClient.post<LeagueCategoryRound>(
      "/auto-match-config/rounds",
      payload
    );
    return data;
  }

  async createOrAttachFormat(payload: {
    format_name: string;
    round_id: string | null; // can be null to create unattached
    format: Record<string, any>;
    position: { x: number; y: number };
  }) {
    const { data } = await axiosClient.post<RoundFormat>(
      "/auto-match-config/formats",
      payload
    );
    return data;
  }

  async attachFormatToRound(formatId: string, roundId: string) {
    const { data } = await axiosClient.put<RoundFormat>(
      `/auto-match-config/formats/${formatId}/attach/${roundId}`
    );
    return data;
  }

  async createEdge(payload: {
    league_id: string;
    league_category_id?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }) {
    const { data } = await axiosClient.post<any>(
      "/auto-match-config/edges",
      payload
    );

    return {
      id: data.edge_id,
      source: data.source_node_id,
      target: data.target_node_id,
      sourceHandle: data.source_handle,
      targetHandle: data.target_handle,
    };
  }

  async deleteEdge(edgeId: string) {
    const { data } = await axiosClient.delete(
      `/auto-match-config/edges/${edgeId}`
    );
    return data;
  }

  async updateNodePosition(
    nodeType: string,
    nodeId: string,
    position: { x: number; y: number }
  ) {
    const { data } = await axiosClient.put(
      `/auto-match-config/nodes/${nodeType}/${nodeId}/position`,
      { position }
    );
    return data;
  }

  async deleteNode(nodeType: string, nodeId: string) {
    const response = await axiosClient.delete(
      `/auto-match-config/nodes/${nodeType}/${nodeId}`
    );
    return response.data;
  }
}

export const autoMatchConfigService = new AutoMatchConfigService();

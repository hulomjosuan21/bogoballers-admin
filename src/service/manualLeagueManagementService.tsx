import axiosClient from "@/lib/axiosClient";
import type { LeagueCategoryRound } from "@/types/leagueCategoryTypes";
import type { LeagueMatch } from "@/types/leagueMatch";
import type { FlowNode, IGroup } from "@/types/manual";
import type { Edge } from "@xyflow/react";

interface FlowStateResponse {
  nodes: FlowNode[];
  edges: Edge[];
}

export class ManualLeagueManagementService {
  async getFlowState(leagueId: string) {
    const response = await axiosClient.get<FlowStateResponse>(
      `/manual-league-management/flow-state/${leagueId}`
    );
    return response.data;
  }

  async createEmptyMatch(payload: {
    league_id: string;
    league_category_id: string;
    round_id: string;
    display_name: string;
    position: { x: number; y: number };
  }) {
    const response = await axiosClient.post<LeagueMatch>(
      "/manual-league-management/matches",
      payload
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
      "/manual-league-management/rounds",
      payload
    );
    return response.data;
  }

  async createGroup(payload: {
    round_id: string;
    display_name: string;
    league_category_id: string;
    position: { x: number; y: number };
  }) {
    const response = await axiosClient.post<IGroup>(
      "/manual-league-management/groups",
      payload
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
      "/manual-league-management/edges",
      payload
    );
    return response.data;
  }

  async updateMatch(matchId: string, payload: Partial<LeagueMatch>) {
    const response = await axiosClient.put<LeagueMatch>(
      `/manual-league-management/matches/${matchId}`,
      payload
    );
    return response.data;
  }
  async updateNodePosition(
    nodeType: string,
    nodeId: string,
    position: { x: number; y: number }
  ) {
    const response = await axiosClient.put(
      `/manual-league-management/nodes/${nodeType}/${nodeId}/position`,
      { position }
    );
    return response.data;
  }
  async assignTeamToMatch(
    matchId: string,
    payload: { team_id: string; slot: "home" | "away" }
  ) {
    const response = await axiosClient.put<LeagueMatch>(
      `/manual-league-management/matches/${matchId}/assign-team`,
      payload
    );
    return response.data;
  }

  async resetCategoryLayout(categoryId: string) {
    const response = await axiosClient.put(
      `/manual-league-management/categories/${categoryId}/reset-layout`
    );
    return response.data;
  }
  async updateGroup(groupId: string, payload: Partial<IGroup>) {
    const response = await axiosClient.put<IGroup>(
      `/manual-league-management/groups/${groupId}`,
      payload
    );
    return response.data;
  }
  async deleteEdge(edgeId: string) {
    const response = await axiosClient.delete(
      `/manual-league-management/edges/${edgeId}`
    );
    return response.data;
  }

  async deleteSingleNode(nodeType: string, nodeId: string) {
    const response = await axiosClient.delete(
      `/manual-league-management/nodes/${nodeType}/${nodeId}`
    );
    return response.data;
  }

  async synchronizeBracket(leagueId: string) {
    const response = await axiosClient.post<{ teams_progressed: number }>(
      `/manual-league-management/leagues/${leagueId}/synchronize`
    );
    return response.data;
  }
}

export const manualLeagueService = new ManualLeagueManagementService();

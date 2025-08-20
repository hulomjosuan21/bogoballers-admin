import axiosClient from "@/lib/axiosClient";
import type { LeagueRoundFormat, RoundStateEnum } from "./types";

interface CreateRoundOperation {
  type: "create_round";
  data: {
    round_id: string;
    round_name: string;
    round_status: RoundStateEnum;
    round_order: number;
    position: { x: number; y: number };
  };
}

interface UpdatePositionOperation {
  type: "update_position";
  data: {
    round_id: string;
    position: { x: number; y: number };
  };
}

interface UpdateFormatOperation {
  type: "update_format";
  data: {
    round_id: string;
    round_format: LeagueRoundFormat | null;
  };
}

export type CategoryOperation =
  | CreateRoundOperation
  | UpdatePositionOperation
  | UpdateFormatOperation;

export interface SaveChangesPayload {
  categoryId: string;
  operations: CategoryOperation[];
}

export class LeagueCategoryService {
  static async saveChanges(payload: SaveChangesPayload) {
    return axiosClient.post(
      `/league/category/${payload.categoryId}/save-changes`,
      payload
    );
  }

  static async updateRoundFormat({
    categoryId,
    roundId,
    roundFormat,
  }: {
    categoryId: string;
    roundId: string;
    roundFormat: LeagueRoundFormat;
  }) {
    await axiosClient.post(
      `/league/category/${categoryId}/round/${roundId}/update-format`,
      { round_format: roundFormat }
    );
  }
}

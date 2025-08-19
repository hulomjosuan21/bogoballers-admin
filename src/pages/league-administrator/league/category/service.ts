import axiosClient from "@/lib/axiosClient";
import type { LeagueRoundFormat } from "./types";

interface CreateCategoryRoundPayload {
  categoryId: string;
  roundId: string;
  roundName: string;
  roundStatus: string;
  roundFormat: string | null;
  roundOrder: number;
  position: { x: number; y: number };
}

interface CreateRoundFormatPayload {
  roundId: string;
  formatType: string;
  pairingMethod?: string;
  position: { x: number; y: number };
}

export class LeagueCategoryService {
  static async createCategoryRound({
    categoryId,
    roundId,
    roundName,
    roundStatus,
    position,
  }: CreateCategoryRoundPayload) {
    await axiosClient.post(`/league/category/${categoryId}/add-round`, {
      round_id: roundId,
      round_name: roundName,
      round_status: roundStatus,
      position,
    });
  }

  static async updateRoundPosition({
    categoryId,
    roundId,
    position,
  }: {
    categoryId: string;
    roundId: string;
    position: { x: number; y: number };
  }) {
    await axiosClient.post(
      `/league/category/${categoryId}/round/${roundId}/update-position`,
      {
        position,
      }
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

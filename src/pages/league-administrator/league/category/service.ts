import axiosClient from "@/lib/axiosClient";
import {
  ApiResponse,
  type CreateLeagueCategory,
  type LeagueRoundFormat,
  type SaveChangesPayload,
} from "./imports";

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

  static async createCategory({
    leagueId,
    data,
  }: {
    leagueId: string;
    data: CreateLeagueCategory;
  }) {
    const response = await axiosClient.post(
      `/league/category/${leagueId}/add-category`,
      data
    );

    return ApiResponse.fromJsonNoPayload(response.data);
  }
}

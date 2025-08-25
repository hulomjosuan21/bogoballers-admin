import axiosClient from "@/lib/axiosClient";
import {
  ApiResponse,
  type CreateLeagueCategory,
  type LeagueCategory,
  type SaveChangesPayload,
} from "./imports";
import type { LeagueCategoryUpdatableFields } from "./types";
import type { LeagueCategoryRoundUpdatableFields } from "./components";

export class LeagueCategoryService {
  static async saveChanges(payload: SaveChangesPayload) {
    return axiosClient.post(
      `/league/category/${payload.leagueCategoryId}/save-changes`,
      payload
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

  static async updateLeagueCategory({
    league_category_id,
    changes,
  }: {
    league_category_id: string;
    changes: Partial<LeagueCategoryUpdatableFields>;
  }) {
    const response = await axiosClient.put(
      `/league/category/${league_category_id}`,
      changes
    );
    return ApiResponse.fromJsonNoPayload(response.data);
  }

  static async fetchActiveCategories(league_id: string) {
    const response = await axiosClient.get(`/league/category/${league_id}`);
    return (response.data ?? []) as LeagueCategory[];
  }

  static async deleteCategory(category_id: string) {
    await axiosClient.delete(`/league/category/${category_id}`);
  }
}

export class LeagueCategoryRoundService {
  static async updateRound({
    roundId,
    changes,
  }: {
    roundId: string;
    changes: Partial<LeagueCategoryRoundUpdatableFields>;
  }) {
    const response = await axiosClient.put(`/league/round/${roundId}`, changes);
    return ApiResponse.fromJsonNoPayload(response.data);
  }
}

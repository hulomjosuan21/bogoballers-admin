import axiosClient from "@/lib/axiosClient";
import {
  ApiResponse,
  type CreateLeagueCategory,
  type LeagueCategory,
  type SaveChangesPayload,
} from "./imports";

export class LeagueCategoryService {
  static async saveChanges(payload: SaveChangesPayload) {
    return axiosClient.post(
      `/league/category/${payload.categoryId}/save-changes`,
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

  static async fetchActiveCategories(league_id: string) {
    const response = await axiosClient.get(`/league/category/${league_id}`);
    return (response.data ?? []) as LeagueCategory[];
  }

  static async deleteCategory(category_id: string) {
    await axiosClient.delete(`/league/category/${category_id}`);
  }
}

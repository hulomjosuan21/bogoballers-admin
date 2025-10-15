import axiosClient from "@/lib/axiosClient";
import {
  type CreateLeagueCategory,
  type LeagueCategory,
} from "@/types/leagueCategoryTypes";

export type LeagueCategoryMetaData = {
  league_category_id: string;
  eligible_teams_count: number;
};

export class LeagueCategoryService {
  static async getMetaData(leagueId: string) {
    const response = await axiosClient.get<LeagueCategoryMetaData[]>(
      `/league-category/metadata/${leagueId}`
    );

    return response.data;
  }

  static async getMany<
    T extends Partial<LeagueCategory> & { condition: string }
  >(leagueId: string, data?: T) {
    const response = await axiosClient.post<LeagueCategory[]>(
      `/league-category/all/${leagueId}`,
      data ?? undefined
    );

    return response.data;
  }

  static async createCategory({
    leagueId,
    data,
  }: {
    leagueId: string;
    data: CreateLeagueCategory;
  }) {
    const response = await axiosClient.post<{ message: string }>(
      `/league-category/${leagueId}/add-category`,
      data
    );

    return response.data;
  }

  static async updateMany(changes: Partial<LeagueCategory>[]) {
    const response = await axiosClient.put<{ message: string }>(
      `/league-category/edit-many`,
      changes
    );
    return response.data;
  }

  static async fetchActiveCategories(league_id: string) {
    const response = await axiosClient.get<LeagueCategory[]>(
      `/league-category/${league_id}`
    );
    return response.data;
  }

  static async deleteCategory(category_id: string) {
    await axiosClient.delete(`/league/category/${category_id}`);
  }
}

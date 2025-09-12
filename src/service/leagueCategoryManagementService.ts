import axiosClient from "@/lib/axiosClient";
import {
  type CreateLeagueCategory,
  type LeagueCategory,
  type LeagueCategoryUpdatableFields,
  type SaveChangesPayload,
} from "@/types/leagueCategoryTypes";
import type { LeagueCategoryRoundUpdatableFields } from "@/components/league-category-management/LeagueCategoryManagementComponents";

export class LeagueCategoryService {
  static async getMany(leagueId: string, data?: Partial<LeagueCategory>) {
    const hasData = data && Object.keys(data).length > 0;

    const response = await axiosClient.post<LeagueCategory[]>(
      `/league-category/all/${leagueId}`,
      hasData ? data : undefined
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

  static async updateLeagueCategory({
    league_category_id,
    changes,
  }: {
    league_category_id: string;
    changes: Partial<LeagueCategoryUpdatableFields>;
  }) {
    const response = await axiosClient.put<{ message: string }>(
      `/league-category/${league_category_id}`,
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

export class LeagueCategoryRoundService {
  static async updateRound({
    roundId,
    changes,
  }: {
    roundId: string;
    changes: Partial<LeagueCategoryRoundUpdatableFields>;
  }) {
    const response = await axiosClient.put<{ message: string }>(
      `/league-round/${roundId}`,
      changes
    );
    return response.data;
  }

  static async progressRound({
    roundId,
    changes,
  }: {
    roundId: string;
    changes: Partial<LeagueCategoryRoundUpdatableFields>;
  }) {
    const response = await axiosClient.put<{ message: string }>(
      `/league-round/progression/${roundId}`,
      changes
    );
    return response.data.message;
  }

  static async saveChanges(payload: SaveChangesPayload) {
    return axiosClient.post(
      `/league-round/${payload.leagueCategoryId}/save-changes`,
      payload
    );
  }
}

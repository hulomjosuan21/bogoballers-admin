import { ApiResponse } from "@/lib/apiResponse";
import axiosClient from "@/lib/axiosClient";
import type { CreateCategory } from "@/pages/league-administrator/league/category/types";

export default class CategoryService {
  static async create(leagueAdminId: string, payload: CreateCategory) {
    const response = await axiosClient.post(
      `/category/${leagueAdminId}`,
      payload
    );
    return ApiResponse.fromJsonNoPayload(response.data);
  }

  static async update(categoryId: string, payload: Partial<CreateCategory>) {
    const response = await axiosClient.put(`/category/${categoryId}`, payload);
    return ApiResponse.fromJsonNoPayload(response.data);
  }

  static async delete(categoryId: string) {
    const response = await axiosClient.delete(`/category/${categoryId}`);
    return ApiResponse.fromJsonNoPayload(response.data);
  }
}

import { ApiResponse } from "@/lib/apiResponse";
import axiosClient from "@/lib/axiosClient";
import type { CategoryModel } from "@/types/leagueCategoryTypes";
import type { LeagueAdminModel } from "@/types/leagueAdmin";

class LeagueAdministratorService {
  static async auth(): Promise<LeagueAdminModel> {
    const response = await axiosClient.get<LeagueAdminModel>(
      "/league-administrator/auth",
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  static async logout() {
    const response = await axiosClient.post("/league-administrator/logout", {
      withCredentials: true,
    });
    const apiResponse = ApiResponse.fromJsonNoPayload(response.data);
    return apiResponse;
  }

  static async register(formData: FormData): Promise<ApiResponse<never>> {
    try {
      const response = await axiosClient.post(
        "/league-administrator/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const apiResponse = ApiResponse.fromJsonNoPayload<never>(response.data);
      return apiResponse;
    } catch (error) {
      console.error("Error registering league administrator:", error);
      throw error;
    }
  }

  static async login(formData: FormData) {
    try {
      const response = await axiosClient.post(
        "/league-administrator/login",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      const apiResponse = ApiResponse.fromJsonNoPayload<never>(response.data);
      return apiResponse;
    } catch (error) {
      console.error("Error registering league administrator:", error);
      throw error;
    }
  }

  static async fetchCategories() {
    const response = await axiosClient.get<CategoryModel[]>("/category/all");
    return response.data;
  }
}

export default LeagueAdministratorService;

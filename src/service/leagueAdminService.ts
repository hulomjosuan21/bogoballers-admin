import { ApiResponse } from "@/lib/apiResponse";
import axiosClient from "@/lib/axiosClient";
import type { Category } from "@/types/category";
import type { League } from "@/types/league";
import type { JwtPayload, LeagueAdministator } from "@/types/leagueAdmin";

class LeagueAdministratorService {
  static async getMany() {
    const response = await axiosClient.get<
      (LeagueAdministator & { active_league: League | null })[]
    >("/league-administrator/all");

    return response.data;
  }

  static async authJwt() {
    const response = await axiosClient.get<JwtPayload>(
      "/league-administrator/auth/jwt",
      {
        withCredentials: true,
      }
    );
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  }

  static async auth(): Promise<LeagueAdministator> {
    const response = await axiosClient.get<LeagueAdministator>(
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
    const response = await axiosClient.get<Category[]>("/category/all");
    return response.data;
  }

  static async updateOne(
    leagueAdministratorId: string,
    data: Partial<LeagueAdministator>
  ) {
    const response = await axiosClient.put<{ message: string }>(
      `/league-administrator/update/${leagueAdministratorId}`,
      data
    );

    return response.data;
  }
}

export default LeagueAdministratorService;

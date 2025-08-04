import { ApiResponse } from "./../lib/apiResponse";
import axiosClient from "@/lib/axiosClient";

export default class LeagueService {
  static async createNewLeague(formData: FormData) {
    const response = await axiosClient.post("/league/create-new", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return ApiResponse.fromJsonNoPayload(response.data);
  }
}

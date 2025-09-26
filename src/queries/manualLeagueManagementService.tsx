import axiosClient from "@/lib/axiosClient";

export class ManualLeagueManagementService {
  async someFn<T>() {
    const response = await axiosClient.get<T>("");

    return response.data;
  }
}

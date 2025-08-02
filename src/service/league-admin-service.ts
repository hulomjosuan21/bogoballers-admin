import { ApiResponse } from "@/lib/apiResponse";
import axiosClient from "@/lib/axiosClient";

class LeagueAdministratorService {
    static async registerLeagueAdmin(formData: FormData): Promise<ApiResponse<never>> {
        try {
            const response = await axiosClient.post("/league-administrator/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const apiResponse = ApiResponse.fromJsonNoPayload<never>(response.data);
            return apiResponse;
        } catch (error) {
            console.error("Error registering league administrator:", error);
            throw error;
        }
    }
}

export default LeagueAdministratorService;
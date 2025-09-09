import axiosClient from "@/lib/axiosClient";
import type { TeamModel } from "@/types/team";

export class TeamService {
  static async getAllTeams() {
    const response = await axiosClient.get<TeamModel[]>("/team/all");

    return response.data;
  }
}

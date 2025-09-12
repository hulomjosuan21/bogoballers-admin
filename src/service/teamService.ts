import axiosClient from "@/lib/axiosClient";
import type { Team } from "@/types/team";

export class TeamService {
  static async getAllTeams() {
    const response = await axiosClient.get<Team[]>("/team/all");

    return response.data;
  }
}

import axiosClient from "@/lib/axiosClient";
import type { Player } from "@/types/player";

export class PlayerService {
  static async get_player_leaderboar() {
    const response = await axiosClient.get<Player[]>("/player/leaderboard");

    return response.data;
  }

  static async getAllPlayers() {
    const response = await axiosClient.get<Player[]>("/player/all");

    return response.data;
  }
}

import axiosClient from "@/lib/axiosClient";
import type { PlayerModel } from "@/types/player";

export class PlayerService {
  static async get_player_leaderboar() {
    const response = await axiosClient.get("/player/leaderboard");

    return (response.data || []) as PlayerModel[];
  }
}

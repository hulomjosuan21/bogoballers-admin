import { PlayerService } from "@/service/player-service";
import type { PlayerModel } from "@/types/player";
import { queryOptions } from "@tanstack/react-query";

export const getPlayerLeaderboardQueryOption = queryOptions<
  PlayerModel[] | null,
  Error
>({
  queryKey: ["player-leaderboard"],
  queryFn: PlayerService.get_player_leaderboar,
});

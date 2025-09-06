import { QUERY_KEYS } from "@/constants/queryKeys";
import { PlayerService } from "@/service/playerService";
import type { PlayerModel } from "@/types/player";
import { queryOptions } from "@tanstack/react-query";

export const getPlayerLeaderboardQueryOption = queryOptions<
  PlayerModel[] | null,
  Error
>({
  queryKey: QUERY_KEYS.PLAYER_LEADERBOARD,
  queryFn: PlayerService.get_player_leaderboar,
});

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
  staleTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: false,
});

export const getAllPlayersQueryOptions = queryOptions<
  PlayerModel[] | null,
  Error
>({
  queryKey: QUERY_KEYS.PLAYERS_ALL,
  queryFn: PlayerService.getAllPlayers,
  staleTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: false,
});

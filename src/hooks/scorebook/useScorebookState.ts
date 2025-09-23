import { useEffect, useReducer, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  gameReducer,
  initialState,
  type GameStateWithHistory,
} from "@/context/GameContext";
import type { MatchBook } from "@/types/scorebook";
import { loadDecryptedState, saveEncryptedState } from "@/service/secureStore";
import type { LeagueMatch } from "@/types/leagueMatch";
import { transformApiDataToScorebookState } from "@/data/leagueMatchDataTransformer";
import axiosClient from "@/lib/axiosClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http//localhost:5000";

export const useScorebookState = (
  matchId: string,
  isController: boolean,
  leagueAdministratorId?: string
) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const socket = io(`${API_BASE_URL}/live`);
    socketRef.current = socket;
    const room = matchId;
    socket.emit("join", { room });

    let pingInterval: NodeJS.Timeout;

    socket.on("connect", () => {
      pingInterval = setInterval(() => {
        const startTime = Date.now();
        socket.emit("ping", { timestamp: startTime });
      }, 5000);

      if (isController && leagueAdministratorId) {
        socket.emit("admin_start_live", {
          league_administrator_id: leagueAdministratorId,
          league_match_id: matchId,
        });
      }
    });

    socket.on("pong", (data: { timestamp: number }) => {
      const rtt = Date.now() - data.timestamp;
      setLatency(rtt);
    });

    socket.on("disconnect", () => {
      setLatency(null);
      clearInterval(pingInterval);

      if (isController && leagueAdministratorId) {
        socket.emit("admin_stop_live", {
          league_administrator_id: leagueAdministratorId,
        });
      }
    });

    const loadGame = async () => {
      try {
        if (isController) {
          const localState = await loadDecryptedState(matchId);
          if (localState && localState.present.match_id === matchId) {
            dispatch({ type: "HYDRATE_STATE", payload: localState });
            setIsLoading(false);
            return;
          }
          const response = await axiosClient.get<LeagueMatch>(
            `/league-match/${matchId}`
          );
          const initialStateForScorebook = transformApiDataToScorebookState(
            response.data
          );
          dispatch({
            type: "HYDRATE_STATE",
            payload: initialStateForScorebook,
          });
          setIsLoading(false);
        } else {
          socket.emit("viewer_request_initial_state", { room });
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setIsNotFound(true);
        setIsLoading(false);
      }
    };
    loadGame();

    socket.on(
      "scorebook_initial_state",
      (initialPresentState: MatchBook | null) => {
        if (!isController) {
          if (initialPresentState) {
            const initialState: GameStateWithHistory = {
              present: initialPresentState,
              past: [],
              future: [],
            };
            dispatch({ type: "HYDRATE_STATE", payload: initialState });
          } else {
            setIsNotFound(true);
          }
          setIsLoading(false);
        }
      }
    );

    if (!isController) {
      socket.on("scorebook_updated", (newState: MatchBook) => {
        setIsNotFound(false);
        dispatch({
          type: "HYDRATE_STATE",
          payload: { past: [], present: newState, future: [] },
        });
      });
    }

    return () => {
      if (isController && leagueAdministratorId) {
        socket.emit("admin_stop_live", {
          league_administrator_id: leagueAdministratorId,
        });
      }

      socket.disconnect();
      clearInterval(pingInterval);
    };
  }, [matchId, isController]);

  useEffect(() => {
    if (isController && !isLoading) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        if (state.present.match_id) {
          saveEncryptedState(matchId, state);
          const room = `match_room_${matchId}`;
          socketRef.current?.emit("scorebook_update", {
            room,
            data: state.present,
          });
        }
      }, 1000);
      return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      };
    }
  }, [state, isController, isLoading, matchId]);

  return { state, dispatch, isLoading, isNotFound, latency };
};

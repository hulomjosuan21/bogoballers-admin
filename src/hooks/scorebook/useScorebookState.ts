import { useEffect, useReducer, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  gameReducer,
  initialState,
  type GameStateWithHistory,
} from "@/context/GameContext";
import type { MatchBook } from "@/types/scorebook";
import { loadDecryptedState, saveEncryptedState } from "@/service/secureStore";
import { transformApiDataToScorebookState } from "@/data/leagueMatchDataTransformer";
import type { LeagueMatch } from "@/types/leagueMatch";
import axiosClient from "@/lib/axiosClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const useScorebookState = (matchId: string, isController: boolean) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const socket = io(`${API_BASE_URL}/live`);
    socketRef.current = socket;
    const room = `match_room_${matchId}`;
    socket.emit("join", { room });

    const loadGame = async () => {
      try {
        const localState = await loadDecryptedState(matchId); // Use matchId
        if (localState) {
          dispatch({ type: "HYDRATE_STATE", payload: localState });
          return;
        }

        const url = isController
          ? `/league-match/${matchId}`
          : `/league-match/${matchId}/live`;
        const response = await axiosClient.get<
          LeagueMatch | GameStateWithHistory
        >(url);
        const data = response.data;
        const initialStateForScorebook =
          "present" in data
            ? data
            : transformApiDataToScorebookState(data as LeagueMatch);
        dispatch({ type: "HYDRATE_STATE", payload: initialStateForScorebook });
      } catch (error) {
        console.error("Failed to fetch initial match data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGame();

    if (!isController) {
      socket.on("scorebook:updated", (newState: MatchBook) => {
        dispatch({
          type: "HYDRATE_STATE",
          payload: { past: [], present: newState, future: [] },
        });
      });
    }

    return () => socket.disconnect();
  }, [matchId, isController]);

  useEffect(() => {
    if (isController && !isLoading && socketRef.current) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = window.setTimeout(() => {
        if (state.present.match_id) {
          saveEncryptedState(state);

          // --- THIS IS THE CRITICAL FIX ---
          // Use the correct room name that matches the 'join' event
          const room = `match_room_${matchId}`;
          socketRef.current?.emit("scorebook:update", {
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

  return { state, dispatch, isLoading };
};

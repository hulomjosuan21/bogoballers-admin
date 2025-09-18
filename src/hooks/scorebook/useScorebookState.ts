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
        if (isController) {
          const localState = await loadDecryptedState();
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
          // Viewer requests the initial state from the server.
          socket.emit("viewer_request_initial_state", { room });
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setIsLoading(false);
      }
    };
    loadGame();

    // Viewer: Listens for the server's reply with the initial state.
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
            console.log(
              "Live match has not started yet. Waiting for first update."
            );
          }
          setIsLoading(false);
        }
      }
    );

    // Viewer: Listens for all ongoing live updates.
    if (!isController) {
      socket.on("scorebook_updated", (newState: MatchBook) => {
        dispatch({
          type: "HYDRATE_STATE",
          payload: { past: [], present: newState, future: [] },
        });
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [matchId, isController]);

  // Controller: Saves state locally and emits updates to the server.
  useEffect(() => {
    if (isController && !isLoading) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        if (state.present.match_id) {
          saveEncryptedState(state);
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

  return { state, dispatch, isLoading };
};

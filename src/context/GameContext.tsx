import React, { createContext, useReducer, useContext, useEffect } from "react";
import { initialMatchData } from "@/data/mock";
import type {
  MatchBook,
  PlayerStatsSummary,
  TeamBook,
} from "@/types/scorebook";

export type Action =
  | { type: "TOGGLE_TIMER" }
  | { type: "SET_TIME"; payload: number }
  | { type: "TIMER_TICK" }
  | { type: "CHANGE_QUARTER"; payload: number }
  | {
      type: "UPDATE_TEAM_STAT";
      payload: {
        teamId: string;
        quarter?: number;
        stat: "teamFoul" | "coachT" | "none_memberT";
        value: number;
      };
    }
  | { type: "ADD_TIMEOUT"; payload: { teamId: string } }
  | { type: "REMOVE_TIMEOUT"; payload: { teamId: string; index: number } }
  | {
      type: "UPDATE_PLAYER_STAT";
      payload: {
        teamId: string;
        playerId: string;
        stat: keyof PlayerStatsSummary | "P" | "T";
        value: number;
      };
    }
  | {
      type: "SUBSTITUTE_PLAYER";
      payload: { teamId: string; draggedId: string; droppedId: string };
    }
  | { type: "UNDO" }
  | { type: "REDO" };

interface GameStateWithHistory {
  past: MatchBook[];
  present: MatchBook;
  future: MatchBook[];
}

const initialState: GameStateWithHistory = {
  past: [],
  present: initialMatchData,
  future: [],
};

const calculatePlayerScore = (summary: PlayerStatsSummary): number => {
  return summary.fg2m * 2 + summary.fg3m * 3 + summary.ftm * 1;
};

const gameReducer = (
  state: GameStateWithHistory,
  action: Action
): GameStateWithHistory => {
  const { past, present, future } = state;

  const presentReducer = (
    currentState: MatchBook,
    currentAction: Action
  ): MatchBook => {
    switch (currentAction.type) {
      case "TOGGLE_TIMER":
        return { ...currentState, timer_running: !currentState.timer_running };

      case "TIMER_TICK":
        if (currentState.time_seconds > 0) {
          return {
            ...currentState,
            time_seconds: currentState.time_seconds - 1,
          };
        }
        return { ...currentState, timer_running: false };

      case "ADD_TIMEOUT": {
        const { teamId } = currentAction.payload;
        const newState = { ...currentState };
        newState.timer_running = false;

        const currentQuarter = currentState.current_quarter;
        const timeInSeconds = currentState.time_seconds;

        const formatTime = (totalSeconds: number) => {
          const minutes = Math.floor(totalSeconds / 60)
            .toString()
            .padStart(2, "0");
          const seconds = (totalSeconds % 60).toString().padStart(2, "0");
          return `${minutes}:${seconds}`;
        };

        const game_time = formatTime(timeInSeconds);
        const isHomeTeam = teamId === currentState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...currentState.home_team }
          : { ...currentState.away_team };

        const existingTimeouts = teamToUpdate.timeouts || [];
        teamToUpdate.timeouts = [
          ...existingTimeouts,
          { qtr: currentQuarter, game_time },
        ];

        if (isHomeTeam) {
          newState.home_team = teamToUpdate;
        } else {
          newState.away_team = teamToUpdate;
        }
        return newState;
      }

      case "REMOVE_TIMEOUT": {
        const { teamId, index } = currentAction.payload;
        const isHomeTeam = teamId === currentState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...currentState.home_team }
          : { ...currentState.away_team };

        const existingTimeouts = teamToUpdate.timeouts || [];
        teamToUpdate.timeouts = existingTimeouts.filter((_, i) => i !== index);

        return isHomeTeam
          ? { ...currentState, home_team: teamToUpdate }
          : { ...currentState, away_team: teamToUpdate };
      }

      case "UPDATE_TEAM_STAT": {
        const { teamId, quarter, stat, value } = currentAction.payload;
        const isHomeTeam = teamId === currentState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...currentState.home_team }
          : { ...currentState.away_team };

        if (stat === "teamFoul" && quarter) {
          const foulQtrIndex = teamToUpdate.teamF_per_qtr.findIndex(
            (fq) => fq.qtr === quarter
          );
          if (foulQtrIndex > -1) {
            teamToUpdate.teamF_per_qtr[foulQtrIndex].foul = value;
          } else {
            teamToUpdate.teamF_per_qtr.push({ qtr: quarter, foul: value });
          }
        }

        if (stat === "coachT") teamToUpdate.coachT = value;
        if (stat === "none_memberT") teamToUpdate.none_memberT = value;

        return isHomeTeam
          ? { ...currentState, home_team: teamToUpdate }
          : { ...currentState, away_team: teamToUpdate };
      }

      case "UPDATE_PLAYER_STAT": {
        const { teamId, playerId, stat, value } = currentAction.payload;
        const isHomeTeam = teamId === currentState.home_team.team_id;
        const teamToUpdate: TeamBook = isHomeTeam
          ? { ...currentState.home_team }
          : { ...currentState.away_team };

        const playerIndex = teamToUpdate.players.findIndex(
          (p) => p.player_id === playerId
        );
        if (playerIndex === -1) return currentState;

        const updatedPlayers = [...teamToUpdate.players];
        const playerToUpdate = { ...updatedPlayers[playerIndex] };

        if (stat === "P" || stat === "T") {
          playerToUpdate[stat] = Math.max(0, playerToUpdate[stat] + value);
        } else {
          playerToUpdate.summary = {
            ...playerToUpdate.summary,
            [stat]: Math.max(
              0,
              playerToUpdate.summary[stat as keyof PlayerStatsSummary] + value
            ),
          };
        }

        playerToUpdate.total_score = calculatePlayerScore(
          playerToUpdate.summary
        );
        updatedPlayers[playerIndex] = playerToUpdate;
        teamToUpdate.players = updatedPlayers;

        const newTeamTotalScore = teamToUpdate.players.reduce(
          (sum, p) => sum + p.total_score,
          0
        );

        if (isHomeTeam) {
          return {
            ...currentState,
            home_team: teamToUpdate,
            home_total_score: newTeamTotalScore,
          };
        } else {
          return {
            ...currentState,
            away_team: teamToUpdate,
            away_total_score: newTeamTotalScore,
          };
        }
      }

      case "SUBSTITUTE_PLAYER": {
        const { teamId, draggedId, droppedId } = currentAction.payload;
        const isHomeTeam = teamId === currentState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...currentState.home_team }
          : { ...currentState.away_team };

        const draggedPlayerIndex = teamToUpdate.players.findIndex(
          (p) => p.player_id === draggedId
        );
        const droppedPlayerIndex = teamToUpdate.players.findIndex(
          (p) => p.player_id === droppedId
        );

        if (draggedPlayerIndex === -1 || droppedPlayerIndex === -1)
          return currentState;

        const newPlayers = [...teamToUpdate.players];
        newPlayers[draggedPlayerIndex] = {
          ...newPlayers[draggedPlayerIndex],
          onBench: false,
        };
        newPlayers[droppedPlayerIndex] = {
          ...newPlayers[droppedPlayerIndex],
          onBench: true,
        };
        teamToUpdate.players = newPlayers;

        return isHomeTeam
          ? { ...currentState, home_team: teamToUpdate }
          : { ...currentState, away_team: teamToUpdate };
      }

      default:
        return currentState;
    }
  };

  if (action.type === "UNDO") {
    if (past.length === 0) return state;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    console.log("ACTION: UNDO", { to: previous });
    return { past: newPast, present: previous, future: [present, ...future] };
  }

  if (action.type === "REDO") {
    if (future.length === 0) return state;
    const next = future[0];
    const newFuture = future.slice(1);
    console.log("ACTION: REDO", { to: next });
    return { past: [...past, present], present: next, future: newFuture };
  }

  const newPresent = presentReducer(present, action);

  if (newPresent === present) {
    return state;
  }

  console.log("ACTION:", action.type, {
    payload: (action as any).payload,
    from: present,
    to: newPresent,
  });
  return {
    past: [...past, present],
    present: newPresent,
    future: [],
  };
};

const GameContext = createContext<{
  state: MatchBook;
  dispatch: React.Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
}>({
  state: initialMatchData,
  dispatch: () => null,
  canUndo: false,
  canRedo: false,
});

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    try {
      const storedState = localStorage.getItem("basketballScorebookState");
      return storedState ? JSON.parse(storedState) : initial;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem("basketballScorebookState", JSON.stringify(state));
  }, [state]);

  const contextValue = {
    state: state.present,
    dispatch,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);

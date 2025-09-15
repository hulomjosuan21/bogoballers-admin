import React, { createContext, useReducer, useContext, useEffect } from "react";
import { initialMatchData } from "@/data/mock";
import type {
  MatchBook,
  PlayerBook,
  PlayerStatsSummary,
  TeamBook,
} from "@/types/scorebook";

// --- ACTION TYPES ---
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
      type: "SET_PLAYER_STAT";
      payload: {
        teamId: string;
        playerId: string;
        stat: "P" | "T";
        value: number;
      };
    }
  | {
      type: "SET_PLAYER_SCORE_FOR_QUARTER";
      payload: {
        teamId: string;
        playerId: string;
        quarter: number;
        value: number;
      };
    }
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

// --- STATE SHAPE ---
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

// --- HELPER FUNCTIONS ---
const recalculateAllScores = (
  team: TeamBook,
  currentQuarter: number
): TeamBook => {
  const newTeam = { ...team, players: team.players.map((p) => ({ ...p })) };
  let currentQuarterTeamScore = 0;

  newTeam.players.forEach((p) => {
    p.total_score = p.score_per_qtr.reduce((sum, q) => sum + q.score, 0);
    const qtrData = p.score_per_qtr.find((s) => s.qtr === currentQuarter);
    if (qtrData) {
      currentQuarterTeamScore += qtrData.score;
    }
  });

  const qtrIndex = newTeam.score_per_qtr.findIndex(
    (s) => s.qtr === currentQuarter
  );
  if (qtrIndex > -1) {
    newTeam.score_per_qtr[qtrIndex].score = currentQuarterTeamScore;
  } else if (currentQuarterTeamScore > 0) {
    newTeam.score_per_qtr.push({
      qtr: currentQuarter,
      score: currentQuarterTeamScore,
    });
  }

  return newTeam;
};

// --- MAIN REDUCER ---
const gameReducer = (
  state: GameStateWithHistory,
  action: Action
): GameStateWithHistory => {
  const { past, present, future } = state;

  const presentReducer = (
    currentState: MatchBook,
    currentAction: Action
  ): MatchBook => {
    let newState = { ...currentState };

    switch (currentAction.type) {
      case "TOGGLE_TIMER":
        return { ...newState, timer_running: !newState.timer_running };

      case "TIMER_TICK":
        if (newState.time_seconds > 0) {
          return { ...newState, time_seconds: newState.time_seconds - 1 };
        }
        return { ...newState, timer_running: false };

      case "CHANGE_QUARTER": {
        const newQuarter = currentAction.payload;
        if (newQuarter === newState.current_quarter) return newState;

        newState.current_quarter = newQuarter;
        newState.timer_running = false;
        newState.time_seconds = newState.minutes_per_quarter * 60;

        const prepareTeamStats = (team: TeamBook): TeamBook => {
          if (!team.score_per_qtr.some((s) => s.qtr === newQuarter)) {
            team.score_per_qtr.push({ qtr: newQuarter, score: 0 });
          }
          if (!team.teamF_per_qtr.some((f) => f.qtr === newQuarter)) {
            team.teamF_per_qtr.push({ qtr: newQuarter, foul: 0 });
          }
          return team;
        };
        newState.home_team = prepareTeamStats(newState.home_team);
        newState.away_team = prepareTeamStats(newState.away_team);
        return newState;
      }

      case "ADD_TIMEOUT": {
        newState.timer_running = false;
        const { teamId } = currentAction.payload;
        const formatTime = (s: number) =>
          `${Math.floor(s / 60)
            .toString()
            .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
        const game_time = formatTime(newState.time_seconds);
        const isHomeTeam = teamId === newState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };
        const existingTimeouts = teamToUpdate.timeouts || [];
        teamToUpdate.timeouts = [
          ...existingTimeouts,
          { qtr: newState.current_quarter, game_time },
        ];
        if (isHomeTeam) newState.home_team = teamToUpdate;
        else newState.away_team = teamToUpdate;
        return newState;
      }

      case "REMOVE_TIMEOUT": {
        const { teamId, index } = currentAction.payload;
        const isHomeTeam = teamId === newState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };
        const existingTimeouts = teamToUpdate.timeouts || [];
        teamToUpdate.timeouts = existingTimeouts.filter((_, i) => i !== index);
        if (isHomeTeam) newState.home_team = teamToUpdate;
        else newState.away_team = teamToUpdate;
        return newState;
      }

      case "UPDATE_TEAM_STAT": {
        const { teamId, quarter, stat, value } = currentAction.payload;
        const isHomeTeam = teamId === newState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };
        if (stat === "teamFoul" && quarter) {
          const foulQtrIndex = teamToUpdate.teamF_per_qtr.findIndex(
            (fq) => fq.qtr === quarter
          );
          if (foulQtrIndex > -1)
            teamToUpdate.teamF_per_qtr[foulQtrIndex].foul = value;
          else teamToUpdate.teamF_per_qtr.push({ qtr: quarter, foul: value });
        }
        if (stat === "coachT") teamToUpdate.coachT = value;
        if (stat === "none_memberT") teamToUpdate.none_memberT = value;
        if (isHomeTeam) newState.home_team = teamToUpdate;
        else newState.away_team = teamToUpdate;
        return newState;
      }

      case "SET_PLAYER_STAT": {
        const { teamId, playerId, stat, value } = currentAction.payload;
        const isHomeTeam = teamId === newState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };

        const playerIndex = teamToUpdate.players.findIndex(
          (p) => p.player_id === playerId
        );
        if (playerIndex === -1) return newState;

        const updatedPlayer = {
          ...teamToUpdate.players[playerIndex],
          [stat]: value,
        };
        const updatedPlayers = [...teamToUpdate.players];
        updatedPlayers[playerIndex] = updatedPlayer;

        if (isHomeTeam)
          newState.home_team = { ...teamToUpdate, players: updatedPlayers };
        else newState.away_team = { ...teamToUpdate, players: updatedPlayers };
        return newState;
      }

      case "SET_PLAYER_SCORE_FOR_QUARTER": {
        const { teamId, playerId, quarter, value } = currentAction.payload;
        const isHomeTeam = teamId === newState.home_team.team_id;
        let teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };

        const playerIndex = teamToUpdate.players.findIndex(
          (p) => p.player_id === playerId
        );
        if (playerIndex === -1) return newState;

        const updatedPlayer = { ...teamToUpdate.players[playerIndex] };
        const updatedScores = [...updatedPlayer.score_per_qtr];
        const qtrIndex = updatedScores.findIndex((s) => s.qtr === quarter);

        if (qtrIndex > -1)
          updatedScores[qtrIndex] = {
            ...updatedScores[qtrIndex],
            score: value,
          };
        else updatedScores.push({ qtr: quarter, score: value });

        updatedPlayer.score_per_qtr = updatedScores;
        const updatedPlayers = [...teamToUpdate.players];
        updatedPlayers[playerIndex] = updatedPlayer;
        teamToUpdate.players = updatedPlayers;

        teamToUpdate = recalculateAllScores(
          teamToUpdate,
          newState.current_quarter
        );
        if (isHomeTeam) {
          newState.home_team = teamToUpdate;
          newState.home_total_score = teamToUpdate.players.reduce(
            (sum, p) => sum + p.total_score,
            0
          );
        } else {
          newState.away_team = teamToUpdate;
          newState.away_total_score = teamToUpdate.players.reduce(
            (sum, p) => sum + p.total_score,
            0
          );
        }
        return newState;
      }

      case "UPDATE_PLAYER_STAT": {
        const { teamId, playerId, stat, value } = currentAction.payload;
        const isHomeTeam = teamId === newState.home_team.team_id;
        let teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };

        const playerIndex = teamToUpdate.players.findIndex(
          (p) => p.player_id === playerId
        );
        if (playerIndex === -1) return newState;

        // Create deep copies to avoid mutation
        const updatedPlayers = [...teamToUpdate.players];
        const updatedPlayer = {
          ...updatedPlayers[playerIndex],
          summary: { ...updatedPlayers[playerIndex].summary },
          score_per_qtr: [...updatedPlayers[playerIndex].score_per_qtr],
        };

        if (stat === "P" || stat === "T") {
          updatedPlayer[stat] = Math.max(0, updatedPlayer[stat] + value);
          if (value > 0) newState.timer_running = false;
        } else if (stat in updatedPlayer.summary) {
          updatedPlayer.summary[stat as keyof PlayerStatsSummary] = Math.max(
            0,
            updatedPlayer.summary[stat as keyof PlayerStatsSummary] + value
          );
          const pointsChanged =
            stat === "fg2m"
              ? 2 * value
              : stat === "fg3m"
              ? 3 * value
              : stat === "ftm"
              ? 1 * value
              : 0;
          if (pointsChanged !== 0) {
            const qtrIndex = updatedPlayer.score_per_qtr.findIndex(
              (s) => s.qtr === newState.current_quarter
            );
            if (qtrIndex > -1)
              updatedPlayer.score_per_qtr[qtrIndex].score = Math.max(
                0,
                updatedPlayer.score_per_qtr[qtrIndex].score + pointsChanged
              );
            else
              updatedPlayer.score_per_qtr.push({
                qtr: newState.current_quarter,
                score: Math.max(0, pointsChanged),
              });
          }
        }

        updatedPlayers[playerIndex] = updatedPlayer;
        teamToUpdate.players = updatedPlayers;

        teamToUpdate = recalculateAllScores(
          teamToUpdate,
          newState.current_quarter
        );
        if (isHomeTeam) {
          newState.home_team = teamToUpdate;
          newState.home_total_score = teamToUpdate.players.reduce(
            (sum, p) => sum + p.total_score,
            0
          );
        } else {
          newState.away_team = teamToUpdate;
          newState.away_total_score = teamToUpdate.players.reduce(
            (sum, p) => sum + p.total_score,
            0
          );
        }
        return newState;
      }

      case "SUBSTITUTE_PLAYER": {
        const { teamId, draggedId, droppedId } = currentAction.payload;
        const isHomeTeam = teamId === newState.home_team.team_id;
        const teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };
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
        if (isHomeTeam) newState.home_team = teamToUpdate;
        else newState.away_team = teamToUpdate;
        return newState;
      }

      default:
        return currentState;
    }
  };

  if (action.type === "UNDO") {
    if (past.length === 0) return state;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    return { past: newPast, present: previous, future: [present, ...future] };
  }
  if (action.type === "REDO") {
    if (future.length === 0) return state;
    const next = future[0];
    const newFuture = future.slice(1);
    return { past: [...past, present], present: next, future: newFuture };
  }

  const newPresent = presentReducer(present, action);
  if (newPresent === present) return state;

  console.log("ACTION:", action.type, {
    payload: (action as any).payload,
    from: present,
    to: newPresent,
  });
  return { past: [...past, present], present: newPresent, future: [] };
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

import React, { createContext, useContext } from "react";
import { initialMatchData } from "@/data/scorebookInitialState";
import type {
  MatchBook,
  PlayerStatsSummary,
  TeamBook,
} from "@/types/scorebook";
export type Action =
  | { type: "HYDRATE_STATE"; payload: GameStateWithHistory }
  | { type: "TOGGLE_TIMER" }
  | { type: "SET_TIME"; payload: number }
  | { type: "TIMER_TICK" }
  | { type: "CHANGE_QUARTER"; payload: number }
  | { type: "ADD_OVERTIME" }
  | {
      type: "UPDATE_TEAM_STAT";
      payload: {
        teamId: string;
        quarter?: number;
        stat: "teamFoul" | "coachT" | "none_memberT" | "capT_ball";
        value: number | string;
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

export interface GameStateWithHistory {
  past: MatchBook[];
  present: MatchBook;
  future: MatchBook[];
}

export const initialState: GameStateWithHistory = {
  past: [],
  present: initialMatchData,
  future: [],
};

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

export const gameReducer = (
  state: GameStateWithHistory,
  action: Action
): GameStateWithHistory => {
  if (action.type === "HYDRATE_STATE") {
    return action.payload;
  }

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

      case "SET_TIME":
        return { ...newState, time_seconds: currentAction.payload };

      case "ADD_OVERTIME": {
        const newTotalQuarters = newState.quarters + 1;

        newState.quarters = newTotalQuarters;
        newState.current_quarter = newTotalQuarters;
        newState.is_overtime = true;
        newState.timer_running = false;
        newState.time_seconds = newState.minutes_per_overtime * 60;

        const prepareTeamStats = (team: TeamBook): TeamBook => {
          if (!team.score_per_qtr.some((s) => s.qtr === newTotalQuarters)) {
            team.score_per_qtr.push({ qtr: newTotalQuarters, score: 0 });
          }
          if (!team.teamF_per_qtr.some((f) => f.qtr === newTotalQuarters)) {
            team.teamF_per_qtr.push({ qtr: newTotalQuarters, foul: 0 });
          }
          return team;
        };
        newState.home_team = prepareTeamStats(newState.home_team);
        newState.away_team = prepareTeamStats(newState.away_team);

        return newState;
      }

      case "CHANGE_QUARTER": {
        const newQuarter = currentAction.payload;
        if (newQuarter === newState.current_quarter) return newState;

        newState.current_quarter = newQuarter;
        newState.timer_running = false;

        if (newState.is_overtime) {
          newState.time_seconds = newState.minutes_per_overtime * 60;
        } else {
          newState.time_seconds = newState.minutes_per_quarter * 60;
        }

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
            teamToUpdate.teamF_per_qtr[foulQtrIndex].foul = Number(value);
          else
            teamToUpdate.teamF_per_qtr.push({
              qtr: quarter,
              foul: Number(value),
            });
        }
        if (stat === "coachT") teamToUpdate.coachT = Number(value);
        if (stat === "none_memberT") teamToUpdate.none_memberT = Number(value);
        if (stat === "capT_ball") teamToUpdate.capT_ball = String(value);
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
        let newState = { ...currentState };
        const { teamId, playerId, stat, value } = currentAction.payload;
        const isHomeTeam = teamId === newState.home_team.team_id;
        let teamToUpdate = isHomeTeam
          ? { ...newState.home_team }
          : { ...newState.away_team };

        const playerIndex = teamToUpdate.players.findIndex(
          (p) => p.player_id === playerId
        );
        if (playerIndex === -1) return currentState;

        const updatedPlayers = teamToUpdate.players.map((p) => ({ ...p }));
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
            if (qtrIndex > -1) {
              updatedPlayer.score_per_qtr[qtrIndex] = {
                ...updatedPlayer.score_per_qtr[qtrIndex],
                score: Math.max(
                  0,
                  updatedPlayer.score_per_qtr[qtrIndex].score + pointsChanged
                ),
              };
            } else {
              updatedPlayer.score_per_qtr.push({
                qtr: newState.current_quarter,
                score: Math.max(0, pointsChanged),
              });
            }
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
        newState.timer_running = false;
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

  if (!(action.type == "TIMER_TICK")) {
    console.log("ACTION:", action.type, {
      payload: (action as any).payload,
      from: present,
      to: newPresent,
    });
  }

  return { past: [...past, present], present: newPresent, future: [] };
};

interface GameContextType {
  state: MatchBook;
  dispatch: React.Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{
  children: React.ReactNode;
  value: GameContextType;
}> = ({ children, value }) => {
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

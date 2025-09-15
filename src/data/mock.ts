// src/data/mock.ts

import type { MatchBook, PlayerBook } from "@/types/scorebook";

const generatePlayers = (teamId: string, count: number): PlayerBook[] =>
  Array.from({ length: count }, (_, i) => ({
    player_id: `${teamId}-p${i + 1}`,
    player_team_id: teamId,
    full_name: `Player ${i + 1}`,
    jersey_name: `PLAYER${i + 1}`,
    jersey_number: Math.floor(Math.random() * 99) + 1,
    total_score: 0,
    score_per_qtr: [],
    P: 0,
    T: 0,
    summary: {
      fg2m: 0,
      fg2a: 0,
      fg3m: 0,
      fg3a: 0,
      ftm: 0,
      fta: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
    },
    onBench: i >= 5, // First 5 players are on the floor
  }));

const homePlayers = generatePlayers("home-team", 12);
const awayPlayers = generatePlayers("away-team", 12);

export const initialMatchData: MatchBook = {
  match_id: "match-123",
  home_total_score: 0,
  away_total_score: 0,
  quarters: 4,
  minutes_per_quarter: 10,
  time_seconds: 10 * 60, // 10 minutes
  timer_running: false,
  current_quarter: 1,
  home_team: {
    side: "home",
    team_id: "home-team",
    team_name: "Bogo Sharks",
    coach: "Coach Smith",
    coachT: 0,
    none_memberT: 0,
    score_per_qtr: [{ qtr: 1, score: 0 }],
    teamF_per_qtr: [{ qtr: 1, foul: 0 }],
    timeouts: [],
    players: homePlayers,
  },
  away_team: {
    side: "away",
    team_id: "away-team",
    team_name: "Cebu Eagles",
    coach: "Coach Jones",
    coachT: 0,
    none_memberT: 0,
    score_per_qtr: [{ qtr: 1, score: 0 }],
    teamF_per_qtr: [{ qtr: 1, foul: 0 }],
    timeouts: [],
    players: awayPlayers,
  },
};

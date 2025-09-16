// src/types/index.ts

export interface PlayerStatsSummary {
  fg2m: number; // Field Goal 2-points Made
  fg2a: number; // Field Goal 2-points Attempted
  fg3m: number;
  fg3a: number;
  ftm: number; // Free Throw Made
  fta: number; // Free Throw Attempted
  reb: number; // Rebounds
  ast: number; // Assists
  stl: number; // Steals
  blk: number; // Blocks
  tov: number; // Turnovers
}

export interface PlayerBook {
  player_id: string;
  player_team_id: string;
  full_name: string;
  jersey_name: string;
  jersey_number: number;
  total_score: number;
  score_per_qtr: { qtr: number; score: number }[];
  P: number; // Personal Fouls
  T: number; // Technical Fouls
  summary: PlayerStatsSummary;
  onBench: boolean;
}

export interface TeamBook {
  side: "home" | "away";
  team_id: string;
  team_name: string;
  coach: string;
  coachT: number;
  none_memberT: number;
  score_per_qtr: { qtr: number; score: number }[];
  teamF_per_qtr: { qtr: number; foul: number }[];
  timeouts: { qtr: number; game_time: string }[];
  players: PlayerBook[];
}

export interface MatchBook {
  match_id: string;
  home_total_score: number;
  away_total_score: number;
  quarters: number;
  minutes_per_quarter: number;
  time_seconds: number; // Time is managed in seconds
  timer_running: boolean;
  current_quarter: number; // e.g., 1, 2, 3, 4
  home_team: TeamBook;
  away_team: TeamBook;
}

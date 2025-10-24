export interface PlayerStatsSummary {
  fg2m: number;
  fg2a: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
}

export interface PlayerBook {
  player_id: string;
  player_team_id: string;
  full_name: string;
  jersey_name: string;
  jersey_number: number;
  profile_image_url: string | null;
  total_score: number;
  score_per_qtr: { qtr: number; score: number }[];
  P: number;
  T: number;
  summary: PlayerStatsSummary;
  onBench: boolean;
}

export interface TeamBook {
  side: "home" | "away";
  team_id: string;
  team_name: string;
  coach: string;
  team_logo_url: string | null;
  coachT: number;
  none_memberT: number;
  capT_ball: string | null;
  score_per_qtr: { qtr: number; score: number }[];
  teamF_per_qtr: { qtr: number; foul: number }[];
  timeouts: { qtr: number; game_time: string }[];
  players: PlayerBook[];
}

export interface MatchBook {
  match_id: string;
  home_total_score: number;
  away_total_score: number;
  is_overtime: boolean;
  quarters: number;
  default_quarters: number;
  minutes_per_quarter: number;
  minutes_per_overtime: number;
  time_seconds: number;
  timer_running: boolean;
  current_quarter: number;
  home_team: TeamBook;
  away_team: TeamBook;
}

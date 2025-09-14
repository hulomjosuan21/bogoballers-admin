export interface PlayerBook {
  player_id: string;
  player_team_id: string;
  league_player_id: string | null;
  full_name: string;
  jersey_name: string;
  jersey_number: number;
  total_score: number; // background holder
  per_qtr_score: { [key: string]: number }[]; // example: [{1qtr: 8}]
  P: number;
  T: number;
  summary: {
    fg2: number;
    fga2: number;
    fg3: number;
    fga3: number;
    reb: number;
    ast: number;
    F: number;
    TP: number;
  };
  onBench: boolean;
}

interface TeamBook {
  side: "home" | "away";
  team_id: string;
  league_team_id: string | null;
  team_name: string;
  teamF: { [key: string]: number }; // example: [{1qtr: 4}]
  coachT: number;
  coach: string;
  capt_ball: string;
  turn_overs: number;
  fg_percent: number;
  ft_percent: number;
  none_memberT: number;
  timeout: { [key: number]: string }[]; // example:[{1: "1:30"}]
  players: PlayerBook[];
}

export interface MatchBook {
  is_league: boolean;
  match_id: string;
  home_total_score: number;
  away_total_score: number;
  quarters: number; // default: 4
  minutes_per_quarter: number; // default: 10
  time: Timer;
  home_team: TeamBook;
  away_team: TeamBook;
  qtr: { [key: string]: boolean }[]; // example: [{1qtr: true} .. to ot1: true....]
}

interface Timer {
  time: string;
  pause: boolean;
}

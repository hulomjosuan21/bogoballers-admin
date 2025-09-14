export interface Match {
  match_id: string;
  public_match_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team: string;
  away_team: string;
  home_team_score: number | null;
  away_team_score: number | null;
  scheduled_date: string | null;
  quarters: number;
  minutes_per_quarter: number;
  court: string | null;
  referees: string[];
  is_exhibition: boolean;
  status: string;
  match_created_at: string;
  match_updated_at: string;
}

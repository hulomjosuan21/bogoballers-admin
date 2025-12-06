export type UpcomingMatch = {
  home_team: {
    team_logo_url: string;
    team_name: string;
    wins: number;
    losses: number;
  };
  away_team: {
    team_logo_url: string;
    team_name: string;
    wins: number;
    losses: number;
  };
  detail: string;
  schedule_date: string;
};

export type CompletedMatch = {
  home_team: {
    team_logo_url: string;
    team_name: string;
    wins: number;
    losses: number;
  };
  away_team: {
    team_logo_url: string;
    team_name: string;
    wins: number;
    losses: number;
  };
  home_team_score: string;
  away_team_score: string;
  detail: string;
};

import type { LeagueAdministator } from "./leagueAdmin";
import type { LeagueCategory } from "./leagueCategoryTypes";

export type LeagueOfficial = {
  full_name: string;
  role: string;
  contact_info: string;
  photo: string;
};

export type LeagueReferee = {
  full_name: string;
  contact_info: string;
  photo: string;
  is_available: boolean;
};

export type LeagueAffiliate = {
  name: string;
  value: string;
  image: string;
  contact_info: string;
};

export type LeagueCourt = {
  name: string;
  location: string;
  is_available: boolean;
};
export interface LeagueResource {
  league_courts: LeagueCourt[];
  league_officials: LeagueOfficial[];
  league_referees: LeagueReferee[];
  league_affiliates: LeagueAffiliate[];
}

export interface League extends LeagueResource {
  league_id: string;
  public_league_id: string;
  league_administrator_id: string;
  league_title: string; // updatable
  league_description: string; // updatable
  league_objective: string; // updatable
  league_rationale: string[]; // updatable
  league_address: string; // updatable
  league_budget: number; // updatable
  registration_deadline: string; // updatable
  opening_date: string; // updatable
  league_schedule: [string, string]; // updatable
  banner_url: string; // updatable
  status: string; // updatable
  season_year: number; // updatable
  sportsmanship_rules: string[]; // updatable
  league_created_at: string;
  league_updated_at: string;
  creator: LeagueAdministator;
  league_categories: LeagueCategory[];
}

export interface ProfitChartPoint {
  date: string;
  amount: number;
}

export interface TotalProfit {
  amount: number;
  last_update: string | null;
  chart: ProfitChartPoint[];
}

export interface LeagueAnalytics {
  total_profit: TotalProfit;
  total_accepted_teams: {
    count: number;
    last_update: string | null;
  };
  total_players: {
    count: number;
    last_update: string | null;
  };
  total_categories: {
    count: number;
    last_update: string | null;
  };

  matches_chart_data: {
    chart: {
      date: string;
      count: number;
    }[];
    total_days: number;
    last_match_date: string | null;
  };
}

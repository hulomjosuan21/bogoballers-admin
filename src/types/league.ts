import type { LeagueCategory } from "@/pages/league-administrator/league/category/types";

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
  league_id: string;
  league_courts: LeagueCourt[];
  league_officials: LeagueOfficial[];
  league_referees: LeagueReferee[];
  league_affiliates: LeagueAffiliate[];
}

export interface LeagueOption {
  player_residency_certificate_valid_until: string;
  player_residency_certificate_required: boolean;
}

export type League = {
  league_id: string;
  league_administrator_id: string;
  league_title: string;
  league_description: string;
  league_budget: number;
  league_address: string;
  registration_deadline: string;
  opening_date: string;
  league_schedule: [string, string];
  banner_url: string;
  status: string;
  season_year: number;
  sportsmanship_rules: string[];
  created_at: string;
  updated_at: string;
  categories: LeagueCategory[];
};

export interface LeagueType extends League {}

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
  active_league: LeagueType;
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
}

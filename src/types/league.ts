import type { LeagueCategoryRound } from "@/pages/league-administrator/league/category/types";

export interface CreateLeagueCategory {
  category_name: string;
  max_team: number;
  accept_teams: boolean;
  team_entrance_fee_amount: number;
  individual_player_entrance_fee_amount: number;
}

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

export interface League {
  league_id: string;
  league_administrator_id: string;
  league_title: string;
  league_description: string;
  league_budget: number;
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
  option: LeagueOption;
}

export interface LeagueCategory {
  category_id: string;
  league_id: string;
  category_name: string;
  max_team: number;
  accept_teams: boolean;
  team_entrance_fee_amount: number;
  individual_player_entrance_fee_amount: number;
  created_at: string;
  updated_at: string;
  rounds: LeagueCategoryRound[];
}

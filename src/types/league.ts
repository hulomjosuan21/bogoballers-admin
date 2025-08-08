import type { RoundFormatEnum, RoundTypeEnum } from "@/enums/enums";

export interface CreateLeagueCategory {
  category_name: string;
  max_team: number;
  accept_teams: boolean;
  team_entrance_fee_amount: number;
  individual_player_entrance_fee_amount: number;
}

export interface LeagueCategory extends CreateLeagueCategory {
  category_id: string;
  created_at: string;
  updated_at: string;
  category_format: {
    format_round: RoundTypeEnum;
    format: RoundFormatEnum;
  }[];
}

export type LeagueOfficial = {
  full_name: string;
  role: string;
  contact_info: string;
  photo_url: string;
};

export type LeagueReferees = {
  full_name: string;
  contact_info: string;
  photo_url: string;
  is_available: boolean;
};

export type LeagueAffiliate = {
  name: string;
  value: string;
  photo_url: string;
  contact_info: string;
};

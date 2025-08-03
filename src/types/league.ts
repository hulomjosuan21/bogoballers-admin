export const matchCategories = [
  "Regular Season",
  "Exhibition",
  "Elimination",
  "Quarterfinal",
  "Semifinal",
  "Final",
  "Third place",
  "Practice",
] as const;

export const formatTypes = [
  "Round Robin",
  "Knockout",
  "Double Elimination",
  "Quarter Final Default",
  "Semi Final Default",
  "Final Default",
] as const;

export type MatchCategory = (typeof matchCategories)[number];
export type FormatType = (typeof formatTypes)[number];

export interface CreateLeagueCategory {
  category_name: string;
  category_format: {
    format_round: MatchCategory;
    format: FormatType;
  }[];
  max_team: number;
  accept_teams: boolean;
  team_entrance_fee_amount: number;
  individual_player_entrance_fee_amount: number;
}

export interface LeagueCategory extends CreateLeagueCategory {
  category_id: string;
  created_at: string;
  updated_at: string;
}

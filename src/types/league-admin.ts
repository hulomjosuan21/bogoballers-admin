import type { UserType } from "./user";

export type LeagueAdmin = {
  user_id: string;
  organization_name: string;
  organization_type: string;
  organization_address: string;
  organization_logo_url: string | null;
  user: UserType;
};

export interface LeagueAdminType extends LeagueAdmin {
  created_at: string;
  updated_at: string;
}

export interface LeagueAdminModel extends LeagueAdminType {
  league_administrator_id: string;
}

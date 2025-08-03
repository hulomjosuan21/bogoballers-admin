import type { UserType } from "./user";

export interface LeagueAdminType {
  user_id: string;
  organization_name: string;
  organization_type: string;
  organization_address: string;
  organization_logo_url: string | null;
  user: UserType;
  created_at: string;
  updated_at: string;
}

import type { User } from "./user";

export type LeagueAdministator = {
  league_administrator_id: string;
  public_league_administrator_id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  organization_address: string;
  organization_logo_url: string;
  league_admin_created_at: string;
  league_admin_updated_at: string;
  account: User;
};

export type JwtPayload = {
  sub: string;
  email: string;
  account_type: string;
  league_administrator_id: string;
  is_verified: boolean;
  exp: number;
  iat: number;
};

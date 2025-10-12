import type { LeagueCategory } from "./leagueCategoryTypes";
import type { Player } from "./player";
import type { Team } from "./team";

export type GuestRequestType = "Team" | "Player";
export type GuestRequestStatus = "Pending" | "Accepted" | "Rejected";
export type PaymentStatus =
  | "Pending"
  | "Paid Online"
  | "Paid On Site"
  | "No Charge"
  | "Refunded"
  | "Partially Refunded";

export interface GuestRegistrationRequest {
  guest_request_id: string;
  league_id: string;
  league_category_id: string;
  request_type: GuestRequestType;
  status: GuestRequestStatus;
  amount_paid: number;
  payment_status: PaymentStatus;
  payment_record: Record<string, unknown>;
  request_created_at: string;
  request_processed_at: string | null;
  league_category: LeagueCategory;
  details: Player | Team;
}

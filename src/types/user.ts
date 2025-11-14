import type { AccountTypeEnum } from "@/enums/enums";

export interface User {
  readonly user_id: string;
  email: string;
  contact_number: string;
  is_verified: boolean;
  account_type: AccountTypeEnum;
  display_name: string | null;
  user_created_at: string;
  user_updated_at: string;
}

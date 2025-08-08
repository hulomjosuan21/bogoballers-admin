import type { AccountTypeEnum } from "@/enums/enums";

export interface UserType {
  user_id: string;
  email: string;
  contact_number: string;
  is_verified: string;
  account_type: AccountTypeEnum;
  created_at: string;
  updated_at: string;
}

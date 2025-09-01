import type { AccountTypeEnum } from "@/enums/enums";

export interface User {
  user_id: string;
  email: string;
  contact_number: string;
  is_verified: string;
  account_type: AccountTypeEnum;
}

export interface UserType extends User {
  created_at: string;
  updated_at: string;
}

import { create } from "zustand";

export type Refund = {
  data: {
    amount: number;
    league_team_id: string;
  };
  message: string;
  leagueId: string;
  leagueCategoryId: string;
  remove: boolean;
};

type RefundState = {
  isOpen: boolean;
  data?: Refund;
  dialogOpen: (data: Refund) => void;
  dialogClose: () => void;
};

export function createRefundStore() {
  return create<RefundState>((set) => ({
    isOpen: false,
    data: undefined,
    dialogOpen: (data: Refund) => set({ isOpen: true, data }),
    dialogClose: () => set({ isOpen: false, data: undefined }),
  }));
}

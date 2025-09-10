import type { LeagueCategoryRoundUpdatableFields } from "@/components/league-category-management/LeagueCategoryManagementComponents";
import { create } from "zustand";

export type UpdateRoundStore = {
  isPending: boolean;
  error: Error | null;
  updateApi: (
    roundId: string,
    changes: Partial<LeagueCategoryRoundUpdatableFields>
  ) => Promise<string>;
};

export const createUpdateRoundStore = (
  updateFn: (params: {
    roundId: string;
    changes: Partial<LeagueCategoryRoundUpdatableFields>;
  }) => Promise<string>
) =>
  create<UpdateRoundStore>((set) => ({
    isPending: false,
    error: null,
    updateApi: async (roundId, changes) => {
      set({ isPending: true, error: null });
      try {
        const res = await updateFn({ roundId, changes });
        set({ isPending: false });
        return res;
      } catch (error) {
        set({ isPending: false, error: error as Error });
        throw error;
      }
    },
  }));

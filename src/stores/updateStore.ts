import { create } from "zustand";

export type UpdateStore<T> = {
  isPending: boolean;
  error: Error | null;
  updateApi: (id: string, data: Partial<T>) => Promise<string>;
};

export const createUpdateStore = <T>(
  updateFn: (params: { id: string; data: Partial<T> }) => Promise<string>
) =>
  create<UpdateStore<T>>((set) => ({
    isPending: false,
    error: null,
    updateApi: async (id, data) => {
      set({ isPending: true, error: null });
      try {
        const res = await updateFn({ id, data });
        set({ isPending: false });
        return res;
      } catch (error) {
        set({ isPending: false, error: error as Error });
        throw error;
      }
    },
  }));

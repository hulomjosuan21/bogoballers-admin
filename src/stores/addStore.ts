import { create } from "zustand";

export type AddStore<T> = {
  isPending: boolean;
  error: Error | null;
  addApi: (data: T) => Promise<string>;
};

export const createAddStore = <T>(
  addFn: (params: { data: T }) => Promise<string>
) =>
  create<AddStore<T>>((set) => ({
    isPending: false,
    error: null,
    addApi: async (data: T) => {
      set({ isPending: true, error: null });
      try {
        const res = await addFn({ data });
        set({ isPending: false });
        return res;
      } catch (error) {
        set({ isPending: false, error: error as Error });
        throw error;
      }
    },
  }));

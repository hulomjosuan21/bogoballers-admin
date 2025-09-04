import { create } from "zustand";

export type DeleteStore = {
  isPending: boolean;
  error: Error | null;
  deleteApi: (id: string) => Promise<string>;
};

export const createDeleteStore = (
  deleteFn: ({ id }: { id: string }) => Promise<string>
) =>
  create<DeleteStore>((set) => ({
    isPending: false,
    error: null,
    deleteApi: async (id: string) => {
      set({ isPending: true, error: null });
      try {
        const res = await deleteFn({ id });
        set({ isPending: false });
        return res;
      } catch (error) {
        set({ isPending: false, error: error as Error });
        throw error;
      }
    },
  }));

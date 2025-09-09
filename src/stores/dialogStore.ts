import { create } from "zustand";

type PopUpState<T = void> = {
  isOpen: boolean;
  data: T | null;
  dialogOpen: (data?: T) => void;
  dialogClose: () => void;
};

export function createPopUpStore<T = void>() {
  return create<PopUpState<T>>((set) => ({
    isOpen: false,
    data: null,
    dialogOpen: (data?: T) => set({ isOpen: true, data: data ?? null }),
    dialogClose: () => set({ isOpen: false, data: null }),
  }));
}

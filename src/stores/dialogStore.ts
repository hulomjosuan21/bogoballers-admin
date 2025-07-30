import { create } from 'zustand'

type DialogState<T = void> = {
  isOpen: boolean
  data: T | null
  dialogOpen: (data?: T) => void
  dialogClose: () => void
}

export function createDialogStore<T = void>() {
  return create<DialogState<T>>((set) => ({
    isOpen: false,
    data: null,
    dialogOpen: (data?: T) => set({ isOpen: true, data: data ?? null }),
    dialogClose: () => set({ isOpen: false, data: null }),
  }))
}

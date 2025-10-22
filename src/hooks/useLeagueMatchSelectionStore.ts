// stores/useLeagueSelectionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LeagueSelectionState {
  selectedCategory: string;
  selectedRound: string;
  selectedGroup: string;
  setSelectedCategory: (id: string) => void;
  setSelectedRound: (id: string) => void;
  setSelectedGroup: (id: string) => void;
  resetRoundAndGroup: () => void;
  resetGroup: () => void;
}

export const useLeagueMatchSelectionStore = create<LeagueSelectionState>()(
  persist(
    (set) => ({
      selectedCategory: "",
      selectedRound: "",
      selectedGroup: "",
      setSelectedCategory: (id) =>
        set(() => ({
          selectedCategory: id,
          selectedRound: "",
          selectedGroup: "",
        })),
      setSelectedRound: (id) =>
        set(() => ({ selectedRound: id, selectedGroup: "" })),
      setSelectedGroup: (id) => set(() => ({ selectedGroup: id })),
      resetRoundAndGroup: () =>
        set(() => ({ selectedRound: "", selectedGroup: "" })),
      resetGroup: () => set(() => ({ selectedGroup: "" })),
    }),
    {
      name: "league-selection-storage",
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LeagueMatch } from "@/types/leagueMatch";

interface SelectedMatchState {
  selectedMatch: LeagueMatch | null;
  setSelectedMatch: (match: LeagueMatch | null) => void;
  removeSelectedMatch: () => void;
}

export const useSelectedMatchStore = create<SelectedMatchState>()(
  persist(
    (set) => ({
      selectedMatch: null,
      setSelectedMatch: (match) => set({ selectedMatch: match }),
      removeSelectedMatch: () => set({ selectedMatch: null }),
    }),
    { name: "selected-match-storage" }
  )
);

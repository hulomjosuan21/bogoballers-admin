import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { encryptedStorage } from "@/lib/encryptedStorage";
import type { League } from "@/types/league";

interface LeagueStore {
  league: League | null;

  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasData: boolean;
  leagueId: string | undefined;

  refetch: (() => Promise<any>) | null;

  setLeague: (league: League | null) => void;
  setQueryState: (state: {
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    leagueId: string | undefined;
    refetch: () => Promise<any>;
  }) => void;

  clearLeague: () => void;
}

export const useLeagueStore = create<LeagueStore>()(
  persist(
    (set) => ({
      league: null,
      isLoading: false,
      isError: false,
      error: null,
      leagueId: undefined,
      hasData: false,
      refetch: null,

      setLeague: (league) => set({ league, hasData: league !== null }),

      setQueryState: ({ isLoading, isError, error, refetch, leagueId }) =>
        set({
          isLoading,
          isError,
          error,
          refetch,
          leagueId,
        }),

      clearLeague: () =>
        set({
          league: null,
          isLoading: false,
          isError: false,
          error: null,
          leagueId: undefined,
          hasData: false,
          refetch: null,
        }),
    }),
    {
      name: "league-store",
      storage: createJSONStorage(() => encryptedStorage),
      partialize: (state) => ({
        league: state.league,
        leagueId: state.leagueId,
        hasData: state.hasData,
      }),
    }
  )
);

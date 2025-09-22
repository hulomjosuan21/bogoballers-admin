import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FormatConfigState {
  rrConfig: {
    label: string;
    group_count: string;
    advances_per_group: string;
    use_point_system: boolean;
  };
  koConfig: {
    label: string;
    group_count: string;
    single_elim: boolean;
    seeding: string;
  };
  deConfig: {
    label: string;
    group_count: string;
    max_loss: string;
    progress_group: string;
    max_progress_group: string;
  };
  boConfig: {
    label: string;
    group_count: string;
    games: string;
  };
  ttbConfig: {
    label: string;
    advantaged_team: string;
    challenger_team: string;
    max_games: string;
  };
  setRRConfig: (config: Partial<FormatConfigState["rrConfig"]>) => void;
  setKOConfig: (config: Partial<FormatConfigState["koConfig"]>) => void;
  setDEConfig: (config: Partial<FormatConfigState["deConfig"]>) => void;
  setBOConfig: (config: Partial<FormatConfigState["boConfig"]>) => void;
  setTTBConfig: (config: Partial<FormatConfigState["ttbConfig"]>) => void;
}

export const useFormatConfigStore = create<FormatConfigState>()(
  persist(
    (set) => ({
      rrConfig: {
        label: "",
        group_count: "",
        advances_per_group: "",
        use_point_system: false,
      },
      koConfig: {
        label: "",
        group_count: "",
        single_elim: true,
        seeding: "random",
      },
      deConfig: {
        label: "",
        group_count: "",
        max_loss: "",
        progress_group: "",
        max_progress_group: "",
      },
      boConfig: {
        label: "",
        group_count: "",
        games: "",
      },
      ttbConfig: {
        label: "",
        advantaged_team: "",
        challenger_team: "",
        max_games: "",
      },
      setRRConfig: (config) =>
        set((state) => ({
          rrConfig: { ...state.rrConfig, ...config },
        })),
      setKOConfig: (config) =>
        set((state) => ({
          koConfig: { ...state.koConfig, ...config },
        })),
      setDEConfig: (config) =>
        set((state) => ({
          deConfig: { ...state.deConfig, ...config },
        })),
      setBOConfig: (config) =>
        set((state) => ({
          boConfig: { ...state.boConfig, ...config },
        })),
      setTTBConfig: (config) =>
        set((state) => ({
          ttbConfig: { ...state.ttbConfig, ...config },
        })),
    }),
    {
      name: "format-config-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

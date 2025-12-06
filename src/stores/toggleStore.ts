import { create } from "zustand";

export enum ToggleState {
  SHOW,
  HIDE,
  SHOW_LEAGUE_TEAM,
  SHOW_SAVED_MATCH,
  SHOW_LEAGUE,
  CONFIG_UPCOMING,
  OPEN_AUTOMATIC_MATCH_SHEET,
}

type ToggleStore<T> = {
  data?: T;
  state: ToggleState;
  toggle: (data?: T, state?: ToggleState) => void;
  reset: () => void;
};

export const useToggleStore = <T>() =>
  create<ToggleStore<T>>((set, get) => ({
    data: undefined,
    state: ToggleState.HIDE,
    toggle: (data, newState) => {
      const s = get();
      set({
        state: s.state === newState ? ToggleState.HIDE : newState,
        data: s.state === newState ? undefined : data,
      });
    },
    reset: () =>
      set({
        state: ToggleState.HIDE,
        data: undefined,
      }),
  }));

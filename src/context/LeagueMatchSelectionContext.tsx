import {
  createContext,
  useReducer,
  useContext,
  type ReactNode,
  type Dispatch,
} from "react";

interface LeagueSelectionState {
  selectedCategory: string;
  selectedRound: string;
  selectedGroup: string;
}

type Action =
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_ROUND"; payload: string }
  | { type: "SET_GROUP"; payload: string }
  | { type: "RESET_ROUND_AND_GROUP" }
  | { type: "RESET_GROUP" };

const initialState: LeagueSelectionState = {
  selectedCategory: "",
  selectedRound: "",
  selectedGroup: "",
};

function reducer(
  state: LeagueSelectionState,
  action: Action
): LeagueSelectionState {
  switch (action.type) {
    case "SET_CATEGORY":
      if (state.selectedCategory === action.payload) return state;
      return {
        selectedCategory: action.payload,
        selectedRound: "",
        selectedGroup: "",
      };
    case "SET_ROUND":
      if (state.selectedRound === action.payload) return state;
      return { ...state, selectedRound: action.payload, selectedGroup: "" };
    case "SET_GROUP":
      if (state.selectedGroup === action.payload) return state;
      return { ...state, selectedGroup: action.payload };
    case "RESET_ROUND_AND_GROUP":
      return { ...state, selectedRound: "", selectedGroup: "" };
    case "RESET_GROUP":
      return { ...state, selectedGroup: "" };
    default:
      return state;
  }
}

const LeagueSelectionContext = createContext<LeagueSelectionState | undefined>(
  undefined
);
const LeagueSelectionDispatchContext = createContext<
  Dispatch<Action> | undefined
>(undefined);

export function LeagueMatchSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <LeagueSelectionContext.Provider value={state}>
      <LeagueSelectionDispatchContext.Provider value={dispatch}>
        {children}
      </LeagueSelectionDispatchContext.Provider>
    </LeagueSelectionContext.Provider>
  );
}

// 🔥 Hook with same API as Zustand store
export function useLeagueMatchSelectionStore() {
  const state = useContext(LeagueSelectionContext);
  const dispatch = useContext(LeagueSelectionDispatchContext);

  if (state === undefined || dispatch === undefined) {
    throw new Error(
      "useLeagueMatchSelectionStore must be used within LeagueMatchSelectionProvider"
    );
  }

  return {
    ...state,
    setSelectedCategory: (id: string) =>
      dispatch({ type: "SET_CATEGORY", payload: id }),
    setSelectedRound: (id: string) =>
      dispatch({ type: "SET_ROUND", payload: id }),
    setSelectedGroup: (id: string) =>
      dispatch({ type: "SET_GROUP", payload: id }),
    resetRoundAndGroup: () => dispatch({ type: "RESET_ROUND_AND_GROUP" }),
    resetGroup: () => dispatch({ type: "RESET_GROUP" }),
  };
}

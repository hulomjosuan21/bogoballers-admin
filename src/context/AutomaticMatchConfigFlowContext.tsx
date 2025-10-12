import type { AutomaticMatchConfigFlowNodeData } from "@/types/automaticMatchConfigTypes";
import {
  type Node as XyFlowNode,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { createContext, useContext, useReducer, type ReactNode } from "react";

type FlowState = {
  nodes: XyFlowNode<AutomaticMatchConfigFlowNodeData>[];
  edges: Edge[];
};

type Action = {
  type: "ADD_NODE";
  payload: XyFlowNode<AutomaticMatchConfigFlowNodeData>;
};

const FlowStateContext = createContext<FlowState | undefined>(undefined);
const FlowDispatchContext = createContext<React.Dispatch<Action> | undefined>(
  undefined
);

const flowReducer = (state: FlowState, action: Action): FlowState => {
  switch (action.type) {
    case "ADD_NODE": {
      if (
        action.payload.type === "leagueCategory" &&
        state.nodes.some((n) => n.id === action.payload.id)
      ) {
        return state;
      }
      return { ...state, nodes: [...state.nodes, action.payload] };
    }
  }
};

const initialState: FlowState = {
  nodes: [],
  edges: [],
};

export const AutomaticMatchConfigFlowProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(flowReducer, initialState);

  return (
    <FlowStateContext.Provider value={state}>
      <FlowDispatchContext.Provider value={dispatch}>
        {children}
      </FlowDispatchContext.Provider>
    </FlowStateContext.Provider>
  );
};

export const useAutomaticMatchConfigFlowDispatch = () => {
  const context = useContext(FlowDispatchContext);
  if (context === undefined) {
    throw new Error("useFlowDispatch must be used within a FlowProvider");
  }
  return context;
};

// src/context/FlowContext.tsx
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from "@xyflow/react";
import type { FlowNodeData } from "@/types/manual"; // Adjust path if needed
import { db } from "@/service/dexie";

type FlowState = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
};

type Action =
  | { type: "SET_STATE"; payload: FlowState }
  | { type: "ADD_NODE"; payload: Node<FlowNodeData> }
  | {
      type: "UPDATE_NODE_DATA";
      payload: { nodeId: string; data: Partial<FlowNodeData> };
    }
  | { type: "ON_NODES_CHANGE"; payload: Parameters<OnNodesChange>[0] }
  | { type: "ON_EDGES_CHANGE"; payload: Parameters<OnEdgesChange>[0] }
  | { type: "ON_CONNECT"; payload: Connection };

const initialState: FlowState = {
  nodes: [],
  edges: [],
};

const FlowStateContext = createContext<FlowState | undefined>(undefined);
const FlowDispatchContext = createContext<React.Dispatch<Action> | undefined>(
  undefined
);

const flowReducer = (state: FlowState, action: Action): FlowState => {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;

    case "ADD_NODE": {
      // Prevent adding a category node if one with the same ID already exists
      if (
        action.payload.type === "leagueCategory" &&
        state.nodes.some((n) => n.id === action.payload.id)
      ) {
        return state;
      }
      return { ...state, nodes: [...state.nodes, action.payload] };
    }

    case "UPDATE_NODE_DATA": {
      return {
        ...state,
        nodes: state.nodes.map((node) => {
          if (node.id === action.payload.nodeId) {
            const updatedData = { ...node.data };
            const payloadData = action.payload.data; // For brevity and clarity

            switch (updatedData.type) {
              case "league_match":
                // The 'in' operator acts as a type guard.
                // It confirms 'league_match' exists on payloadData before accessing it.
                if ("league_match" in payloadData && payloadData.league_match) {
                  updatedData.league_match = {
                    ...updatedData.league_match,
                    ...payloadData.league_match, // This is now type-safe
                  };
                }
                break;

              case "league_category_round":
                if ("round" in payloadData && payloadData.round) {
                  updatedData.round = {
                    ...updatedData.round,
                    ...payloadData.round,
                  };
                }
                break;

              case "group":
                if ("group" in payloadData && payloadData.group) {
                  updatedData.group = {
                    ...updatedData.group,
                    ...payloadData.group,
                  };
                }
                break;

              case "league_category":
                if (
                  "league_category" in payloadData &&
                  payloadData.league_category
                ) {
                  updatedData.league_category = {
                    ...updatedData.league_category,
                    ...payloadData.league_category,
                  };
                }
                break;
            }

            return { ...node, data: updatedData };
          }
          return node;
        }),
      };
    }

    case "ON_NODES_CHANGE":
      return {
        ...state,
        nodes: applyNodeChanges(
          action.payload,
          state.nodes
        ) as Node<FlowNodeData>[],
      };

    case "ON_EDGES_CHANGE":
      return { ...state, edges: applyEdgeChanges(action.payload, state.edges) };

    case "ON_CONNECT":
      return { ...state, edges: addEdge(action.payload, state.edges) };

    default:
      return state;
  }
};

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(flowReducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      const savedState = await db.flowState.get(1);
      if (savedState) {
        dispatch({
          type: "SET_STATE",
          payload: { nodes: savedState.nodes, edges: savedState.edges },
        });
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (state.nodes.length > 0 || state.edges.length > 0) {
      db.flowState.put({ id: 1, nodes: state.nodes, edges: state.edges });
    }
  }, [state]);

  return (
    <FlowStateContext.Provider value={state}>
      <FlowDispatchContext.Provider value={dispatch}>
        {children}
      </FlowDispatchContext.Provider>
    </FlowStateContext.Provider>
  );
};

export const useFlowState = () => {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error("useFlowState must be used within a FlowProvider");
  }
  return context;
};

export const useFlowDispatch = () => {
  const context = useContext(FlowDispatchContext);
  if (context === undefined) {
    throw new Error("useFlowDispatch must be used within a FlowProvider");
  }
  return context;
};

import React, {
  createContext,
  useReducer,
  useContext,
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
} from "@xyflow/react";
import type { ManualMatchConfigFlowNodeData } from "@/types/manualMatchConfigTypes";

type FlowState = {
  nodes: Node<ManualMatchConfigFlowNodeData>[];
  edges: Edge[];
};

type Action =
  | {
      type: "REPLACE_NODE";
      payload: { tempId: string; newNode: Node<ManualMatchConfigFlowNodeData> };
    }
  | { type: "SET_STATE"; payload: FlowState }
  | { type: "ADD_NODE"; payload: Node<ManualMatchConfigFlowNodeData> }
  | {
      type: "UPDATE_NODE_DATA";
      payload: { nodeId: string; data: Partial<ManualMatchConfigFlowNodeData> };
    }
  | { type: "ON_NODES_CHANGE"; payload: Parameters<OnNodesChange>[0] }
  | { type: "ON_EDGES_CHANGE"; payload: Parameters<OnEdgesChange>[0] }
  | { type: "ON_CONNECT"; payload: Edge }
  | { type: "UPDATE_EDGE"; payload: { tempId: string; newEdge: Edge } };

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
            const payloadData = action.payload.data;
            switch (updatedData.type) {
              case "league_match":
                if ("league_match" in payloadData && payloadData.league_match) {
                  updatedData.league_match = {
                    ...updatedData.league_match,
                    ...payloadData.league_match,
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

    case "REPLACE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.tempId ? action.payload.newNode : node
        ),
        edges: state.edges.map((edge) => {
          if (edge.source === action.payload.tempId) {
            return { ...edge, source: action.payload.newNode.id };
          }
          if (edge.target === action.payload.tempId) {
            return { ...edge, target: action.payload.newNode.id };
          }
          return edge;
        }),
      };

    case "ON_NODES_CHANGE":
      return {
        ...state,
        nodes: applyNodeChanges(
          action.payload,
          state.nodes
        ) as Node<ManualMatchConfigFlowNodeData>[],
      };

    case "ON_EDGES_CHANGE":
      return { ...state, edges: applyEdgeChanges(action.payload, state.edges) };

    case "ON_CONNECT":
      return { ...state, edges: addEdge(action.payload, state.edges) };

    default:
      return state;
  }
};

export const ManualMatchConfigFlowProvider = ({
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

export const useFlowState = () => {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error("useFlowState must be used within a FlowProvider");
  }
  return context;
};

export const useManualMatchConfigFlowDispatch = () => {
  const context = useContext(FlowDispatchContext);
  if (context === undefined) {
    throw new Error("useFlowDispatch must be used within a FlowProvider");
  }
  return context;
};

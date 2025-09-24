import {
  createContext,
  useCallback,
  useState,
  type FC,
  type ReactNode,
  useContext,
} from "react";
import {
  type Connection,
  type Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type XYPosition,
} from "@xyflow/react";

import type { LeagueTeam } from "@/types/team";
import type {
  NodeData,
  ILeagueCategory,
  ILeagueMatch,
  ILeagueCategoryRound,
} from "@/types/manual";

interface FlowContextType {
  nodes: Node<NodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  onNodesChange: (changes: any) => void;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  leagueTeams: LeagueTeam[];
  setLeagueTeams: React.Dispatch<React.SetStateAction<LeagueTeam[]>>;
  leagueCategories: ILeagueCategory[];
  setLeagueCategories: React.Dispatch<React.SetStateAction<ILeagueCategory[]>>;
  updateMatchWithTeam: (
    matchId: string,
    teamId: string,
    role: "home" | "away"
  ) => void;
  addNode: (type: string, position: XYPosition) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const ManualFlowProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [leagueTeams, setLeagueTeams] = useState<LeagueTeam[]>([]);
  const [leagueCategories, setLeagueCategories] = useState<ILeagueCategory[]>(
    []
  );

  const addNode = useCallback(
    (nodeType: string, position: XYPosition) => {
      const newNodeId = `${nodeType}-${+new Date()}`;
      let newNodeData: NodeData;

      // Create initial data based on the node type being dropped
      switch (nodeType) {
        case "leagueCategory":
          newNodeData = {
            category: {
              league_category_id: newNodeId,
              category_name: "New Category",
              position,
            } as ILeagueCategory,
          };
          break;
        case "leagueCategoryRound":
          newNodeData = {
            round: {
              round_id: newNodeId,
              round_name: "New Round",
              position,
            } as ILeagueCategoryRound,
          };
          break;
        case "leagueMatch":
          newNodeData = {
            match: {
              league_match_id: newNodeId,
              public_league_match_id: `M-${newNodeId.slice(-4)}`,
              position,
            } as ILeagueMatch,
          };
          break;
        default:
          return;
      }

      const newNode: Node<NodeData> = {
        id: newNodeId,
        type: nodeType,
        position,
        data: newNodeData,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      setEdges((eds) => addEdge({ ...params, type: "smoothstep" }, eds));

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type !== "leagueMatch") return node;

          const currentMatchData = (node.data as { match: ILeagueMatch }).match;

          // Update the source node
          if (node.id === params.source) {
            let updatedData: Partial<ILeagueMatch> = {};
            if (params.sourceHandle?.startsWith("winner")) {
              updatedData = {
                next_match_id: params.target,
                next_match_slot: params.targetHandle,
              };
            } else if (params.sourceHandle?.startsWith("loser")) {
              updatedData = {
                loser_next_match_id: params.target,
                loser_next_match_slot: params.targetHandle,
              };
            }
            return {
              ...node,
              data: { match: { ...currentMatchData, ...updatedData } },
            };
          }

          // Update the target node
          if (node.id === params.target) {
            return {
              ...node,
              data: {
                match: {
                  ...currentMatchData,
                  previous_match_ids: [
                    ...(currentMatchData.previous_match_ids || []),
                    params.source,
                  ],
                },
              },
            };
          }

          return node;
        })
      );
    },
    [setEdges, setNodes]
  );

  const updateMatchWithTeam = useCallback(
    (matchId: string, teamId: string, role: "home" | "away") => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== matchId || node.type !== "leagueMatch") return node;

          const team = leagueTeams.find((t) => t.league_team_id === teamId);
          if (!team) return node;

          const currentData = (node.data as { match: ILeagueMatch }).match;
          return {
            ...node,
            data: {
              match: {
                ...currentData,
                [`${role}_team_id`]: teamId,
                [`${role}_team`]: team,
              },
            },
          };
        })
      );
    },
    [leagueTeams, setNodes]
  );

  return (
    <FlowContext.Provider
      value={{
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        onConnect,
        leagueTeams,
        setLeagueTeams,
        leagueCategories,
        setLeagueCategories,
        updateMatchWithTeam,
        addNode,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = (): FlowContextType => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a ManualFlowProvider");
  }
  return context;
};

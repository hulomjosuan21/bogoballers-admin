import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type Edge,
} from "@xyflow/react";
import { useFlowDispatch, useFlowState } from "@/context/FlowContext";
import type {
  FlowNode,
  GroupNodeData,
  LeagueCategoryRoundNodeData,
  LeagueMatchNodeData,
} from "@/types/manual";
import { nodeTypes } from "@/components/manual-management";
import type { LeagueMatch } from "@/types/leagueMatch";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";

function useDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const dispatch = useFlowDispatch();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const payloadString = event.dataTransfer.getData(
        "application/reactflow-node"
      );
      if (!payloadString) return;

      try {
        const payload: Omit<FlowNode, "position"> = JSON.parse(payloadString);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode: FlowNode = { ...payload, position };
        dispatch({ type: "ADD_NODE", payload: newNode });
      } catch {
        console.error("Invalid node payload dropped on canvas");
      }
    },
    [screenToFlowPosition, dispatch]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return { onDrop, onDragOver };
}

const getCascadeDeleteChanges = (
  rootNodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
) => {
  const nodesToDelete = new Set<string>([rootNodeId]);
  const edgesToDelete = new Set<string>();

  // A queue to process nodes whose children we need to find
  const queue = [rootNodeId];

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;

    const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

    for (const edge of outgoingEdges) {
      edgesToDelete.add(edge.id);

      const targetNodeId = edge.target;

      if (!nodesToDelete.has(targetNodeId)) {
        nodesToDelete.add(targetNodeId);
        queue.push(targetNodeId);
      }
    }
  }

  return { nodesToDelete, edgesToDelete };
};

export function ManualMatchingCanvas() {
  const { nodes, edges } = useFlowState();
  const dispatch = useFlowDispatch();
  const { openDialog } = useAlertDialog();
  const { onDrop, onDragOver } = useDragAndDrop();

  const onNodesChange: OnNodesChange = useCallback(
    async (changes) => {
      const categoryChange = changes.find((change) => {
        if (change.type === "remove") {
          const node = nodes.find((n) => n.id === change.id);
          return node?.type === "leagueCategory";
        }
        return false;
      });

      if (categoryChange) {
        const confirm = await openDialog({
          title: "Confirm Deletion",
          description:
            "Are you sure? This will remove all connected rounds, groups, and matches.",
        });

        if (!confirm) return;

        const { nodesToDelete, edgesToDelete } = getCascadeDeleteChanges(
          categoryChange.id,
          nodes,
          edges
        );
        const newNodes = nodes.filter((n) => !nodesToDelete.has(n.id));
        const newEdges = edges.filter((e) => !edgesToDelete.has(e.id));

        dispatch({
          type: "SET_STATE",
          payload: { nodes: newNodes, edges: newEdges },
        });

        toast.success("Category and all connected nodes were deleted.");
      } else {
        dispatch({ type: "ON_NODES_CHANGE", payload: changes });
      }
    },
    [nodes, edges, dispatch, openDialog]
  );
  const onEdgesChange: OnEdgesChange = (changes) =>
    dispatch({ type: "ON_EDGES_CHANGE", payload: changes });

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      dispatch({ type: "ON_CONNECT", payload: connection });

      const { source, sourceHandle, target } = connection;
      if (!source || !target) return;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);

      if (!sourceNode || !targetNode) return;

      if (
        sourceNode.type === "leagueCategory" &&
        targetNode.type === "leagueCategoryRound" &&
        targetNode.data.type === "league_category_round" &&
        sourceHandle
      ) {
        let round_order = -1;
        if (sourceHandle === "elimination") round_order = 0;
        if (sourceHandle === "quarterfinal") round_order = 1;
        if (sourceHandle === "semifinal") round_order = 2;
        if (sourceHandle === "final") round_order = 3;

        const roundUpdateData: Partial<LeagueCategoryRoundNodeData> = {
          round: { league_category_id: source, round_order },
        };

        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: { nodeId: target, data: roundUpdateData },
        });
      }

      if (
        sourceNode.type === "leagueCategoryRound" &&
        targetNode.type === "group" &&
        sourceNode.data.type === "league_category_round"
      ) {
        const groupUpdateData: Partial<GroupNodeData> = {
          group: { round_id: sourceNode.data.round.round_id },
        };

        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: { nodeId: target, data: groupUpdateData },
        });
      }

      if (
        sourceNode.type === "group" &&
        targetNode.type === "leagueMatch" &&
        sourceNode.data.type === "group"
      ) {
        const roundIdFromGroup = sourceNode.data.group.round_id;
        const parentRoundNode = nodes.find((n) => n.id === roundIdFromGroup);

        if (
          parentRoundNode &&
          parentRoundNode.data.type === "league_category_round"
        ) {
          const groupName = sourceNode.data.group.display_name;
          const existingMatchesCount = edges.filter(
            (edge) => edge.source === sourceNode.id
          ).length;
          const newDisplayName = `${groupName} - Match ${
            existingMatchesCount + 1
          }`;

          const matchUpdateData: Partial<LeagueMatchNodeData> = {
            league_match: {
              round_id: sourceNode.data.group.round_id,
              league_category_id: parentRoundNode.data.round.league_category_id,
              display_name: newDisplayName,
            },
          };

          dispatch({
            type: "UPDATE_NODE_DATA",
            payload: { nodeId: target, data: matchUpdateData },
          });
        }
      }

      if (
        sourceNode.type === "leagueMatch" &&
        targetNode.type === "leagueMatch" &&
        sourceNode.data.type === "league_match" &&
        targetNode.data.type === "league_match" &&
        sourceHandle
      ) {
        const isWinnerProgression = sourceHandle.startsWith("winner-");

        const updatedSourceMatch: Partial<LeagueMatch> = isWinnerProgression
          ? { next_match_id: target }
          : { loser_next_match_id: target };
        const sourceUpdateData: Partial<LeagueMatchNodeData> = {
          league_match: updatedSourceMatch,
        };
        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: { nodeId: source, data: sourceUpdateData },
        });

        const updatedTargetMatch: Partial<LeagueMatch> = {
          depends_on_match_ids: [
            ...(targetNode.data.league_match.depends_on_match_ids || []),
            source,
          ],
        };
        const targetUpdateData: Partial<LeagueMatchNodeData> = {
          league_match: updatedTargetMatch,
        };
        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: { nodeId: target, data: targetUpdateData },
        });
      }
    },
    [dispatch, nodes, edges]
  );

  return (
    <div className="h-full border rounded-md w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

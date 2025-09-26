import React, { useCallback, useEffect } from "react";
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
  type Node,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { useFlowDispatch, useFlowState } from "@/context/FlowContext";
import type { FlowNode } from "@/types/manual";
import { nodeTypes } from "@/components/manual-management";
import type { LeagueMatch } from "@/types/leagueMatch";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";
import { manualLeagueService } from "@/service/manualLeagueManagementService";
import { useActiveLeague } from "@/hooks/useActiveLeague";

const getCategoryIdFromNode = (node: FlowNode): string | null => {
  if (node.type === "leagueCategory") {
    return node.id;
  }
  if (node.data.type === "league_category_round") {
    return node.data.round.league_category_id || null;
  }
  if (node.data.type === "group") {
    return node.data.group.league_category_id || null;
  }
  if (node.data.type === "league_match") {
    return node.data.league_match.league_category_id || null;
  }
  return null;
};

const getCascadeDeleteChanges = (rootNodeId: string, edges: Edge[]) => {
  const nodesToDelete = new Set<string>([rootNodeId]);
  const edgesToDelete = new Set<string>();
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
        const newNode: FlowNode = {
          ...payload,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
        };
        dispatch({ type: "ADD_NODE", payload: newNode });
      } catch (error) {
        console.error("Invalid node payload dropped on canvas", error);
        toast.error("Could not add node to canvas.");
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

export function ManualMatchingCanvas() {
  const { activeLeagueId } = useActiveLeague();
  const { nodes, edges } = useFlowState();
  const dispatch = useFlowDispatch();
  const { openDialog } = useAlertDialog();
  const { onDrop, onDragOver } = useDragAndDrop();

  useEffect(() => {
    if (!activeLeagueId) return;

    const loadInitialState = async () => {
      try {
        toast.info("Loading league layout...");
        const initialState = await manualLeagueService.getFlowState(
          activeLeagueId
        );
        if (initialState.nodes && initialState.edges) {
          dispatch({ type: "SET_STATE", payload: initialState });
          toast.success("League layout loaded successfully!");
        }
      } catch (error) {
        toast.error("Failed to load league layout from the database.");
        console.error("Failed to fetch flow state:", error);
      }
    };

    loadInitialState();
  }, [activeLeagueId, dispatch]);

  const onNodeDragStop: (event: React.MouseEvent, node: Node) => void =
    useCallback(async (_event, node) => {
      const permanentIdPrefixes = [
        "league-category-",
        "lround-",
        "lgroup-",
        "lmatch-",
      ];
      const isPermanentNode = permanentIdPrefixes.some((prefix) =>
        node.id.startsWith(prefix)
      );
      if (!isPermanentNode) return;

      try {
        await manualLeagueService.updateNodePosition(
          node.type!,
          node.id,
          node.position
        );
      } catch (error) {
        toast.error("Failed to save new position.");
        console.error(error);
      }
    }, []);

  const onNodesChange: OnNodesChange = useCallback(
    async (changes) => {
      const changesToDispatch: NodeChange[] = [];
      for (const change of changes) {
        if (change.type === "remove") {
          const nodeToRemove = nodes.find((n) => n.id === change.id);
          if (nodeToRemove?.type === "leagueCategory") {
            const confirm = await openDialog({
              title: "Confirm Deletion",
              description:
                "Are you sure? This will delete all connected children from the database.",
            });
            if (!confirm) {
              toast.info("Deletion cancelled.");
              return;
            }
            try {
              await manualLeagueService.resetCategoryLayout(change.id);
              const { nodesToDelete, edgesToDelete } = getCascadeDeleteChanges(
                change.id,
                edges
              );
              const newNodes = nodes.filter((n) => !nodesToDelete.has(n.id));
              const newEdges = edges.filter((e) => !edgesToDelete.has(e.id));
              dispatch({
                type: "SET_STATE",
                payload: { nodes: newNodes, edges: newEdges },
              });
              toast.success("Category and all children deleted.");
            } catch (error) {
              toast.error("Failed to delete category.");
            }
          } else if (nodeToRemove) {
            try {
              await manualLeagueService.deleteSingleNode(
                nodeToRemove.type!,
                nodeToRemove.id
              );
              changesToDispatch.push(change);
              toast.success("Node deleted.");
            } catch (error) {
              toast.error("Failed to delete node.");
            }
          }
        } else {
          changesToDispatch.push(change);
        }
      }
      if (changesToDispatch.length > 0) {
        dispatch({ type: "ON_NODES_CHANGE", payload: changesToDispatch });
      }
    },
    [nodes, edges, dispatch, openDialog]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    async (changes) => {
      const changesToDispatch: EdgeChange[] = [];
      for (const change of changes) {
        if (change.type === "remove") {
          try {
            await manualLeagueService.deleteEdge(change.id);
            toast.success("Connection deleted.");
            changesToDispatch.push(change);
          } catch (error) {
            toast.error("Failed to delete connection.");
          }
        } else {
          changesToDispatch.push(change);
        }
      }
      if (changesToDispatch.length > 0) {
        dispatch({ type: "ON_EDGES_CHANGE", payload: changesToDispatch });
      }
    },
    [dispatch]
  );

  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      const { source, sourceHandle, target, targetHandle } = connection;
      if (!source || !target) return;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return;

      let isValid = false;
      const sourceType = sourceNode.type;
      const targetType = targetNode.type;

      if (
        sourceType === "leagueCategory" &&
        targetType === "leagueCategoryRound"
      )
        isValid = true;
      else if (sourceType === "leagueCategoryRound" && targetType === "group")
        isValid = true;
      else if (sourceType === "group" && targetType === "leagueMatch")
        isValid = true;
      else if (sourceType === "leagueMatch" && targetType === "leagueMatch")
        isValid = true;

      if (!isValid) {
        toast.error(
          `Invalid Connection: A ${sourceType} cannot be connected to a ${targetType}.`
        );
        return;
      }

      if (!activeLeagueId) {
        toast.error("Active league not found.");
        return;
      }
      const leagueId = activeLeagueId;
      const categoryId = getCategoryIdFromNode(sourceNode);

      if (!categoryId) {
        toast.error(
          "Could not determine the category for this connection. Ensure the source node is properly connected."
        );
        return;
      }

      const tempEdgeId = `temp-edge-${Math.random()}`;
      dispatch({
        type: "ON_CONNECT",
        payload: { ...connection, id: tempEdgeId },
      });

      try {
        const permanentEdge = await manualLeagueService.createEdge({
          league_id: leagueId,
          league_category_id: categoryId,
          source,
          target,
          sourceHandle,
          targetHandle,
        });

        dispatch({
          type: "UPDATE_EDGE",
          payload: { tempId: tempEdgeId, newEdge: permanentEdge },
        });
        toast.success("Connection saved.");

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
          if (sourceHandle === "final") round_order = 99;

          const isNewNode = !targetNode.id.startsWith("lround-");
          if (isNewNode) {
            const newRoundFromServer = await manualLeagueService.createRound({
              league_category_id: source,
              round_name: targetNode.data.league_category_round,
              round_order: round_order,
              position: targetNode.position,
            });
            const finalNode: FlowNode = {
              ...targetNode,
              id: newRoundFromServer.round_id,
              data: { ...targetNode.data, round: newRoundFromServer },
            };
            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: targetNode.id, newNode: finalNode },
            });
            toast.success("New Round created.");
          } else {
            // Here you would call an 'updateRound' service if you need to update an existing round
          }
        } else if (
          sourceNode.type === "leagueCategoryRound" &&
          targetNode.type === "group" &&
          sourceNode.data.type === "league_category_round" &&
          targetNode.data.type === "group"
        ) {
          const isNewNode = !targetNode.id.startsWith("lgroup-");
          const dataForGroup = {
            round_id: sourceNode.id,
            league_category_id: sourceNode.data.round.league_category_id!,
            display_name: targetNode.data.group.display_name!,
            position: targetNode.position,
          };

          if (isNewNode) {
            const newGroupFromServer = await manualLeagueService.createGroup(
              dataForGroup
            );
            const finalNode: FlowNode = {
              ...targetNode,
              id: newGroupFromServer.group_id,
              data: { ...targetNode.data, group: newGroupFromServer },
            };
            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: targetNode.id, newNode: finalNode },
            });
            toast.success("New Group created.");
          } else {
            await manualLeagueService.updateGroup(targetNode.id, dataForGroup);
            dispatch({
              type: "UPDATE_NODE_DATA",
              payload: { nodeId: targetNode.id, data: { group: dataForGroup } },
            });
            toast.info("Group reconnected.");
          }
        } else if (
          sourceNode.type === "group" &&
          targetNode.type === "leagueMatch" &&
          sourceNode.data.type === "group"
        ) {
          const isNewNode = !targetNode.id.startsWith("lmatch-");

          if (isNewNode && targetNode.data.type === "league_match") {
            const roundIdFromGroup = sourceNode.data.group.round_id;
            if (!roundIdFromGroup) {
              toast.error("Parent group must be connected to a round first.");
              dispatch({
                type: "ON_EDGES_CHANGE",
                payload: [
                  {
                    id: connection.source + "-" + connection.target,
                    type: "remove",
                  },
                ],
              });
              return;
            }

            const categoryIdFromGroup =
              sourceNode.data.group.league_category_id;
            if (!categoryIdFromGroup) {
              toast.error(
                "Parent group is not correctly linked to a category."
              );
              dispatch({
                type: "ON_EDGES_CHANGE",
                payload: [
                  {
                    id: connection.source + "-" + connection.target,
                    type: "remove",
                  },
                ],
              });
              return;
            }

            const groupName = sourceNode.data.group.display_name;
            const existingMatchesCount = edges.filter(
              (edge) => edge.source === sourceNode.id
            ).length;
            const newDisplayName = `${groupName} - Match ${
              existingMatchesCount + 1
            }`;

            const newMatchFromServer =
              await manualLeagueService.createEmptyMatch({
                league_id: leagueId,
                league_category_id: categoryIdFromGroup,
                round_id: roundIdFromGroup,
                display_name: newDisplayName,
                position: targetNode.position,
              });

            const finalNode: FlowNode = {
              ...targetNode,
              id: newMatchFromServer.league_match_id,
              data: { ...targetNode.data, league_match: newMatchFromServer },
            };
            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: targetNode.id, newNode: finalNode },
            });
            toast.success(`'${newDisplayName}' created.`);
          }
        } else if (
          sourceNode.type === "leagueMatch" &&
          targetNode.type === "leagueMatch" &&
          sourceNode.data.type === "league_match" &&
          targetNode.data.type === "league_match" &&
          sourceHandle
        ) {
          const isSourcePermanent = sourceNode.id.startsWith("lmatch-");
          const isTargetPermanent = targetNode.id.startsWith("lmatch-");

          if (!isSourcePermanent || !isTargetPermanent) {
            toast.error(
              "Cannot connect matches. Both matches must be connected to a group first."
            );
            dispatch({
              type: "ON_EDGES_CHANGE",
              payload: [{ id: tempEdgeId, type: "remove" }],
            });
            return;
          }

          const isWinnerProgression = sourceHandle.startsWith("winner-");
          const updatedSourceMatch: Partial<LeagueMatch> = isWinnerProgression
            ? { next_match_id: target }
            : { loser_next_match_id: target };
          await manualLeagueService.updateMatch(source, updatedSourceMatch);
          dispatch({
            type: "UPDATE_NODE_DATA",
            payload: {
              nodeId: source,
              data: { league_match: updatedSourceMatch },
            },
          });

          const updatedTargetMatch: Partial<LeagueMatch> = {
            depends_on_match_ids: [
              ...(targetNode.data.league_match.depends_on_match_ids || []),
              source,
            ],
          };
          await manualLeagueService.updateMatch(target, updatedTargetMatch);
          dispatch({
            type: "UPDATE_NODE_DATA",
            payload: {
              nodeId: target,
              data: { league_match: updatedTargetMatch },
            },
          });
          toast.success("Match progression saved.");
        }
      } catch (error) {
        toast.error("Failed to process connection.");
        dispatch({
          type: "ON_EDGES_CHANGE",
          payload: [{ id: tempEdgeId, type: "remove" }],
        });
      }
    },
    [dispatch, nodes, edges, activeLeagueId]
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
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

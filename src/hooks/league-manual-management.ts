import React, { useCallback, useEffect, useRef } from "react";
import {
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
import type { LeagueMatch } from "@/types/leagueMatch";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";
import { manualLeagueService } from "@/service/manualLeagueManagementService";
import { useActiveLeague } from "@/hooks/useActiveLeague";

export const getCategoryIdFromNode = (node: FlowNode): string | null => {
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

export function useDragAndDrop() {
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

export function useManageManualNodeManagement() {
  const { activeLeagueId } = useActiveLeague();
  const { nodes, edges } = useFlowState();
  const dispatch = useFlowDispatch();
  const { openDialog } = useAlertDialog();
  const { onDrop, onDragOver } = useDragAndDrop();

  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

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
          if (!change.id.startsWith("temp-edge-")) {
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
      const currentNodes = nodesRef.current;
      const { source, sourceHandle, target, targetHandle } = connection;
      if (!source || !target) return;

      const sourceNode = currentNodes.find((n) => n.id === source);
      const targetNode = currentNodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode || !activeLeagueId) {
        toast.error("A required node or the active league could not be found.");
        return;
      }

      let isValid = false;
      const sourceType = sourceNode.type;
      const targetType = targetNode.type;

      if (
        sourceType === "leagueCategory" &&
        targetType === "leagueCategoryRound"
      ) {
        isValid = true;
      } else if (
        sourceType === "leagueCategoryRound" &&
        targetType === "group"
      ) {
        isValid = true;
      } else if (sourceType === "group" && targetType === "leagueMatch") {
        isValid = true;
      } else if (
        sourceType === "leagueCategoryRound" &&
        targetType === "leagueMatch"
      ) {
        isValid = true;
      } else if (sourceType === "leagueMatch" && targetType === "leagueMatch") {
        isValid = true;
      }

      if (!isValid) {
        toast.error(
          `Invalid Connection: A ${sourceType} cannot be connected to a ${targetType}.`
        );
        return;
      }

      const leagueId = activeLeagueId;
      const categoryId = getCategoryIdFromNode(sourceNode);
      if (!categoryId) {
        toast.error("Could not determine the category for this connection.");
        return;
      }

      const countMatches = (roundId: string, groupId?: string) => {
        const matches = nodesRef.current.filter(
          (n) =>
            n.data.type === "league_match" &&
            n.data.league_match.round_id === roundId &&
            (groupId
              ? n.data.league_match.group_id === groupId
              : !n.data.league_match.group_id)
        );
        return matches.length + 1;
      };

      const permanentPrefixes = [
        "league-category-",
        "lround-",
        "lgroup-",
        "lmatch-",
      ];
      const isIdPermanent = (id: string) =>
        permanentPrefixes.some((p) => id.startsWith(p));

      const sourcePermanent = isIdPermanent(source);
      const targetPermanent = isIdPermanent(target);

      const tempEdgeId = `temp-edge-${Math.random()}`;
      dispatch({
        type: "ON_CONNECT",
        payload: { ...connection, id: tempEdgeId },
      });

      const createAndReplaceEdge = async (
        finalSource: string,
        finalTarget: string
      ) => {
        try {
          const permanentEdge = await manualLeagueService.createEdge({
            league_id: leagueId,
            league_category_id: categoryId,
            source: finalSource,
            target: finalTarget,
            sourceHandle,
            targetHandle,
          });
          dispatch({
            type: "UPDATE_EDGE",
            payload: { tempId: tempEdgeId, newEdge: permanentEdge },
          });
        } catch (err) {
          toast.error("Failed to save connection to server.");
          dispatch({
            type: "ON_EDGES_CHANGE",
            payload: [{ id: tempEdgeId, type: "remove" }],
          });
          throw err;
        }
      };

      try {
        // Category -> Round
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

          const isNewNode = !targetNode.id.startsWith("lround-");
          if (isNewNode) {
            const newRoundFromServer = await manualLeagueService.createRound({
              league_category_id: source,
              round_name: targetNode.data.league_category_round,
              round_order,
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

            const otherNodes = nodesRef.current.filter(
              (n) => n.id !== targetNode.id
            );
            nodesRef.current = [...otherNodes, finalNode];

            toast.success("New Round created.");
            await createAndReplaceEdge(source, newRoundFromServer.round_id);
          }
        }
        // Round -> Group
        else if (
          sourceNode.type === "leagueCategoryRound" &&
          targetNode.type === "group" &&
          sourceNode.data.type === "league_category_round" &&
          targetNode.data.type === "group"
        ) {
          const categoryIdFromRound = sourceNode.data.round.league_category_id;
          const isNewNode = !targetNode.id.startsWith("lgroup-");
          const roundName = sourceNode.data.round.round_name;
          if (!categoryIdFromRound || !roundName) {
            throw new Error("Parent Round is missing its category ID.");
          }
          const displayName = targetNode.data.group.display_name || "New Group";
          const dataForGroup = {
            round_id: sourceNode.id,
            league_category_id: categoryIdFromRound,
            round_name: roundName,
            display_name: displayName,
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

            const otherNodes = nodesRef.current.filter(
              (n) => n.id !== targetNode.id
            );
            nodesRef.current = [...otherNodes, finalNode];

            toast.success("New Group created.");
            await createAndReplaceEdge(
              sourceNode.id,
              newGroupFromServer.group_id
            );
          } else {
            await manualLeagueService.updateGroup(targetNode.id, dataForGroup);
            dispatch({
              type: "UPDATE_NODE_DATA",
              payload: { nodeId: targetNode.id, data: { group: dataForGroup } },
            });
            toast.info("Group reconnected.");

            if (!sourcePermanent || !targetPermanent) {
              await createAndReplaceEdge(sourceNode.id, targetNode.id);
            }
          }
        }
        // Group -> Match
        else if (
          sourceNode.type === "group" &&
          targetNode.type === "leagueMatch" &&
          sourceNode.data.type === "group" &&
          targetNode.data.type === "league_match"
        ) {
          const isNewNode = !targetNode.id.startsWith("lmatch-");
          if (isNewNode) {
            const roundIdFromGroup = sourceNode.data.group.round_id;
            const categoryIdFromGroup =
              sourceNode.data.group.league_category_id;
            const roundNameFromGroup = sourceNode.data.group.round_name;

            if (!roundIdFromGroup || !categoryIdFromGroup) {
              throw new Error(
                "Parent group must be connected to a round first."
              );
            }

            const matchData = targetNode.data.league_match;
            let newDisplayName: string;
            if (
              matchData.is_final ||
              matchData.is_third_place ||
              matchData.is_runner_up
            ) {
              newDisplayName = matchData.display_name || "Special Match";
            } else {
              let matchType = "Match";

              if (matchData.is_elimination) {
                matchType = "Elimination Match";
              }

              const matchCount = countMatches(
                roundIdFromGroup,
                sourceNode.data.group.group_id
              );
              newDisplayName = `${roundNameFromGroup} - ${sourceNode.data.group.display_name} - ${matchType} ${matchCount}`;
            }

            const payload = {
              ...matchData,
              league_id: leagueId,
              league_category_id: categoryIdFromGroup,
              round_id: roundIdFromGroup,
              display_name: newDisplayName,
              group_id: sourceNode.data.group.group_id,
              position: targetNode.position,
            };
            const newMatchFromServer =
              await manualLeagueService.createEmptyMatch(payload);

            const finalNode: FlowNode = {
              ...targetNode,
              id: newMatchFromServer.league_match_id,
              data: { ...targetNode.data, league_match: newMatchFromServer },
            };
            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: targetNode.id, newNode: finalNode },
            });

            const otherNodes = nodesRef.current.filter(
              (n) => n.id !== targetNode.id
            );
            nodesRef.current = [...otherNodes, finalNode];

            toast.success(`'${newDisplayName}' created.`);

            await createAndReplaceEdge(
              sourceNode.id,
              newMatchFromServer.league_match_id
            );
          } else {
            if (!sourcePermanent || !targetPermanent) {
              await createAndReplaceEdge(sourceNode.id, targetNode.id);
            }
          }
        }
        // Round -> Match
        else if (
          sourceNode.type === "leagueCategoryRound" &&
          targetNode.type === "leagueMatch" &&
          sourceNode.data.type === "league_category_round" &&
          targetNode.data.type === "league_match"
        ) {
          const isNewNode = !targetNode.id.startsWith("lmatch-");
          if (isNewNode) {
            const { round_id, round_name, league_category_id } =
              sourceNode.data.round;

            const matchData = targetNode.data.league_match;
            let newDisplayName: string;
            if (
              matchData.is_final ||
              matchData.is_third_place ||
              matchData.is_runner_up
            ) {
              newDisplayName = matchData.display_name || "Special Match";
            } else {
              let matchType = "Match";

              if (matchData.is_elimination) {
                matchType = "Elimination Match";
              }

              const matchCount = countMatches(round_id!);
              newDisplayName = `${round_name} - ${matchType} ${matchCount}`;
            }

            const payload = {
              ...matchData,
              league_id: leagueId,
              league_category_id: league_category_id!,
              round_id: round_id!,
              display_name: newDisplayName,
              position: targetNode.position,
            };
            const newMatchFromServer =
              await manualLeagueService.createEmptyMatch(payload);

            const finalNode: FlowNode = {
              ...targetNode,
              id: newMatchFromServer.league_match_id,
              data: { ...targetNode.data, league_match: newMatchFromServer },
            };
            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: targetNode.id, newNode: finalNode },
            });

            const otherNodes = nodesRef.current.filter(
              (n) => n.id !== targetNode.id
            );
            nodesRef.current = [...otherNodes, finalNode];

            toast.success(`'${newDisplayName}' created.`);

            await createAndReplaceEdge(sourceNode.id, finalNode.id);
          }
        }
        // Match -> Match
        if (
          sourceNode.type === "leagueMatch" &&
          targetNode.type === "leagueMatch" &&
          sourceNode.data.type === "league_match" &&
          targetNode.data.type === "league_match" &&
          sourceHandle
        ) {
          const isNewNode = !targetNode.id.startsWith("lmatch-");

          if (isNewNode) {
            const parentMatchData = sourceNode.data.league_match;
            if (!parentMatchData.round_id) {
              throw new Error("Parent match is missing its round_id.");
            }

            const parentGroupNode = parentMatchData.group_id
              ? currentNodes.find((n) => n.id === parentMatchData.group_id)
              : undefined;

            const parentRoundNode = currentNodes.find(
              (n) =>
                n.id === parentMatchData.round_id &&
                n.data?.type === "league_category_round"
            );

            let roundName;
            if (
              parentRoundNode?.data?.type === "league_category_round" &&
              parentRoundNode.data.round
            ) {
              roundName = parentRoundNode.data.round.round_name;
            }

            let parentGroup;
            if (
              parentGroupNode?.data?.type === "group" &&
              parentGroupNode.data.group
            ) {
              parentGroup = parentGroupNode.data.group;
            }

            const matchData = targetNode.data.league_match;

            let newDisplayName: string;
            if (
              matchData.is_final ||
              matchData.is_third_place ||
              matchData.is_runner_up
            ) {
              newDisplayName = matchData.display_name || "Special Match";
            } else {
              let matchType = "Match";
              if (matchData.is_elimination) {
                matchType = "Elimination Match";
              }

              const matchCount = countMatches(
                parentMatchData.round_id,
                parentGroup?.group_id
              );

              if (parentGroup?.display_name && parentGroupNode) {
                newDisplayName = `${roundName} - ${parentGroup.display_name} - ${matchType} ${matchCount}`;
              } else {
                newDisplayName = `${roundName} - ${matchType} ${matchCount}`;
              }
            }

            const payload = {
              ...matchData,
              league_id: parentMatchData.league_id!,
              league_category_id: parentMatchData.league_category_id!,
              round_id: parentMatchData.round_id,
              display_name: newDisplayName,
              position: targetNode.position,
              group_id: parentGroup?.group_id,
            };

            const newMatchFromServer =
              await manualLeagueService.createEmptyMatch(payload);

            const finalNode: FlowNode = {
              ...targetNode,
              id: newMatchFromServer.league_match_id,
              data: { ...targetNode.data, league_match: newMatchFromServer },
            };
            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: targetNode.id, newNode: finalNode },
            });

            const otherNodes = nodesRef.current.filter(
              (n) => n.id !== targetNode.id
            );
            nodesRef.current = [...otherNodes, finalNode];

            toast.success(`'${newDisplayName}' created.`);

            await createAndReplaceEdge(sourceNode.id, finalNode.id);

            // progression update
            const isWinnerProgression = sourceHandle.startsWith("winner-");
            const updatedSourceMatch: Partial<LeagueMatch> = isWinnerProgression
              ? { next_match_id: finalNode.id }
              : { loser_next_match_id: finalNode.id };

            await manualLeagueService.updateMatch(
              sourceNode.id,
              updatedSourceMatch
            );
            dispatch({
              type: "UPDATE_NODE_DATA",
              payload: {
                nodeId: sourceNode.id,
                data: { league_match: updatedSourceMatch },
              },
            });

            const updatedTargetMatch: Partial<LeagueMatch> = {
              depends_on_match_ids: [sourceNode.id],
            };
            await manualLeagueService.updateMatch(
              finalNode.id,
              updatedTargetMatch
            );
            dispatch({
              type: "UPDATE_NODE_DATA",
              payload: {
                nodeId: finalNode.id,
                data: { league_match: updatedTargetMatch },
              },
            });
          } else {
            await createAndReplaceEdge(sourceNode.id, targetNode.id);

            const isWinnerProgression = sourceHandle.startsWith("winner-");
            const updatedSourceMatch: Partial<LeagueMatch> = isWinnerProgression
              ? { next_match_id: targetNode.id }
              : { loser_next_match_id: targetNode.id };

            await manualLeagueService.updateMatch(
              sourceNode.id,
              updatedSourceMatch
            );
            dispatch({
              type: "UPDATE_NODE_DATA",
              payload: {
                nodeId: sourceNode.id,
                data: { league_match: updatedSourceMatch },
              },
            });

            const updatedTargetMatch: Partial<LeagueMatch> = {
              depends_on_match_ids: [
                ...(targetNode.data.league_match.depends_on_match_ids || []),
                sourceNode.id,
              ],
            };
            await manualLeagueService.updateMatch(
              targetNode.id,
              updatedTargetMatch
            );
            dispatch({
              type: "UPDATE_NODE_DATA",
              payload: {
                nodeId: targetNode.id,
                data: { league_match: updatedTargetMatch },
              },
            });
          }
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "Failed to process connection."
        );
        dispatch({
          type: "ON_EDGES_CHANGE",
          payload: [{ id: tempEdgeId, type: "remove" }],
        });
        console.error(error);
      }
    },
    [dispatch, activeLeagueId]
  );
  return {
    nodes,
    edges,
    onNodeDragStop,
    onConnect,
    onEdgesChange,
    onNodesChange,
    onDrop,
    onDragOver,
  };
}

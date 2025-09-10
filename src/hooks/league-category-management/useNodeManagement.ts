import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import {
  getRoundOrder,
  isValidOrderTransition,
  RoundStateEnum,
  RoundTypeEnum,
  type FormatNodeData,
  type LeagueCategory,
  type LeagueCategoryRound,
  type LeagueRoundFormat,
  type NodeData,
  type RoundFormatTypesEnum,
  type RoundNodeData,
} from "@/types/leagueCategoryTypes";
import { generateUUIDWithPrefix } from "@/lib/app_utils";
import { getPredefinedFormatConfigs } from "@/constants/getPredefinedFormatConfigs";
export const CATEGORY_WIDTH = 1280;
export const CATEGORY_HEIGHT = 720;
export const STATUSES: Record<RoundTypeEnum, RoundStateEnum> = {
  [RoundTypeEnum.Elimination]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.QuarterFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.SemiFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.Final]: RoundStateEnum.Upcoming,
};

interface UseNodeManagementProps {
  categories?: LeagueCategory[] | null;
  viewOnly?: boolean;
  nTeams: number;
}

export function useNodeManagement({
  nTeams,
  categories,
  viewOnly = false,
}: UseNodeManagementProps) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [deletedNodeIds, setDeletedNodeIds] = useState<Set<string>>(new Set());
  const [selectedNodes, setSelectedNodes] = useState<Node<NodeData>[]>([]);
  const originalNodesRef = useRef<Node<NodeData>[]>([]);
  const initialNodesRef = useRef<Node<NodeData>[]>([]);
  const categoriesRef = useRef<LeagueCategory[]>([]);
  const initializeFromCategories = useCallback(() => {
    if (!categories) return;

    categoriesRef.current = categories;

    const newNodes: Node<NodeData>[] = [];
    const newEdges: Edge[] = [];

    categories.forEach((cat, catIndex) => {
      newNodes.push({
        id: cat.league_category_id,
        type: "categoryNode",
        position: { x: 50, y: catIndex * 800 },
        data: { category: cat, viewOnly: viewOnly },
        draggable: false,
        selectable: true,
      });

      cat.rounds.forEach((round) => {
        const pos = round.position ?? { x: 100, y: 100 };
        newNodes.push({
          id: round.round_id,
          type: "roundNode",
          parentId: cat.league_category_id,
          extent: "parent",
          draggable: !viewOnly,
          position: pos,
          data: {
            round,
            _isNew: false,
            viewOnly: viewOnly,
          } satisfies RoundNodeData,
        });

        if (round.next_round_id) {
          const targetRound = cat.rounds.find(
            (r) => r.round_id === round.next_round_id
          );
          if (targetRound) {
            const targetHasLeft = targetRound.round_order > 0;

            newEdges.push({
              id: `edge-${round.round_id}-${targetRound.round_id}`,
              source: round.round_id,
              sourceHandle: "right",
              target: targetRound.round_id,
              targetHandle: targetHasLeft ? "left" : undefined,
            });
          }
        }

        if (round.round_format) {
          const formatNodeId = `format-${round.round_id}`;
          newNodes.push({
            id: formatNodeId,
            type: "formatNode",
            parentId: cat.league_category_id,
            extent: "parent",
            draggable: !viewOnly,
            position: round.round_format.position ?? {
              x: pos.x,
              y: pos.y + 120,
            },
            data: {
              label: round.round_format.format_type,
              round_format: round.round_format,
              round_id: round.round_id,
              format_config: round.format_config,
            } satisfies FormatNodeData,
          });

          newEdges.push({
            id: `edge-${round.round_id}-${formatNodeId}`,
            source: round.round_id,
            sourceHandle: "bottom",
            target: formatNodeId,
            targetHandle: "top",
          });
        }
      });
    });

    originalNodesRef.current = [...newNodes];
    initialNodesRef.current = [...newNodes];
    setNodes(newNodes);
    setEdges(newEdges);
    setDeletedNodeIds(new Set());
  }, [categories, viewOnly]);
  const getChangedNodes = useCallback(() => {
    const changed: Node<NodeData>[] = [];

    nodes.forEach((currentNode) => {
      if (currentNode.type === "categoryNode") return;

      const initialNode = initialNodesRef.current.find(
        (n) => n.id === currentNode.id
      );

      if (!initialNode) {
        changed.push(currentNode);
        return;
      }

      const hasPositionChange =
        currentNode.position.x !== initialNode.position.x ||
        currentNode.position.y !== initialNode.position.y;

      if (currentNode.type === "roundNode") {
        const currentRound = (currentNode.data as RoundNodeData)?.round;
        const initialRound = (initialNode.data as RoundNodeData)?.round;

        const hasRoundDataChange =
          currentRound &&
          initialRound &&
          (currentRound.round_status !== initialRound.round_status ||
            JSON.stringify(currentRound.round_format) !==
              JSON.stringify(initialRound.round_format) ||
            currentRound.next_round_id !== initialRound.next_round_id);

        if (hasPositionChange || hasRoundDataChange) {
          changed.push(currentNode);
        }
      } else if (currentNode.type === "formatNode") {
        if (hasPositionChange) {
          changed.push(currentNode);
        }
      }
    });

    return changed;
  }, [nodes]);
  const getDeletedNodes = useCallback(() => {
    return initialNodesRef.current.filter(
      (node) =>
        deletedNodeIds.has(node.id) &&
        (node.type === "roundNode" || node.type === "formatNode")
    );
  }, [deletedNodeIds]);
  const findCategoryRounds = useCallback(
    (categoryId: string) => {
      return nodes.filter(
        (n) => n.type === "roundNode" && n.parentId === categoryId
      );
    },
    [nodes]
  );
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (viewOnly) return;

      const removeChanges = changes.filter(
        (change) => change.type === "remove"
      );

      if (removeChanges.length > 0) {
        const removedNodeIds = removeChanges.map((change) => change.id);
        const nodesToDelete = nodes.filter((node) =>
          removedNodeIds.includes(node.id)
        );

        const deletableNodes = nodesToDelete.filter(
          (node) => node.type === "roundNode" || node.type === "formatNode"
        );

        if (deletableNodes.length === 0) {
          setNodes((nds) => applyNodeChanges(changes, nds) as Node<NodeData>[]);
          return;
        }

        setDeletedNodeIds((prev) => {
          const newSet = new Set(prev);
          deletableNodes.forEach((node) => {
            if (
              node.type === "roundNode" &&
              !(node.data as RoundNodeData)._isNew
            ) {
              newSet.add(node.id);
            } else if (
              node.type === "formatNode" &&
              !(node.data as FormatNodeData)._isNew
            ) {
              newSet.add(node.id);
            }
          });
          return newSet;
        });

        setNodes((nds) => {
          let updatedNodes = applyNodeChanges(changes, nds) as Node<NodeData>[];

          const formatNodesToDelete = deletableNodes.filter(
            (n) => n.type === "formatNode"
          );
          formatNodesToDelete.forEach((formatNode) => {
            const formatData = formatNode.data as FormatNodeData;
            if (formatData.round_id) {
              updatedNodes = updatedNodes.map((n) => {
                if (
                  n.type === "roundNode" &&
                  (n.data as RoundNodeData).round.round_id ===
                    formatData.round_id
                ) {
                  const round = (n.data as RoundNodeData).round;
                  const updatedRound = { ...round, round_format: null };
                  return {
                    ...n,
                    data: { ...n.data, round: updatedRound } as RoundNodeData,
                  };
                }
                return n;
              });
            }
          });

          return updatedNodes;
        });

        setEdges((eds) =>
          eds.filter(
            (edge) =>
              !removedNodeIds.includes(edge.source) &&
              !removedNodeIds.includes(edge.target)
          )
        );

        const newNodesCount = deletableNodes.filter((node) => {
          if (node.type === "roundNode")
            return (node.data as RoundNodeData)._isNew;
          if (node.type === "formatNode")
            return (node.data as FormatNodeData)._isNew;
          return false;
        }).length;

        const existingNodesCount = deletableNodes.length - newNodesCount;

        if (newNodesCount > 0) {
          toast.success(`Removed ${newNodesCount} new node(s) from canvas`);
        }

        if (existingNodesCount > 0) {
          toast.info(
            `Marked ${existingNodesCount} node(s) for deletion. Click "Save Changes" to delete from backend.`
          );
        }
      } else {
        setNodes((nds) => applyNodeChanges(changes, nds) as Node<NodeData>[]);
      }
    },
    [nodes, viewOnly]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (viewOnly) return;

      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);

        changes.forEach((change) => {
          if (change.type === "remove") {
            const removedEdge = eds.find((e) => e.id === change.id);
            if (removedEdge) {
              const sourceNode = nodes.find((n) => n.id === removedEdge.source);
              const targetNode = nodes.find((n) => n.id === removedEdge.target);

              if (
                sourceNode?.type === "roundNode" &&
                targetNode?.type === "roundNode"
              ) {
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.id === sourceNode.id && n.type === "roundNode") {
                      const currentRound = (n.data as RoundNodeData).round;
                      const updatedRound = {
                        ...currentRound,
                        next_round_id: null,
                      };
                      return {
                        ...n,
                        data: {
                          ...n.data,
                          round: updatedRound,
                        } as RoundNodeData,
                      };
                    }
                    return n;
                  })
                );
              }

              if (
                sourceNode?.type === "roundNode" &&
                targetNode?.type === "formatNode"
              ) {
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.id === sourceNode.id && n.type === "roundNode") {
                      const currentRound = (n.data as RoundNodeData).round;
                      const updatedRound = {
                        ...currentRound,
                        round_format: null,
                      };
                      return {
                        ...n,
                        data: {
                          ...n.data,
                          round: updatedRound,
                        } as RoundNodeData,
                      };
                    }
                    if (n.id === targetNode.id && n.type === "formatNode") {
                      return {
                        ...n,
                        data: {
                          ...n.data,
                          round_id: undefined,
                          round_format: undefined,
                        } as FormatNodeData,
                      };
                    }
                    return n;
                  })
                );
              }
            }
          }
        });

        return newEdges;
      });
    },
    [nodes, viewOnly]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (viewOnly) return;

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (
        sourceNode?.type === "roundNode" &&
        targetNode?.type === "formatNode" &&
        connection.sourceHandle === "bottom" &&
        connection.targetHandle === "top"
      ) {
        const round = (sourceNode.data as RoundNodeData).round;
        const formatLabel = (targetNode.data as FormatNodeData).label;
        const formatVariant = (targetNode.data as FormatNodeData).variant;
        const roundOrder = round.round_order;
        const rountStatus = round.round_status;

        const roundFormat: LeagueRoundFormat = {
          format_type: formatLabel as RoundFormatTypesEnum,
          pairing_method: "random",
          round_id: round.round_id,
          position: targetNode.position,
          format_config: null,
        };

        const presets = getPredefinedFormatConfigs(nTeams);
        const defaultPreset = presets.find(
          (preset) => preset.variant === formatVariant
        );
        const defaultConfig = defaultPreset?.format_config ?? null;

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === sourceNode.id && n.type === "roundNode") {
              const updatedRound = {
                ...round,
                round_format: {
                  round_order: roundOrder,
                  round_status: rountStatus,
                  ...roundFormat,
                  format_config: {
                    label: defaultPreset?.label,
                    ...defaultConfig,
                  },
                },
              };
              return {
                ...n,
                data: { ...n.data, round: updatedRound } as RoundNodeData,
              };
            }
            if (n.id === targetNode.id && n.type === "formatNode") {
              return {
                ...n,
                data: {
                  ...n.data,
                  round_format: {
                    ...roundFormat,
                    format_config: defaultConfig,
                  },
                  round_id: round.round_id,
                  format_config: defaultConfig,
                } as FormatNodeData,
              };
            }
            return n;
          })
        );

        setEdges((eds) => addEdge(connection, eds));

        toast.success(
          `Format '${formatLabel}' assigned to ${round.round_name} (unsaved)`
        );
        return;
      }

      if (sourceNode?.type === "formatNode") {
        toast.error("Format nodes cannot be sources of connections.");
        return;
      }

      if (
        sourceNode?.type === "roundNode" &&
        targetNode?.type === "roundNode"
      ) {
        const sRound = (sourceNode.data as RoundNodeData).round;
        const tRound = (targetNode.data as RoundNodeData).round;
        const categoryId = sourceNode.parentId as string;

        const hasQuarterFinal = findCategoryRounds(categoryId).some(
          (rn) => (rn.data as RoundNodeData).round.round_order === 1
        );

        if (
          !isValidOrderTransition(sRound.round_order, tRound.round_order, {
            categoryHasQuarterFinal: hasQuarterFinal,
          })
        ) {
          toast.error("Invalid connection for round order.");
          return;
        }

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === sourceNode.id && n.type === "roundNode") {
              const currentRound = (n.data as RoundNodeData).round;
              const updatedRound = {
                ...currentRound,
                next_round_id: tRound.round_id,
              };
              return {
                ...n,
                data: {
                  ...n.data,
                  round: updatedRound,
                } as RoundNodeData,
              };
            }
            return n;
          })
        );

        setEdges((eds) => addEdge(connection, eds));

        toast.success(
          `${sRound.round_name} connected to ${tRound.round_name} (unsaved)`
        );
        return;
      }

      toast.error("Invalid connection.");
    },
    [nodes, findCategoryRounds, viewOnly]
  );

  const onNodeDragStop = useCallback(
    (_e: React.MouseEvent, node: Node<NodeData>) => {
      if (viewOnly || node.type === "categoryNode") return;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            if (node.type === "roundNode") {
              const round = { ...(n.data as RoundNodeData).round };
              round.position = { ...node.position };
              return {
                ...n,
                position: node.position,
                data: { ...n.data, round } as RoundNodeData,
              };
            }

            if (node.type === "formatNode") {
              const formatData = n.data as FormatNodeData;
              const updatedFormatData = { ...formatData };

              if (formatData.round_format) {
                updatedFormatData.round_format = {
                  ...formatData.round_format,
                  position: { ...node.position },
                };
              }

              return {
                ...n,
                position: node.position,
                data: updatedFormatData,
              };
            }
          }
          return n;
        })
      );
    },
    [viewOnly]
  );
  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Node<NodeData>[] }) => {
      if (viewOnly) return;
      setSelectedNodes(selected ?? []);
    },
    [viewOnly]
  );
  const deleteSelectedNodes = useCallback(async () => {
    if (viewOnly) return;

    const nodesToDelete = selectedNodes.filter(
      (node) => node.type === "roundNode" || node.type === "formatNode"
    );

    if (nodesToDelete.length === 0) {
      return;
    }

    const removeChanges: NodeChange[] = nodesToDelete.map((node) => ({
      type: "remove" as const,
      id: node.id,
    }));

    onNodesChange(removeChanges);
    setSelectedNodes([]);
  }, [selectedNodes, onNodesChange, viewOnly]);
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (viewOnly) return;

      event.preventDefault();

      const nodeType = event.dataTransfer.getData("node-type");
      const label = event.dataTransfer.getData("application/reactflow");
      if (!label) return;

      const mousePosition = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const targetCategory = nodes.find((node) => {
        if (node.type !== "categoryNode") return false;
        return (
          mousePosition.x >= node.position.x &&
          mousePosition.x <= node.position.x + CATEGORY_WIDTH &&
          mousePosition.y >= node.position.y &&
          mousePosition.y <= node.position.y + CATEGORY_HEIGHT
        );
      });

      if (!targetCategory) {
        toast.error("You must drop inside a category!");
        return;
      }

      if (nodeType === "round") {
        const hasDuplicate = nodes.some((n) => {
          if (n.type !== "roundNode" || n.parentId !== targetCategory.id)
            return false;
          const rd = (n.data as RoundNodeData).round;
          return rd.round_name === label;
        });
        if (hasDuplicate) {
          toast.error(`Only one ${label} round is allowed per category!`);
          return;
        }
      }

      let newNode: Node<NodeData> | null = null;
      const dropPosition = {
        x: mousePosition.x - targetCategory.position.x - 50,
        y: mousePosition.y - targetCategory.position.y - 50,
      };

      if (nodeType === "round") {
        const roundId = generateUUIDWithPrefix("round");
        const order = getRoundOrder(label as RoundTypeEnum);
        const created: LeagueCategoryRound = {
          round_id: roundId,
          category_id: targetCategory.id,
          round_name: label as RoundTypeEnum,
          round_order: order,
          round_status: STATUSES[label as RoundTypeEnum],
          round_format: null,
          format_config: null,
          position: dropPosition,
        };

        newNode = {
          id: roundId,
          type: "roundNode",
          draggable: true,
          parentId: targetCategory.id,
          extent: "parent",
          position: dropPosition,
          data: {
            round: created,
            _isNew: true,
            viewOnly: viewOnly,
          } satisfies RoundNodeData,
        };

        setNodes((prev) => prev.concat(newNode!));
      } else {
        const newNodeId = `format-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`;

        const variant = event.dataTransfer.getData("variant");

        newNode = {
          id: newNodeId,
          type: "formatNode",
          draggable: true,
          parentId: targetCategory.id,
          extent: "parent",
          position: dropPosition,
          data: {
            label: label,
            variant: variant,
            _isNew: true,
            format_config: null,
          } satisfies FormatNodeData,
        };
        setNodes((prev) => prev.concat(newNode!));
      }
    },
    [nodes, reactFlowInstance, viewOnly]
  );

  const hasUnsavedChanges = useMemo(() => {
    return getChangedNodes().length > 0 || deletedNodeIds.size > 0;
  }, [getChangedNodes, deletedNodeIds]);

  const getTotalChangesCount = useMemo(() => {
    return getChangedNodes().length + deletedNodeIds.size;
  }, [getChangedNodes, deletedNodeIds]);

  return {
    nodes,
    edges,
    deletedNodeIds,
    selectedNodes,
    originalNodesRef,
    initialNodesRef,
    categoriesRef,
    setNodes,
    setEdges,
    setDeletedNodeIds,
    setSelectedNodes,
    initializeFromCategories,
    getChangedNodes,
    getDeletedNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStop,
    onSelectionChange,
    deleteSelectedNodes,
    onDrop,
    hasUnsavedChanges,
    getTotalChangesCount,
    findCategoryRounds,
  };
}

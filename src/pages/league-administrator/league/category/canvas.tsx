import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  useReactFlow,
  type FormatNodeData,
  type LeagueCategoryRound,
  type LeagueRoundFormat,
  type NodeData,
  type RoundNodeData,
  getRoundOrder,
  isValidOrderTransition,
  RoundFormatTypesEnum,
  RoundStateEnum,
  RoundTypeEnum,
  type LeagueCategory,
  toast,
  CATEGORY_HEIGHT,
  CATEGORY_WIDTH,
  CategoryNode,
  FormatNode,
  RoundNode,
  ContentBody,
  ContentShell,
  ContentHeader,
  FormatNodeMenu,
  RoundNodeMenu,
  AddCategoryDialog,
  Loader2,
  generateUUIDWithPrefix,
  LeagueCategoryService,
  Button,
  STATUSES,
  edgeTypes,
} from "./imports";
import type { CategoryOperation } from "./types";
import type { League } from "@/types/league";

type LeagueCategoryCanvasProps = {
  categories: LeagueCategory[] | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<League | null, Error>>;
  viewOnly?: boolean;
};

export default function LeagueCategoryCanvas({
  categories,
  isLoading,
  error,
  refetch,
  viewOnly = false,
}: LeagueCategoryCanvasProps) {
  const reactFlowInstance = useReactFlow();

  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [deletedNodeIds, setDeletedNodeIds] = useState<Set<string>>(new Set());

  const originalNodesRef = useRef<Node<NodeData>[]>([]);
  const initialNodesRef = useRef<Node<NodeData>[]>([]);
  const categoriesRef = useRef<LeagueCategory[]>([]);

  useEffect(() => {
    if (!categories) return;

    categoriesRef.current = categories;

    const newNodes: Node<NodeData>[] = [];
    const newEdges: Edge[] = [];

    categories.forEach((cat, catIndex) => {
      newNodes.push({
        id: cat.category_id,
        type: "categoryNode",
        position: { x: 50, y: catIndex * 800 },
        data: { category: cat },
        draggable: true,
        selectable: true,
      });

      cat.rounds.forEach((round) => {
        const pos = round.position ?? { x: 100, y: 100 };
        newNodes.push({
          id: round.round_id,
          type: "roundNode",
          parentId: cat.category_id,
          extent: "parent",
          draggable: true,
          position: pos,
          data: { round, _isNew: false } satisfies RoundNodeData,
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
            parentId: cat.category_id,
            extent: "parent",
            draggable: true,
            position: round.round_format.position ?? {
              x: pos.x,
              y: pos.y + 120,
            },
            data: {
              label: round.round_format.format_type,
              round_format: round.round_format,
              round_id: round.round_id,
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
  }, [categories]);

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

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
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
    [nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
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
    [nodes]
  );

  const [selectedNodes, setSelectedNodes] = useState<Node<NodeData>[]>([]);
  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Node<NodeData>[] }) => {
      setSelectedNodes(selected ?? []);
    },
    []
  );

  const deleteSelectedNodes = useCallback(async () => {
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
  }, [selectedNodes, onNodesChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNodes.length > 0 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const activeElement = document.activeElement;
        const isInInput =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.getAttribute("contenteditable") === "true");

        if (!isInInput) {
          event.preventDefault();
          deleteSelectedNodes();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSelectedNodes]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      categoryNode: CategoryNode,
      roundNode: (props: any) => (
        <RoundNode {...props} allNodesRef={originalNodesRef} />
      ),
      formatNode: FormatNode,
    }),
    []
  );

  const onNodeDragStop = useCallback(
    (_e: React.MouseEvent, node: Node<NodeData>) => {
      if (node.type === "categoryNode") return;

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
    []
  );

  const findCategoryRounds = useCallback(
    (categoryId: string) => {
      return nodes.filter(
        (n) => n.type === "roundNode" && n.parentId === categoryId
      );
    },
    [nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
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

        const roundFormat: LeagueRoundFormat = {
          format_type: formatLabel as RoundFormatTypesEnum,
          pairing_method: "random",
          round_id: round.round_id,
          position: targetNode.position,
        };

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === sourceNode.id && n.type === "roundNode") {
              const updatedRound = { ...round, round_format: roundFormat };
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
                  round_format: roundFormat,
                  round_id: round.round_id,
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
    [nodes, findCategoryRounds]
  );

  const onDragStart = (
    event: React.DragEvent,
    type: "round" | "format",
    label: string
  ) => {
    event.dataTransfer.setData("node-type", type);
    event.dataTransfer.setData("application/reactflow", label);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
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
          position: dropPosition,
        };

        newNode = {
          id: roundId,
          type: "roundNode",
          draggable: true,
          parentId: targetCategory.id,
          extent: "parent",
          position: dropPosition,
          data: { round: created, _isNew: true } satisfies RoundNodeData,
        };

        setNodes((prev) => prev.concat(newNode!));
      } else {
        const newNodeId = `format-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`;
        newNode = {
          id: newNodeId,
          type: "formatNode",
          draggable: true,
          parentId: targetCategory.id,
          extent: "parent",
          position: dropPosition,
          data: {
            label,
            _isNew: true,
          } satisfies FormatNodeData,
        };
        setNodes((prev) => prev.concat(newNode!));
      }
    },
    [nodes, reactFlowInstance]
  );

  useEffect(() => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (targetNode?.type === "formatNode") {
          return {
            ...edge,
            style: { stroke: "#f39c12", strokeWidth: 2 },
          };
        }

        let style: React.CSSProperties = {
          stroke: "#f39c12",
          strokeWidth: 2,
          strokeDasharray: "12,6",
          animation: "dash-upcoming 2s linear infinite",
        };

        if (sourceNode?.type === "roundNode") {
          const s = (sourceNode.data as RoundNodeData).round
            .round_status as RoundStateEnum;
          switch (s) {
            case RoundStateEnum.Finished:
              style = {
                stroke: "#4caf50",
                strokeWidth: 2,
                strokeDasharray: "12,6",
                animation: "dash-upcoming 2s linear infinite",
              };
              break;
            case RoundStateEnum.Ongoing:
              style = {
                stroke: "#f39c12",
                strokeWidth: 2,
                strokeDasharray: "12,6",
                animation: "dash-upcoming 2s linear infinite",
              };
              break;
            default:
              style = {
                stroke: "#2196f3",
                strokeWidth: 2,
                strokeDasharray: "12,6",
                animation: "dash-upcoming 2s linear infinite",
              };
          }
        }

        return { ...edge, style };
      })
    );
  }, [nodes]);

  const saveChanges = async () => {
    try {
      const changedNodes = getChangedNodes();
      const deletedNodes = getDeletedNodes();

      if (changedNodes.length === 0 && deletedNodes.length === 0) {
        toast.info("No changes to save");
        return;
      }

      const operationsByCategory = new Map<string, CategoryOperation[]>();

      for (const node of changedNodes) {
        if (!node.parentId) continue;

        const categoryId = node.parentId;
        if (!operationsByCategory.has(categoryId)) {
          operationsByCategory.set(categoryId, []);
        }
        const operations = operationsByCategory.get(categoryId)!;

        if (node.type === "roundNode") {
          const { round, _isNew } = node.data as RoundNodeData;

          if (_isNew) {
            operations.push({
              type: "create_round",
              data: {
                round_id: round.round_id,
                round_name: round.round_name,
                round_status: round.round_status as RoundStateEnum,
                round_order: round.round_order,
                position: round.position,
              },
            });
          } else {
            const initialNode = initialNodesRef.current.find(
              (n) => n.id === node.id
            );
            if (initialNode) {
              const initialRound = (initialNode.data as RoundNodeData).round;

              if (
                round.position?.x !== initialRound.position?.x ||
                round.position?.y !== initialRound.position?.y
              ) {
                operations.push({
                  type: "update_position",
                  data: {
                    round_id: round.round_id,
                    position: round.position,
                  },
                });
              }

              if (
                JSON.stringify(round.round_format) !==
                JSON.stringify(initialRound.round_format)
              ) {
                operations.push({
                  type: "update_format",
                  data: {
                    round_id: round.round_id,
                    round_format: round.round_format ?? null,
                  },
                });
              }

              if (round.next_round_id !== initialRound.next_round_id) {
                operations.push({
                  type: "update_next_round",
                  data: {
                    round_id: round.round_id,
                    next_round_id: round.next_round_id ?? null,
                  },
                });
              }
            }
          }
        } else if (node.type === "formatNode") {
          const formatData = node.data as FormatNodeData;

          if (formatData.round_id) {
            const initialNode = initialNodesRef.current.find(
              (n) => n.id === node.id
            );

            if (initialNode) {
              if (
                node.position.x !== initialNode.position.x ||
                node.position.y !== initialNode.position.y
              ) {
                const roundNode = nodes.find(
                  (rn) =>
                    rn.type === "roundNode" &&
                    (rn.data as RoundNodeData).round.round_id ===
                      formatData.round_id
                );

                if (roundNode) {
                  const round = (roundNode.data as RoundNodeData).round;
                  if (round.round_format) {
                    operations.push({
                      type: "update_format",
                      data: {
                        round_id: formatData.round_id,
                        round_format: {
                          ...round.round_format,
                          position: node.position,
                        },
                      },
                    });
                  }
                }
              }
            }
          }
        }
      }

      for (const node of deletedNodes) {
        if (!node.parentId) continue;

        const categoryId = node.parentId;
        if (!operationsByCategory.has(categoryId)) {
          operationsByCategory.set(categoryId, []);
        }
        const operations = operationsByCategory.get(categoryId)!;

        if (node.type === "roundNode") {
          const { round } = node.data as RoundNodeData;
          operations.push({
            type: "delete_round",
            data: {
              round_id: round.round_id,
            },
          });
        } else if (node.type === "formatNode") {
          const formatData = node.data as FormatNodeData;
          if (formatData.round_id) {
            operations.push({
              type: "update_format",
              data: {
                round_id: formatData.round_id,
                round_format: null,
              },
            });
          }
        }
      }

      const promises: Promise<any>[] = [];

      for (const [categoryId, operations] of operationsByCategory) {
        if (operations.length > 0) {
          promises.push(
            LeagueCategoryService.saveChanges({
              categoryId,
              operations,
            })
          );
        }
      }

      await Promise.all(promises);

      setDeletedNodeIds(new Set());

      toast.success("All changes saved successfully");
      await refetch();
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    return getChangedNodes().length > 0 || deletedNodeIds.size > 0;
  }, [getChangedNodes, deletedNodeIds]);

  const getTotalChangesCount = useMemo(() => {
    return getChangedNodes().length + deletedNodeIds.size;
  }, [getChangedNodes, deletedNodeIds]);

  const safeOnNodesChange = viewOnly ? undefined : onNodesChange;
  const safeOnEdgesChange = viewOnly ? undefined : onEdgesChange;
  const safeOnConnect = viewOnly ? undefined : onConnect;
  const safeOnDrop = viewOnly ? undefined : onDrop;
  const safeOnNodeDragStop = viewOnly ? undefined : onNodeDragStop;
  const safeOnSelectionChange = viewOnly ? undefined : onSelectionChange;

  const categoryCanvas = (
    <>
      <div className="h-full border rounded-md w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          onNodesChange={safeOnNodesChange}
          onEdgesChange={safeOnEdgesChange}
          onConnect={safeOnConnect}
          onDrop={safeOnDrop}
          onNodeDragStop={safeOnNodeDragStop}
          onSelectionChange={safeOnSelectionChange}
          onDragOver={(e) => {
            if (viewOnly) return;
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
          }}
          fitView
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          panOnScroll
          selectionOnDrag={!viewOnly}
          draggable={!viewOnly}
          elementsSelectable={!viewOnly}
          minZoom={0.2}
          maxZoom={2}
        >
          <Background />
          <Controls className="node-menu-button" />
        </ReactFlow>
      </div>

      {!viewOnly && (
        <div className="flex flex-col gap-4">
          <Button className="w-full" onClick={() => setAddDialogOpen(true)}>
            Add Category
          </Button>
          <RoundNodeMenu
            onDragStart={(e, label) => onDragStart(e, "round", label)}
          />
          <FormatNodeMenu
            onDragStart={(e, label) => onDragStart(e, "format", label)}
          />
        </div>
      )}
    </>
  );

  return (
    <ContentShell>
      <ContentHeader title="Category Management">
        {!viewOnly && hasUnsavedChanges && (
          <Button variant={"outline"} size={"sm"} onClick={saveChanges}>
            Save Changes ({getTotalChangesCount})
          </Button>
        )}
      </ContentHeader>
      <ContentBody className="flex-row">
        {!viewOnly && (
          <AddCategoryDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
          />
        )}
        {isLoading ? (
          <div className="centered-container">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="centered-container">
            <p className="text-primary">{(error as any).message}</p>
          </div>
        ) : categoriesRef.current && categoriesRef.current.length > 0 ? (
          categoryCanvas
        ) : (
          <div className="centered-container">
            <p className="text-muted-foreground">No categories available</p>
          </div>
        )}
      </ContentBody>
    </ContentShell>
  );
}

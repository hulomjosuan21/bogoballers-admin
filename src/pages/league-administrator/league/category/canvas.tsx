import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
  BezierEdge,
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
  useQuery,
  getActiveLeagueQueryOptions,
  Loader2,
  generateUUIDWithPrefix,
  LeagueCategoryService,
  Button,
} from "./imports";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const edgeTypes = {
  bezier: BezierEdge,
};

const STATUSES: Record<RoundTypeEnum, RoundStateEnum> = {
  [RoundTypeEnum.Elimination]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.QuarterFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.SemiFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.Final]: RoundStateEnum.Upcoming,
};

export default function LeagueCategoryCanvas() {
  const reactFlowInstance = useReactFlow();
  const { data, isLoading, error, refetch } = useQuery(
    getActiveLeagueQueryOptions
  );

  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const originalNodesRef = useRef<Node<NodeData>[]>([]);
  const initialNodesRef = useRef<Node<NodeData>[]>([]);
  const categoriesRef = useRef<LeagueCategory[]>([]);

  useEffect(() => {
    if (!data?.categories) return;

    const categories: LeagueCategory[] = data.categories;
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
  }, [data?.categories]);

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

      const currentRound = (currentNode.data as RoundNodeData)?.round;
      const initialRound = (initialNode.data as RoundNodeData)?.round;

      const hasRoundDataChange =
        currentRound &&
        initialRound &&
        (currentRound.round_status !== initialRound.round_status ||
          JSON.stringify(currentRound.round_format) !==
            JSON.stringify(initialRound.round_format));

      if (hasPositionChange || hasRoundDataChange) {
        changed.push(currentNode);
      }
    });

    return changed;
  }, [nodes]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as Node<NodeData>[]);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const [_, setSelectedNodes] = useState<Node<NodeData>[]>([]);
  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Node<NodeData>[] }) => {
      setSelectedNodes(selected ?? []);
    },
    []
  );

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

      if (node.type === "roundNode") {
        const round = (node.data as RoundNodeData).round;
        round.position = { ...node.position };
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        )
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
    async (connection: Connection) => {
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

        try {
          await LeagueCategoryService.updateRoundFormat({
            categoryId: sourceNode.parentId!,
            roundId: round.round_id,
            roundFormat,
          });

          toast.success(
            `Format '${formatLabel}' assigned to ${round.round_name}`
          );
          setEdges((eds) => addEdge(connection, eds));
        } catch (err) {
          toast.error("Failed to update round format");
          console.error(err);
        }
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

        setEdges((eds) => addEdge(connection, eds));
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
          data: { label } satisfies FormatNodeData,
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

      if (changedNodes.length === 0) {
        toast.info("No changes to save");
        return;
      }

      const promises: Promise<any>[] = [];

      for (const node of changedNodes) {
        if (node.type !== "roundNode" || !node.parentId) continue;

        const { round, _isNew } = node.data as RoundNodeData;
        const categoryId = node.parentId;

        if (_isNew) {
          promises.push(
            LeagueCategoryService.saveChanges({
              categoryId,
              operations: [
                {
                  type: "create_round",
                  data: {
                    round_id: round.round_id,
                    round_name: round.round_name,
                    round_status: round.round_status as RoundStateEnum,
                    round_order: round.round_order,
                    position: round.position,
                  },
                },
              ],
            })
          );
        } else {
          const operations: any[] = [];

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
                  round_format: round.round_format,
                },
              });
            }
          }

          if (operations.length > 0) {
            promises.push(
              LeagueCategoryService.saveChanges({
                categoryId,
                operations,
              })
            );
          }
        }
      }

      await Promise.all(promises);

      toast.success("All changes saved successfully");
      await refetch();

      initialNodesRef.current = [...nodes];
      originalNodesRef.current = [...nodes];
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    return getChangedNodes().length > 0;
  }, [getChangedNodes]);

  const categoryCanvas = (
    <>
      <div className="h-full border rounded-md w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
          }}
          fitView
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          panOnScroll
          selectionOnDrag
          minZoom={0.2}
          maxZoom={2}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls className="node-menu-button" />
        </ReactFlow>
      </div>

      <div className="flex flex-col gap-4">
        <RoundNodeMenu
          onDragStart={(e, label) => onDragStart(e, "round", label)}
        />
        <FormatNodeMenu
          onDragStart={(e, label) => onDragStart(e, "format", label)}
        />
      </div>
    </>
  );

  return (
    <ContentShell>
      <ContentHeader title="Category Management">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" mode="icon" className="relative">
              <MoreVertical className="h-5 w-5" />
              <Badge
                variant="primary"
                shape="circle"
                size="sm"
                className={cn(
                  "absolute top-0 right-0 translate-x-1/4 -translate-y-1/4",
                  getChangedNodes().length === 0 && "hidden"
                )}
              >
                {getChangedNodes().length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" aria-describedby={undefined}>
            <DropdownMenuItem onClick={() => setAddDialogOpen(true)}>
              Add Category
            </DropdownMenuItem>
            {hasUnsavedChanges && (
              <DropdownMenuItem onClick={saveChanges}>
                Save Changes ({getChangedNodes().length})
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </ContentHeader>
      <ContentBody className="flex-row">
        <AddCategoryDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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
} from "@xyflow/react";
import { RoundStateEnum, RoundTypeEnum } from "@/enums/enums";
import {
  type FormatNodeData,
  type NodeData,
  type RoundNodeData,
} from "./types";
import { toast } from "sonner";
import {
  CATEGORY_HEIGHT,
  CATEGORY_WIDTH,
  CategoryNode,
  EliminationRoundNode,
  FinalRoundNode,
  FormatNode,
  QuarterFinalRoundNode,
  SemiFinalRoundNode,
} from "./nodes";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import { FormatNodeMenu, RoundNodeMenu } from "./menus";
import { AddCategoryDialog } from "./components";
import { useQuery } from "@tanstack/react-query";
import { getActiveLeagueQueryOptions } from "@/queries/league";
import { Loader2 } from "lucide-react";
import { SmallButton } from "@/components/custom-buttons";
import LeagueService from "@/service/league-service";
import { generateUUIDWithPrefix } from "@/lib/utils";
const STATUSES = {
  [RoundTypeEnum.Elimination]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.QuarterFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.SemiFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.Final]: RoundStateEnum.Upcoming,
};

export default function LeagueCategoryCanvas() {
  const reactFlowInstance = useReactFlow();
  const { data, isLoading, error } = useQuery(getActiveLeagueQueryOptions);

  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const originalNodesRef = useRef<Node<NodeData>[]>([]);

  useEffect(() => {
    if (data?.categories) {
      const categoryNodes: Node<NodeData>[] = data.categories.map(
        (cat, index): Node<NodeData> => ({
          id: cat.category_id,
          type: "categoryNode",
          position: { x: 50, y: index * 800 },
          data: {
            category: cat,
          },
          draggable: true,
          selectable: true,
        })
      );

      originalNodesRef.current = categoryNodes;
      setNodes(categoryNodes);
    }
  }, [data]);

  useEffect(() => {
    if (!data?.categories) return;

    const roundNodes: Node<NodeData>[] = [];

    data.categories.forEach((cat) => {
      cat.rounds.forEach((round) => {
        let roundNodeType: Node["type"] = "formatNode";
        switch (round.round_name) {
          case RoundTypeEnum.Elimination:
            roundNodeType = "eliminationRoundNode";
            break;
          case RoundTypeEnum.QuarterFinal:
          case "Quarterfinal":
            roundNodeType = "quarterFinalRoundNode";
            break;
          case RoundTypeEnum.SemiFinal:
          case "Semifinal":
            roundNodeType = "semiFinalRoundNode";
            break;
          case RoundTypeEnum.Final:
            roundNodeType = "finalRoundNode";
            break;
          default:
            roundNodeType = "formatNode";
        }

        roundNodes.push({
          id: round.round_id,
          type: roundNodeType,
          position: {
            x: round.position?.x ?? 100,
            y: round.position?.y ?? 100,
          },
          draggable: true,
          parentId: cat.category_id,
          extent: "parent",
          data: {
            round_id: round.round_id,
            label: round.round_name as RoundTypeEnum,
            status: round.round_status as RoundStateEnum,
          } satisfies RoundNodeData,
        });
      });
    });

    setNodes((prevNodes) => {
      const filteredNodes = prevNodes.filter(
        (n) => !n.id.startsWith("league-round-")
      );
      const allNodes = [...filteredNodes, ...roundNodes];
      originalNodesRef.current = allNodes;
      return allNodes;
    });
  }, [data]);

  const [changedNodes, setChangedNodes] = useState<
    Record<string, Node<NodeData>>
  >({});

  const nodesAreEqual = (a: Node<NodeData>, b: Node<NodeData>) => {
    if (a.position.x !== b.position.x || a.position.y !== b.position.y)
      return false;
    if (JSON.stringify(a.data) !== JSON.stringify(b.data)) return false;
    if (a.type !== b.type) return false;
    return true;
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds) as Node<NodeData>[];

        const newChangedNodes: Record<string, Node<NodeData>> = {
          ...changedNodes,
        };

        newNodes.forEach((node) => {
          if (node.type === "categoryNode") {
            if (newChangedNodes[node.id]) {
              delete newChangedNodes[node.id];
            }
            return;
          }

          const originalNode = originalNodesRef.current.find(
            (n) => n.id === node.id
          );

          if (!originalNode) {
            newChangedNodes[node.id] = node;
          } else if (!nodesAreEqual(node, originalNode)) {
            newChangedNodes[node.id] = node;
          } else {
            if (newChangedNodes[node.id]) {
              delete newChangedNodes[node.id];
            }
          }
        });

        setChangedNodes(newChangedNodes);
        return newNodes;
      });
    },
    [changedNodes]
  );

  const [edges, setEdges] = useState<Edge[]>([]);
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
      eliminationRoundNode: (props: any) => (
        <EliminationRoundNode {...props} allNodesRef={originalNodesRef} />
      ),
      quarterFinalRoundNode: (props: any) => (
        <QuarterFinalRoundNode {...props} allNodesRef={originalNodesRef} />
      ),
      semiFinalRoundNode: (props: any) => (
        <SemiFinalRoundNode {...props} allNodesRef={originalNodesRef} />
      ),
      finalRoundNode: (props: any) => (
        <FinalRoundNode {...props} allNodesRef={originalNodesRef} />
      ),
      formatNode: FormatNode,
    }),
    []
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node<NodeData>) => {
      if (node.type === "categoryNode") {
        return;
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        )
      );

      setChangedNodes((prev) => {
        const originalNode = originalNodesRef.current.find(
          (n) => n.id === node.id
        );
        if (
          !originalNode ||
          !nodesAreEqual({ ...node, position: node.position }, originalNode)
        ) {
          return { ...prev, [node.id]: { ...node, position: node.position } };
        } else {
          const copy = { ...prev };
          delete copy[node.id];
          return copy;
        }
      });
    },
    []
  );

  const saveChanges = async () => {
    try {
      await Promise.all(
        Object.values(changedNodes).map(async (node) => {
          if (node.type?.includes("Round") && node.parentId) {
            const originalNode = originalNodesRef.current.find(
              (n) => n.id === node.id
            );
            if (!originalNode) {
              await LeagueService.createCategoryRound({
                roundId: (node.data as RoundNodeData).round_id,
                categoryId: node.parentId,
                roundName: (node.data as RoundNodeData).label,
                roundStatus: (node.data as RoundNodeData).status,
                position: node.position,
              });
            } else {
              await LeagueService.updateRoundPosition(
                node.parentId,
                node.id,
                node.position
              );
            }
          }
        })
      );

      toast.success("All changes saved");

      originalNodesRef.current = [...nodes];
      setChangedNodes({});
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    }
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (
        sourceNode?.type === "formatNode" &&
        !(
          targetNode?.type?.includes("Round") &&
          connection.targetHandle === "bottom"
        )
      ) {
        toast.error(
          "Format nodes can only connect to the bottom of a round node!"
        );
        return;
      }

      if (
        sourceNode?.type?.includes("Round") &&
        connection.sourceHandle === "bottom" &&
        targetNode?.type !== "formatNode"
      ) {
        toast.error("Bottom handle can only connect to format nodes!");
        return;
      }

      setEdges((eds) => addEdge(connection, eds));
    },
    [nodes]
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

  const isRoundNodeData = (data: NodeData): data is RoundNodeData => {
    return (data as RoundNodeData).label !== undefined;
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
          if (!n.type?.includes("Round") || n.parentId !== targetCategory.id) {
            return false;
          }
          return (
            isRoundNodeData(n.data) && n.data.label === (label as RoundTypeEnum)
          );
        });
        if (hasDuplicate) {
          toast.error(`Only one ${label} round is allowed per category!`);
          return;
        }
      }

      let roundNodeType: Node["type"] = "formatNode";
      if (nodeType === "round") {
        switch (label) {
          case RoundTypeEnum.Elimination:
            roundNodeType = "eliminationRoundNode";
            break;
          case RoundTypeEnum.QuarterFinal:
            roundNodeType = "quarterFinalRoundNode";
            break;
          case RoundTypeEnum.SemiFinal:
            roundNodeType = "semiFinalRoundNode";
            break;
          case RoundTypeEnum.Final:
            roundNodeType = "finalRoundNode";
            break;
        }
      }

      const newNodeId = `${nodeType}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;
      const roundId = generateUUIDWithPrefix("round");
      const newNode: Node<NodeData> =
        nodeType === "round"
          ? {
              id: newNodeId,
              type: roundNodeType,
              position: {
                x: mousePosition.x - targetCategory.position.x - 50,
                y: mousePosition.y - targetCategory.position.y - 50,
              },
              draggable: true,
              parentId: targetCategory.id,
              extent: "parent",
              data: {
                round_id: roundId,
                label: label as RoundTypeEnum,
                status: STATUSES[label as RoundTypeEnum],
              } satisfies RoundNodeData,
            }
          : {
              id: newNodeId,
              type: roundNodeType,
              position: {
                x: mousePosition.x - targetCategory.position.x - 50,
                y: mousePosition.y - targetCategory.position.y - 50,
              },
              draggable: true,
              parentId: targetCategory.id,
              extent: "parent",
              data: { label } satisfies FormatNodeData,
            };

      setNodes((prev) => prev.concat(newNode));
      if (nodeType === "round") {
        setChangedNodes((prev) => ({
          ...prev,
          [newNode.id]: newNode,
        }));
      }
    },
    [nodes, reactFlowInstance, STATUSES]
  );

  useEffect(() => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (targetNode?.type === "formatNode") {
          return {
            ...edge,
            style: {
              stroke: "#f39c12",
              strokeWidth: 2,
            },
          };
        }

        let style: React.CSSProperties = {
          stroke: "#f39c12",
          strokeWidth: 2,
          strokeDasharray: "12,6",
          animation: "dash-upcoming 2s linear infinite",
        };

        if (
          sourceNode?.type?.includes("Round") &&
          isRoundNodeData(sourceNode.data)
        ) {
          const sourceLabel = sourceNode.data.label;
          const sourceStatus = STATUSES[sourceLabel] ?? RoundStateEnum.Upcoming;

          switch (sourceStatus) {
            case RoundStateEnum.Finished:
              style = {
                stroke: "#4caf50",
                strokeWidth: 2,
                strokeDasharray: "4,4",
                animation: "dash-finish 1.5s linear infinite",
              };
              break;
            case RoundStateEnum.Ongoing:
              style = {
                stroke: "#2196f3",
                strokeWidth: 2,
                strokeDasharray: "8,4",
                animation: "dash-ongoing 1s linear infinite",
              };
              break;
            case RoundStateEnum.Upcoming:
              style = {
                stroke: "#f39c12",
                strokeWidth: 2,
                strokeDasharray: "12,6",
                animation: "dash-upcoming 2s linear infinite",
              };
              break;
          }
        }

        return { ...edge, style };
      })
    );
  }, [STATUSES, nodes]);

  const categoryCanvas = (
    <>
      <div className="h-full border rounded-md w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
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
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={true}
          selectionOnDrag={true}
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
        <SmallButton onClick={() => setAddDialogOpen(true)}>
          Add Category
        </SmallButton>
        {Object.keys(changedNodes).length > 0 && (
          <SmallButton variant="ghost" onClick={saveChanges}>
            Save Changes
          </SmallButton>
        )}
      </ContentHeader>
      <ContentBody className="flex-row">
        <AddCategoryDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px] w-full">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[300px] w-full">
            <p className="text-primary">{error.message}</p>
          </div>
        ) : data?.categories && data.categories.length > 0 ? (
          categoryCanvas
        ) : (
          <div className="flex justify-center items-center min-h-[300px] w-full">
            <p className="text-muted-foreground">No categories available</p>
          </div>
        )}
      </ContentBody>
    </ContentShell>
  );
}

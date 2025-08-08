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
  type RoundDetails,
  type RoundNodeData,
  type StatusMap,
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
import { RoundNodeDialog } from "./components";
import { Button } from "@/components/ui/button";

export default function LeagueCategoryCanvas() {
  const reactFlowInstance = useReactFlow();

  const fakeCategories: { category_id: string; category_name: string }[] = [
    { category_id: "cat1", category_name: "Open League Men" },
    { category_id: "cat2", category_name: "Under-13 Midget" },
    { category_id: "cat3", category_name: "PWD Women" },
    { category_id: "cat4", category_name: "24-Below Young Adult" },
  ];

  const [nodes, setNodes] = useState<Node<NodeData>[]>(() =>
    fakeCategories.map(
      (cat, index): Node<NodeData> => ({
        id: cat.category_id,
        type: "categoryNode",
        position: { x: 50, y: index * 800 },
        data: {
          categoryId: cat.category_id,
          categoryName: cat.category_name,
        },
        draggable: true,
        selectable: true,
      })
    )
  );

  const nodesRef = useRef<Node<NodeData>[]>(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const [edges, setEdges] = useState<Edge[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<RoundDetails | null>(null);

  const [statuses, setStatuses] = useState<StatusMap>({
    [RoundTypeEnum.Elimination]: RoundStateEnum.Upcoming,
    [RoundTypeEnum.QuarterFinal]: RoundStateEnum.Upcoming,
    [RoundTypeEnum.SemiFinal]: RoundStateEnum.Upcoming,
    [RoundTypeEnum.Final]: RoundStateEnum.Upcoming,
  });

  const setStatus = (label: RoundTypeEnum, status: RoundStateEnum) => {
    setStatuses((prev) => ({ ...prev, [label]: status }));
  };

  const nodeTypes = useMemo(
    () => ({
      categoryNode: CategoryNode,
      eliminationRoundNode: (props: any) => (
        <EliminationRoundNode {...props} allNodesRef={nodesRef} />
      ),
      quarterFinalRoundNode: (props: any) => (
        <QuarterFinalRoundNode {...props} allNodesRef={nodesRef} />
      ),
      semiFinalRoundNode: (props: any) => (
        <SemiFinalRoundNode {...props} allNodesRef={nodesRef} />
      ),
      finalRoundNode: (props: any) => (
        <FinalRoundNode {...props} allNodesRef={nodesRef} />
      ),
      formatNode: FormatNode,
    }),
    []
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as Node<NodeData>[]);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      console.log(
        "Connection Attempt:",
        sourceNode?.type,
        "→",
        targetNode?.type
      );

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

      console.log(
        "Dropping node:",
        JSON.stringify(
          {
            nodeType,
            label,
            targetCategoryId: targetCategory.id,
          },
          null,
          2
        )
      );

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

      // Generate a unique ID for the new node
      const newNodeId = `${nodeType}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

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
                label: label as RoundTypeEnum,
                status: statuses[label as RoundTypeEnum],
                onOpen: () => {
                  setSelectedRound({
                    label: label as RoundTypeEnum,
                  });
                  setDialogOpen(true);
                },
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

      console.log("Adding node:", JSON.stringify(newNode, null, 2));

      setNodes((prev) => prev.concat(newNode));
    },
    [nodes, reactFlowInstance, statuses]
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
          const sourceStatus = statuses[sourceLabel] ?? RoundStateEnum.Upcoming;

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
  }, [statuses, nodes]);

  return (
    <ContentShell>
      <ContentHeader title="Category Management">
        <Button size={"sm"}>Save Changes</Button>
      </ContentHeader>
      <ContentBody className="flex-row">
        <div className="h-full border rounded-md w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
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
      </ContentBody>

      <RoundNodeDialog
        round={selectedRound}
        status={
          selectedRound
            ? statuses[selectedRound.label]
            : RoundStateEnum.Upcoming
        }
        setStatus={setStatus}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </ContentShell>
  );
}

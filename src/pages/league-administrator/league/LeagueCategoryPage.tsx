import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";
import { Maximize } from "lucide-react";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import {
  RoundTypeEnum,
  RoundStateEnum,
  type StatusMap,
  type RoundDetails,
  type RoundNodeData,
} from "./category/category-types";
import { RoundNodeDialog } from "./category/category-components";
import { FormatNodeMenu, RoundNodeMenu } from "./category/category-node-menus";
import {
  CATEGORY_HEIGHT,
  CATEGORY_WIDTH,
  CategoryNode,
  FormatNode,
  RoundNode,
} from "./category/category-nodes";

export default function LeagueCategoryPage() {
  const reactFlowInstance = useReactFlow();

  const fakeCategories = [
    { category_id: "cat1", category_name: "Open League Men" },
    { category_id: "cat2", category_name: "Under-13 Midget" },
    { category_id: "cat3", category_name: "PWD Women" },
    { category_id: "cat4", category_name: "24-Below Young Adult" },
  ];

  const [nodes, setNodes] = useState<Node[]>(() =>
    fakeCategories.map((cat, index) => ({
      id: cat.category_id,
      type: "categoryNode",
      position: { x: 50, y: index * 800 },
      data: { categoryId: cat.category_id, categoryName: cat.category_name },
      draggable: true,
      selectable: true,
    }))
  );

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

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (
        sourceNode?.type === "formatNode" &&
        !(
          targetNode?.type === "roundNode" &&
          connection.targetHandle === "bottom"
        )
      ) {
        toast.error(
          "Format nodes can only connect to the bottom of a round node!"
        );
        return;
      }

      if (
        sourceNode?.type === "roundNode" &&
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
        const hasDuplicate = nodes.some(
          (n) =>
            n.type === "roundNode" &&
            n.parentId === targetCategory.id &&
            (n.data as RoundNodeData).label === label
        );
        if (hasDuplicate) {
          toast.error("This round type already exists in this category!");
          return;
        }
      }

      const newNode: Node = {
        id: `${nodeType}-${nodes.length + 1}`,
        type: nodeType === "round" ? "roundNode" : "formatNode",
        position: {
          x: mousePosition.x - targetCategory.position.x - 50,
          y: mousePosition.y - targetCategory.position.y - 50,
        },
        draggable: true,
        parentId: targetCategory.id,
        extent: "parent",
        data:
          nodeType === "round"
            ? {
                label: label as RoundTypeEnum,
                icon: Maximize,
                onOpen: () => {
                  setSelectedRound({
                    label: label as RoundTypeEnum,
                  });
                  setDialogOpen(true);
                },
              }
            : { label },
      };

      setNodes((prev) => prev.concat(newNode));
    },
    [nodes, reactFlowInstance]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  useEffect(() => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        // Special style for formatNode target
        if (targetNode?.type === "formatNode") {
          return {
            ...edge,
            style: {
              stroke: "#f39c12",
              strokeWidth: 2,
            },
          };
        }

        const sourceLabel = (sourceNode?.data as RoundNodeData)?.label;

        const sourceStatus = sourceLabel
          ? statuses[sourceLabel] ?? RoundStateEnum.Upcoming
          : RoundStateEnum.Upcoming;

        let style: React.CSSProperties = {};

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
          default:
            style = {
              stroke: "#f39c12",
              strokeWidth: 2,
              strokeDasharray: "12,6",
              animation: "dash-upcoming 2s linear infinite",
            };
            break;
        }

        return { ...edge, style };
      })
    );
  }, [statuses, nodes]);

  return (
    <ContentShell>
      <ContentHeader title="Category Management" />

      <ContentBody className="flex-row">
        <div className="h-full border rounded-md w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={{
              categoryNode: CategoryNode,
              roundNode: RoundNode,
              formatNode: FormatNode,
            }}
            fitView
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

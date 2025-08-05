import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
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
  CATEGORY_HEIGHT,
  CATEGORY_WIDTH,
  type CategoryNodeData,
  type RoundDetails,
  type RoundMenuItem,
  type RoundNodeData,
  type RoundType,
  type StatusMap,
} from "./category/category-types";
import { RoundNodeDialog } from "./category/category-components";

function CategoryNode({ data }: { data: CategoryNodeData }) {
  return (
    <div
      className={`border-2 rounded-md flex flex-col overflow-hidden w-[${CATEGORY_WIDTH}px] h-[${CATEGORY_HEIGHT}px]`}
    >
      <div className="bg-primary font-semibold text-sm p-3">
        {data.categoryName}
      </div>
      <div className="flex-1 p-2 overflow-auto">
        <p className="text-helper italic text-sm">
          Drop round & format nodes here...
        </p>
      </div>
    </div>
  );
}

function RoundNode({ data }: { data: RoundNodeData }) {
  const { label, onOpen, icon: Icon } = data;

  return (
    <div
      onClick={onOpen}
      className={`bg-muted rounded-md p-3 cursor-pointer flex items-center gap-2 shadow-sm hover:opacity-90 transition border-2`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      {/* Bottom handle for connecting to format nodes */}
      <Handle id="bottom" type="source" position={Position.Bottom} />
    </div>
  );
}

function FormatNode({ data }: { data: { label: string } }) {
  return (
    <div className="bg-muted rounded-md p-2 cursor-pointer flex items-center gap-2 shadow-sm hover:opacity-90 transition border-1">
      <span className="text-xs">{data.label}</span>
      <Handle id="top" type="target" position={Position.Top} />
    </div>
  );
}

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
    Elimination: "Upcoming",
    Quarterfinals: "Upcoming",
    Semifinals: "Upcoming",
    Finals: "Upcoming",
  });

  const setStatus = (label: RoundType, status: string) => {
    setStatuses((prev) => ({ ...prev, [label]: status }));
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

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

      // Prevent duplicate round nodes of same type in same category
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
                label,
                icon: Maximize,
                onOpen: () => {
                  setSelectedRound({
                    label: label as RoundType,
                    formats: ["Format A", "Format B"],
                    states: ["Upcoming", "Ongoing", "Finished"],
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

        // If this edge goes to a format node → fixed green edge
        if (targetNode?.type === "formatNode") {
          return {
            ...edge,
            style: {
              stroke: "#f39c12",
              strokeWidth: 2,
            },
          };
        }

        // Otherwise, style based on round status
        const sourceLabel = (sourceNode?.data as RoundNodeData)?.label;
        const sourceStatus = sourceLabel ? statuses[sourceLabel] : "";

        let style: React.CSSProperties = {};
        switch (sourceStatus) {
          case "Finished":
            style = {
              stroke: "#4caf50",
              strokeWidth: 2,
              strokeDasharray: "4,4",
              animation: "dash-finish 1.5s linear infinite",
            };
            break;
          case "Ongoing":
            style = {
              stroke: "#2196f3",
              strokeWidth: 2,
              strokeDasharray: "8,4",
              animation: "dash-ongoing 1s linear infinite",
            };
            break;
          case "Upcoming":
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
        status={selectedRound ? statuses[selectedRound.label] : ""}
        setStatus={setStatus}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </ContentShell>
  );
}

function RoundNodeMenu({
  onDragStart,
}: {
  onDragStart: (event: React.DragEvent, label: RoundType) => void;
}) {
  const menuItems: RoundMenuItem[] = [
    { label: "Elimination", icon: Maximize },
    { label: "Quarterfinals", icon: Maximize },
    { label: "Semifinals", icon: Maximize },
    { label: "Finals", icon: Maximize },
  ];

  return (
    <div className="w-48 p-2 border rounded-md flex flex-col gap-2">
      {menuItems.map(({ label, icon: Icon }) => (
        <div
          key={label}
          draggable
          onDragStart={(event) => onDragStart(event, label as RoundType)}
          className={`flex items-center gap-2 p-2 rounded-md border-2 bg-background cursor-grab hover:opacity-80`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

function FormatNodeMenu({
  onDragStart,
}: {
  onDragStart: (event: React.DragEvent, label: string) => void;
}) {
  const menuItems = [
    "Round Robin",
    "Knockout",
    "Double Elimination",
    "Twice-to-Beat",
    "Best-of-3",
    "Best-of-5",
    "Best-of-7",
  ];

  return (
    <div className="w-48 p-2 border rounded-md flex flex-col gap-2">
      {menuItems.map((label) => (
        <div
          key={label}
          draggable
          onDragStart={(event) => onDragStart(event, label)}
          className="flex items-center gap-2 p-2 rounded-md border-2 bg-background cursor-grab hover:opacity-80"
        >
          <span className="text-xs text-center font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

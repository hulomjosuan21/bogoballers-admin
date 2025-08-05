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
        <p className="text-helper italic text-sm">Drop round nodes here...</p>
      </div>
    </div>
  );
}

function RoundNode({ data }: { data: RoundNodeData }) {
  const { label, onOpen, icon: Icon } = data;

  const borderColors: Record<RoundType, string> = {
    Elimination: "border-cyan-500",
    Quarterfinals: "border-sky-500",
    Semifinals: "border-amber-500",
    Finals: "border-purple-500",
  };

  return (
    <div
      onClick={onOpen}
      className={`bg-muted rounded-md p-3 cursor-pointer flex items-center gap-2 shadow-sm hover:opacity-90 transition border-2 ${borderColors[label]}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Bottom} />
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

  const onDragStart = (event: React.DragEvent, roundType: RoundType) => {
    event.dataTransfer.setData("application/reactflow", roundType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const roundType = event.dataTransfer.getData(
        "application/reactflow"
      ) as RoundType;
      if (!roundType) return;

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

      const hasDuplicate = nodes.some((n) => {
        if (n.type !== "roundNode" || n.parentId !== targetCategory.id)
          return false;
        const nodeData = n.data as RoundNodeData;
        return nodeData.label === roundType;
      });

      if (hasDuplicate) {
        toast.error("This round type already exists in this category!");
        return;
      }

      const newRoundNode: Node<RoundNodeData> = {
        id: `round-${nodes.length + 1}`,
        type: "roundNode",
        position: {
          x: mousePosition.x - targetCategory.position.x - 50,
          y: mousePosition.y - targetCategory.position.y - 50,
        },
        draggable: true,
        parentId: targetCategory.id,
        extent: "parent",
        data: {
          label: roundType,
          icon: Maximize,
          onOpen: () => {
            setSelectedRound({
              label: roundType,
              formats: ["Format A", "Format B"],
              states: ["Upcoming", "Ongoing", "Finished"],
            });
            setDialogOpen(true);
          },
        },
      };

      setNodes((prev) => prev.concat(newRoundNode));
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
            }}
            fitView
          >
            <Background />
            <Controls className="node-menu-button" />
          </ReactFlow>
        </div>

        <RoundNodeMenu onDragStart={onDragStart} />
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
  onDragStart: (event: React.DragEvent, nodeType: RoundType) => void;
}) {
  const menuItems: RoundMenuItem[] = [
    { label: "Elimination", icon: Maximize, border: "border-cyan-500" },
    { label: "Quarterfinals", icon: Maximize, border: "border-sky-500" },
    { label: "Semifinals", icon: Maximize, border: "border-amber-500" },
    { label: "Finals", icon: Maximize, border: "border-purple-500" },
  ];

  return (
    <div className="w-48 p-2 border rounded-md flex flex-col gap-2">
      {menuItems.map(({ label, icon: Icon, border }) => (
        <div
          key={label}
          draggable
          onDragStart={(event) => onDragStart(event, label)}
          className={`flex items-center gap-2 p-2 rounded-md border-2 ${border} bg-background cursor-grab hover:opacity-80`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

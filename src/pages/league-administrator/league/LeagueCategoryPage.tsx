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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const roundsData = [
  { id: "1", label: "Elimination" },
  { id: "2", label: "Quarterfinals" },
  { id: "3", label: "Semifinals" },
  { id: "4", label: "Finals" },
];

function RoundNode({ data }: any) {
  const { label, status, setStatus, formats, states, test } = data;

  return (
    <div className="bg-accent border rounded-md min-w-[150px] text-center shadow-sm overflow-hidden">
      <div className="drag-handle cursor-grab font-bold bg-primary px-2 py-1">
        {label}
      </div>

      <div className="p-2 grid space-y-2">
        {/* First select: Formats */}
        <Select
          defaultValue={status}
          onValueChange={(value) => setStatus(label, value)}
        >
          <SelectTrigger className="mt-2 p-1 text-xs w-full">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            {formats.map((f: string) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Second select: Statuses */}
        <Select
          defaultValue={status}
          onValueChange={(value) => setStatus(label, value)}
        >
          <SelectTrigger className="mt-2 p-1 text-xs w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {states.map((s: string) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {test}
      </div>

      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default function LeagueCategoryPage() {
  const [statuses, setStatuses] = useState<Record<string, string>>({
    Elimination: "Upcoming",
    Quarterfinals: "Upcoming",
    Semifinals: "Upcoming",
    Finals: "Upcoming",
  });

  const setStatus = (label: string, status: string) => {
    setStatuses((prev) => ({ ...prev, [label]: status }));
  };
  const CustomMessage = () => (
    <div className="text-xs bg-green-100 p-1 rounded">
      ✅ All matches scheduled
    </div>
  );
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "1",
      type: "roundNode",
      position: { x: 0, y: 100 },
      data: {
        label: "Elimination",
        status: statuses["Elimination"],
        setStatus,
        formats: ["Round Robin", "Knock Out", "Test"],
        states: ["Upcoming", "Ongoing", "Finished"],
      },
      dragHandle: ".drag-handle",
    },
    {
      id: "2",
      type: "roundNode",
      position: { x: 250, y: 100 },
      data: {
        label: "Quarterfinals",
        status: statuses["Quarterfinals"],
        setStatus,
        formats: ["Swiss System", "Double Elimination"],
        states: ["Upcoming", "Ongoing", "Finished"],
      },
      dragHandle: ".drag-handle",
    },
    {
      id: "3",
      type: "roundNode",
      position: { x: 500, y: 100 },
      data: {
        label: "Semifinals",
        status: statuses["Semifinals"],
        setStatus,
        formats: ["Knock Out Only"],
        states: ["Upcoming", "Ongoing", "Finished"],
      },
      dragHandle: ".drag-handle",
    },
    {
      id: "4",
      type: "roundNode",
      position: { x: 750, y: 100 },
      data: {
        label: "Finals",
        status: statuses["Finals"],
        setStatus,
        formats: ["Best of 3", "Best of 5"],
        states: ["Upcoming", "Ongoing", "Finished"],
        test: <CustomMessage />,
      },
      dragHandle: ".drag-handle",
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    toast.success("Removed!");
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;

      const sourceExists = edges.some((e) => e.source === source);
      const targetExists = edges.some((e) => e.target === target);

      if (sourceExists || targetExists) {
        toast.error("This node is already connected!");
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            style: {
              stroke: "#f39c12",
              strokeWidth: 2,
              strokeDasharray: "10,5",
            },
          },
          eds
        )
      );
    },
    [edges] // dependency so it checks updated edges
  );

  useEffect(() => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        const sourceLabel = roundsData.find((r) => r.id === edge.source)?.label;
        const sourceStatus = sourceLabel ? statuses[sourceLabel] : "";

        const isFinished = sourceStatus === "Finished";

        return {
          ...edge,
          style: {
            stroke: isFinished ? "#4caf50" : "#f39c12",
            strokeWidth: 2,
            strokeDasharray: isFinished ? "5,5" : "10,5",
            animation: isFinished
              ? "dash-finish 2s linear infinite"
              : "dash-unfinished 1s linear infinite",
          },
        };
      })
    );
  }, [statuses]);

  return (
    <>
      <style>
        {`
            @keyframes dash-unfinished {
                to {
                stroke-dashoffset: -15;
                }
            }
            @keyframes dash-finish {
                to {
                stroke-dashoffset: -10;
                }
            }
        `}
      </style>
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete} // ✅ Now edges can be deleted
          onConnect={onConnect}
          nodeTypes={{ roundNode: RoundNode }}
          fitView
          nodesDraggable
          nodesConnectable
          elementsSelectable // ✅ Needed so edges can be selected
        >
          <Background />
          <Controls className="text-foreground" />
        </ReactFlow>
      </div>
    </>
  );
}

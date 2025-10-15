import { ReactFlow, Background, Controls } from "@xyflow/react";
import { useManageAutomaticMatchConfigNode } from "@/hooks/useAutomaticMatchConfigHook";
import { automaticMatchConfigNodeTypes } from "@/components/automatic-match-config";

export function AutomaticMatchingCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onNodeDragStop,
  } = useManageAutomaticMatchConfigNode();

  return (
    <div className="h-full border rounded-md w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={automaticMatchConfigNodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

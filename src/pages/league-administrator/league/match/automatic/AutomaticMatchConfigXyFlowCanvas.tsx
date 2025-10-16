import { ReactFlow, Background, Controls } from "@xyflow/react";
import { automaticMatchConfigNodeTypes } from "@/components/automatic-match-config";
import { useManageAutomaticMatchConfigNode } from "@/hooks/useAutomaticMatchConfigHook";

export function AutomaticMatchConfigXyFlowCanvas() {
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
    <div className="h-full w-full border rounded-md bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={automaticMatchConfigNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

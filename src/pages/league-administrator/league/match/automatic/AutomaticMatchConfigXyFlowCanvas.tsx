import { Background, Controls, ReactFlow } from "@xyflow/react";
import { useManageAutomaticMatchConfigNode } from "@/hooks/useAutomaticMatchConfigHook";
import { automaticMatchConfigNodeTypes } from "@/components/automatic-match-config";

export default function AutomaticMatchConfigXyFlowCanvas() {
  const { nodes, edges, onNodesChange, onDrop, onDragOver } =
    useManageAutomaticMatchConfigNode();

  return (
    <div className="h-full border rounded-md w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onDrop={onDrop}
        onNodesChange={onNodesChange}
        onDragOver={onDragOver}
        nodeTypes={automaticMatchConfigNodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

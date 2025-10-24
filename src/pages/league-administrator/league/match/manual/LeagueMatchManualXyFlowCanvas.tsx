import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";

import { useManageManualMatchConfigNode } from "@/hooks/useManualMatchConfigHook";
import { manualMatchConfigNodeTypes } from "@/components/manual-match-config";
import { useTheme } from "@/providers/theme-provider";

export function ManualMatchingCanvas({
  activeLeagueId,
}: {
  activeLeagueId?: string;
}) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onNodeDragStop,
  } = useManageManualMatchConfigNode(activeLeagueId);
  const { theme } = useTheme();

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
        colorMode={theme}
        nodeTypes={manualMatchConfigNodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

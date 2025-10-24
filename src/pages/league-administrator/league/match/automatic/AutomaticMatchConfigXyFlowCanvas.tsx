import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { automaticMatchConfigNodeTypes } from "@/components/automatic-match-config";
import { useManageAutomaticMatchConfigNode } from "@/hooks/useAutomaticMatchConfigHook";
import { useTheme } from "@/providers/theme-provider";

export function AutomaticMatchConfigXyFlowCanvas({
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
  } = useManageAutomaticMatchConfigNode(activeLeagueId);
  const { theme } = useTheme();

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
        colorMode={theme}
        onDragOver={onDragOver}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

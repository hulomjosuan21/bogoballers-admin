import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigLeagueCategoryRoundNodeData } from "@/types/automaticMatchConfigTypes";

const AutomaticMatchConfigLeagueCategoryRoundNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigLeagueCategoryRoundNodeData>>
> = ({ data }) => {
  return (
    <div className="relative p-3 border rounded-md bg-secondary w-24">
      <div className="font-semibold text-xs text-secondary-foreground">
        {data.round.round_name}
      </div>
      <div className="text-xs text-muted-foreground">Round</div>

      <Handle type="source" position={Position.Right} id="match-source" />
    </div>
  );
};

export default memo(AutomaticMatchConfigLeagueCategoryRoundNode);

import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type ManualMatchConfigLeagueCategoryRoundNodeData } from "@/types/manualMatchConfigTypes";

const ManualMatchConfigLeagueCategoryRoundNode: React.FC<
  NodeProps<Node<ManualMatchConfigLeagueCategoryRoundNodeData>>
> = ({ data }) => {
  return (
    <div className="p-3 border rounded-md rounded-tl-4xl bg-background w-32 text-foreground">
      <div className="font-semibold text-primary text-sm">
        {data.league_category_round}
      </div>
      <div className="text-xs text-muted-foreground">Round</div>

      <Handle type="target" position={Position.Left} id="category-target" />
      <Handle type="source" position={Position.Right} id="group-source" />
    </div>
  );
};

export default memo(ManualMatchConfigLeagueCategoryRoundNode);

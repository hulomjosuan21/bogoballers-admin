import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type LeagueCategoryRoundNodeData } from "@/types/manual";

const LeagueCategoryRoundNode: React.FC<
  NodeProps<Node<LeagueCategoryRoundNodeData>>
> = ({ data }) => {
  return (
    <div className="p-3 border rounded-md bg-background w-56 text-foreground">
      <div className="font-semibold text-primary">
        {data.league_category_round}
      </div>
      <div className="text-xs text-muted-foreground">Round</div>

      <Handle type="target" position={Position.Left} id="category-target" />
      <Handle type="source" position={Position.Right} id="group-source" />
    </div>
  );
};

export default memo(LeagueCategoryRoundNode);

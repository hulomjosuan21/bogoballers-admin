import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigLeagueCategoryNodeData } from "@/types/automaticMatchConfigTypes";

const AutomaticMatchConfigLeagueCategoryNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigLeagueCategoryNodeData>>
> = ({ data }) => {
  return (
    <div className="relative p-3 border rounded-md bg-secondary w-24">
      <div className="font-semibold text-xs text-secondary-foreground">
        {data.league_category.category_name}
      </div>
      <div className="text-xs text-muted-foreground">Category</div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default memo(AutomaticMatchConfigLeagueCategoryNode);

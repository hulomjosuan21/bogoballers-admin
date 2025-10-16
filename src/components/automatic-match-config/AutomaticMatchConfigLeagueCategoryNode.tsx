import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigLeagueCategoryNodeData } from "@/types/automaticMatchConfigTypes";

const AutomaticMatchConfigLeagueCategoryNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigLeagueCategoryNodeData>>
> = ({ data }) => {
  return (
    <div className="p-3 border rounded-md bg-background w-28 text-center">
      <div className="font-semibold text-xs">
        {data.league_category.category_name}
      </div>
      <div className="text-xs text-muted-foreground">Category</div>

      {/* Category → Round */}
      <Handle type="source" position={Position.Right} id="category-out" />
    </div>
  );
};

export default memo(AutomaticMatchConfigLeagueCategoryNode);

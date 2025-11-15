import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigLeagueCategoryNodeData } from "@/types/automaticMatchConfigTypes";

const AutomaticMatchConfigLeagueCategoryNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigLeagueCategoryNodeData>>
> = ({ data }) => {
  const { league_category } = data;
  return (
    <div className="p-3 border rounded-md rounded-tl-4xl bg-background w-fit text-center">
      <div className="font-semibold text-xs">
        {league_category.category_name}
      </div>
      <div className="text-xs text-muted-foreground">Category</div>

      <Handle type="source" position={Position.Right} id="category-out" />
    </div>
  );
};

export default memo(AutomaticMatchConfigLeagueCategoryNode);

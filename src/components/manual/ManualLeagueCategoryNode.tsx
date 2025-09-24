import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LeagueCategoryNode } from "@/types/manual";

const ManualLeagueCategoryNode = ({ data }: NodeProps<LeagueCategoryNode>) => {
  return (
    <div className="card border bg-card text-card-foreground shadow-md w-64">
      <div className="card-header p-2 bg-muted/50 border-b">
        <h3 className="card-title text-sm font-semibold">Category</h3>
      </div>
      <div className="card-content p-3">
        <p className="font-bold">{data.category.category_name}</p>
        <p className="text-xs text-muted-foreground">
          Max Teams: {data.category.max_team}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="category-source"
        className="w-3 h-3 bg-primary"
      />
    </div>
  );
};

export default memo(ManualLeagueCategoryNode);

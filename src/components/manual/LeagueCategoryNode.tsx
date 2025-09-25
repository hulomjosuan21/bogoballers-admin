import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type LeagueCategoryNodeData } from "@/types/manual";

const handleStyle = {};

const LeagueCategoryNode: React.FC<NodeProps<Node<LeagueCategoryNodeData>>> = ({
  data,
}) => {
  return (
    <div className="p-4 border rounded-md bg-background w-64 text-foreground">
      <div className="font-bold text-lg text-primary">
        {data.league_category.category_name}
      </div>
      <div className="text-xs text-muted-foreground">Category</div>

      <div className="absolute right-2 top-[25%] text-xs text-muted-foreground transform -translate-y-1/2">
        Elimination
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="elimination"
        style={{ ...handleStyle, top: "25%" }}
      />

      <div className="absolute right-2 top-[45%] text-xs text-muted-foreground transform -translate-y-1/2">
        Quarterfinal
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="quarterfinal"
        style={{ ...handleStyle, top: "45%" }}
      />

      <div className="absolute right-2 top-[65%] text-xs text-muted-foreground transform -translate-y-1/2">
        Semifinal
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="semifinal"
        style={{ ...handleStyle, top: "65%" }}
      />

      <div className="absolute right-2 top-[85%] text-xs text-muted-foreground transform -translate-y-1/2">
        Final
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="final"
        style={{ ...handleStyle, top: "85%" }}
      />
    </div>
  );
};

export default memo(LeagueCategoryNode);

import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type ManualMatchConfigGroupNodeData } from "@/types/manualMatchConfigTypes";

const GroupNode: React.FC<NodeProps<Node<ManualMatchConfigGroupNodeData>>> = ({
  data,
}) => {
  return (
    <div className="relative p-3 border rounded-md bg-secondary w-24">
      <div className="font-semibold text-xs text-secondary-foreground">
        {data.group.display_name}
      </div>
      <div className="text-xs text-muted-foreground">Group</div>

      <Handle type="target" position={Position.Left} id="round-target" />
      <Handle type="source" position={Position.Right} id="match-source" />
    </div>
  );
};

export default memo(GroupNode);

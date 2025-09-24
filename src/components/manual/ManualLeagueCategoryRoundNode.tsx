import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LeagueCategoryRoundNode } from "@/types/manual";
import ManualGroupNode from "./ManualGroupNode";

const ManualLeagueCategoryRoundNode = ({
  data,
}: NodeProps<LeagueCategoryRoundNode>) => {
  const { round } = data;
  const groupCount = round.format_config?.group_count || 0;
  const groups = Array.from({ length: groupCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return (
    <div className="flex items-start gap-4">
      <div className="card border bg-card text-card-foreground shadow-md w-64">
        <div className="card-header p-2 bg-muted/50 border-b">
          <h3 className="card-title text-sm font-semibold">Round</h3>
        </div>
        <div className="card-content p-3">
          <p className="font-bold">{round.round_name}</p>
          <p className="text-xs text-muted-foreground">
            Format: {round.format_type}
          </p>
        </div>
        <Handle
          type="target"
          position={Position.Top}
          id={`${round.round_id}-target`}
          className="w-3 h-3 bg-primary"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id={`${round.round_id}-next-round`}
          className="w-3 h-3 bg-amber-500"
        />
      </div>
      {groups.length > 0 && (
        <div className="card border bg-card text-card-foreground shadow-md w-48 p-2">
          <h4 className="text-xs font-semibold text-center mb-2">Groups</h4>
          {groups.map((group) => (
            <ManualGroupNode
              key={group}
              roundId={round.round_id}
              groupName={`Group ${group}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default memo(ManualLeagueCategoryRoundNode);

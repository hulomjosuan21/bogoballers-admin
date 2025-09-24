import { Handle, Position } from "@xyflow/react";

interface ManualGroupNodeProps {
  roundId: string;
  groupName: string;
}

const ManualGroupNode: React.FC<ManualGroupNodeProps> = ({
  roundId,
  groupName,
}) => {
  return (
    <div className="relative flex items-center justify-between p-2 my-1 border rounded-md bg-background">
      <span className="text-xs font-medium">{groupName}</span>
      <Handle
        type="source"
        position={Position.Right}
        id={`${roundId}-group-${groupName}`}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default ManualGroupNode;

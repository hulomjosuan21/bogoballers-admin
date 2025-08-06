import { Handle, Position, type Connection, type Edge } from "@xyflow/react";
import {
  RoundTypeEnum,
  type CategoryNodeData,
  type RoundNodeData,
} from "./category-types";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CATEGORY_WIDTH = 1280;
export const CATEGORY_HEIGHT = 720;

export function CategoryNode({ data }: { data: CategoryNodeData }) {
  return (
    <div
      className={`border-2 rounded-md flex flex-col overflow-hidden w-[${CATEGORY_WIDTH}px] h-[${CATEGORY_HEIGHT}px]`}
    >
      <div className="bg-primary font-semibold text-sm p-3">
        {data.categoryName}
      </div>
      <div className="flex-1 p-2 overflow-auto">
        <p className="text-helper italic text-sm">
          Drop round & format nodes here...
        </p>
      </div>
    </div>
  );
}

export function RoundNode({ data }: { data: RoundNodeData }) {
  const { label, onOpen } = data;

  const hideLeftHandle = label === RoundTypeEnum.Elimination;
  const hideRightHandle = label === RoundTypeEnum.Final;

  return (
    <div className="bg-muted rounded-md p-3 cursor-pointer flex items-center justify-between gap-2 shadow-sm hover:opacity-90 transition border-2 group">
      <span className="font-medium">{label}</span>

      <Button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        size={"icon"}
        variant={"outline"}
      >
        <Settings2 className="w-4 h-4" />
      </Button>

      {!hideRightHandle && <Handle type="source" position={Position.Right} />}

      {!hideLeftHandle && <Handle type="target" position={Position.Left} />}

      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isValidConnection={(conn: Connection | Edge) => {
          if ("sourceHandle" in conn) {
            return conn.targetHandle === "top";
          }
          return false;
        }}
      />
    </div>
  );
}

export function FormatNode({ data }: { data: { label: string } }) {
  return (
    <div className="bg-muted rounded-md p-2 cursor-pointer flex items-center gap-2 shadow-sm hover:opacity-90 transition border-1">
      <span className="text-xs">{data.label}</span>
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        isValidConnection={(conn: Connection | Edge) => {
          if ("sourceHandle" in conn) {
            return conn.sourceHandle === "bottom";
          }
          return false;
        }}
      />
    </div>
  );
}

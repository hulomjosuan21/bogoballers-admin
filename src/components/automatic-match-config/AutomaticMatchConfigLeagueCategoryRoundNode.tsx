import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigLeagueCategoryRoundNodeData } from "@/types/automaticMatchConfigTypes";
import { RoundTypeEnum } from "@/types/leagueCategoryTypes";
import { Info, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const AutomaticMatchConfigLeagueCategoryRoundNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigLeagueCategoryRoundNodeData>> & {
    viewOnly?: boolean;
  }
> = ({ data }) => {
  const { round } = data;

  return (
    <div className="relative p-3 border rounded-md bg-background w-fit">
      {round.league_category_id ? (
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 items-center">
            <Info className="w-3 h-3 cursor-pointer text-muted-foreground" />
            <div className="font-semibold text-xs text-primary">
              {round.round_name}
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <div>
                <Settings className="w-3 h-3 cursor-pointer text-muted-foreground" />
              </div>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Round Settings</SheetTitle>
                <SheetDescription>
                  You can configure round options here.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <div className="font-semibold text-xs text-center text-primary">
          {round.round_name}
        </div>
      )}

      <div className="text-xs text-center text-muted-foreground">Round</div>

      <Handle type="target" position={Position.Left} id="round-in" />

      <Handle type="target" position={Position.Top} id="round-format-in" />

      {data.round.round_name !== RoundTypeEnum.Final && (
        <Handle type="source" position={Position.Right} id="round-out" />
      )}
    </div>
  );
};

export default memo(AutomaticMatchConfigLeagueCategoryRoundNode);

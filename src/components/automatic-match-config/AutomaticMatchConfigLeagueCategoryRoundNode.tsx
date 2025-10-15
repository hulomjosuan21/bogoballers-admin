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
  return (
    <div className="relative p-3 border rounded-md bg-background w-fit">
      <div className="flex gap-2 items-center">
        <div className="flex gap-1 items-center">
          <Info className="w-3 h-3 cursor-pointer text-muted-foreground" />
          <div className="font-semibold text-xs text-primary">
            {data.round.round_name}
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <div className="">
              <Settings className="w-3 h-3 cursor-pointer text-muted-foreground" />
            </div>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Are you absolutely sure?</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <div className="text-xs text-center text-muted-foreground">Round</div>
      <Handle type="source" position={Position.Top} id="" />
      <Handle type="source" position={Position.Left} id="" />
      {data.round.round_name != RoundTypeEnum.Final && (
        <Handle type="source" position={Position.Right} id="" />
      )}
    </div>
  );
};

export default memo(AutomaticMatchConfigLeagueCategoryRoundNode);

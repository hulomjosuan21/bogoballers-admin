import React, { memo, useTransition } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type ManualMatchConfigLeagueCategoryNodeData } from "@/types/manualMatchConfigTypes";
import { Button } from "../ui/button";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { manualLeagueService } from "@/service/manualLeagueManagementService";
import { Spinner } from "../ui/spinner";
import { getErrorMessage } from "@/lib/error";
import { useLeagueStore } from "@/stores/leagueStore";
import { queryClient } from "@/lib/queryClient";

const handleStyle = {};

const ManualMatchConfigLeagueCategoryNode: React.FC<
  NodeProps<Node<ManualMatchConfigLeagueCategoryNodeData>>
> = ({ data }) => {
  const { leagueId: activeLeagueId } = useLeagueStore();

  if (!activeLeagueId) {
    return null;
  }

  const { league_category_id } = data.league_category;

  const [isPending, startTransition] = useTransition();

  const handleSyncBracket = async () => {
    if (!activeLeagueId) {
      toast.error("No active league to synchronize.");
      return;
    }

    try {
      toast.info("Synchronizing bracket...");

      startTransition(async () => {
        const result = await manualLeagueService.synchronizeBracket(
          league_category_id
        );

        await queryClient.invalidateQueries({
          queryKey: ["manual-match-config-flow", activeLeagueId],
          exact: true,
        });
        toast.success(`${result.message}`);
      });
    } catch (error) {
      toast.error(
        error ? getErrorMessage(error) : "Failed to synchronize bracket."
      );
    }
  };

  return (
    <div className="relative">
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

      <div className="absolute left-1/2 transform -translate-x-1/2 mt-1">
        <Button
          size="sm"
          className="h-7 px-1.5"
          onClick={handleSyncBracket}
          disabled={isPending}
        >
          {isPending ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <ArrowRightLeft className="w-4 h-4" />
          )}
          Sync
        </Button>
      </div>
    </div>
  );
};

export default memo(ManualMatchConfigLeagueCategoryNode);

import React, { memo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigLeagueCategoryRoundNodeData } from "@/types/automaticMatchConfigTypes";
import {
  RoundFormatTypesEnum,
  RoundTypeEnum,
} from "@/types/leagueCategoryTypes";
import { Info, Settings, Play, FastForward, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import { autoMatchConfigService } from "@/service/automaticMatchConfigService";
import { getErrorMessage } from "@/lib/error";

const AutomaticMatchConfigLeagueCategoryRoundNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigLeagueCategoryRoundNodeData>> & {
    viewOnly?: boolean;
  }
> = ({ data }) => {
  const { round } = data;
  const [loading, setLoading] = useState<
    "generate" | "progress" | "reset" | null
  >(null);

  const handleGenerate = async () => {
    try {
      setLoading("generate");
      await autoMatchConfigService.generateMatches(round.round_id!);
      toast.success("Matches generated successfully!");
    } catch (e) {
      toast.error("Failed to generate matches.");
    } finally {
      setLoading(null);
    }
  };

  const handleProgress = async () => {
    try {
      setLoading("progress");
      const result = await autoMatchConfigService.progressRound(
        round.round_id!
      );
      toast.success(result.message);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  const handleReset = async () => {
    try {
      setLoading("reset");
      await autoMatchConfigService.resetRound(round.round_id!);
      toast.success("Matches reset successfully!");
    } catch (e) {
      toast.error("Failed to reset matches.");
    } finally {
      setLoading(null);
    }
  };

  const renderProgressButton = () => {
    if (!round) return null;

    const isLoading = loading === "progress";

    if (round.format?.format_type == RoundFormatTypesEnum.DoubleElimination) {
      if (round.current_stage != null && round.total_stages != null) {
        if (round.current_stage < round.total_stages) {
          return (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleProgress}
              disabled={isLoading}
            >
              <FastForward className="w-3 h-3 mr-1" />
              {isLoading
                ? "Progressing..."
                : `Progress to Stage ${round.current_stage + 1}`}
            </Button>
          );
        } else {
          return (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleProgress}
              disabled={isLoading}
            >
              <FastForward className="w-3 h-3 mr-1" />
              {isLoading ? "Processing..." : "Process Final"}
            </Button>
          );
        }
      }
    }

    if (round.round_name === RoundTypeEnum.Final) {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleProgress}
          disabled={isLoading}
        >
          <FastForward className="w-3 h-3 mr-1" />
          {isLoading ? "Processing..." : "Process Final"}
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={handleProgress}
        disabled={isLoading}
      >
        <FastForward className="w-3 h-3 mr-1" />
        {isLoading ? "Progressing..." : "Progress Round"}
      </Button>
    );
  };

  return (
    <div className="relative p-3 border rounded-md bg-background w-fit">
      {round.league_category_id ? (
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 items-center">
            <Sheet>
              <SheetTrigger asChild>
                <div>
                  <Info className="w-3 h-3 cursor-pointer text-muted-foreground" />
                </div>
              </SheetTrigger>
              <SheetContent className="p-0">
                <SheetHeader className="py-4 px-5 border-b border-border">
                  <SheetTitle>Round Details</SheetTitle>
                  <SheetDescription>
                    Information about this round
                  </SheetDescription>
                </SheetHeader>
                <SheetBody className="py-0 px-5 grow">
                  <ScrollArea className="h-[calc(100dvh-190px)] pe-3 -me-3">
                    <div className="text-sm text-muted-foreground mt-2">
                      Round ID: {round.round_id}
                      <br />
                      Status: {round.round_status}
                      <br />
                      Order: {round.round_order}
                    </div>
                  </ScrollArea>
                </SheetBody>
              </SheetContent>
            </Sheet>

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
            <SheetContent className="p-0" side={"bottom"}>
              <SheetHeader className="py-4 px-5 border-b border-border">
                <SheetTitle>Edit Round</SheetTitle>
                <SheetDescription>
                  Update configuration or control matches for this round
                </SheetDescription>
              </SheetHeader>

              <SheetBody className="py-0 px-5 grow">
                <ScrollArea className="h-[calc(100dvh-190px)] pe-3 -me-3">
                  {/* Round settings UI can go here */}
                </ScrollArea>
              </SheetBody>

              <SheetFooter className="flex flex-col gap-2 py-4 px-5 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={loading === "generate"}
                >
                  <Play className="w-3 h-3 mr-1" />
                  {loading === "generate"
                    ? "Generating..."
                    : "Generate Matches"}
                </Button>

                {renderProgressButton()}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReset}
                  disabled={loading === "reset"}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {loading === "reset" ? "Resetting..." : "Reset Matches"}
                </Button>
              </SheetFooter>
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

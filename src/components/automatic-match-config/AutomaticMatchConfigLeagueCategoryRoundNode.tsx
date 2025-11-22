import React, { memo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigLeagueCategoryRoundNodeData } from "@/types/automaticMatchConfigTypes";
import {
  RoundFormatTypesEnum,
  RoundTypeEnum,
} from "@/types/leagueCategoryTypes";
import {
  Info,
  Settings,
  Play,
  FastForward,
  RotateCcw,
  Trophy,
  Hash,
  ListOrdered,
  Calendar,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { aiAutoMatchConfigService } from "@/service/aiAutomaticMatchConfigService";
import { ActivityLogsFeed } from "../ActivityLogsFeed";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { leagueService } from "@/service/leagueService";
import { queryClient } from "@/lib/queryClient";
import { useLeagueStore } from "@/stores/leagueStore";
import { useAlertDialog } from "@/hooks/userAlertDialog";

const AutomaticMatchConfigLeagueCategoryRoundNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigLeagueCategoryRoundNodeData>> & {
    viewOnly?: boolean;
  }
> = ({ data }) => {
  const { round } = data;
  const roundId = round.round_id;
  const { leagueId } = useLeagueStore();
  const queryKey = ["activity-logs-round", roundId];
  const { openDialog } = useAlertDialog();
  const {
    data: logData,
    isLoading: logLoading,
    error: logError,
    refetch: refetchLog,
  } = useQuery({
    queryKey,
    queryFn: () =>
      leagueService.getLogs({
        round_id: roundId,
      }),
    enabled: !!roundId,
  });

  const [loading, setLoading] = useState<
    "generate" | "progress" | "reset" | null
  >(null);

  const handleGenerate = () => {
    if (!round.round_id) return;

    const asyncHandle = async () => {
      const res = await aiAutoMatchConfigService.generateMatches(
        round.round_id!
      );
      await refetchLog();
      if (leagueId) {
        await queryClient.refetchQueries({
          queryKey: ["auto-match-config-flow", leagueId],
          exact: true,
        });
      }
      return res;
    };

    setLoading("generate");

    toast.promise(asyncHandle(), {
      loading: "Generating matches and updating logs...",
      success: (res) => {
        setLoading(null);
        return res.explanation || "AI has created the initial schedule.";
      },
      error: (err) => {
        setLoading(null);
        return `Generation Failed: ${getErrorMessage(err)}`;
      },
    });
  };

  const handleProgress = () => {
    if (!round.round_id) return;

    const asyncHandle = async () => {
      const res = await aiAutoMatchConfigService.progressRound(round.round_id!);
      await refetchLog();
      if (leagueId) {
        await queryClient.refetchQueries({
          queryKey: ["auto-match-config-flow", leagueId],
          exact: true,
        });
      }
      return res;
    };

    setLoading("progress");

    toast.promise(asyncHandle(), {
      loading: "Progressing round and updating logs...",

      success: (res) => {
        setLoading(null);
        return res.explanation || "Team statuses updated successfully.";
      },

      error: (err) => {
        setLoading(null);
        return `Cannot Progress: ${getErrorMessage(err)}`;
      },
    });
  };

  const handleReset = async () => {
    if (!round.round_id) return;

    const confirm = await openDialog({
      description: "Are you sure? This will delete ALL matches in this round.",
      confirmText: "Proceed",
      cancelText: "Cancel",
    });
    if (!confirm) return;

    const asyncHandle = async () => {
      const res = await aiAutoMatchConfigService.resetRound(round.round_id!);
      await refetchLog();

      if (leagueId) {
        await queryClient.refetchQueries({
          queryKey: ["auto-match-config-flow", leagueId],
          exact: true,
        });
      }
      return res;
    };

    setLoading("reset");
    ``;

    toast.promise(asyncHandle(), {
      loading: "Resetting round and updating logs...",

      success: () => {
        setLoading(null);
        return "Matches deleted and team statuses reverted.";
      },

      error: (err) => {
        setLoading(null);
        return `Reset Failed: ${getErrorMessage(err)}`;
      },
    });
  };

  const renderProgressButton = () => {
    if (!round) return null;

    const isLoading = loading === "progress";
    const isDisabled = isLoading || !round.matches_generated;

    let buttonText = "Progress Round";
    let Icon = FastForward;
    if (round.format?.format_type === RoundFormatTypesEnum.DoubleElimination) {
      if (round.current_stage != null && round.total_stages != null) {
        if (round.current_stage < round.total_stages) {
          buttonText = `Progress to Stage ${round.current_stage + 1}`;
        } else {
          buttonText = "Process Final Results";
          Icon = Trophy;
        }
      }
    } else if (round.round_name === RoundTypeEnum.Final) {
      buttonText = "Process Champion";
      Icon = Trophy;
    }

    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={handleProgress}
        disabled={isDisabled}
        className="w-full justify-start font-medium"
      >
        <Icon className="w-4 h-4 mr-2 text-blue-500" />
        {isLoading ? "Processing..." : buttonText}
      </Button>
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Ongoing":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  return (
    <div className="relative p-3 border rounded-lg bg-background w-fit min-w-[180px] shadow-sm hover:shadow-md transition-all duration-200 group">
      {round.league_category_id ? (
        <div className="flex gap-3 items-center justify-between">
          <div className="flex gap-2 items-center flex-1">
            <Sheet>
              <SheetTrigger asChild>
                <div className="p-1.5 hover:bg-accent rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                  <Info className="w-4 h-4" />
                </div>
              </SheetTrigger>
              <SheetContent className="p-0 w-[400px] sm:w-[540px]">
                <SheetHeader className="py-6 px-6 border-b bg-muted/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 bg-primary/10 rounded-lg">
                      <Trophy className="w-5 h-5 text-primary" />
                    </span>
                    <SheetTitle className="text-lg font-bold">
                      Round Details
                    </SheetTitle>
                  </div>
                  <SheetDescription className="text-base">
                    configuration for{" "}
                    <span className="font-medium text-foreground">
                      {round.round_name}
                    </span>
                  </SheetDescription>
                </SheetHeader>

                <SheetBody className="px-6 py-6">
                  <ScrollArea className="h-[calc(100dvh-200px)] pr-4">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 p-4 rounded-lg border bg-card shadow-sm">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Current Status
                          </h4>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-md text-sm font-semibold border",
                                getStatusColor(round.round_status)
                              )}
                            >
                              {round.round_status || "Pending"}
                            </span>
                            {round.matches_generated && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Matches
                                Generated
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-card shadow-sm space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <ListOrdered className="w-3 h-3" /> Order
                            </div>
                            <p className="font-medium">{round.round_order}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" /> Created
                            </div>
                            <p className="font-medium text-sm">
                              {new Date().toLocaleDateString()}{" "}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-card shadow-sm space-y-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Hash className="w-3 h-3" /> System ID
                            </div>
                            <p className="font-mono text-xs text-muted-foreground break-all">
                              {round.round_id?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t">
                        <h4 className="text-sm font-semibold">
                          Configuration Data
                        </h4>
                        <div className="bg-muted/50 p-3 rounded-md font-mono text-xs text-muted-foreground break-all">
                          ID: {round.round_id}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetBody>
              </SheetContent>
            </Sheet>

            <div className="font-bold text-sm text-foreground truncate max-w-[120px]">
              {round.round_name}
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <div className="p-1.5 hover:bg-accent rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </div>
            </SheetTrigger>
            <SheetContent className="p-0 flex flex-col h-full" side={"right"}>
              <SheetHeader className="py-5 px-6 border-b bg-muted/5 shrink-0">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <SheetTitle>Round Controls</SheetTitle>
                </div>
                <SheetDescription>
                  Manage matches and progression for {round.round_name}
                </SheetDescription>
              </SheetHeader>

              <SheetBody className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-hidden relative bg-muted/5">
                  <ActivityLogsFeed
                    logs={logData?.data || []}
                    isLoading={logLoading}
                    error={logError}
                    height="h-full"
                  />
                </div>
              </SheetBody>

              <SheetFooter className="p-6 border-t bg-background shrink-0 sm:justify-start flex-col items-stretch gap-0">
                <div className="space-y-4 w-full">
                  {/* Actions Group */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Match Actions
                    </h4>
                    <div className="grid gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerate}
                        disabled={
                          loading === "generate" || round.matches_generated
                        }
                        className={cn(
                          "w-full justify-start",
                          round.matches_generated && "opacity-60"
                        )}
                      >
                        <Play className="w-4 h-4 mr-2 text-green-600" />
                        {loading === "generate"
                          ? "Generating..."
                          : "Generate Initial Matches"}
                      </Button>

                      {round.matches_generated && (
                        <div className="pl-1">{renderProgressButton()}</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <h4 className="text-xs font-semibold text-red-500/80 uppercase tracking-wider mb-2 mt-1">
                      Danger Zone
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleReset}
                      disabled={loading === "reset" || !round.matches_generated}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {loading === "reset"
                        ? "Resetting..."
                        : "Reset Round Data"}
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <div className="font-semibold text-sm text-center text-primary py-1">
          {round.round_name}
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-dashed">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            round.matches_generated ? "bg-green-500" : "bg-gray-300"
          )}
        />
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          {round.matches_generated ? round.round_status : "Not Started"}
        </span>
      </div>

      <Handle type="target" position={Position.Left} id="round-in" />
      <Handle type="target" position={Position.Top} id="round-format-in" />

      {data.round.round_name !== RoundTypeEnum.Final && (
        <Handle type="source" position={Position.Right} id="round-out" />
      )}
    </div>
  );
};

export default memo(AutomaticMatchConfigLeagueCategoryRoundNode);

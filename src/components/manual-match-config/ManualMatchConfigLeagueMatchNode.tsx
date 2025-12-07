import React, { memo, useCallback, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { ManualMatchConfigLeagueMatchNodeData } from "@/types/manualMatchConfigTypes";
import { useManualMatchConfigFlowDispatch } from "@/context/ManualMatchConfigFlowContext";
import type { LeagueTeam } from "@/types/team";
import { manualLeagueService } from "@/service/manualLeagueManagementService";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { cn } from "@/lib/utils";
import { ManualScoreDialog } from "@/dialogs/manualScoreDialog";
import type { LeagueMatch } from "@/types/leagueMatch";
import { queryClient } from "@/lib/queryClient";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";

const TeamDropZone = ({
  team,
  side,
  placeholder,
}: {
  side: "left" | "right";
  team?: LeagueTeam | null;
  is_round_robin?: boolean;
  placeholder: string;
}) => {
  const baseClasses =
    "border border-dashed h-14 w-28 rounded-sm grid place-content-center text-center p-1 bg-background/50 cursor-pointer transition-all hover:bg-accent/50 select-none";

  return (
    <>
      <div
        className={
          team
            ? baseClasses
            : `${baseClasses} border-muted-foreground/30 opacity-70`
        }
      >
        {team ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "text-[11px] font-semibold text-foreground line-clamp-2",
                    team.is_eliminated
                      ? "line-through text-red-400"
                      : "text-foreground"
                  )}
                >
                  {team.team_name}
                </span>
              </TooltipTrigger>
              <TooltipContent side={side}>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Wins:</span>
                    <span className="font-medium">{team.wins}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Losses:</span>
                    <span className="font-medium">{team.losses}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-xs font-thin text-muted-foreground">
            {placeholder}
          </span>
        )}
      </div>
    </>
  );
};

const ManualMatchConfigLeagueMatchNode: React.FC<
  NodeProps<Node<ManualMatchConfigLeagueMatchNodeData>>
> = ({ id, data }) => {
  const { league_id } = useActiveLeagueMeta();
  const dispatch = useManualMatchConfigFlowDispatch();
  const match = data.league_match;

  const [scoreDialog, setScoreDialog] = useState<{
    isOpen: boolean;
    match: Partial<LeagueMatch> | null;
  }>({
    isOpen: false,
    match: null,
  });

  const updateMatch = useCallback(
    (updates: Partial<typeof match>) => {
      dispatch({
        type: "UPDATE_NODE_DATA",
        payload: {
          nodeId: id,
          data: { league_match: { ...match, ...updates } },
        },
      });
    },
    [dispatch, id, match]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent, teamSlot: "home" | "away") => {
      e.preventDefault();
      e.stopPropagation();

      const isPermanentNode = id.startsWith("lmatch-");
      if (!isPermanentNode) {
        toast.error("Connect match to group first");
        return;
      }

      const teamStr = e.dataTransfer.getData("application/reactflow-team");
      if (!teamStr) return;

      try {
        const team: LeagueTeam = JSON.parse(teamStr);

        updateMatch(
          teamSlot === "home"
            ? { home_team: team, home_team_id: team.league_team_id }
            : { away_team: team, away_team_id: team.league_team_id }
        );

        await manualLeagueService.assignTeamToMatch(id, {
          team_id: team.league_team_id,
          slot: teamSlot,
        });

        toast.success(`${team.team_name} → ${teamSlot}`);
      } catch {
        toast.error("Failed to assign team");
      }
    },
    [id, updateMatch]
  );

  const resolveDisplayName = () => {
    if (match.winner_team_id && match.loser_team_id) {
      return `${match.home_team_score ?? 0} - ${match.away_team_score ?? 0}`;
    }
    return match.display_name || `Match ${id.substring(0, 6)}`;
  };

  const renderWinHandle = () => {
    const { is_final, is_round_robin, is_third_place } = match;

    if (is_round_robin) {
      return (
        <Handle type="source" position={Position.Right} id={`result-${id}`} />
      );
    }

    if (is_final) return null;

    if (is_third_place) return null;

    return (
      <>
        <div className="absolute -right-5 top-[33%] text-xs text-blue-500 -translate-y-1/2">
          W
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id={`winner-${id}`}
          style={{ top: "33%", background: "hsl(var(--sky-500))" }}
        />
      </>
    );
  };

  const renderLossHandle = () => {
    const { is_final, is_third_place, is_elimination, is_round_robin } = match;

    if (is_final || is_third_place || is_round_robin) return null;

    if (!is_elimination) {
      return (
        <>
          <div className="absolute -right-5 top-[66%] text-xs text-red-500 -translate-y-1/2">
            L
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id={`loser-${id}`}
            style={{ top: "66%", background: "hsl(var(--destructive))" }}
          />
        </>
      );
    }

    return null;
  };

  return (
    <div
      className="p-3 border rounded-lg bg-card shadow-sm"
      onDoubleClick={() => setScoreDialog({ isOpen: true, match })}
    >
      <ManualScoreDialog
        open={scoreDialog.isOpen}
        match={scoreDialog.match}
        onOpenChange={(isOpen) =>
          setScoreDialog((prev) => ({ ...prev, isOpen }))
        }
        onSuccess={async () => {
          await queryClient.invalidateQueries({
            queryKey: ["manual-match-config-flow", league_id],
            exact: true,
          });
        }}
      />
      <div className="text-center text-xs font-medium text-muted-foreground mb-2">
        {resolveDisplayName()}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div onDragOver={onDragOver} onDrop={(e) => onDrop(e, "home")}>
          <TeamDropZone
            team={match.home_team}
            side="left"
            placeholder="Home Team"
            is_round_robin={match.is_round_robin}
          />
        </div>

        <span className="font-bold text-lg text-primary">VS</span>

        <div onDragOver={onDragOver} onDrop={(e) => onDrop(e, "away")}>
          <TeamDropZone
            team={match.away_team}
            side="right"
            placeholder="Away Team"
            is_round_robin={match.is_round_robin}
          />
        </div>
      </div>

      <Handle type="target" position={Position.Left} id="match-input" />

      {renderWinHandle()}
      {renderLossHandle()}
    </div>
  );
};

export default memo(ManualMatchConfigLeagueMatchNode);

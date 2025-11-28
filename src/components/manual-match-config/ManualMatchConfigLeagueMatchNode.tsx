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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

const TeamDropZone = ({
  team,
  side,
  placeholder,
  is_round_robin,
  matchId,
  slot,
  currentScore = 0,
}: {
  side: "left" | "right";
  team?: LeagueTeam | null;
  is_round_robin?: boolean;
  placeholder: string;
  matchId: string;
  slot: "home" | "away";
  currentScore?: number;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState("");

  const updateScoreMutation = useMutation({
    mutationFn: (score: number) =>
      manualLeagueService.updateScore(matchId, { slot, score }),
    onSuccess: (response) => {
      toast.success(response.data.message || "Score updated");
      setScoreInput("");
    },
    onError: () => toast.error("Failed to update score"),
  });

  const eliminateMutation = useMutation({
    mutationFn: () => manualLeagueService.eliminateTeam(team!.league_team_id),
    onSuccess: (response) => {
      toast.success(response.data.message || "Team eliminated");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Failed to eliminate team"),
  });

  const handleUpdateScore = () => {
    const score = scoreInput === "" ? 0 : parseInt(scoreInput, 10);
    if (isNaN(score) || score < 0) {
      toast.error("Please enter a valid score");
      return;
    }
    updateScoreMutation.mutate(score);
  };

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
        onDoubleClick={() => {
          if (!team) return;
          setIsDialogOpen(true);
        }}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {team?.team_name || "Empty Slot"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="score" className="sr-only">
                  Score
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  placeholder={currentScore.toString()}
                  value={scoreInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d+$/.test(val)) setScoreInput(val);
                  }}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              {is_round_robin ? (
                <Button
                  variant="destructive"
                  onClick={() => eliminateMutation.mutate()}
                  disabled={eliminateMutation.isPending || !is_round_robin}
                >
                  Eliminate
                </Button>
              ) : (
                <span className="text-info text-[10px]">
                  Eliminating a team in a match node is only allowed in a match
                  format template
                </span>
              )}

              <Button
                onClick={handleUpdateScore}
                disabled={updateScoreMutation.isPending}
              >
                {updateScoreMutation.isPending ? "..." : "Update"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ManualMatchConfigLeagueMatchNode: React.FC<
  NodeProps<Node<ManualMatchConfigLeagueMatchNodeData>>
> = ({ id, data }) => {
  const dispatch = useManualMatchConfigFlowDispatch();
  const match = data.league_match;
  const matchId = match.league_match_id || id;

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
        <div className="absolute right-[-20px] top-[33%] text-xs text-blue-500 -translate-y-1/2">
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
          <div className="absolute right-[-20px] top-[66%] text-xs text-red-500 -translate-y-1/2">
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
    <div className="p-3 border rounded-lg bg-card shadow-sm">
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
            matchId={matchId}
            slot="home"
            currentScore={match.home_team_score ?? 0}
          />
        </div>

        <span className="font-bold text-lg text-primary">VS</span>

        <div onDragOver={onDragOver} onDrop={(e) => onDrop(e, "away")}>
          <TeamDropZone
            team={match.away_team}
            side="right"
            placeholder="Away Team"
            is_round_robin={match.is_round_robin}
            matchId={matchId}
            slot="away"
            currentScore={match.away_team_score ?? 0}
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

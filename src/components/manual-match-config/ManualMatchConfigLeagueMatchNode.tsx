import React, { memo, useCallback } from "react";
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

const TeamDropZone = ({
  team,
  side,
  placeholder,
}: {
  side: "left" | "right";
  team?: LeagueTeam | null;
  placeholder: string;
}) => (
  <>
    {team ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border border-dashed h-14 w-28 rounded-sm grid place-content-center text-center p-1 bg-background/50">
              <span className="text-[11px] font-semibold text-foreground line-clamp-2">
                {team.team_name}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side={side}>
            <div className="stat-list">
              <div className="stat-item">
                <span className="stat-label">Wins:</span>
                <span className="stat-value">{team.wins}</span>
              </div>

              <div className="stat-item">
                <span className="stat-label">Losses:</span>
                <span className="stat-value">{team.losses}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <div className="border border-dashed h-14 w-28 rounded-sm grid place-content-center text-center p-1 bg-background/50">
        <span className="text-xs font-thin text-muted-foreground">
          {placeholder}
        </span>
      </div>
    )}
  </>
);

const ManualMatchConfigLeagueMatchNode: React.FC<
  NodeProps<Node<ManualMatchConfigLeagueMatchNodeData>>
> = ({ id, data }) => {
  const dispatch = useManualMatchConfigFlowDispatch();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent, teamSlot: "home" | "away") => {
      event.preventDefault();
      event.stopPropagation();

      const isPermanentNode = id.startsWith("lmatch-");
      if (!isPermanentNode) {
        toast.error(
          "Cannot assign team. Please connect the match to a group first."
        );
        return;
      }

      const teamString = event.dataTransfer.getData(
        "application/reactflow-team"
      );
      if (!teamString) return;

      try {
        const team: LeagueTeam = JSON.parse(teamString);

        const newMatchData = { ...data.league_match };
        if (teamSlot === "home") {
          newMatchData.home_team_id = team.league_team_id;
          newMatchData.home_team = team;
        } else {
          newMatchData.away_team_id = team.league_team_id;
          newMatchData.away_team = team;
        }
        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: { nodeId: id, data: { league_match: newMatchData } },
        });

        await manualLeagueService.assignTeamToMatch(id, {
          team_id: team.league_team_id,
          slot: teamSlot,
        });
        toast.success(`${team.team_name} assigned to ${teamSlot} slot.`);
      } catch (e) {
        toast.error("Failed to assign team to the match.");
      }
    },
    [id, data.league_match, dispatch]
  );

  const rosolve = () => {
    if (data.league_match.winner_team_id && data.league_match.loser_team_id) {
      return `${data.league_match.home_team_score} - ${data.league_match.away_team_score}`;
    } else {
      return data.league_match.display_name || `Match ${id.substring(0, 4)}`;
    }
  };

  const renderWinHandle = () => {
    if (!data) return null;

    const { is_final, is_runner_up, is_third_place } = data.league_match;

    if (!(is_final || is_runner_up || is_third_place)) {
      return (
        <>
          <div className="absolute right-[-20px] top-[33%] text-xs text-blue-500 transform -translate-y-1/2">
            W
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id={`winner-${id}`}
            style={{
              top: "33%",
              background: "hsl(var(--sky-500, 202 89% 51%))",
            }}
          />
        </>
      );
    }

    return null;
  };

  const renderLossHandle = () => {
    if (!data) return null;

    const { is_final, is_runner_up, is_third_place, is_elimination } =
      data.league_match;

    if (is_final || is_runner_up || is_third_place) {
      return null;
    }

    if (!is_elimination) {
      return (
        <>
          <div className="absolute right-[-20px] top-[66%] text-xs text-red-500 transform -translate-y-1/2">
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
    <div className="p-2 border rounded-md bg-card">
      <div className="text-xs text-muted-foreground mb-1 text-center">
        {rosolve()}
      </div>
      <div className="flex gap-2 justify-between items-center">
        <div onDragOver={onDragOver} onDrop={(e) => onDrop(e, "home")}>
          <TeamDropZone
            side="left"
            team={data.league_match.home_team}
            placeholder="Home Team"
          />
        </div>
        <span className="font-semibold text-xs text-primary">vs</span>
        <div onDragOver={onDragOver} onDrop={(e) => onDrop(e, "away")}>
          <TeamDropZone
            side="right"
            team={data.league_match.away_team}
            placeholder="Away Team"
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

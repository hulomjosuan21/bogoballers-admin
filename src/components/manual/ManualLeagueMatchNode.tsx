import { memo, type DragEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LeagueMatchNode } from "@/types/manual"; // Adjust path
import { useFlow } from "@/context/ManualFlowContext";

const TeamSlot: React.FC<{
  teamName: string | null | undefined;
  slotType: "home" | "away";
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
}> = ({ teamName, slotType, onDrop }) => {
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  return (
    <div
      onDrop={onDrop}
      onDragOver={handleDragOver}
      data-slot-type={slotType}
      className={`flex-1 p-3 border-2 border-dashed rounded-md text-center ${
        !teamName
          ? "border-muted-foreground/50"
          : "border-primary/50 bg-primary/10"
      }`}
    >
      <p className="text-sm font-semibold">
        {teamName || `Drop ${slotType} team`}
      </p>
    </div>
  );
};

const ManualLeagueMatchNode = ({ data, id }: NodeProps<LeagueMatchNode>) => {
  const { match } = data;
  // Destructure the match object from the data prop
  const { updateMatchWithTeam } = useFlow();

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const slotType = event.currentTarget.dataset.slotType as "home" | "away";
    const teamId = event.dataTransfer.getData("application/reactflow-team");
    if (!slotType || !teamId) return;
    updateMatchWithTeam(id, teamId, slotType);
  };

  return (
    <div className="card border bg-card text-card-foreground shadow-lg w-80">
      <Handle
        type="target"
        position={Position.Left}
        id="home"
        className="top-1/3 !bg-blue-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="away"
        className="top-2/3 !bg-red-500"
      />
      <div className="card-header p-2 bg-muted/50 border-b">
        <h3 className="card-title text-xs font-medium text-muted-foreground">
          Match ID: {match.public_league_match_id}
        </h3>
      </div>
      <div className="card-content p-3 space-y-2">
        <TeamSlot
          teamName={match.home_team?.team_name}
          slotType="home"
          onDrop={onDrop}
        />
        <div className="text-center font-bold text-muted-foreground">VS</div>
        <TeamSlot
          teamName={match.away_team?.team_name}
          slotType="away"
          onDrop={onDrop}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="winner"
        style={{ top: "33%" }}
        className="!bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="loser"
        style={{ top: "66%" }}
        className="!bg-rose-500"
      />
    </div>
  );
};
export default memo(ManualLeagueMatchNode);

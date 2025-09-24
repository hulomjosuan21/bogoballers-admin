import type { DragEvent } from "react";
import type { LeagueTeam } from "@/types/team"; // Adjust path
import { useFlow } from "@/context/ManualFlowContext";

const DraggableTeam = ({ team }: { team: LeagueTeam }) => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, teamId: string) => {
    event.dataTransfer.setData("application/reactflow-team", teamId);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, team.league_team_id)}
      className="p-2 my-1 border rounded-lg cursor-grab bg-background hover:bg-muted active:cursor-grabbing"
    >
      <p className="font-semibold text-sm">{team.team_name}</p>
      <p className="text-xs text-muted-foreground">ID: {team.public_team_id}</p>
    </div>
  );
};

const ManualLeagueTeamNodeMenu = () => {
  const { leagueTeams } = useFlow();

  return (
    <aside className="absolute top-4 left-4 z-10 w-64 h-[calc(100vh-2rem)]">
      <div className="card border bg-card text-card-foreground shadow-xl h-full flex flex-col">
        <div className="card-header p-3 border-b">
          <h2 className="card-title font-bold">Available Teams</h2>
        </div>
        <div className="card-content p-2 overflow-y-auto">
          {leagueTeams.length > 0 ? (
            leagueTeams.map((team) => (
              <DraggableTeam key={team.league_team_id} team={team} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No teams available.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ManualLeagueTeamNodeMenu;

import type { DragEvent } from "react";
import { useFlow } from "@/context/ManualFlowContext";
import type { LeagueTeam } from "@/types/team"; // Adjust path
import { useState } from "react";

// A small, draggable component for a single team
const DraggableTeam = ({ team }: { team: LeagueTeam }) => {
  const onDragStart = (event: DragEvent<HTMLDivElement>, teamId: string) => {
    // This sets the data that will be read when the item is dropped
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

// The main sidebar component that lists all available teams
const ManualLeagueTeamMenu = () => {
  const { leagueTeams, setLeagueTeams } = useFlow();

  // You will replace this with a useEffect that fetches teams from your API
  // For now, let's add some temporary teams for testing.
  useState(() => {
    const mockTeams: LeagueTeam[] = [
      {
        league_team_id: "team-a",
        public_team_id: "T-A",
        team_name: "Bogo Sharks",
      } as LeagueTeam,
      {
        league_team_id: "team-b",
        public_team_id: "T-B",
        team_name: "Cebu City Eagles",
      } as LeagueTeam,
      {
        league_team_id: "team-c",
        public_team_id: "T-C",
        team_name: "Mandaue Lions",
      } as LeagueTeam,
    ];
    setLeagueTeams(mockTeams);
  });

  return (
    <aside className="p-4 h-full">
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

export default ManualLeagueTeamMenu;

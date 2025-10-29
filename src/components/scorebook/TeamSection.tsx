import type { TeamBook } from "@/types/scorebook";
import { PlayerRoster } from "./PlayerRoster";
import { Input, InputAddon, InputGroup } from "../ui/input";
import { TeamStatsByQuarterTable } from "./TeamStatsByQuarterTable";
import { memo } from "react";
import { Badge } from "../ui/badge";
import { TeamTimeoutTable } from "./TeamTimeoutTable";
import { useGame } from "@/context/GameContext";

type Props = {
  viewMode?: boolean;
  team: TeamBook;
};

export const TeamSection = memo(function TeamSection({
  viewMode = false,
  team,
}: Props) {
  const { dispatch } = useGame();
  const handleStatChange = (
    stat: "coachT" | "none_memberT" | "capT_ball",
    value: string
  ) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      dispatch({
        type: "UPDATE_TEAM_STAT",
        payload: {
          teamId: team.team_id,
          stat: stat,
          value: numericValue,
        },
      });
    }
  };

  return (
    <section className="grid auto-rows-auto gap-4 p-3 border rounded-lg">
      <div className="flex gap-1 items-center">
        {team.team_logo_url ? (
          <img
            src={team.team_logo_url}
            alt={team.team_name}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold uppercase">
            {team.team_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}
        <h2 className="text-md font-semibold">{team.team_name}</h2>
        <Badge className="text-xs">{team.side}</Badge>
      </div>

      <PlayerRoster viewMode={viewMode} team={team} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <TeamStatsByQuarterTable team={team} viewMode={viewMode} />
        <TeamTimeoutTable team={team} viewMode={viewMode} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <InputGroup>
          <InputAddon variant={"sm"}>CoachT</InputAddon>
          <Input
            type="number"
            value={team.coachT}
            onChange={(e) => handleStatChange("coachT", e.target.value)}
            disabled={viewMode}
            variant={"sm"}
          />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>NoneMemberT</InputAddon>
          <Input
            type="number"
            value={team.none_memberT}
            onChange={(e) => handleStatChange("none_memberT", e.target.value)}
            disabled={viewMode}
            variant={"sm"}
          />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>CAP'T BALL</InputAddon>
          <Input
            type="text"
            value={team.capT_ball ?? ""}
            onChange={(e) => handleStatChange("capT_ball", e.target.value)}
            disabled={viewMode}
            variant={"sm"}
          />
        </InputGroup>
      </div>
    </section>
  );
});

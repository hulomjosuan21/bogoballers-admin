// src/components/TeamSection.tsx
import type { TeamBook } from "@/types/scorebook";
import { PlayerRoster } from "./PlayerRoster";
import { FullRosterSummaryTable } from "./FullRosterSummaryTable"; // Import the new component
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
  const handleStatChange = (stat: "coachT" | "none_memberT", value: string) => {
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
        <h2 className="text-md font-semibold">{team.team_name}</h2>
        <Badge className="text-xs">{team.side}</Badge>
      </div>

      <PlayerRoster viewMode={viewMode} team={team} />
      <div className="grid grid-cols-2 gap-1">
        <TeamStatsByQuarterTable team={team} viewMode={viewMode} />
        <TeamTimeoutTable team={team} viewMode={viewMode} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <InputGroup>
          <InputAddon variant={"sm"}>CoachT</InputAddon>
          <Input
            type="number"
            defaultValue={team.coachT}
            onChange={(e) => handleStatChange("coachT", e.target.value)}
            disabled={viewMode}
            variant={"sm"}
          />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>NoneMemberT</InputAddon>
          <Input
            type="number"
            defaultValue={team.none_memberT}
            onChange={(e) => handleStatChange("none_memberT", e.target.value)}
            disabled={viewMode}
            variant={"sm"}
          />
        </InputGroup>
      </div>
      <FullRosterSummaryTable team={team} />
    </section>
  );
});

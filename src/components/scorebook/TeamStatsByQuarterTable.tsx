import type { TeamBook } from "@/types/scorebook";
import { useGame } from "@/context/GameContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";

type Props = {
  team: TeamBook;
  viewMode?: boolean;
};

export function TeamStatsByQuarterTable({ team, viewMode = false }: Props) {
  const { state, dispatch } = useGame();
  const quarters = Array.from({ length: state.quarters }, (_, i) => i + 1);

  const handleFoulChange = (quarter: number, newValue: string) => {
    const foulCount = parseInt(newValue, 10);
    if (!isNaN(foulCount)) {
      dispatch({
        type: "UPDATE_TEAM_STAT",
        payload: {
          teamId: team.team_id,
          quarter: quarter,
          stat: "teamFoul",
          value: foulCount,
        },
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Quarter</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Team Fouls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quarters.map((qtrNum) => {
            const qtrScoreData = team.score_per_qtr.find(
              (item) => item.qtr === qtrNum
            );
            const qtrFoulData = team.teamF_per_qtr.find(
              (item) => item.qtr === qtrNum
            );

            return (
              <TableRow key={qtrNum}>
                <TableCell className="font-medium">Q{qtrNum}</TableCell>
                <TableCell>{qtrScoreData?.score ?? 0}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    variant={"sm"}
                    className="rounded-sm w-12 remove-spinner"
                    value={qtrFoulData?.foul ?? 0}
                    onChange={(e) => handleFoulChange(qtrNum, e.target.value)}
                    readOnly={viewMode}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

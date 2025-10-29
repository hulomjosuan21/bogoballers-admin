import type { TeamBook } from "@/types/scorebook";
import { useGame } from "@/context/GameContext";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "../ui/table";
import { Trash2 } from "lucide-react";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";

type Props = {
  team: TeamBook;
  viewMode?: boolean;
};

export function TeamTimeoutTable({ team, viewMode = false }: Props) {
  const { state, dispatch } = useGame();
  const { openDialog } = useAlertDialog();

  const handleAddTimeout = async () => {
    const confirm = await openDialog({
      title: "Confirm Timeout",
      description: `Are you sure you want to call a timeout for team ${team.team_name}?`,
      confirmText: "Yes, Timeout",
      cancelText: "Cancel",
    });
    if (!confirm) return;
    dispatch({ type: "ADD_TIMEOUT", payload: { teamId: team.team_id } });
    toast.info(`Team ${team.team_name} timed out`);
  };

  const handleRemoveTimeout = (index: number) => {
    dispatch({
      type: "REMOVE_TIMEOUT",
      payload: { teamId: team.team_id, index },
    });
  };

  const timeouts = team.timeouts || [];

  return (
    <div className="rounded-md border">
      <div className="p-2 flex justify-between items-center">
        <h3 className="text-sm font-semibold">Timeouts Log</h3>
        {!viewMode && (
          <Button
            size="sm"
            className="text-xs"
            onClick={handleAddTimeout}
            disabled={viewMode}
          >
            Add Timeout
          </Button>
        )}
      </div>

      <div className="max-h-fut flex-grow overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-8">Qtr</TableHead>
              <TableHead className="h-8">Time Taken</TableHead>
              {!viewMode && <TableHead className="h-8 text-right"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeouts.length > 0 ? (
              timeouts.map((timeout, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {timeout.qtr >= state.default_quarters
                      ? `OT${timeout.qtr - state.default_quarters}`
                      : `Q${timeout.qtr}`}
                  </TableCell>
                  <TableCell>{timeout.game_time}</TableCell>
                  {!viewMode && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveTimeout(index)}
                        disabled={viewMode}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-12 text-center text-muted-foreground"
                >
                  No timeouts used.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

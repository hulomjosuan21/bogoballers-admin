import { memo, useMemo } from "react";
import type { TeamBook } from "@/types/scorebook";
import { useGame } from "@/context/GameContext";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { PlayerOnTheFloorTable } from "./PlayerOnTheFloorTable";
import { PlayerChip } from "./PlayerChip";
import { Armchair } from "lucide-react";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";

type Props = {
  viewMode?: boolean;
  team: TeamBook;
};

export const PlayerRoster = memo(function PlayerRoster({
  viewMode,
  team,
}: Props) {
  const { state, dispatch } = useGame();
  const currentQuarter = state.current_quarter;
  const { openDialog } = useAlertDialog();
  const playersOnFloor = useMemo(
    () => team.players.filter((p) => !p.onBench),
    [team.players]
  );
  const playersOnBench = useMemo(
    () => team.players.filter((p) => p.onBench),
    [team.players]
  );
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const isBenchPlayerDragged = playersOnBench.some(
      (p) => p.player_id === active.id
    );
    const isFloorPlayerTarget = playersOnFloor.some(
      (p) => p.player_id === over.id
    );

    if (isBenchPlayerDragged && isFloorPlayerTarget) {
      const confirm = await openDialog({
        confirmText: "Confirm",
        cancelText: "Cancel",
      });
      if (!confirm) return;
      dispatch({
        type: "SUBSTITUTE_PLAYER",
        payload: {
          teamId: team.team_id,
          draggedId: String(active.id),
          droppedId: String(over.id),
        },
      });
      toast.info(`Player substituted`);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        <PlayerOnTheFloorTable
          viewMode={viewMode}
          players={playersOnFloor}
          dispatch={dispatch}
          currentQuarter={currentQuarter}
        />

        {!viewMode && (
          <div className="p-3 border rounded-md">
            <div className="pb-2 flex items-center gap-2">
              <span className="font-semibold text-sm">Bench</span>
              <Armchair className="h-4 w-4 text-muted-foreground" />
            </div>
            {playersOnBench.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {playersOnBench.map((player) => (
                  <PlayerChip key={player.player_id} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No players on the bench.
              </p>
            )}
          </div>
        )}
      </div>
    </DndContext>
  );
});

import { memo, useEffect, useMemo, useRef } from "react";
import type { TeamBook } from "@/types/scorebook";
import { useGame } from "@/context/GameContext";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { PlayerOnTheFloorTable } from "./PlayerOnTheFloorTable";
import { PlayerChip } from "./PlayerChip";
import { Armchair } from "lucide-react";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";
import { formatTime } from "./TopSection";

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
  const latestTimeRef = useRef(state.time_seconds);
  const { openDialog } = useAlertDialog();

  const playersOnFloor = useMemo(
    () => team.players.filter((p) => !p.onBench),
    [team.players]
  );

  const playersOnBench = useMemo(
    () => team.players.filter((p) => p.onBench),
    [team.players]
  );

  useEffect(() => {
    latestTimeRef.current = state.time_seconds;
  }, [state.time_seconds]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const droppedPlayer = active.data.current as
      | {
          full_name: string;
          jersey_name: string;
          jersey_number: string;
        }
      | undefined;
    const overPlayer = over.data.current as
      | {
          full_name: string;
          jersey_name: string;
          jersey_number: string;
        }
      | undefined;
    if (!droppedPlayer || !overPlayer) return;

    const fromBench = playersOnBench.some((p) => p.player_id === active.id);
    const toFloor = playersOnFloor.some((p) => p.player_id === over.id);
    if (!(fromBench && toFloor)) return;

    const {
      full_name: droppedName,
      jersey_name: droppedJerseyName,
      jersey_number: droppedNumber,
    } = droppedPlayer;
    const {
      full_name: overName,
      jersey_name: overJerseyName,
      jersey_number: overNumber,
    } = overPlayer;

    const substitutionText = `${droppedName} (#${droppedNumber}) → ${overName} (#${overNumber})`;

    const confirmed = await openDialog({
      title: `Confirm Substitution – ${team.team_name}`,
      description: substitutionText,
      confirmText: "Confirm",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    dispatch({
      type: "SUBSTITUTE_PLAYER",
      payload: {
        teamId: team.team_id,
        draggedId: String(active.id),
        droppedId: String(over.id),
      },
    });

    toast.info(
      `${droppedJerseyName} (#${droppedNumber}) substituted for ${overJerseyName} (#${overNumber}) at ${formatTime(
        latestTimeRef.current
      )}`
    );
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
              <span className="font-semibold text-sm">
                Bench ({playersOnBench.length})
              </span>
              <Armchair className="h-4 w-4 text-muted-foreground" />
            </div>
            {playersOnBench.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
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

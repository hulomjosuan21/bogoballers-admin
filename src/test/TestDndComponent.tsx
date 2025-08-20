import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

type Player = {
  player_id: string;
  name: string;
  isStaged: boolean;
};

const PLAYERS: Player[] = [
  { player_id: "1", name: "Player 1", isStaged: false },
  { player_id: "2", name: "Player 2", isStaged: false },
  { player_id: "3", name: "Player 3", isStaged: false },
  { player_id: "4", name: "Player 4", isStaged: false },
  { player_id: "5", name: "Player 5", isStaged: false },
  { player_id: "6", name: "Player 6", isStaged: false },
  { player_id: "7", name: "Player 7", isStaged: false },
  { player_id: "8", name: "Player 8", isStaged: false },
  { player_id: "9", name: "Player 9", isStaged: false },
  { player_id: "10", name: "Player 10", isStaged: true },
  { player_id: "11", name: "Player 11", isStaged: true },
  { player_id: "12", name: "Player 12", isStaged: true },
];

export default function TestDndComponent() {
  const [isAutoSave, setAutoSave] = useState(false);
  const [players, setPlayers] = useState<Player[]>(PLAYERS);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const newId = active.id as string;
    const newStage = over.id === "staged";
    let updatedPlayer: Player | undefined;
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.player_id === newId) {
          updatedPlayer = { ...player, isStaged: newStage };
          return updatedPlayer;
        }
        return player;
      })
    );

    if (isAutoSave && updatedPlayer) {
      setTimeout(() => {
        toast.success(`Players ${updatedPlayer?.name} saved!`);
      }, 2000);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <Checkbox
          id="autosave"
          checked={isAutoSave}
          onCheckedChange={(checked) => setAutoSave(!!checked)}
        />
        <label htmlFor="autosave" className="select-none">
          Enable Autosave
        </label>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8">
          <Column
            id="unstaged"
            players={players.filter((p) => !p.isStaged)}
            title="Unstaged"
          />
          <div className="w-px bg-gray-300"></div>
          <Column
            id="staged"
            players={players.filter((p) => p.isStaged)}
            title="Staged"
          />
        </div>
      </DndContext>
    </div>
  );
}

function Column({
  id,
  players,
  title,
}: {
  id: string;
  players: Player[];
  title: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col items-center gap-2">
      <h3 className="font-bold mb-2">{title}</h3>
      <div
        className={`flex flex-wrap gap-2 p-2 border rounded w-full min-h-[100px] ${
          isOver ? "bg-muted" : ""
        }`}
      >
        {players.map((player) => (
          <PlayerCard key={player.player_id} player={player} />
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.player_id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
      className="border rounded p-2 cursor-move"
    >
      {player.name}
    </div>
  );
}

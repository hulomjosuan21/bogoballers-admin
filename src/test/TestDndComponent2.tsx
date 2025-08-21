import playerJson from "./testPlayers.json";
import { useEffect } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Player = {
  player_id: string;
  name: string;
  isStaged: boolean;
};

interface PlayerState {
  initialPlayers: Player[];
  setInitial: (players: Player[]) => void;
  addInitial: (player: Player) => void;
  removeInitial: (id: string) => void;

  droppedPlayers: Player[];
  setDropped: (players: Player[]) => void;
  addDropped: (player: Player) => void;
  removeDropped: (id: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      initialPlayers: [],
      setInitial: (players) => set({ initialPlayers: players }),
      addInitial: (player) =>
        set((state) => ({ initialPlayers: [...state.initialPlayers, player] })),
      removeInitial: (id) =>
        set((state) => ({
          initialPlayers: state.initialPlayers.filter(
            (p) => p.player_id !== id
          ),
        })),

      droppedPlayers: [],
      setDropped: (players) => set({ droppedPlayers: players }),
      addDropped: (player) =>
        set((state) => ({ droppedPlayers: [...state.droppedPlayers, player] })),
      removeDropped: (id) =>
        set((state) => ({
          droppedPlayers: state.droppedPlayers.filter(
            (p) => p.player_id !== id
          ),
        })),
    }),
    {
      name: "player-storage",
    }
  )
);

const PLAYERS: Player[] = playerJson as Player[];

export default function DndTest2() {
  const initialPlayers = usePlayerStore((state) => state.initialPlayers);
  const droppedPlayers = usePlayerStore((state) => state.droppedPlayers);

  const setInitial = usePlayerStore((state) => state.setInitial);
  const addInitial = usePlayerStore((state) => state.addInitial);
  const removeInitial = usePlayerStore((state) => state.removeInitial);

  const addDropped = usePlayerStore((state) => state.addDropped);
  const removeDropped = usePlayerStore((state) => state.removeDropped);

  useEffect(() => {
    setInitial(PLAYERS);
  }, [setInitial]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const playerId = active.id as string;

    const player =
      initialPlayers.find((p) => p.player_id === playerId) ||
      droppedPlayers.find((p) => p.player_id === playerId);

    if (!player) return;

    if (over.id === "dropped") {
      removeInitial(playerId);
      addDropped(player);
    } else if (over.id === "initial") {
      removeDropped(playerId);
      addInitial(player);
    }

    // Debug log current state
    console.log("Initial:", usePlayerStore.getState().initialPlayers);
    console.log("Dropped:", usePlayerStore.getState().droppedPlayers);
  };

  return (
    <div className="p-4 h-screen">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-8 h-full">
        <DndContext onDragEnd={onDragEnd}>
          <Column id="initial" players={initialPlayers} />
          <Separator orientation="vertical" className="h-full" />
          <Column id="dropped" players={droppedPlayers} />
        </DndContext>
      </div>
    </div>
  );
}

type ColumnProps = {
  id: string;
  players: Player[];
};

function Column({ id, players }: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-2 p-4 border rounded-md bg-muted",
        isOver && "bg-primary/20"
      )}
    >
      {players.map((p) => (
        <Card key={p.player_id} player={p} />
      ))}
    </div>
  );
}

type CardProps = {
  player: Player;
};

function Card({ player }: CardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.player_id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform) }}
      className="p-4 border rounded shadow"
    >
      {player.name}
    </div>
  );
}

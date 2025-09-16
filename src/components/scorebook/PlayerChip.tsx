// src/components/PlayerChip.tsx
import type { PlayerBook } from "@/types/scorebook";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function PlayerChip({ player }: { player: PlayerBook }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: player.player_id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 text-xs border rounded-md p-2 bg-card cursor-grab"
    >
      <span>{player.jersey_name}</span>
      <span className="font-bold">#{player.jersey_number}</span>
    </div>
  );
}

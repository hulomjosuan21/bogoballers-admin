// src/components/PlayerChip.tsx
import type { PlayerBook } from "@/types/scorebook";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Separator } from "../ui/separator";

export function PlayerChip({ player }: { player: PlayerBook }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: player.player_id,
      data: {
        full_name: player.full_name,
        jersey_name: player.jersey_name,
        jersey_number: player.jersey_number,
      },
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
      <GripVertical className="h-4 w-4 text-muted-foreground" />

      {player.profile_image_url ? (
        <img
          src={player.profile_image_url}
          alt={player.full_name}
          className="h-8 w-8 rounded-md object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold uppercase">
          {player.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
      )}
      <span className="truncate">{player.full_name}</span>
      <Separator orientation="vertical" className="mx-1" />
      <span className="truncate">{player.jersey_name}</span>
      <span className="font-bold">#{player.jersey_number}</span>
    </div>
  );
}

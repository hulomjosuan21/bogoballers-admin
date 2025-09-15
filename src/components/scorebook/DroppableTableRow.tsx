// src/components/DroppableTableRow.tsx
import { useDroppable } from "@dnd-kit/core";
import { TableRow } from "../ui/table";
import type { PlayerBook } from "@/types/scorebook";

export function DroppableTableRow({
  player,
  children,
}: {
  player: PlayerBook;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: player.player_id,
  });

  return (
    <TableRow ref={setNodeRef} className={isOver ? "bg-primary/20" : ""}>
      {children}
    </TableRow>
  );
}

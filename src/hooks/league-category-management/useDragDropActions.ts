import { useCallback } from "react";

interface UseDragDropActionsProps {
  viewOnly?: boolean;
}

export function useDragDropActions({
  viewOnly = false,
}: UseDragDropActionsProps) {
  const onDragStart = useCallback(
    (event: React.DragEvent, type: "round" | "format", label: string) => {
      if (viewOnly) return;

      event.dataTransfer.setData("node-type", type);
      event.dataTransfer.setData("application/reactflow", label);
      event.dataTransfer.effectAllowed = "move";
    },
    [viewOnly]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (viewOnly) return;

      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
    },
    [viewOnly]
  );

  return {
    onDragStart,
    onDragOver,
  };
}

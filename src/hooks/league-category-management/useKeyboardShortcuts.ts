import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  deleteSelectedNodes: () => void;
  selectedNodesCount: number;
  viewOnly?: boolean;
}

export function useKeyboardShortcuts({
  deleteSelectedNodes,
  selectedNodesCount,
  viewOnly = false,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (viewOnly) return;

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNodesCount > 0 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const activeElement = document.activeElement;
        const isInInput =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.getAttribute("contenteditable") === "true");

        if (!isInInput) {
          event.preventDefault();
          deleteSelectedNodes();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteSelectedNodes, selectedNodesCount, viewOnly]);
}

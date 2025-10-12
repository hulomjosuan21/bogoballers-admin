import { useAutomaticMatchConfigFlowDispatch } from "@/context/AutomaticMatchConfigFlowContext";
import type { AutomaticMatchConfigFlowNode } from "@/types/automaticMatchConfigTypes";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

export function useAutomaticMatchConfigDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const dispatch = useAutomaticMatchConfigFlowDispatch();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const payloadString = event.dataTransfer.getData(
        "application/reactflow-node"
      );
      if (!payloadString) return;

      try {
        const payload: Omit<AutomaticMatchConfigFlowNode, "position"> =
          JSON.parse(payloadString);
        const newNode: AutomaticMatchConfigFlowNode = {
          ...payload,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
        };
        dispatch({ type: "ADD_NODE", payload: newNode });
      } catch (error) {
        toast.error("Could not add node to canvas.");
      }
    },
    [screenToFlowPosition, dispatch]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return { onDrop, onDragOver };
}

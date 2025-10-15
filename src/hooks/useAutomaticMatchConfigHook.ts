import {
  useAutomaticMatchConfigFlowDispatch,
  useAutomaticMatchConfigFlowState,
} from "@/context/AutomaticMatchConfigFlowContext";
import type { AutomaticMatchConfigFlowNode } from "@/types/automaticMatchConfigTypes";
import {
  useReactFlow,
  type NodeChange,
  type OnNodesChange,
} from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
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

export function useManageAutomaticMatchConfigNode() {
  const { nodes, edges } = useAutomaticMatchConfigFlowState();
  const dispatch = useAutomaticMatchConfigFlowDispatch();
  const { onDrop, onDragOver } = useAutomaticMatchConfigDragAndDrop();
  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      dispatch({ type: "ON_NODES_CHANGE", payload: changes });
    },
    [dispatch]
  );

  return { onNodesChange, onDrop, onDragOver, edges, nodes };
}

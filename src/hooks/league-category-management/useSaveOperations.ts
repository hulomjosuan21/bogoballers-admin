import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import type { NodeData } from "@/types/leagueCategoryTypes";
import {
  buildSaveOperations,
  executeSaveOperations,
} from "./saveOperationsBuilder";
import { useActiveLeague } from "../useActiveLeague";

interface UseSaveOperationsProps {
  getChangedNodes: () => Node<NodeData>[];
  getDeletedNodes: () => Node<NodeData>[];
  nodes: Node<NodeData>[];
  initialNodesRef: React.RefObject<Node<NodeData>[]>;
  setDeletedNodeIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useSaveOperations({
  getChangedNodes,
  getDeletedNodes,
  nodes,
  initialNodesRef,
  setDeletedNodeIds,
}: UseSaveOperationsProps) {
  const { refetchActiveLeague } = useActiveLeague();

  const saveChanges = useCallback(async () => {
    const changedNodes = getChangedNodes();
    const deletedNodes = getDeletedNodes();

    if (changedNodes.length === 0 && deletedNodes.length === 0) {
      return { success: false, message: "No changes to save" };
    }

    const operationsByCategory = buildSaveOperations(
      changedNodes,
      deletedNodes,
      nodes,
      initialNodesRef
    );

    const success = await executeSaveOperations(
      operationsByCategory,
      async () => {
        setDeletedNodeIds(new Set());
        await refetchActiveLeague();
      }
    );

    return {
      success,
      message: success
        ? "Changes saved successfully"
        : "Failed to save changes",
    };
  }, [
    getChangedNodes,
    getDeletedNodes,
    nodes,
    initialNodesRef,
    setDeletedNodeIds,
  ]);

  return { saveChanges };
}

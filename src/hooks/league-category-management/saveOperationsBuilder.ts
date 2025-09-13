import { toast } from "sonner";
import type { Node } from "@xyflow/react";
import {
  RoundStateEnum,
  type CategoryOperation,
  type NodeData,
  type RoundNodeData,
  type FormatNodeData,
} from "@/types/leagueCategoryTypes";
import { LeagueCategoryRoundService } from "@/service/leagueCategory";
import { getErrorMessage } from "@/lib/error";

export function buildSaveOperations(
  changedNodes: Node<NodeData>[],
  deletedNodes: Node<NodeData>[],
  allNodes: Node<NodeData>[],
  initialNodesRef: React.MutableRefObject<Node<NodeData>[]>
) {
  const operationsByCategory = new Map<string, CategoryOperation[]>();

  for (const node of changedNodes) {
    if (!node.parentId) continue;

    const categoryId = node.parentId;
    if (!operationsByCategory.has(categoryId)) {
      operationsByCategory.set(categoryId, []);
    }
    const operations = operationsByCategory.get(categoryId)!;

    if (node.type === "roundNode") {
      const { round, _isNew } = node.data as RoundNodeData;

      if (_isNew) {
        operations.push({
          type: "create_round",
          data: {
            round_id: round.round_id,
            round_name: round.round_name,
            round_status: round.round_status as RoundStateEnum,
            round_order: round.round_order,
            position: round.position,
          },
        });
      } else {
        const initialNode = initialNodesRef.current.find(
          (n) => n.id === node.id
        );
        if (initialNode) {
          const initialRound = (initialNode.data as RoundNodeData).round;

          if (
            round.position?.x !== initialRound.position?.x ||
            round.position?.y !== initialRound.position?.y
          ) {
            operations.push({
              type: "update_position",
              data: {
                round_id: round.round_id,
                position: round.position,
              },
            });
          }

          if (
            JSON.stringify(round.round_format) !==
            JSON.stringify(initialRound.round_format)
          ) {
            operations.push({
              type: "update_format",
              data: {
                round_id: round.round_id,
                round_format: round.round_format ?? null,
              },
            });
          }

          if (round.next_round_id !== initialRound.next_round_id) {
            operations.push({
              type: "update_next_round",
              data: {
                round_id: round.round_id,
                next_round_id: round.next_round_id ?? null,
              },
            });
          }
        }
      }
    } else if (node.type === "formatNode") {
      const formatData = node.data as FormatNodeData;

      if (formatData.round_id) {
        const initialNode = initialNodesRef.current.find(
          (n) => n.id === node.id
        );

        if (initialNode) {
          if (
            node.position.x !== initialNode.position.x ||
            node.position.y !== initialNode.position.y
          ) {
            const roundNode = allNodes.find(
              (rn) =>
                rn.type === "roundNode" &&
                (rn.data as RoundNodeData).round.round_id ===
                  formatData.round_id
            );

            if (roundNode) {
              const round = (roundNode.data as RoundNodeData).round;
              if (round.round_format) {
                operations.push({
                  type: "update_format",
                  data: {
                    round_id: formatData.round_id,
                    round_format: {
                      ...round.round_format,
                      position: node.position,
                    },
                  },
                });
              }
            }
          }
        }
      }
    }
  }

  for (const node of deletedNodes) {
    if (!node.parentId) continue;

    const categoryId = node.parentId;
    if (!operationsByCategory.has(categoryId)) {
      operationsByCategory.set(categoryId, []);
    }
    const operations = operationsByCategory.get(categoryId)!;

    if (node.type === "roundNode") {
      const { round } = node.data as RoundNodeData;
      operations.push({
        type: "delete_round",
        data: {
          round_id: round.round_id,
        },
      });
    } else if (node.type === "formatNode") {
      const formatData = node.data as FormatNodeData;
      if (formatData.round_id) {
        operations.push({
          type: "update_format",
          data: {
            round_id: formatData.round_id,
            round_format: null,
          },
        });
      }
    }
  }

  return operationsByCategory;
}

export async function executeSaveOperations(
  operationsByCategory: Map<string, CategoryOperation[]>,
  onSuccess: () => Promise<void>
) {
  const promises: Promise<any>[] = [];

  for (const [leagueCategoryId, operations] of operationsByCategory) {
    if (operations.length > 0) {
      promises.push(
        LeagueCategoryRoundService.saveChanges({
          leagueCategoryId,
          operations,
        })
      );
    }
  }

  return toast.promise(
    Promise.all(promises).then(async () => {
      await onSuccess();
    }),
    {
      loading: "Saving changes...",
      success: "All changes saved successfully",
      error: (err) => getErrorMessage(err),
    }
  );
}

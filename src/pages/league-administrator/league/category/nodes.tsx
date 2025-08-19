import {
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  getRoundTypeByOrder,
  type CategoryNodeData,
  type RoundNodeData,
} from "./types";
import React from "react";
import { RoundNodeSheet } from "./components";

export const CATEGORY_WIDTH = 1280;
export const CATEGORY_HEIGHT = 720;

export function CategoryNode({ data }: { data: CategoryNodeData }) {
  const { category } = data;
  return (
    <div className="border-2 rounded-md flex flex-col overflow-hidden w-[1280px] h-[720px]">
      <div className="bg-primary text-sm p-3">
        <strong>Category:</strong> {category.category_name}
      </div>
      <div className="flex-1 p-2 overflow-auto flex flex-col">
        <p className="text-helper italic text-xs mb-4">
          Drop round & format nodes here...
        </p>
        <div className="flex-grow" />
        <div className="text-helper flex items-center">
          <p>Max Teams: {category.max_team}</p>
          <p className="border-l px-2 ml-2">
            Team Entrance Fee: {category.team_entrance_fee_amount}
          </p>
        </div>
      </div>
    </div>
  );
}

type NodesRef = React.RefObject<Node<any>[]>;

function RoundName({ order }: { order: number }) {
  return <span className="font-medium">{getRoundTypeByOrder(order)}</span>;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Upcoming":
      return "bg-blue-500/15 text-blue-600";
    case "Ongoing":
      return "bg-yellow-500/15 text-yellow-600";
    case "Finished":
      return "bg-green-500/15 text-green-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// --- RoundNode.tsx ---
export function RoundNode({
  data,
  allNodesRef,
}: {
  data: RoundNodeData;
  allNodesRef: NodesRef;
}) {
  const allNodes = allNodesRef.current ?? [];
  const order = data.round.round_order;

  // Fix: show left handle if this node is a target of any next_round_id
  const isTarget = allNodes.some(
    (n) => (n.data as any)?.round?.next_round_id === data.round.round_id
  );
  const hasLeft = order > 0 || isTarget;
  const hasRight = order < 3;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-1">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusClasses(
            data.round.round_status
          )}`}
        >
          {data.round.round_status}
        </span>
      </div>

      <div className="rounded-md p-3 flex items-center justify-between gap-2 border-2 group bg-background">
        <RoundName order={order} />
        <RoundNodeSheet data={data} />

        {hasLeft && (
          <Handle
            id="left"
            type="target"
            position={Position.Left}
            isValidConnection={(conn: Connection | Edge) => {
              const sourceNode = allNodes.find((n) => n.id === conn.source);
              const srcOrder = (sourceNode?.data as any)?.round?.round_order;
              if (typeof srcOrder !== "number") return false;

              if (order === 1) return srcOrder === 0;
              if (order === 2) return srcOrder === 1 || srcOrder === 0;
              if (order === 3) return srcOrder === 2;
              return false;
            }}
          />
        )}

        {hasRight && (
          <Handle
            id="right"
            type="source"
            position={Position.Right}
            isValidConnection={(conn: Connection | Edge) => {
              const targetNode = allNodes.find((n) => n.id === conn.target);
              const tgtOrder = (targetNode?.data as any)?.round?.round_order;
              if (typeof tgtOrder !== "number") return false;

              if (order === 0 && tgtOrder === 1) return true; // Elim -> QF
              if (order === 0 && tgtOrder === 2) return true; // Elim -> Semi
              if (order === 1 && tgtOrder === 2) return true; // QF -> Semi
              if (order === 2 && tgtOrder === 3) return true; // Semi -> Final
              return false;
            }}
          />
        )}

        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          isValidConnection={(conn: Connection | Edge) =>
            conn.targetHandle === "top"
          }
        />
      </div>
    </div>
  );
}

export function FormatNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-md p-2 flex items-center gap-2 border-2">
      <span className="text-xs">{data.label}</span>
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        isValidConnection={(conn: Connection | Edge) =>
          conn.sourceHandle === "bottom"
        }
      />
    </div>
  );
}

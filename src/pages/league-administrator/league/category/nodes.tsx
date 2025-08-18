import {
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { type CategoryNodeData, type RoundNodeData } from "./types";
import React from "react";
import { RoundTypeEnum } from "@/enums/enums";
import { RoundNodeSheet } from "./components";

export const CATEGORY_WIDTH = 1280;
export const CATEGORY_HEIGHT = 720;

export function CategoryNode({ data }: { data: CategoryNodeData }) {
  const { category } = data;
  return (
    <div className="border-2 rounded-md flex flex-col overflow-hidden w-[1280px] h-[720px]">
      <div className="bg-primary font-semibold text-sm p-3">
        {category.category_name}
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

function BaseRoundNode({
  data,
  children,
}: {
  data: RoundNodeData;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md p-3 flex items-center justify-between gap-2 border-2 group">
      <span className="font-medium">{data.round.round_name}</span>
      <RoundNodeSheet data={data} />
      {children}
    </div>
  );
}

type NodesRef = React.RefObject<Node<any>[]>;

export function EliminationRoundNode({
  data,
  allNodesRef,
}: {
  data: RoundNodeData;
  allNodesRef: NodesRef;
}) {
  const allNodes = allNodesRef.current ?? [];
  return (
    <BaseRoundNode data={data}>
      <Handle
        type="source"
        position={Position.Right}
        isValidConnection={(conn: Connection | Edge) => {
          const targetNode = allNodes.find((n) => n.id === conn.target);
          const targetLabel = (targetNode?.data as any)?.label || "";
          return (
            targetLabel === RoundTypeEnum.QuarterFinal ||
            targetLabel === RoundTypeEnum.SemiFinal
          );
        }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isValidConnection={(conn: Connection | Edge) =>
          conn.targetHandle === "top"
        }
      />
    </BaseRoundNode>
  );
}

export function QuarterFinalRoundNode({
  data,
  allNodesRef,
}: {
  data: RoundNodeData;
  allNodesRef: NodesRef;
}) {
  const allNodes = allNodesRef.current ?? [];
  return (
    <BaseRoundNode data={data}>
      <Handle
        type="target"
        position={Position.Left}
        isValidConnection={(conn: Connection | Edge) => {
          const sourceNode = allNodes.find((n) => n.id === conn.source);
          const sourceLabel = (sourceNode?.data as any)?.label || "";
          return (
            sourceLabel !== RoundTypeEnum.SemiFinal &&
            sourceLabel !== RoundTypeEnum.Final
          );
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isValidConnection={(conn: Connection | Edge) => {
          const targetNode = allNodes.find((n) => n.id === conn.target);
          const targetLabel = (targetNode?.data as any)?.label || "";
          return (
            targetLabel === RoundTypeEnum.SemiFinal ||
            targetLabel === RoundTypeEnum.Final
          );
        }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isValidConnection={(conn: Connection | Edge) =>
          conn.targetHandle === "top"
        }
      />
    </BaseRoundNode>
  );
}

export function SemiFinalRoundNode({
  data,
  allNodesRef,
}: {
  data: RoundNodeData;
  allNodesRef: NodesRef;
}) {
  const allNodes = allNodesRef.current ?? [];
  return (
    <BaseRoundNode data={data}>
      <Handle
        type="target"
        position={Position.Left}
        isValidConnection={(conn: Connection | Edge) => {
          const sourceNode = allNodes.find((n) => n.id === conn.source);
          const sourceLabel = (sourceNode?.data as any)?.label || "";
          return sourceLabel !== RoundTypeEnum.Final;
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isValidConnection={(conn: Connection | Edge) => {
          const targetNode = allNodes.find((n) => n.id === conn.target);
          const targetLabel = (targetNode?.data as any)?.label || "";
          return targetLabel === RoundTypeEnum.Final;
        }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isValidConnection={(conn: Connection | Edge) =>
          conn.targetHandle === "top"
        }
      />
    </BaseRoundNode>
  );
}

export function FinalRoundNode({
  data,
  allNodesRef,
}: {
  data: RoundNodeData;
  allNodesRef: NodesRef;
}) {
  const allNodes = allNodesRef.current ?? [];
  return (
    <BaseRoundNode data={data}>
      <Handle
        type="target"
        position={Position.Left}
        isValidConnection={(conn: Connection | Edge) => {
          const sourceNode = allNodes.find((n) => n.id === conn.source);
          const sourceLabel = (sourceNode?.data as any)?.label || "";
          return sourceLabel === RoundTypeEnum.SemiFinal;
        }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isValidConnection={(conn: Connection | Edge) =>
          conn.targetHandle === "top"
        }
      />
    </BaseRoundNode>
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

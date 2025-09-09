import { useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import {
  RoundStateEnum,
  type NodeData,
  type RoundNodeData,
} from "@/types/leagueCategoryTypes";

interface UseEdgeStylingProps {
  nodes: Node<NodeData>[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export function useEdgeStyling({ nodes, setEdges }: UseEdgeStylingProps) {
  useEffect(() => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        // Format node connections (round to format)
        if (targetNode?.type === "formatNode") {
          return {
            ...edge,
            style: {
              stroke: "#2196f3",
              strokeWidth: 1,
              strokeDasharray: "4",
              animation: "dash-upcoming 2s linear infinite",
            },
          };
        }

        // Default style for upcoming rounds
        let style: React.CSSProperties = {
          stroke: "#f39c12",
          strokeWidth: 2,
          strokeDasharray: "12,6",
          animation: "dash-upcoming 2s linear infinite",
        };

        // Round to round connections - style based on source round status
        if (sourceNode?.type === "roundNode") {
          const roundStatus = (sourceNode.data as RoundNodeData).round
            .round_status as RoundStateEnum;

          switch (roundStatus) {
            case RoundStateEnum.Finished:
              style = {
                stroke: "#4caf50",
                strokeWidth: 2,
                strokeDasharray: "12,6",
                animation: "dash-upcoming 2s linear infinite",
              };
              break;
            case RoundStateEnum.Ongoing:
              style = {
                stroke: "#f39c12",
                strokeWidth: 2,
                strokeDasharray: "12,6",
                animation: "dash-upcoming 2s linear infinite",
              };
              break;
            default: // RoundStateEnum.Upcoming
              style = {
                stroke: "#2196f3",
                strokeWidth: 2,
                strokeDasharray: "12,6",
                animation: "dash-upcoming 2s linear infinite",
              };
          }
        }

        return { ...edge, style };
      })
    );
  }, [nodes, setEdges]);
}

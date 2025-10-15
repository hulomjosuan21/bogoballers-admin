import {
  RoundFormatTypesEnum,
  RoundTypeEnum,
} from "@/types/leagueCategoryTypes";
import { GripVertical } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { type Node as XyFlowNode } from "@xyflow/react";

export function AutomaticRoundNodeMenu() {
  const menuItems = Object.values(RoundTypeEnum);

  const onDragStart = (event: React.DragEvent, roundType: RoundTypeEnum) => {
    const roundId = uuidv4();
    const nodePayload: Omit<XyFlowNode, "position"> = {
      id: roundId,
      type: "leagueCategoryRound",
      data: {
        type: "league_category_round",
        league_category_round: roundType,
        round: { round_id: roundId, round_name: roundType },
      },
    };
    event.dataTransfer.setData(
      "application/reactflow-node",
      JSON.stringify(nodePayload)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-2 justify-center">
      {menuItems.map((value) => (
        <div
          key={value}
          onDragStart={(event) => onDragStart(event, value)}
          draggable
          className="flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AutomaticFormatNodeMenu() {
  const menuItems = Object.values(RoundFormatTypesEnum);

  const onDragStart = (
    event: React.DragEvent,
    formatType: RoundFormatTypesEnum
  ) => {
    const formatId = uuidv4();
    const nodePayload: Omit<XyFlowNode, "position"> = {
      id: formatId,
      type: "roundFormat",
      data: {
        type: "league_category_round_format",
        format_name: formatType,
        format_type: formatType,
        format_obj: { format_id: formatId, format_name: formatType },
      },
    };
    event.dataTransfer.setData(
      "application/reactflow-node",
      JSON.stringify(nodePayload)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-2 justify-center">
      {menuItems.map((value) => (
        <div
          key={value}
          onDragStart={(event) => onDragStart(event, value)}
          draggable
          className="flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

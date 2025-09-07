import { GripVertical } from "lucide-react";
import {
  RoundFormatTypesEnum,
  RoundTypeEnum,
} from "@/types/leagueCategoryTypes";

export function RoundNodeMenu({
  onDragStart,
}: {
  onDragStart: (event: React.DragEvent, label: RoundTypeEnum) => void;
}) {
  const menuItems = Object.values(RoundTypeEnum);

  return (
    <div className="w-48 p-2 border rounded-md bg-card">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
        Rounds
      </h3>
      <div className="flex flex-col gap-2">
        {menuItems.map((value) => (
          <div
            key={value}
            draggable
            onDragStart={(event) => onDragStart(event, value)}
            className="flex items-center gap-2 p-2 rounded-md border bg-background cursor-grab hover:opacity-80"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormatNodeMenu({
  onDragStart,
}: {
  onDragStart: (event: React.DragEvent, label: string) => void;
}) {
  const menuItems = Object.values(RoundFormatTypesEnum);

  return (
    <div className="w-48 p-2 border rounded-md bg-card">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
        Formats
      </h3>
      <div className="flex flex-col gap-2">
        {menuItems.map((value) => (
          <div
            key={value}
            draggable
            onDragStart={(event) => onDragStart(event, value)}
            className="flex items-center gap-2 p-2 rounded-md border bg-background cursor-grab hover:opacity-80"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-center font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

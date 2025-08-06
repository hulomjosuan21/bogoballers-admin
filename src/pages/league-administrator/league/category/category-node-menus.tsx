import { GripVertical } from "lucide-react";
import { RoundTypeEnum } from "./category-types";

export function RoundNodeMenu({
  onDragStart,
}: {
  onDragStart: (event: React.DragEvent, label: RoundTypeEnum) => void;
}) {
  const menuItems: { label: RoundTypeEnum }[] = [
    { label: RoundTypeEnum.Elimination },
    { label: RoundTypeEnum.QuarterFinal },
    { label: RoundTypeEnum.SemiFinal },
    { label: RoundTypeEnum.Final },
  ];

  return (
    <div className="w-48 p-2 border rounded-md bg-card shadow-sm">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
        Rounds
      </h3>
      <div className="flex flex-col gap-2">
        {menuItems.map(({ label }) => (
          <div
            key={label}
            draggable
            onDragStart={(event) => onDragStart(event, label)}
            className="flex items-center gap-2 p-2 rounded-md border-2 bg-background cursor-grab hover:opacity-80"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
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
  const menuItems = [
    "Round Robin",
    "Knockout",
    "Double Elimination",
    "Twice-to-Beat",
    "Best-of-3",
    "Best-of-5",
    "Best-of-7",
  ];

  return (
    <div className="w-48 p-2 border rounded-md bg-card shadow-sm">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
        Formats
      </h3>
      <div className="flex flex-col gap-2">
        {menuItems.map((label) => (
          <div
            key={label}
            draggable
            onDragStart={(event) => onDragStart(event, label)}
            className="flex items-center gap-2 p-2 rounded-md border-2 bg-background cursor-grab hover:opacity-80"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-center font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

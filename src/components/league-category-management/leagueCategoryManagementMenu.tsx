import { GripVertical } from "lucide-react";
import { RoundTypeEnum } from "@/types/leagueCategoryTypes";
import { getPredefinedFormatConfigs } from "@/constants/getPredefinedFormatConfigs";

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
  nTeam,
  onDragStart,
}: {
  nTeam: number;
  onDragStart: (
    event: React.DragEvent,
    label: string,
    config: Record<string, any>
  ) => void;
}) {
  const configs = getPredefinedFormatConfigs(nTeam);
  return (
    <div className="w-48 p-2 border rounded-md bg-card">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
        Format types
      </h3>
      <div className="flex flex-col gap-2">
        {configs.map(({ label, format_type, variant, format_config }) => (
          <div
            key={label}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("variant", variant);
              onDragStart(event, format_type, format_config);
            }}
            className="flex flex-col gap-1 p-2 rounded-md border bg-background cursor-grab hover:opacity-80"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold">{format_type}</span>
            </div>
            <span className="text-xs font-medium ml-6 text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

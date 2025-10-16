import React, { memo, useState, useTransition } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigRoundFormatData } from "@/types/automaticMatchConfigTypes";
import { RoundFormatTypesEnum } from "@/types/leagueCategoryTypes";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "../ui/badge";
import { autoMatchConfigService } from "@/service/automaticMatchConfigService";
import { toast } from "sonner";

const AutomaticMatchConfigRoundFormatNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigRoundFormatData>>
> = ({ data }) => {
  const [formatName, setFormatName] = useState(data.format_name);
  const [config, setConfig] = useState<Record<string, any>>(
    data.format_obj.format_obj ?? {}
  );

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        if (!data.format_obj.format_id) return;

        const response = await autoMatchConfigService.updateFormat(
          data.format_obj.format_id,
          {
            format_name: formatName,
            format_obj: config,
          }
        );

        toast.success(response.message);
      } catch (e) {
        toast.error("Error updating format.");
      }
    });
  };

  const renderFormatInputs = () => {
    switch (data.format_type) {
      case RoundFormatTypesEnum.RoundRobin:
        return (
          <>
            <Label>Group Count</Label>
            <Input
              value={config.group_count ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, group_count: e.target.value })
              }
              placeholder="Number of groups"
            />
            <Label>Advances per Group</Label>
            <Input
              value={config.advances_per_group ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, advances_per_group: e.target.value })
              }
              placeholder="Teams advancing per group"
            />
            <div className="flex items-center gap-3">
              <Label htmlFor="use-point-system">Use Point System</Label>
              <Switch
                id="use-point-system"
                checked={
                  config.use_point_system === true ||
                  config.use_point_system === "true"
                }
                onCheckedChange={(checked) =>
                  setConfig({ ...config, use_point_system: checked })
                }
              />
            </div>
          </>
        );

      case RoundFormatTypesEnum.Knockout:
        return (
          <>
            <Label>Group Count</Label>
            <Input
              value={config.group_count ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, group_count: e.target.value })
              }
              placeholder="Number of groups"
            />
            <Label>Seeding Method</Label>
            <Select
              value={config.seeding ?? "random"}
              onValueChange={(value) =>
                setConfig({ ...config, seeding: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select seeding method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="ranked" disabled>
                  <div className="flex items-center justify-between w-full">
                    <span>Ranked</span>
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      Coming soon
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        );

      case RoundFormatTypesEnum.DoubleElimination:
        return (
          <>
            <Label>Group Count</Label>
            <Input
              value={config.group_count ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, group_count: e.target.value })
              }
              placeholder="Number of groups"
            />
            <Label>Max Losses</Label>
            <Input
              value={config.max_loss ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, max_loss: e.target.value })
              }
              placeholder="e.g. 2"
            />
            <Label>Starting Stage</Label>
            <Input
              value={config.progress_group ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, progress_group: e.target.value })
              }
              placeholder="e.g. 1"
            />
            <Label>Max Stages</Label>
            <Input
              value={config.max_progress_group ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, max_progress_group: e.target.value })
              }
              placeholder="e.g. 6"
            />
          </>
        );

      case RoundFormatTypesEnum.BestOf:
        return (
          <>
            <Label>Group Count</Label>
            <Input
              value={config.group_count ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, group_count: e.target.value })
              }
              placeholder="Number of groups"
            />
            <Label>Number of Games</Label>
            <Input
              value={config.games ?? ""}
              type="number"
              onChange={(e) => setConfig({ ...config, games: e.target.value })}
              placeholder="e.g. 3"
            />
            <Label>Advances per Group</Label>
            <Input
              value={config.advances_per_group ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, advances_per_group: e.target.value })
              }
              placeholder="e.g. 2"
            />
          </>
        );

      default:
        return (
          <div className="text-muted-foreground text-sm mt-2">
            No specific configuration for this format.
          </div>
        );
    }
  };

  return (
    <div className="relative p-3 border rounded-md bg-secondary w-fit">
      <div className="flex gap-2 items-center">
        <div className="font-semibold text-xs text-secondary-foreground">
          {formatName}
        </div>

        {data.format_obj.round_id && (
          <Sheet>
            <SheetTrigger asChild>
              <div>
                <Settings className="w-3 h-3 cursor-pointer text-muted-foreground" />
              </div>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit Format</SheetTitle>
                <SheetDescription>
                  Update configuration for{" "}
                  <span className="font-semibold">{data.format_type}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-3 mt-4">
                <Label>Format Name</Label>
                <Input
                  max={20}
                  value={formatName}
                  onChange={(e) => setFormatName(e.target.value)}
                  placeholder="Enter format name"
                />

                {renderFormatInputs()}

                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="mt-4 w-full"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="text-xs text-center text-muted-foreground">Format</div>

      <Handle type="source" position={Position.Bottom} id="format-out" />
    </div>
  );
};

export default memo(AutomaticMatchConfigRoundFormatNode);

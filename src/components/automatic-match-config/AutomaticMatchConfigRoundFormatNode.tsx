import React, { memo, useState, useTransition } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { AutomaticMatchConfigRoundFormatData } from "@/types/automaticMatchConfigTypes";
import { RoundFormatTypesEnum } from "@/types/leagueCategoryTypes";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { ScrollArea } from "../ui/scroll-area";

type ConfigValue = string | number | boolean | object | null;

const AutomaticMatchConfigRoundFormatNode: React.FC<
  NodeProps<Node<AutomaticMatchConfigRoundFormatData>>
> = ({ data }) => {
  const [formatName, setFormatName] = useState(data.format_name);

  const getDefaultConfig = (
    type: RoundFormatTypesEnum
  ): Record<string, any> => {
    switch (type) {
      case RoundFormatTypesEnum.RoundRobin:
        return {
          group_count: 1,
          advances_per_group: 1,
          use_point_system: false,
        };
      case RoundFormatTypesEnum.Knockout:
        return {
          group_count: 1,
          seeding: "random",
          series_config: null,
        };
      case RoundFormatTypesEnum.DoubleElimination:
        return {
          group_count: 1,
          max_loss: 2,
          progress_group: 1,
          max_progress_group: 6,
          advances_per_group: 1,
        };
      case RoundFormatTypesEnum.BestOf:
        return {
          group_count: 1,
          games: 3,
          advances_per_group: 1,
          series_config: null,
        };
      default:
        return {};
    }
  };

  const [config, setConfig] = useState<Record<string, any>>(() => {
    const defaults = getDefaultConfig(data.format_type);
    return { ...defaults, ...(data.format_obj.format_obj ?? {}) };
  });
  const [isConfigured, setIsConfigured] = useState(
    data.format_obj.is_configured ?? false
  );

  const [isPending, startTransition] = useTransition();

  const normalizeConfig = (cfg: Record<string, ConfigValue>) => {
    const normalized: Record<string, ConfigValue> = {};
    for (const key in cfg) {
      const val = cfg[key];

      if (typeof val === "string" && !isNaN(Number(val)) && val.trim() !== "") {
        // convert numeric strings into numbers
        normalized[key] = Number(val);
      } else {
        normalized[key] = val;
      }
    }
    return normalized;
  };

  const handleSave = (isConfigured: boolean) => {
    startTransition(async () => {
      try {
        if (!data.format_obj.format_id) return;

        const response = await autoMatchConfigService.updateFormat(
          data.format_obj.format_id,
          {
            format_name: formatName,
            format_obj: normalizeConfig(config),
            is_configured: isConfigured,
          }
        );

        toast.success(response.message);
        setIsConfigured(isConfigured);
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

            <div className="mt-3 pt-3 space-y-2">
              <Label htmlFor="use-series">Enable Series (Twice-to-Beat)</Label>
              <Switch
                id="use-series"
                checked={!!config.series_config}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    series_config: checked
                      ? {
                          type: "TwiceToBeat",
                          advantaged_team: "",
                          challenger_team: "",
                          max_games: 2,
                        }
                      : null,
                  })
                }
              />
            </div>

            {config.series_config?.type === "TwiceToBeat" && (
              <div className="space-y-2 mt-2">
                <Label>Advantaged Team</Label>
                <Input
                  value={config.series_config.advantaged_team ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      series_config: {
                        ...config.series_config,
                        advantaged_team: e.target.value,
                      },
                    })
                  }
                  placeholder="Team ID or name"
                />
                <Label>Challenger Team</Label>
                <Input
                  value={config.series_config.challenger_team ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      series_config: {
                        ...config.series_config,
                        challenger_team: e.target.value,
                      },
                    })
                  }
                  placeholder="Team ID or name"
                />
              </div>
            )}
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
            <Label>Advances per Group</Label>
            <Input
              value={config.advances_per_group ?? ""}
              type="number"
              onChange={(e) =>
                setConfig({ ...config, advances_per_group: e.target.value })
              }
              placeholder="Teams advancing per group"
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
            <div className="mt-3 pt-3 space-y-2">
              <Label>Enable Twice-to-Beat</Label>
              <Switch
                checked={!!config.series_config}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    series_config: checked
                      ? {
                          type: "TwiceToBeat",
                          advantaged_team: "",
                          challenger_team: "",
                          max_games: 2,
                        }
                      : null,
                  })
                }
              />
            </div>

            {config.series_config && (
              <div className="space-y-2 mt-2">
                <Label>Advantaged Team</Label>
                <Input
                  value={config.series_config.advantaged_team ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      series_config: {
                        ...config.series_config,
                        advantaged_team: e.target.value,
                      },
                    })
                  }
                />

                <Label>Challenger Team</Label>
                <Input
                  value={config.series_config.challenger_team ?? ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      series_config: {
                        ...config.series_config,
                        challenger_team: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
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

            <SheetContent className="p-0">
              <SheetHeader className="py-4 px-5 border-b border-border">
                <SheetTitle>Edit Format</SheetTitle>
                <SheetDescription>
                  Update configuration for{" "}
                  <span className="font-semibold">{data.format_type}</span>
                </SheetDescription>
              </SheetHeader>

              <SheetBody className="py-0 px-5 grow">
                <ScrollArea className="h-[calc(100dvh-190px)] pe-3 -me-3">
                  <div className="space-y-4 mt-4">
                    <div className="space-y-3 px-1">
                      <Label>Format Name</Label>
                      <Input
                        max={20}
                        value={formatName}
                        onChange={(e) => setFormatName(e.target.value)}
                        placeholder="Enter format name"
                      />

                      {renderFormatInputs()}
                    </div>
                  </div>
                </ScrollArea>
              </SheetBody>

              <SheetFooter className="py-4 px-5 border-t border-border">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isPending}
                  variant={"secondary"}
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isPending || isConfigured}
                >
                  {isPending
                    ? "Saving..."
                    : isConfigured
                    ? "Configured"
                    : "Configure"}
                </Button>
              </SheetFooter>
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

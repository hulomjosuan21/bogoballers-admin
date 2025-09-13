import { GripVertical, Pencil } from "lucide-react";
import {
  RoundFormatTypesEnum,
  RoundTypeEnum,
} from "@/types/leagueCategoryTypes";
import { getPredefinedFormatConfigs } from "@/constants/getPredefinedFormatConfigs";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useFormatConfigStore } from "@/stores/formatConfigStore";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BestOfConfig,
  DoubleEliminationConfig,
  KnockoutConfig,
  RoundRobinConfig,
  TwiceToBeatConfig,
} from "@/types/formatConfig";
// import { Checkbox } from "../ui/checkbox";

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
    config:
      | RoundRobinConfig
      | KnockoutConfig
      | DoubleEliminationConfig
      | BestOfConfig
      | TwiceToBeatConfig
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] =
    useState<RoundFormatTypesEnum | null>(null);

  const {
    rrConfig,
    koConfig,
    deConfig,
    boConfig,
    ttbConfig,
    setRRConfig,
    setKOConfig,
    setDEConfig,
    setBOConfig,
    setTTBConfig,
  } = useFormatConfigStore();

  const getConfigForFormat = (formatType: RoundFormatTypesEnum) => {
    switch (formatType) {
      case RoundFormatTypesEnum.RoundRobin:
        return {
          label: rrConfig.label || "• 1 Group, All Play All",
          format_type: RoundFormatTypesEnum.RoundRobin,
          variant: "roundrobin_1group",
          format_config: {
            group_count: parseInt(rrConfig.group_count) || 1,
            advances_per_group: parseInt(rrConfig.advances_per_group) || 2,
            regeneration_count: parseInt(rrConfig.regeneration_count) || 1,
            label: rrConfig.label || "• 1 Group, All Play All",
          },
        };
      case RoundFormatTypesEnum.Knockout:
        return {
          label: koConfig.label || "• Single Elim, Random Seeding",
          format_type: RoundFormatTypesEnum.Knockout,
          variant: "knockout_singleelim",
          format_config: {
            group_count: parseInt(koConfig.group_count) || 1,
            single_elim: koConfig.single_elim,
            seeding: koConfig.seeding,
            regeneration_count: parseInt(koConfig.regeneration_count) || 0,
            label: koConfig.label || "• Single Elim, Random Seeding",
          },
        };
      case RoundFormatTypesEnum.DoubleElimination:
        return {
          label: deConfig.label || "• Standard",
          format_type: RoundFormatTypesEnum.DoubleElimination,
          variant: "doubleelim_standard",
          format_config: {
            group_count: parseInt(deConfig.group_count) || 1,
            max_loss: parseInt(deConfig.max_loss) || 2,
            brackets: ["winners", "losers"],
            regeneration_count: parseInt(deConfig.regeneration_count) || 0,
            label: deConfig.label || "• Standard",
          },
        };
      case RoundFormatTypesEnum.BestOf:
        return {
          label: boConfig.label || "• Best of 3",
          format_type: RoundFormatTypesEnum.BestOf,
          variant: "bestof_3",
          format_config: {
            group_count: parseInt(boConfig.group_count) || 1,
            games: parseInt(boConfig.games) || 3,
            regeneration_count: parseInt(boConfig.regeneration_count) || 0,
            label: boConfig.label || "• Best of 3",
          },
        };
      case RoundFormatTypesEnum.TwiceToBeat:
        return {
          label: ttbConfig.label || "• Finals Format",
          format_type: RoundFormatTypesEnum.TwiceToBeat,
          variant: "twicetobeat_final",
          format_config: {
            advantaged_team: ttbConfig.advantaged_team || "",
            challenger_team: ttbConfig.challenger_team || "",
            max_games: parseInt(ttbConfig.max_games) || 2,
            label: ttbConfig.label || "• Finals Format",
          },
        };
      default:
        return null;
    }
  };

  const handleApply = () => {
    setOpen(false);
  };

  const configs = getPredefinedFormatConfigs(nTeam, 1);

  return (
    <div className="w-48 p-2 border rounded-md bg-card">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
        Format types
      </h3>
      <div className="flex flex-col gap-2">
        {configs.map(({ format_type, label }) => (
          <Dialog
            key={format_type}
            open={open && selectedFormat === format_type}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (isOpen) setSelectedFormat(format_type);
              else setSelectedFormat(null);
            }}
          >
            <DialogTrigger asChild>
              <div
                className="flex flex-col gap-1 p-2 rounded-md border bg-background cursor-grab hover:opacity-80"
                draggable
                onDragStart={(event) => {
                  const config = getConfigForFormat(format_type);
                  if (config) {
                    event.dataTransfer.setData("variant", config.variant);
                    event.dataTransfer.setData(
                      "application/reactflow",
                      config.label
                    );
                    event.dataTransfer.setData("node-type", "format");
                    onDragStart(event, config.label, config.format_config);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold">{format_type}</span>
                </div>
                <span className="text-xs font-medium ml-6 text-muted-foreground">
                  {label}
                </span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure {label}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor={`${format_type}-label`}>Format Label</Label>
                  <Input
                    id={`${format_type}-label`}
                    type="text"
                    value={
                      format_type === RoundFormatTypesEnum.RoundRobin
                        ? rrConfig.label
                        : format_type === RoundFormatTypesEnum.Knockout
                        ? koConfig.label
                        : format_type === RoundFormatTypesEnum.DoubleElimination
                        ? deConfig.label
                        : format_type === RoundFormatTypesEnum.BestOf
                        ? boConfig.label
                        : ttbConfig.label
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (format_type === RoundFormatTypesEnum.RoundRobin) {
                        setRRConfig({ ...rrConfig, label: value });
                      } else if (
                        format_type === RoundFormatTypesEnum.Knockout
                      ) {
                        setKOConfig({ ...koConfig, label: value });
                      } else if (
                        format_type === RoundFormatTypesEnum.DoubleElimination
                      ) {
                        setDEConfig({ ...deConfig, label: value });
                      } else if (format_type === RoundFormatTypesEnum.BestOf) {
                        setBOConfig({ ...boConfig, label: value });
                      } else if (
                        format_type === RoundFormatTypesEnum.TwiceToBeat
                      ) {
                        setTTBConfig({ ...ttbConfig, label: value });
                      }
                    }}
                    placeholder="Enter format label"
                  />
                </div>
                {format_type === RoundFormatTypesEnum.RoundRobin && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-groupCount`}>
                        Number of Groups
                      </Label>
                      <Input
                        id={`${format_type}-groupCount`}
                        type="number"
                        value={rrConfig.group_count}
                        onChange={(e) =>
                          setRRConfig({
                            ...rrConfig,
                            group_count: e.target.value,
                          })
                        }
                        min="1"
                        placeholder="Enter number of groups"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-advancesPerGroup`}>
                        Advances per Group
                      </Label>
                      <Input
                        id={`${format_type}-advancesPerGroup`}
                        type="number"
                        value={rrConfig.advances_per_group}
                        onChange={(e) =>
                          setRRConfig({
                            ...rrConfig,
                            advances_per_group: e.target.value,
                          })
                        }
                        min="1"
                        placeholder="Enter advances per group"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-regenerationCount`}>
                        Regeneration Count
                      </Label>
                      <Input
                        id={`${format_type}-regenerationCount`}
                        type="number"
                        value={rrConfig.regeneration_count}
                        onChange={(e) =>
                          setRRConfig({
                            ...rrConfig,
                            regeneration_count: e.target.value,
                          })
                        }
                        min="0"
                        placeholder="Enter regeneration count"
                      />
                    </div>
                  </>
                )}
                {format_type === RoundFormatTypesEnum.Knockout && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-groupCount`}>
                        Number of Groups
                      </Label>
                      <Input
                        id={`${format_type}-groupCount`}
                        type="number"
                        value={koConfig.group_count}
                        onChange={(e) =>
                          setKOConfig({
                            ...koConfig,
                            group_count: e.target.value,
                          })
                        }
                        min="1"
                        placeholder="Enter number of groups"
                      />
                    </div>
                    {/* <div className="space-y-1">
                      <Label
                        htmlFor={`${format_type}-singleElim`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          id={`${format_type}-singleElim`}
                          checked={koConfig.single_elim}
                          onCheckedChange={(checked) =>
                            setKOConfig({
                              ...koConfig,
                              single_elim: !!checked,
                            })
                          }
                        />
                        Single Elimination
                      </Label>
                    </div> */}
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-seeding`}>
                        Seeding Method
                      </Label>
                      <Input
                        disabled
                        id={`${format_type}-seeding`}
                        type="text"
                        value={koConfig.seeding}
                        onChange={(e) =>
                          setKOConfig({ ...koConfig, seeding: e.target.value })
                        }
                        placeholder="Enter seeding method (e.g., random)"
                      />
                    </div>
                  </>
                )}
                {format_type === RoundFormatTypesEnum.DoubleElimination && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-groupCount`}>
                        Number of Groups
                      </Label>
                      <Input
                        id={`${format_type}-groupCount`}
                        type="number"
                        value={deConfig.group_count}
                        onChange={(e) =>
                          setDEConfig({
                            ...deConfig,
                            group_count: e.target.value,
                          })
                        }
                        min="1"
                        placeholder="Enter number of groups"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-maxLoss`}>
                        Max Losses
                      </Label>
                      <Input
                        id={`${format_type}-maxLoss`}
                        type="number"
                        value={deConfig.max_loss}
                        onChange={(e) =>
                          setDEConfig({ ...deConfig, max_loss: e.target.value })
                        }
                        min="1"
                        placeholder="Enter max losses"
                      />
                    </div>
                  </>
                )}
                {format_type === RoundFormatTypesEnum.BestOf && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-groupCount`}>
                        Number of Groups
                      </Label>
                      <Input
                        id={`${format_type}-groupCount`}
                        type="number"
                        value={boConfig.group_count}
                        onChange={(e) =>
                          setBOConfig({
                            ...boConfig,
                            group_count: e.target.value,
                          })
                        }
                        min="1"
                        placeholder="Enter number of groups"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-games`}>
                        Number of Games
                      </Label>
                      <Input
                        id={`${format_type}-games`}
                        type="number"
                        value={boConfig.games}
                        onChange={(e) =>
                          setBOConfig({ ...boConfig, games: e.target.value })
                        }
                        min="1"
                        placeholder="Enter number of games"
                      />
                    </div>
                  </>
                )}
                {format_type === RoundFormatTypesEnum.TwiceToBeat && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-advantagedTeam`}>
                        Advantaged Team
                      </Label>
                      <Select
                        value={ttbConfig.advantaged_team}
                        onValueChange={(value) =>
                          setTTBConfig({ ...ttbConfig, advantaged_team: value })
                        }
                      >
                        <SelectTrigger id={`${format_type}-advantagedTeam`}>
                          <SelectValue placeholder="Select advantaged team" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Empty as per requirement */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-challengerTeam`}>
                        Challenger Team
                      </Label>
                      <Select
                        value={ttbConfig.challenger_team}
                        onValueChange={(value) =>
                          setTTBConfig({ ...ttbConfig, challenger_team: value })
                        }
                      >
                        <SelectTrigger id={`${format_type}-challengerTeam`}>
                          <SelectValue placeholder="Select challenger team" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Empty as per requirement */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-maxGames`}>
                        Max Games
                      </Label>
                      <Input
                        id={`${format_type}-maxGames`}
                        type="number"
                        value={ttbConfig.max_games}
                        onChange={(e) =>
                          setTTBConfig({
                            ...ttbConfig,
                            max_games: e.target.value,
                          })
                        }
                        min="1"
                        placeholder="Enter max games"
                      />
                    </div>
                  </>
                )}
                <Button onClick={handleApply}>Apply Configuration</Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}

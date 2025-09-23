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
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
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
  onDragStart,
}: {
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
  const [tempConfig, setTempConfig] = useState<{
    label?: string;
    group_count?: string;
    advances_per_group?: string;
    use_point_system?: boolean;
    single_elim?: boolean;
    seeding?: string;
    max_loss?: string;
    games?: string;
    advantaged_team?: string;
    challenger_team?: string;
    max_games?: string;
    progress_group?: string;
    max_progress_group?: string;
  }>({});

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
            label: rrConfig.label || "• 1 Group, All Play All",
            use_point_system: rrConfig.use_point_system || false,
          },
        };
      case RoundFormatTypesEnum.Knockout:
        return {
          label: koConfig.label || "• Single Elim, Random Seeding",
          format_type: RoundFormatTypesEnum.Knockout,
          variant: "knockout_singleelim",
          format_config: {
            group_count: parseInt(koConfig.group_count) || 1,
            single_elim: true,
            seeding: koConfig.seeding,
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
            label: deConfig.label || "• Standard",
            progress_group: deConfig.progress_group || 1,
            max_progress_group: deConfig.max_progress_group || 2,
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
            label: boConfig.label || "• Best of 3",
            advances_per_group: parseInt(boConfig.advances_per_group) || 2,
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
    if (!selectedFormat) return;

    const validateNumber = (
      value: string | undefined,
      min: number,
      max: number,
      field: string
    ) => {
      if (value === undefined || value === "") return true;
      const num = parseInt(value);
      if (isNaN(num) || num < min || num > max) {
        toast.error(`${field} must be between ${min} and ${max}`);
        return false;
      }
      return true;
    };

    switch (selectedFormat) {
      case RoundFormatTypesEnum.RoundRobin: {
        if (
          !validateNumber(tempConfig.group_count, 1, 6, "Number of Groups") ||
          !validateNumber(
            tempConfig.advances_per_group,
            1,
            10,
            "Advances per Group"
          )
        ) {
          toast.error("Please provide valid values for all changed fields");
          return;
        }
        setRRConfig({
          ...rrConfig,
          ...(tempConfig.label !== undefined && { label: tempConfig.label }),
          ...(tempConfig.group_count !== undefined && {
            group_count: tempConfig.group_count,
          }),
          ...(tempConfig.advances_per_group !== undefined && {
            advances_per_group: tempConfig.advances_per_group,
          }),
          ...(tempConfig.use_point_system !== undefined && {
            use_point_system: tempConfig.use_point_system,
          }),
        });

        break;
      }
      case RoundFormatTypesEnum.Knockout: {
        if (!validateNumber(tempConfig.group_count, 1, 6, "Number of Groups")) {
          toast.error("Please provide valid values for all changed fields");
          return;
        }
        if (tempConfig.seeding === "") {
          toast.error("Seeding method is required if changed");
          return;
        }
        setKOConfig({
          ...koConfig,
          ...(tempConfig.label !== undefined && { label: tempConfig.label }),
          ...(tempConfig.group_count !== undefined && {
            group_count: tempConfig.group_count,
          }),
          ...(tempConfig.seeding !== undefined && {
            seeding: tempConfig.seeding,
          }),
        });
        break;
      }
      case RoundFormatTypesEnum.DoubleElimination: {
        if (
          !validateNumber(tempConfig.group_count, 1, 6, "Number of Groups") ||
          !validateNumber(tempConfig.max_loss, 1, 5, "Max Losses")
        ) {
          toast.error("Please provide valid values for all changed fields");
          return;
        }
        setDEConfig({
          ...deConfig,
          ...(tempConfig.label !== undefined && { label: tempConfig.label }),
          ...(tempConfig.group_count !== undefined && {
            group_count: tempConfig.group_count,
          }),
          ...(tempConfig.max_loss !== undefined && {
            max_loss: tempConfig.max_loss,
          }),
          ...(tempConfig.progress_group !== undefined && {
            progress_group: tempConfig.progress_group,
          }),
          ...(tempConfig.max_progress_group !== undefined && {
            max_progress_group: tempConfig.max_progress_group,
          }),
        });
        break;
      }
      case RoundFormatTypesEnum.BestOf: {
        if (
          !validateNumber(tempConfig.group_count, 1, 6, "Number of Groups") ||
          !validateNumber(tempConfig.games, 1, 7, "Number of Games")
        ) {
          toast.error("Please provide valid values for all changed fields");
          return;
        }
        setBOConfig({
          ...boConfig,
          ...(tempConfig.label !== undefined && { label: tempConfig.label }),
          ...(tempConfig.group_count !== undefined && {
            group_count: tempConfig.group_count,
          }),
          ...(tempConfig.games !== undefined && { games: tempConfig.games }),
          ...(tempConfig.advances_per_group !== undefined && {
            advances_per_group: tempConfig.advances_per_group,
          }),
        });
        break;
      }
      case RoundFormatTypesEnum.TwiceToBeat: {
        if (!validateNumber(tempConfig.max_games, 1, 3, "Max Games")) {
          toast.error("Please provide valid values for all changed fields");
          return;
        }
        setTTBConfig({
          ...ttbConfig,
          ...(tempConfig.label !== undefined && { label: tempConfig.label }),
          ...(tempConfig.advantaged_team !== undefined && {
            advantaged_team: tempConfig.advantaged_team,
          }),
          ...(tempConfig.challenger_team !== undefined && {
            challenger_team: tempConfig.challenger_team,
          }),
          ...(tempConfig.max_games !== undefined && {
            max_games: tempConfig.max_games,
          }),
        });
        break;
      }
    }
    setOpen(false);
    setTempConfig({});
  };

  const configs = getPredefinedFormatConfigs();

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
              if (isOpen) {
                setSelectedFormat(format_type);
                setTempConfig({});
              } else {
                setSelectedFormat(null);
                setTempConfig({});
              }
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
                    onDragStart(
                      event,
                      config.format_type,
                      config.format_config
                    );
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold">{format_type}</span>
                  </div>
                  <Pencil className="w-3 h-3 cursor-pointer text-muted-foreground" />
                </div>

                <span className="text-xs font-medium ml-6 text-muted-foreground">
                  {label}
                </span>
              </div>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>
                  Configure {format_type.toLocaleLowerCase()} format
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor={`${format_type}-label`}>Format Label</Label>
                  <Input
                    id={`${format_type}-label`}
                    type="text"
                    value={
                      tempConfig.label ??
                      rrConfig.label ??
                      koConfig.label ??
                      deConfig.label ??
                      boConfig.label ??
                      ttbConfig.label ??
                      ""
                    }
                    onChange={(e) =>
                      setTempConfig({ ...tempConfig, label: e.target.value })
                    }
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
                        min={1}
                        max={6}
                        value={
                          tempConfig.group_count ?? rrConfig.group_count ?? ""
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            group_count: e.target.value,
                          })
                        }
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
                        min={1}
                        max={10}
                        value={
                          tempConfig.advances_per_group ??
                          rrConfig.advances_per_group ??
                          ""
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            advances_per_group: e.target.value,
                          })
                        }
                        placeholder="Enter advances per group"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id={`${format_type}-usePointSystem`}
                        checked={
                          tempConfig.use_point_system ??
                          rrConfig.use_point_system ??
                          true
                        }
                        onCheckedChange={(checked) =>
                          setTempConfig({
                            ...tempConfig,
                            use_point_system: checked as boolean,
                          })
                        }
                      />
                      <Label
                        htmlFor={`${format_type}-usePointSystem`}
                        className="text-sm"
                      >
                        Use Point System
                      </Label>
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
                        min={1}
                        max={6}
                        value={
                          tempConfig.group_count ?? koConfig.group_count ?? ""
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            group_count: e.target.value,
                          })
                        }
                        placeholder="Enter number of groups"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-seeding`}>
                        Seeding Method
                      </Label>
                      <Input
                        disabled
                        id={`${format_type}-seeding`}
                        type="text"
                        value={tempConfig.seeding ?? koConfig.seeding ?? ""}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            seeding: e.target.value,
                          })
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
                        min={1}
                        max={6}
                        value={
                          tempConfig.group_count ?? deConfig.group_count ?? ""
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            group_count: e.target.value,
                          })
                        }
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
                        min={1}
                        max={5}
                        value={tempConfig.max_loss ?? deConfig.max_loss ?? ""}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            max_loss: e.target.value,
                          })
                        }
                        placeholder="Enter max losses"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-progressGroup`}>
                        Starting Stage
                      </Label>
                      <Input
                        id={`${format_type}-progressGroup`}
                        type="number"
                        min={1}
                        max={6}
                        value={
                          tempConfig.progress_group ??
                          deConfig.progress_group ??
                          1
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            progress_group: e.target.value,
                          })
                        }
                        placeholder="Enter starting stage"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-maxProgressGroup`}>
                        Max Stages
                      </Label>
                      <Input
                        id={`${format_type}-maxProgressGroup`}
                        type="number"
                        min={1}
                        max={10}
                        value={
                          tempConfig.max_progress_group ??
                          deConfig.max_progress_group ??
                          6
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            max_progress_group: e.target.value,
                          })
                        }
                        placeholder="Enter max stages"
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
                        min={1}
                        max={6}
                        value={
                          tempConfig.group_count ?? boConfig.group_count ?? ""
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            group_count: e.target.value,
                          })
                        }
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
                        min={1}
                        max={7}
                        value={tempConfig.games ?? boConfig.games ?? ""}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            games: e.target.value,
                          })
                        }
                        placeholder="Enter number of games"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-advancesPerGroup`}>
                        Advances per Group
                      </Label>
                      <Input
                        id={`${format_type}-advancesPerGroup`}
                        type="number"
                        min={1}
                        max={10}
                        value={
                          tempConfig.advances_per_group ??
                          boConfig.advances_per_group ??
                          ""
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            advances_per_group: e.target.value,
                          })
                        }
                        placeholder="Enter advances per group"
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
                        value={
                          tempConfig.advantaged_team ??
                          ttbConfig.advantaged_team ??
                          ""
                        }
                        onValueChange={(value) =>
                          setTempConfig({
                            ...tempConfig,
                            advantaged_team: value,
                          })
                        }
                      >
                        <SelectTrigger id={`${format_type}-advantagedTeam`}>
                          <SelectValue placeholder="Select advantaged team" />
                        </SelectTrigger>
                        <SelectContent></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${format_type}-challengerTeam`}>
                        Challenger Team
                      </Label>
                      <Select
                        value={
                          tempConfig.challenger_team ??
                          ttbConfig.challenger_team ??
                          ""
                        }
                        onValueChange={(value) =>
                          setTempConfig({
                            ...tempConfig,
                            challenger_team: value,
                          })
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
                        min={1}
                        max={3}
                        value={
                          tempConfig.max_games ?? ttbConfig.max_games ?? ""
                        }
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            max_games: e.target.value,
                          })
                        }
                        placeholder="Enter max games"
                      />
                    </div>
                  </>
                )}
                <Button onClick={handleApply} size={"sm"}>
                  Apply Configuration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}

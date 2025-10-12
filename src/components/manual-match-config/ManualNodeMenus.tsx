import React, { useState, useEffect } from "react";
import { type Node } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IManualMatchConfigGroup } from "@/types/manualMatchConfigTypes";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import {
  RoundTypeEnum,
  type LeagueCategory,
} from "@/types/leagueCategoryTypes";
import { useLeagueTeamDynamicQuery } from "@/hooks/useLeagueTeam";
import { LeagueTeamService } from "@/service/leagueTeamService";
import type { LeagueTeam } from "@/types/team";
import type { LeagueMatch } from "@/types/leagueMatch";
import { useFlowState } from "@/context/ManualMatchConfigFlowContext";
import { useActiveLeagueCategories } from "@/hooks/useLeagueCategories";

export function ManualLeagueCategoryNodeMenu() {
  const { activeLeagueCategories } = useActiveLeague();

  const { nodes } = useFlowState();

  const categoryNodeIdsOnCanvas = new Set(
    nodes
      .filter((node) => node.type === "leagueCategory")
      .map((node) => node.id)
  );

  const availableCategories = activeLeagueCategories.filter(
    (category) => !categoryNodeIdsOnCanvas.has(category.league_category_id)
  );

  const onDragStart = (event: React.DragEvent, category: LeagueCategory) => {
    const nodePayload: Omit<Node, "position"> = {
      id: category.league_category_id,
      type: "leagueCategory",
      data: { type: "league_category", league_category: category },
    };
    event.dataTransfer.setData(
      "application/reactflow-node",
      JSON.stringify(nodePayload)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-2 justify-center">
      {availableCategories.map((value) => (
        <div
          key={value.league_category_id}
          onDragStart={(event) => onDragStart(event, value)}
          draggable
          className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">
            {value.category_name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ManualGroupNodeMenu() {
  const [groups, setGroups] = useState<IManualMatchConfigGroup[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const newGroup: IManualMatchConfigGroup = {
      display_name: inputValue.trim(),
      group_id: uuidv4(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setInputValue("");
  };

  const onDragStart = (
    event: React.DragEvent,
    group: IManualMatchConfigGroup
  ) => {
    const groupId = uuidv4();
    const nodePayload: Omit<Node, "position"> = {
      id: groupId,
      type: "group",
      data: { type: "group", group: { ...group, group_id: groupId } },
    };
    event.dataTransfer.setData(
      "application/reactflow-node",
      JSON.stringify(nodePayload)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="p-2 bg-card rounded-md">
      <div className="flex gap-2 mb-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter group name"
          className="w-34 h-8"
        />
        <Button onClick={handleAdd} size="sm" variant="outline" className="h-8">
          Add
        </Button>
      </div>
      <div className="flex flex-col gap-2 justify-center">
        {groups.map((value, index) => (
          <div
            key={index}
            onDragStart={(event) => onDragStart(event, value)}
            draggable
            className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-card-foreground">
              {value.display_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManualRoundNodeMenu() {
  const menuItems = Object.values(RoundTypeEnum);

  const onDragStart = (event: React.DragEvent, roundType: RoundTypeEnum) => {
    const roundId = uuidv4();
    const nodePayload: Omit<Node, "position"> = {
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
    <div className="space-y-2">
      <div className="flex flex-col gap-2 justify-center">
        {menuItems.map((value) => (
          <div
            key={value}
            onDragStart={(event) => onDragStart(event, value)}
            draggable
            className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-card-foreground">
              {value}
            </span>
          </div>
        ))}
      </div>
      <ManualGroupNodeMenu />
    </div>
  );
}

export function ManualLeagueTeamNodeMenu() {
  const { activeLeagueId } = useActiveLeague();

  const {
    activeLeagueCategories,
    activeLeagueCategoriesLoading,
    activeLeagueCategoriesError,
  } = useActiveLeagueCategories(activeLeagueId, { condition: "Manual" });

  const hasActiveLeague =
    Array.isArray(activeLeagueCategories) &&
    !activeLeagueCategoriesLoading &&
    !activeLeagueCategoriesError &&
    activeLeagueCategories.length > 0;

  const [selectedCategory, setSelectedCategory] =
    useState<LeagueCategory | null>(null);

  useEffect(() => {
    if (hasActiveLeague && !selectedCategory) {
      setSelectedCategory(activeLeagueCategories[0] || null);
    }
  }, [hasActiveLeague, activeLeagueCategories, selectedCategory]);

  const { dynamicLeagueTeamData, dynamicLeagueTeamLoading } =
    useLeagueTeamDynamicQuery(
      [
        "league-teams-manual",
        selectedCategory?.league_category_id ?? "none",
        "NotEliminated",
      ],
      () =>
        selectedCategory
          ? LeagueTeamService.getMany(selectedCategory.league_category_id, {
              condition: "NotEliminated",
            })
          : Promise.resolve([]),
      { enabled: !!selectedCategory }
    );

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    team: LeagueTeam
  ) => {
    try {
      event.dataTransfer.setData(
        "application/reactflow-team",
        JSON.stringify(team)
      );
      event.dataTransfer.effectAllowed = "move";
    } catch (err) {
      console.error("Failed to set drag data:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Select
        onValueChange={(catId) => {
          const category = activeLeagueCategories?.find(
            (c) => c.league_category_id === catId
          );
          setSelectedCategory(category || null);
        }}
        value={selectedCategory?.league_category_id || ""}
        disabled={!hasActiveLeague}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select League Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Active League Categories</SelectLabel>
            {activeLeagueCategories?.map((category) => (
              <SelectItem
                key={category.league_category_id}
                value={category.league_category_id}
              >
                {category.category_name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-2 justify-center max-h-96 overflow-y-auto">
        {dynamicLeagueTeamLoading && (
          <span className="text-sm text-muted-foreground">
            Loading teams...
          </span>
        )}
        {dynamicLeagueTeamData?.length
          ? dynamicLeagueTeamData.map((team) => (
              <div
                key={team.league_team_id}
                onDragStart={(event) => onDragStart(event, team)}
                draggable
                className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground">
                  {team.team_name}
                </span>
              </div>
            ))
          : !dynamicLeagueTeamLoading && (
              <span className="text-sm text-muted-foreground">
                No teams available.
              </span>
            )}
      </div>
    </div>
  );
}

const matchTemplates: { label: string; data: Partial<LeagueMatch> }[] = [
  {
    label: "New Match",
    data: {
      display_name: "New Match",
    },
  },
  {
    label: "New Elimination Match",
    data: {
      display_name: "Elimination Match",
      is_elimination: true,
    },
  },
  {
    label: "Third Place Match",
    data: {
      display_name: "Battle for Third",
      is_third_place: true,
    },
  },
  // {
  //   label: "Runner-Up Match",
  //   data: {
  //     display_name: "Runner-Up Match",
  //     is_runner_up: true,
  //   },
  // },
  {
    label: "Final Match",
    data: {
      display_name: "Final Match",
      is_final: true,
    },
  },
];
const DraggableMatchItem = ({
  label,
  matchData,
}: {
  label: string;
  matchData: Partial<LeagueMatch>;
}) => {
  const onDragStart = (event: React.DragEvent) => {
    const matchId = uuidv4();

    const newMatch: Partial<LeagueMatch> = {
      league_match_id: matchId,
      ...matchData,
    };

    const nodePayload: Omit<Node, "position"> = {
      id: matchId,
      type: "leagueMatch",
      data: { type: "league_match", league_match: newMatch },
    };

    event.dataTransfer.setData(
      "application/reactflow-node",
      JSON.stringify(nodePayload)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      onDragStart={onDragStart}
      draggable
      className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs font-medium text-card-foreground">{label}</span>
    </div>
  );
};

export function ManualMatchNodeMenu() {
  return (
    <div className="">
      <div className="flex flex-col gap-2">
        {matchTemplates.map((template) => (
          <DraggableMatchItem
            key={template.label}
            label={template.label}
            matchData={template.data}
          />
        ))}
      </div>
    </div>
  );
}

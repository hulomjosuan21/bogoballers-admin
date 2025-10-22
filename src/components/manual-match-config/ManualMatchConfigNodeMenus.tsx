import React, { useState, useEffect } from "react";
import { type Node } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { GripVertical, List, Shuffle } from "lucide-react";

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
import { useActiveLeagueCategories } from "@/hooks/useLeagueCategories";

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
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter group name"
          className="h-8"
        />
        <Button onClick={handleAdd} size="sm" className="h-8">
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
      <div className="flex flex-col gap-2 items-center">
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

  const [teamPool, setTeamPool] = useState<LeagueTeam[]>([]);
  const [currentRoll, setCurrentRoll] = useState<LeagueTeam[]>([]);
  const [showAll, setShowAll] = useState(false);

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

  useEffect(() => {
    if (dynamicLeagueTeamData?.length) {
      setTeamPool(dynamicLeagueTeamData);
      setCurrentRoll([]);
      setShowAll(false);
    } else {
      setTeamPool([]);
      setCurrentRoll([]);
      setShowAll(false);
    }
  }, [dynamicLeagueTeamData, selectedCategory]);

  const rollTwo = () => {
    if (teamPool.length === 0) {
      // reset once all are rolled
      setTeamPool(dynamicLeagueTeamData || []);
      setCurrentRoll([]);
      return;
    }

    const shuffled = [...teamPool].sort(() => Math.random() - 0.5);

    const picked = shuffled.slice(0, 2);
    const remaining = teamPool.filter(
      (t) => !picked.find((p) => p.league_team_id === t.league_team_id)
    );

    setCurrentRoll(picked);
    setTeamPool(remaining);
    setShowAll(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Category Selector */}
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

      <div className="flex gap-2">
        <Button
          onClick={rollTwo}
          size={"sm"}
          disabled={dynamicLeagueTeamLoading || !dynamicLeagueTeamData?.length}
          className="flex items-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          {teamPool.length === 0 ? "Reset" : "Roll"}
        </Button>

        <Button
          variant="secondary"
          size={"sm"}
          onClick={() => setShowAll((prev) => !prev)}
          disabled={dynamicLeagueTeamLoading || !dynamicLeagueTeamData?.length}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          {showAll ? "Hide All" : "Show All"}
        </Button>
      </div>

      <div className="flex flex-col gap-2 items-center max-h-96 overflow-y-auto">
        {dynamicLeagueTeamLoading && (
          <span className="text-sm text-muted-foreground">
            Loading teams...
          </span>
        )}

        {showAll
          ? dynamicLeagueTeamData?.map((team) => (
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
          : currentRoll.length > 0
          ? currentRoll.map((team) => (
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
                {teamPool.length === 0
                  ? "All teams rolled. Press Reset."
                  : "Click Roll to pick teams."}
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
      <div className="flex flex-col items-center gap-2">
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

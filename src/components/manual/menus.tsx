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
import type { IGroup } from "@/types/manual";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import {
  RoundTypeEnum,
  type LeagueCategory,
} from "@/types/leagueCategoryTypes";
import { useLeagueTeamDynamicQuery } from "@/hooks/useLeagueTeam";
import { LeagueTeamService } from "@/service/leagueTeamService";
import type { LeagueTeam } from "@/types/team";
import type { LeagueMatch } from "@/types/leagueMatch";

export function ManualLeagueCategoryNodeMenu() {
  const { activeLeagueCategories } = useActiveLeague();

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
      {activeLeagueCategories.map((value) => (
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
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const newGroup: IGroup = {
      display_name: inputValue.trim(),
      group_id: uuidv4(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setInputValue("");
  };

  const onDragStart = (event: React.DragEvent, group: IGroup) => {
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
          className="w-32 h-8"
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
  const { activeLeagueData, activeLeagueError, activeLeagueCategories } =
    useActiveLeague();
  const hasActiveLeague =
    !activeLeagueError &&
    activeLeagueData &&
    activeLeagueCategories &&
    activeLeagueCategories.length > 0;
  const [selectedCategory, setSelectedCategory] =
    useState<LeagueCategory | null>(null);

  useEffect(() => {
    if (hasActiveLeague && !selectedCategory) {
      setSelectedCategory(activeLeagueCategories[0]);
    }
  }, [hasActiveLeague, activeLeagueCategories, selectedCategory]);

  const { dynamicLeagueTeamData, dynamicLeagueTeamLoading } =
    useLeagueTeamDynamicQuery(
      [
        "league-teams-manual",
        selectedCategory?.league_category_id,
        "NotEliminated",
      ],
      () =>
        LeagueTeamService.getMany(selectedCategory!.league_category_id, {
          condition: "NotEliminated",
        }),
      { enabled: !!selectedCategory }
    );

  const onDragStart = (event: React.DragEvent, team: LeagueTeam) => {
    event.dataTransfer.setData(
      "application/reactflow-team",
      JSON.stringify(team)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-4">
      <Select
        onValueChange={(catId) =>
          setSelectedCategory(
            activeLeagueCategories.find(
              (c) => c.league_category_id === catId
            ) || null
          )
        }
        value={selectedCategory?.league_category_id || ""}
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
        {dynamicLeagueTeamData?.map((team) => (
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
        ))}
      </div>
    </div>
  );
}

export function ManualEmptyLeagueMatchNode({ leagueId }: { leagueId: string }) {
  const onDragStart = (event: React.DragEvent) => {
    const matchId = uuidv4();
    const newMatch: Partial<LeagueMatch> = {
      league_match_id: matchId,
      league_id: leagueId,
      league_category_id: "",
      round_id: "",
      home_team_id: null,
      home_team: null,
      away_team_id: null,
      away_team: null,
      home_team_score: null,
      away_team_score: null,
      winner_team_id: null,
      loser_team_id: null,
      scheduled_date: null,
      quarters: 4,
      minutes_per_quarter: 10,
      minutes_per_overtime: 5,
      court: "",
      referees: [],
      previous_match_ids: [],
      next_match_id: null,
      next_match_slot: null,
      loser_next_match_id: null,
      loser_next_match_slot: null,
      round_number: null,
      bracket_side: null,
      bracket_position: null,
      pairing_method: "manual",
      is_final: false,
      is_third_place: false,
      is_exhibition: false,
      status: "PENDING",
      stage_number: null,
      depends_on_match_ids: [],
      is_placeholder: true,
      bracket_stage_label: null,
      league_match_created_at: new Date().toISOString(),
      display_name: "New Match",
      league_match_updated_at: new Date().toISOString(),
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
      className="w-fit border rounded-md p-2 bg-card cursor-grab hover:opacity-80"
    >
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">
        Empty Match
      </h3>
      <div className="w-48 flex gap-1 justify-between">
        <div className="border border-dashed h-12 w-22 rounded-sm grid place-content-center font-thin text-xs text-muted-foreground">
          Home
        </div>
        <div className="border border-dashed h-12 w-22 rounded-sm grid place-content-center font-thin text-xs text-muted-foreground">
          Away
        </div>
      </div>
    </div>
  );
}

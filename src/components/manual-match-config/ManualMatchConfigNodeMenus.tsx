import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { type Node } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { Filter, GripVertical, List, Settings2, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IManualMatchConfigGroup } from "@/types/manualMatchConfigTypes";
import { RoundTypeEnum } from "@/types/leagueCategoryTypes";
import type { LeagueMatch } from "@/types/leagueMatch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { ScrollArea } from "../ui/scroll-area";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import axiosClient from "@/lib/axiosClient";
type ManualCategoryOption = {
  league_category_id: string;
  category_name: string;
};

type ManualTeamOption = {
  league_team_id: string;
  team_name: string;
  group_label: string;
};
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
      <div className="flex flex-col gap-2 justify-center mt-2">
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

export const ManualLeagueTeamNodeMenu = memo(() => {
  {
    const { league_id: activeLeagueId } = useActiveLeagueMeta();

    if (!activeLeagueId) return null;

    const { data: manualCategories } = useSuspenseQuery<ManualCategoryOption[]>(
      {
        queryKey: ["manual-categories", activeLeagueId],
        queryFn: async () => {
          const response = await axiosClient.get<ManualCategoryOption[]>(
            `/manual-league-management/league-categories/${activeLeagueId}`
          );

          return response.data;
        },
      }
    );

    const [selectedCategory, setSelectedCategory] =
      useState<ManualCategoryOption | null>(null);

    useEffect(() => {
      if (
        manualCategories &&
        manualCategories.length > 0 &&
        !selectedCategory
      ) {
        setSelectedCategory(manualCategories[0]);
      }
    }, [manualCategories, selectedCategory]);

    const queryKey = [
      "league-teams-grouped",
      selectedCategory?.league_category_id,
    ];
    const { data: teamData } = useSuspenseQuery({
      queryKey: queryKey,
      queryFn: async () => {
        if (!selectedCategory) return [];

        const { data } = await axiosClient.get<ManualTeamOption[]>(
          `/league-team/grouped/${selectedCategory.league_category_id}`
        );
        return data;
      },
    });

    const { mutate: saveGroups, isPending: isSaving } = useMutation({
      mutationFn: async (
        teams: { league_team_id: string; group_label: string }[]
      ) => {
        if (!selectedCategory) throw new Error("No category");

        const { data } = await axiosClient.put<ManualTeamOption[]>(
          `/league-team/update-grouped/${selectedCategory.league_category_id}`,
          { teams }
        );

        return data;
      },
      onSuccess: (updatedTeams) => {
        queryClient.setQueryData(queryKey, updatedTeams);
        toast.success("Groups updated");
        handleLocalReset(updatedTeams);
      },
      onError: () => {
        toast.error("Failed to update groups");
      },
    });

    const [groupCount, setGroupCount] = useState<number>(1);
    const [targetGroup, setTargetGroup] = useState<string>("all");
    const [currentRoll, setCurrentRoll] = useState<ManualTeamOption[]>([]);
    const [lastRolledGroupIndex, setLastRolledGroupIndex] = useState<
      string | null
    >(null);
    const [showAll, setShowAll] = useState(false);
    const [teamPool, setTeamPool] = useState<
      Record<string, ManualTeamOption[]>
    >({});

    const handleLocalReset = useCallback((teams: ManualTeamOption[]) => {
      const groups: Record<string, ManualTeamOption[]> = {};
      teams.forEach((team) => {
        const gLabel = team.group_label || "0";
        if (!groups[gLabel]) groups[gLabel] = [];
        groups[gLabel].push(team);
      });
      setTeamPool(groups);
      setCurrentRoll([]);
      setLastRolledGroupIndex(null);
      setShowAll(false);
    }, []);

    useEffect(() => {
      if (teamData) handleLocalReset(teamData);
    }, [teamData, handleLocalReset]);

    useEffect(() => {
      setTargetGroup("all");
    }, [groupCount]);

    const handleRedistributeAndSave = () => {
      if (!teamData || teamData.length === 0) return;
      const shuffled = [...teamData].sort(() => Math.random() - 0.5);
      const updates: { league_team_id: string; group_label: string }[] = [];
      shuffled.forEach((team, index) => {
        const gIndex = index % groupCount;
        updates.push({
          league_team_id: team.league_team_id,
          group_label: gIndex.toString(),
        });
      });
      saveGroups(updates);
    };

    const rollTwo = useCallback(() => {
      const allTeamsCount = Object.values(teamPool).flat().length;
      if (allTeamsCount === 0) {
        handleLocalReset(teamData || []);
        return;
      }

      let validGroupKeys = Object.keys(teamPool).filter(
        (key) => teamPool[key].length >= 2
      );

      if (targetGroup !== "all") {
        if (validGroupKeys.includes(targetGroup)) {
          validGroupKeys = [targetGroup];
        } else {
          toast.info(`No pairs left in Group ${parseInt(targetGroup) + 1}`);
          return;
        }
      }

      if (validGroupKeys.length === 0) {
        if (targetGroup === "all") {
          handleLocalReset(teamData || []);
        }
        return;
      }

      const randomKeyIndex = Math.floor(Math.random() * validGroupKeys.length);
      const selectedGroupKey = validGroupKeys[randomKeyIndex];
      const groupTeams = teamPool[selectedGroupKey];

      const shuffled = [...groupTeams].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, 2);
      const remainingInGroup = groupTeams.filter(
        (t) => !picked.find((p) => p.league_team_id === t.league_team_id)
      );

      setCurrentRoll(picked);
      setLastRolledGroupIndex(selectedGroupKey);
      setTeamPool((prev) => ({
        ...prev,
        [selectedGroupKey]: remainingInGroup,
      }));
      setShowAll(false);
    }, [teamPool, teamData, handleLocalReset, targetGroup]);

    const onDragStart = useCallback(
      (event: React.DragEvent<HTMLDivElement>, team: ManualTeamOption) => {
        event.dataTransfer.setData(
          "application/reactflow-team",
          JSON.stringify(team)
        );
        event.dataTransfer.effectAllowed = "move";
      },
      []
    );

    const totalTeamsRemaining = useMemo(
      () => Object.values(teamPool).flat().length,
      [teamPool]
    );

    const TeamCard = ({ team }: { team: ManualTeamOption }) => (
      <div
        onDragStart={(evt) => onDragStart(evt, team)}
        draggable
        className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-card-foreground truncate">
          {team.team_name}
        </span>
      </div>
    );

    return (
      <div className="flex flex-col items-center gap-4">
        <Select
          onValueChange={(catId) => {
            const cat = manualCategories?.find(
              (c) => c.league_category_id === catId
            );
            setSelectedCategory(cat || null);
          }}
          value={selectedCategory?.league_category_id || ""}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {manualCategories?.map((c) => (
              <SelectItem
                key={c.league_category_id}
                value={c.league_category_id}
              >
                {c.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-muted/20">
            <Label className="text-xs font-semibold text-muted-foreground">
              Groups:
            </Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={groupCount}
              onChange={(e) => setGroupCount(parseInt(e.target.value) || 1)}
              className="h-6 w-10 text-center text-xs p-0 border-none focus-visible:ring-0 bg-transparent"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRedistributeAndSave}
            disabled={isSaving || !teamData?.length}
            className="h-8 text-xs"
          >
            {isSaving ? "Saving..." : "Shuffle & Save"}
            <Settings2 className="w-3 h-3 ml-2" />
          </Button>
        </div>

        <Separator className="w-full max-w-[200px]" />

        {groupCount > 1 && (
          <div className="w-[200px]">
            <Select value={targetGroup} onValueChange={setTargetGroup}>
              <SelectTrigger className="h-8 text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Group (Random)</SelectItem>
                {Array.from({ length: groupCount }).map((_, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    Group {idx + 1} Only
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={rollTwo}
            size="sm"
            disabled={isSaving || !teamData?.length}
            className="flex items-center gap-2 w-24"
          >
            <Shuffle className="w-4 h-4" />
            {totalTeamsRemaining === 0 ? "Reset" : "Roll"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            disabled={!teamData?.length}
            className="flex items-center gap-2 w-24"
          >
            <List className="w-4 h-4" />
            {showAll ? "Hide" : "Show All"}
          </Button>
        </div>

        <ScrollArea className="flex flex-col gap-4 items-center w-full max-h-64 px-2 mt-2">
          {!showAll && currentRoll.length > 0 && (
            <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
              {lastRolledGroupIndex !== null && (
                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                  Group {parseInt(lastRolledGroupIndex) + 1}
                </span>
              )}
              {currentRoll.map((team) => (
                <TeamCard key={team.league_team_id} team={team} />
              ))}
            </div>
          )}

          {showAll && (
            <div className="flex flex-col gap-4 w-full items-center animate-in fade-in zoom-in duration-300">
              {Object.entries(teamPool)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([groupKey, teams]) => {
                  if (teams.length === 0) return null;
                  return (
                    <div
                      key={groupKey}
                      className="w-full flex flex-col items-center gap-2"
                    >
                      <div className="flex items-center w-full gap-2">
                        <Separator className="flex-1" />
                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                          Group {parseInt(groupKey) + 1}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                      {teams.map((team) => (
                        <TeamCard key={team.league_team_id} team={team} />
                      ))}
                    </div>
                  );
                })}
            </div>
          )}

          {!showAll && currentRoll.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-4">
              {teamData?.length === 0 ? "No teams found." : "Ready to roll."}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }
});

const formatMatchTemplates: { label: string; data: Partial<LeagueMatch> }[] = [
  {
    label: "Round Robin Match",
    data: {
      display_name: "Round Robin Match",
      is_round_robin: true,
    },
  },
];

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
        <span className="w-48 text-[10px] uppercase font-bold text-muted-foreground text-left mt-2">
          Format Template
        </span>
        {formatMatchTemplates.map((template) => (
          <DraggableMatchItem
            key={template.label}
            label={template.label}
            matchData={template.data}
          />
        ))}

        <div className="w-48 my-1 border-t border-border" />
        <span className="w-48 text-[10px] uppercase font-bold text-muted-foreground text-left">
          None Format Templates
        </span>
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

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { useLeagueMatchSelectionStore } from "./useLeagueMatchSelectionStore";

export interface LeagueGroup {
  group_id: string;
  group_name: string;
}

export interface LeagueRound {
  round_id: string;
  round_name: string;
  groups: LeagueGroup[];
}

export interface LeagueCategoryWithRounds {
  league_category_id: string;
  category_name: string;
  rounds: LeagueRound[];
}

export function useLeagueCategoriesRoundsGroups() {
  const { activeLeagueId, activeLeagueLoading, activeLeagueError } =
    useActiveLeague();

  const {
    selectedCategory,
    selectedRound,
    selectedGroup,
    setSelectedCategory,
    setSelectedRound,
    setSelectedGroup,
  } = useLeagueMatchSelectionStore();

  const {
    data: categories = [],
    isLoading: queryLoading,
    error: queryError,
  } = useQuery<LeagueCategoryWithRounds[]>({
    queryKey: ["league-categories-rounds-groups", activeLeagueId],
    queryFn: async () => {
      if (!activeLeagueId) return [];
      const { data } = await axiosClient.get<LeagueCategoryWithRounds[]>(
        `/league-category/rounds-groups-names/${activeLeagueId}`
      );
      return data;
    },
    enabled: !!activeLeagueId,
  });

  const rounds =
    categories.find((c) => c.league_category_id === selectedCategory)?.rounds ??
    [];
  const groups = rounds.find((r) => r.round_id === selectedRound)?.groups ?? [];

  const isLoading = activeLeagueLoading || queryLoading;
  const error = activeLeagueError || queryError;

  useEffect(() => {
    if (categories.length === 0) {
      if (selectedCategory || selectedRound || selectedGroup) {
        setSelectedCategory("");
        setSelectedRound("");
        setSelectedGroup("");
      }
      return;
    }

    const validCategory = categories.find(
      (c) => c.league_category_id === selectedCategory
    );
    if (!validCategory) {
      if (selectedCategory) setSelectedCategory("");
      if (selectedRound) setSelectedRound("");
      if (selectedGroup) setSelectedGroup("");
      return;
    }

    const validRound = validCategory.rounds.find(
      (r) => r.round_id === selectedRound
    );
    if (!validRound) {
      if (selectedRound) setSelectedRound("");
      if (selectedGroup) setSelectedGroup("");
      return;
    }

    const validGroup = validRound.groups.find(
      (g) => g.group_id === selectedGroup
    );
    if (!validGroup && selectedGroup) {
      setSelectedGroup("");
    }
  }, [categories, selectedCategory, selectedRound, selectedGroup]);

  return {
    categories,
    rounds,
    groups,
    isLoading,
    error,
    selectedCategory,
    selectedRound,
    selectedGroup,
    setSelectedCategory,
    setSelectedRound,
    setSelectedGroup,
  };
}

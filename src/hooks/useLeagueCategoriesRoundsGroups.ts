import { useEffect, useMemo } from "react";
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
  const {
    activeLeagueId,
    activeLeagueData,
    activeLeagueLoading,
    activeLeagueError,
  } = useActiveLeague();

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

  const isLoading = activeLeagueLoading || queryLoading;
  const error = activeLeagueError || queryError;

  const rounds = useMemo(() => {
    return (
      categories.find((c) => c.league_category_id === selectedCategory)
        ?.rounds ?? []
    );
  }, [categories, selectedCategory]);

  const groups = useMemo(() => {
    return rounds.find((r) => r.round_id === selectedRound)?.groups ?? [];
  }, [rounds, selectedRound]);

  // ✅ Validation & auto-reset of invalid selections
  useEffect(() => {
    if (!categories.length) {
      if (selectedCategory || selectedRound || selectedGroup) {
        setSelectedCategory("");
        setSelectedRound("");
        setSelectedGroup("");
      }
      return;
    }

    const category = categories.find(
      (c) => c.league_category_id === selectedCategory
    );
    if (!category) {
      if (selectedCategory) setSelectedCategory("");
      if (selectedRound) setSelectedRound("");
      if (selectedGroup) setSelectedGroup("");
      return;
    }

    const round = category.rounds.find((r) => r.round_id === selectedRound);
    if (!round) {
      if (selectedRound) setSelectedRound("");
      if (selectedGroup) setSelectedGroup("");
      return;
    }

    const group = round.groups.find((g) => g.group_id === selectedGroup);
    if (!group && selectedGroup) {
      setSelectedGroup("");
    }
  }, [
    categories,
    selectedCategory,
    selectedRound,
    selectedGroup,
    setSelectedCategory,
    setSelectedRound,
    setSelectedGroup,
  ]);

  return {
    activeLeagueId,
    activeLeagueData,
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

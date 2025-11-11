import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { useLeagueMatchSelectionStore } from "./useLeagueMatchSelectionStore";
import { useFetchLeagueGenericData } from "./useFetchLeagueGenericData";
import type { League } from "@/types/league";
import { LeagueStatus } from "@/service/leagueService";

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
    leagueId: activeLeagueId,
    data: activeLeagueData,
    isLoading: activeLeagueLoading,
    error: activeLeagueError,
  } = useFetchLeagueGenericData<League>({
    key: ["is-active"],
    params: {
      active: true,
      status: [
        LeagueStatus.Pending,
        LeagueStatus.Scheduled,
        LeagueStatus.Ongoing,
      ],
    },
  });

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

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!categories.length) return;

    const firstCategory = categories[0];
    const firstRound = firstCategory.rounds?.[0];

    setSelectedCategory(firstCategory.league_category_id);
    if (firstRound) setSelectedRound(firstRound.round_id);

    initialized.current = true;
  }, [categories, setSelectedCategory, setSelectedRound]);

  useEffect(() => {
    if (!categories.length) return;

    const category = categories.find(
      (c) => c.league_category_id === selectedCategory
    );
    if (!category) {
      setSelectedCategory("");
      setSelectedRound("");
      setSelectedGroup("");
      return;
    }

    const round = category.rounds.find((r) => r.round_id === selectedRound);
    if (!round) {
      setSelectedRound("");
      setSelectedGroup("");
      return;
    }

    const group = round.groups.find((g) => g.group_id === selectedGroup);
    if (!group) {
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

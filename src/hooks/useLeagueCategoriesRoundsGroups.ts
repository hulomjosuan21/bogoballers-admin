import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
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

interface LeagueCategoriesResponse {
  league_id: string;
  league_status: string;
  payload: LeagueCategoryWithRounds[];
}

export function useLeagueCategoriesRoundsGroups(params?: {
  publicLeagueId?: string;
}) {
  const {
    selectedCategory,
    selectedRound,
    selectedGroup,
    setSelectedCategory,
    setSelectedRound,
    setSelectedGroup,
  } = useLeagueMatchSelectionStore();

  const publicLeagueId = params?.publicLeagueId;

  const queryKey = ["league-categories-rounds-groups", publicLeagueId];

  const {
    data,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery<LeagueCategoriesResponse>({
    queryKey: queryKey,
    queryFn: async () => {
      const { data } = await axiosClient.get<LeagueCategoriesResponse>(
        `/league-category/rounds-groups-names`,
        {
          params: publicLeagueId ? { public_league_id: publicLeagueId } : {},
        }
      );
      return data;
    },
  });

  const categories = data?.payload || [];
  const activeLeagueId = data?.league_id;
  const activeLeagueStatus = data?.league_status;

  const isLoading = queryLoading;
  const error = queryError;

  const rounds = useMemo(() => {
    return (
      categories.find((c) => c.league_category_id === selectedCategory)
        ?.rounds ?? []
    );
  }, [categories, selectedCategory]);

  const groups = useMemo(() => {
    return rounds.find((r) => r.round_id === selectedRound)?.groups ?? [];
  }, [rounds, selectedRound]);

  const lastInitializedLeagueId = useRef<string | null>(null);

  useEffect(() => {
    if (!categories.length || !activeLeagueId) return;
    if (lastInitializedLeagueId.current === activeLeagueId) return;

    const firstCategory = categories[0];
    const firstRound = firstCategory.rounds?.[0];
    setSelectedCategory(firstCategory.league_category_id);

    if (firstRound) {
      setSelectedRound(firstRound.round_id);
    } else {
      setSelectedRound("");
    }
    setSelectedGroup("");
    lastInitializedLeagueId.current = activeLeagueId;
  }, [
    activeLeagueId,
    categories,
    setSelectedCategory,
    setSelectedRound,
    setSelectedGroup,
  ]);

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
    activeLeagueStatus,
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

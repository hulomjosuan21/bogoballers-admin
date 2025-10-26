import type { MatchBook } from "@/types/scorebook";
import { useToggleStore } from "./toggleStore";
import type { LeagueMatch } from "@/types/leagueMatch";

export const useToggleMatchBookSection = useToggleStore<MatchBook>();
export const useToggleUpcomingMatchSection = useToggleStore<LeagueMatch>();

import { useToggleStore } from "./toggleStore";
import type { LeagueWithRecord } from "@/types/leagueRecord";

export const useToggleLeagueHistorySection = useToggleStore<LeagueWithRecord>();

import type { League } from "@/types/league";
import { useToggleStore } from "./toggleStore";

export const useToggleLeagueHistorySection = useToggleStore<
  League & { league_match_records: {} }
>();
